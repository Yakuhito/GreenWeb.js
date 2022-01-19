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
}

export class ChiaMessageChannel {
    private ws: WebSocket | undefined;
    private readonly port: number;
    private readonly host: string;
    private readonly apiKey: string;
    private readonly onMessage: (message: Buffer) => void;
    private readonly networkId: string;
    private inboundDataBuffer: Buffer = Buffer.from([]);

    constructor({host, port, apiKey, onMessage, networkId}: ChiaMessageChannelOptions) {
        this.port = port;
        this.onMessage = onMessage;

        if(host.includes(":") && host[0] !== "[") { // IPv6
            host = "[" + host + "]"
        }
        this.host = host;
        this.networkId = networkId;
        this.apiKey = apiKey;
    }

    public async connect(): Promise<void> {
        const url: string = "wss://" + this.host + ":" + this.port.toString() + "/" + this.apiKey + "/ws";

        return new Promise((resolve) => {
            this.ws = new WebSocket(url);
            
            // this.ws.on("message", (data: Buffer): void => this.messageHandler(data));
            this.ws.onmessage = async (message) => {
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
            // // this.ws.on("error", (err: Error): void => console.log(err));
            // this.ws.on("close", (_, reason) => console.log(reason));
            // this.ws.on("open", () => {
            //     this.onConnected();

            //     resolve();
            // });
            this.ws.onopen = () => {
                this.onConnected();

                resolve();
            }
        });
    }

    public sendMessage(message: Buffer): void {
        this.ws?.send(message);
    }

    public close(): void {
        this.ws?.close();
    }

    private messageHandler(data: Buffer): void {
        this.inboundDataBuffer = Buffer.concat([this.inboundDataBuffer, data]);

        // Buffer is big enough to contain the length
        if (this.inboundDataBuffer.byteLength >= 5) {
            const haveMessageId = data.readUInt8(1);
            const messageLength = haveMessageId > 0 ?
                data.readUInt32BE(4) :
                data.readUInt32BE(2);

            const messageReady = data.byteLength === messageLength + 6;
            const bufferOverflow = data.byteLength > messageLength + 6;

            if (messageReady) {
                this.onMessage(this.inboundDataBuffer);

                this.inboundDataBuffer = Buffer.from([]);
            } else if (bufferOverflow) {
                // Very basic protection against badly developed or malicious peers
                // Depending on what they are doing this could happen many times in a row but should eventually recover
                this.inboundDataBuffer = Buffer.from([]);
            }
        }
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

    // private onClose(err?: Error): void {}
}