/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from "chai";
import { makeMsg, NodeType } from "../../../../util/serializer/types/outbound_message";
import { ProtocolMessageTypes } from "../../../../util/serializer/types/protocol_message_types";
import { Capability, Handshake } from "../../../../util/serializer/types/shared_protocol";
import { getSoftwareVersion } from "../../../../util/software_version";
import { ChiaMessageChannel } from "../../../../xch/providers/leaflet/chia_message_channel";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe.only("ChiaMessageChannel", () => {
    it("connect()", async () => {
        let url: string = "";
        let sentMessages: number = 0;

        const obj = {
            onmessage: null,
            onopen: () => { },
            send: (msg: Buffer) => sentMessages += 1,
            close: () => { },
            readyState: WebSocket.CONNECTING
        };
        const webSocketOverrideCreateFunc = (_url: string) => {
            url = _url;

            return obj;
        };
        const msgChannel: ChiaMessageChannel = new ChiaMessageChannel({
            host: "ho::st",
            port: 1337,
            apiKey: "API-KEY",
            onMessage: () => {},
            networkId: "mainnet"
        }, webSocketOverrideCreateFunc);

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.readyState = WebSocket.OPEN;
            obj.onopen();
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(obj.onmessage).not.to.be.null;
        expect(url).to.equal("wss://[ho::st]:1337/API-KEY/ws");
        expect(sentMessages).to.equal(1);
    });

    it("connect() while connected", async () => {
        let url: string = "";
        let sentMessages: number = 0;

        const obj = {
            onmessage: null,
            onopen: () => {},
            send: (msg: Buffer) => sentMessages += 1,
            close: () => { },
            readyState: WebSocket.CONNECTING
        };
        const webSocketOverrideCreateFunc = (_url: string) => {
            url = _url;

            return obj;
        };
        const msgChannel: ChiaMessageChannel = new ChiaMessageChannel({
            host: "host",
            port: 1337,
            apiKey: "API-KEY",
            onMessage: () => { },
            networkId: "mainnet"
        }, webSocketOverrideCreateFunc);

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.readyState = WebSocket.OPEN;
            obj.onopen();
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(obj.onmessage).to.not.be.null;
        expect(url).to.equal("wss://host:1337/API-KEY/ws");
        expect(sentMessages).to.equal(1);

        await msgChannel.connect();

        expect(obj.onmessage).to.not.be.null;
        expect(url).to.equal("wss://host:1337/API-KEY/ws");
        expect(sentMessages).to.equal(1);
    });

    it("sendMessage()", async () => {
        let sentMessages: number = 0;
        let lastSentMessage: Buffer = Buffer.from([]);

        const obj = {
            onmessage: null,
            onopen: () => { },
            send: (msg: Buffer) => {
                sentMessages += 1;
                lastSentMessage = msg;
            },
            close: () => { },
            readyState: WebSocket.CONNECTING
        };
        const webSocketOverrideCreateFunc = (_url: string) => {
            obj.readyState = WebSocket.OPEN;

            return obj;
        };
        const msgChannel: ChiaMessageChannel = new ChiaMessageChannel({
            host: "ho::st",
            port: 1337,
            apiKey: "API-KEY",
            onMessage: () => { },
            networkId: "mainnet"
        }, webSocketOverrideCreateFunc);

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.onopen();
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(sentMessages).to.equal(1);

        const toSend = Buffer.from([1, 2, 3, 4]);
        msgChannel.sendMessage(toSend);
        expect(lastSentMessage.toString("hex")).to.equal(toSend.toString("hex"));
    });

    it("close()", async () => {
        let url: string = "";
        let sentMessages: number = 0;
        let closed: boolean = false;

        const obj = {
            onmessage: null,
            onopen: () => { },
            send: (msg: Buffer) => sentMessages += 1,
            close: () => closed = true,
            readyState: WebSocket.CONNECTING
        };
        const webSocketOverrideCreateFunc = (_url: string) => {
            url = _url;

            return obj;
        };
        const msgChannel: ChiaMessageChannel = new ChiaMessageChannel({
            host: "host",
            port: 1337,
            apiKey: "API-KEY",
            onMessage: () => { },
            networkId: "mainnet"
        }, webSocketOverrideCreateFunc);

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.readyState = WebSocket.OPEN;
            obj.onopen();
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(obj.onmessage).not.to.be.null;

        msgChannel.close();

        expect(url).to.equal("wss://host:1337/API-KEY/ws");
        expect(sentMessages).to.equal(1);
        expect(closed).to.be.true;
    });

    it("messageHandler()", async () => {
        let url: string = "";
        let sentMessages: number = 0;
        let lastMessageHandled = Buffer.from([]);

        const obj = {
            onmessage: async (m: any) => { },
            onopen: () => { },
            send: (msg: Buffer) => sentMessages += 1,
            close: () => { },
            readyState: WebSocket.CONNECTING
        };
        const webSocketOverrideCreateFunc = (_url: string) => {
            url = _url;

            return obj;
        };
        const msgChannel: ChiaMessageChannel = new ChiaMessageChannel({
            host: "host",
            port: 1337,
            apiKey: "API-KEY",
            onMessage: (m: Buffer) => lastMessageHandled = m,
            networkId: "mainnet"
        }, webSocketOverrideCreateFunc);

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.readyState = WebSocket.OPEN;
            obj.onopen();
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(url).to.equal("wss://host:1337/API-KEY/ws");
        expect(sentMessages).to.equal(1);

        const handshake: Handshake = new Handshake();
        handshake.networkId = "mainnet";
        handshake.protocolVersion = "v0.0.33";
        handshake.softwareVersion = getSoftwareVersion();
        handshake.serverPort = 8444;
        handshake.nodeType = NodeType.WALLET;
        handshake.capabilities = [[Capability.BASE, "1"],];

        const handshakeMsg: Buffer = makeMsg(
            ProtocolMessageTypes.handshake,
            handshake
        );
        await obj.onmessage({
            data: handshakeMsg,
        });

        expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
    });

    it("messageHandler() - buffer overflow", async () => {
        let url: string = "";
        let sentMessages: number = 0;
        let lastMessageHandled = Buffer.from([]);

        const obj = {
            onmessage: async (m: any) => { },
            onopen: () => { },
            send: (msg: Buffer) => sentMessages += 1,
            close: () => { },
            readyState: WebSocket.CONNECTING
        };
        const webSocketOverrideCreateFunc = (_url: string) => {
            url = _url;

            return obj;
        };
        const msgChannel: ChiaMessageChannel = new ChiaMessageChannel({
            host: "host",
            port: 1337,
            apiKey: "API-KEY",
            onMessage: (m: Buffer) => lastMessageHandled = m,
            networkId: "mainnet"
        }, webSocketOverrideCreateFunc);

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.readyState = WebSocket.OPEN;
            obj.onopen();
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(url).to.equal("wss://host:1337/API-KEY/ws");
        expect(sentMessages).to.equal(1);

        const handshake: Handshake = new Handshake();
        handshake.networkId = "mainnet";
        handshake.protocolVersion = "v0.0.33";
        handshake.softwareVersion = getSoftwareVersion();
        handshake.serverPort = 8444;
        handshake.nodeType = NodeType.WALLET;
        handshake.capabilities = [[Capability.BASE, "1"],];

        const handshakeMsg: Buffer = makeMsg(
            ProtocolMessageTypes.handshake,
            handshake
        );
        await obj.onmessage({
            data: Buffer.concat([
                handshakeMsg,
                Buffer.from([1, 2, 3])
            ]),
        });

        expect(lastMessageHandled.toString("hex")).to.equal("");
    });
});