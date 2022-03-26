// https://github.com/freddiecoleman/chia-network-scanner/blob/main/MessageChannel.ts

import { makeMsg, NodeType } from "../../../util/serializer/types/outbound_message";
import { ProtocolMessageTypes } from "../../../util/serializer/types/protocol_message_types";
import { Capability, Handshake, PROTOCOL_VERSION } from "../../../util/serializer/types/shared_protocol";
import { getSoftwareVersion } from "../../../util/software_version";

try {
    (global as any).WebSocket = require("ws");
// eslint-disable-next-line no-empty
} catch(_) {}

export interface ChiaMessageChannelOptions {
    host: string;
    port: number;
    apiKey: string;
    onMessage: (message: Buffer) => void;
    networkId: string;
    webSocketCreateFunc: (url: string) => IWebSocket;
}

export interface IChiaMessageChannel {
    connect: () => Promise<void>;
    sendMessage: (message: Buffer) => void;
    close: () => void;
    isConnected: () => boolean;
}

export interface IWebSocket {
    onmessage: ((this: any, ev: any) => any) | null;
    onopen: ((this: any, ev: any) => any) | null;
    onerror: ((this: any, ev: any) => any) | null;
    send: (message: Buffer) => void;
    close: () => void;

    readyState: typeof WebSocket.OPEN;
}

export class ChiaMessageChannel implements IChiaMessageChannel {
    private ws: IWebSocket | undefined;
    private readonly port: number;
    private readonly host: string;
    private readonly apiKey: string;
    private readonly onMessage: (message: Buffer) => void;
    private readonly networkId: string;
    private inboundDataBuffer: Buffer = Buffer.from([]);
    private webSocketCreateFunc: (url: string) => IWebSocket;

    constructor({ host, port, apiKey, onMessage, networkId, webSocketCreateFunc }: ChiaMessageChannelOptions) {
        this.port = port;
        this.onMessage = onMessage;

        if(host.includes(":") && host[0] !== "[") { // IPv6
            host = "[" + host + "]"
        }
        this.host = host;
        this.networkId = networkId;
        this.apiKey = apiKey;
        this.webSocketCreateFunc = webSocketCreateFunc;
    }

    public async connect(): Promise<void> {
        const url: string = "wss://" + this.host + ":" + this.port.toString() + "/" + this.apiKey + "/ws";

        if(this.isConnected()) {
            return;
        }
    
        this.ws = this.webSocketCreateFunc(url);

        return new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.ws!.onmessage = async (message) => {
                let isBlob: boolean;

                try {
                    isBlob = message.data instanceof Blob;
                } catch(_) {
                    isBlob = false;
                }

                const msg: Buffer = message.data instanceof Array ? Buffer.concat(message.data) :
                    isBlob ? Buffer.from(await message.data.arrayBuffer()) :
                        Buffer.from(message.data);


                this.messageHandler(msg);
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.ws!.onopen = () => {
                this.onConnected();

                resolve();
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.ws!.onerror = () => {
                this.close();

                resolve();
            }
        });
    }

    public sendMessage(message: Buffer): void {
        this.ws?.send(message);
    }

    public close(): void {
        this.ws?.close();
        this.ws = undefined;
    }

    public isConnected(): boolean {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.ws !== undefined && this.ws!.readyState === WebSocket.OPEN;
    }

    private messageHandler(data: Buffer): void {
        this.inboundDataBuffer = Buffer.concat([this.inboundDataBuffer, data]);

        // Buffer is big enough to contain the length
        if(this.inboundDataBuffer.byteLength < 5) {
            return;
        }

        do {
            const haveMessageId: number = this.inboundDataBuffer.readUInt8(1);
            const messageLength: number = haveMessageId !== 0 ?
                this.inboundDataBuffer.readUInt32BE(4) :
                this.inboundDataBuffer.readUInt32BE(2);

            const realMessageLength: number = messageLength + (haveMessageId ? 8 : 6);
            const canConsumeMessage: boolean = this.inboundDataBuffer.byteLength >= realMessageLength;

            if(canConsumeMessage) {
                const message = this.inboundDataBuffer.slice(0, realMessageLength);
                this.inboundDataBuffer = this.inboundDataBuffer.slice(realMessageLength);

                this.onMessage(message);
            } else {
                break;
            }
        } while(this.inboundDataBuffer.byteLength >= 5);
        // note: The original file had a 'buffer overflow protection' thingy here
        // I don't think I understood it
        // If you do and think it's needed, please do reach out
    }

    private onConnected(): void {
        const handshake: Handshake = new Handshake();
        handshake.networkId = this.networkId;
        handshake.protocolVersion = PROTOCOL_VERSION;
        handshake.softwareVersion = getSoftwareVersion();
        handshake.serverPort = this.port;
        handshake.nodeType = NodeType.WALLET;
        handshake.capabilities = [[Capability.BASE, "1"], ];
        const hanshakeMsg: Buffer = makeMsg(
            ProtocolMessageTypes.handshake,
            handshake
        );

        this.sendMessage(hanshakeMsg);
    }
}