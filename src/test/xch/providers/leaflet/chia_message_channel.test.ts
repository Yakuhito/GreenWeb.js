/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
import { expect } from "chai";
import { Serializer } from "../../../../util/serializer/serializer";
import { makeMsg, Message, NodeType } from "../../../../util/serializer/types/outbound_message";
import { ProtocolMessageTypes } from "../../../../util/serializer/types/protocol_message_types";
import { Capability, Handshake } from "../../../../util/serializer/types/shared_protocol";
import { RequestPuzzleSolution } from "../../../../util/serializer/types/wallet_protocol";
import { getSoftwareVersion } from "../../../../util/software_version";
import { ChiaMessageChannel, IWebSocket } from "../../../../xch/providers/leaflet/chia_message_channel";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe("ChiaMessageChannel", () => {
    describe("connect()", () => {
        it("Works", async () => {
            let url: string = "";
            let sentMessages: number = 0;

            const obj: IWebSocket = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                onMessage: () => { },
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
            };

            await Promise.all([
                msgChannel.connect(),
                opener()
            ]);

            expect(obj.onmessage).not.to.be.null;
            expect(url).to.equal("wss://[ho::st]:1337/API-KEY/ws");
            expect(sentMessages).to.equal(1);
        });

        it("Works if called while already connected", async () => {
            let url: string = "";
            let sentMessages: number = 0;

            const obj: IWebSocket = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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
    });

    describe("sendMessage()", () => {
        it("Works", async () => {
            let sentMessages: number = 0;
            let lastSentMessage: Buffer = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => {
                    sentMessages += 1;
                    lastSentMessage = msg;
                },
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.onopen?.("hey");
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

        it("Works if called without calling connect() before", async () => {
            let sentMessages: number = 0;

            const obj: IWebSocket = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => {
                    sentMessages += 1;
                },
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            expect(msgChannel.isConnected()).to.be.false;

            msgChannel.sendMessage(Buffer.from([1, 2, 3]));
            expect(msgChannel.isConnected()).to.be.false;
            expect(sentMessages).to.equal(0);
        });
    });

    describe("close()", () => {
        it("Works", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let closed: boolean = false;

            const obj = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => closed = true,
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

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
            expect(msgChannel.isConnected()).to.be.false;
        });

        it("Works if called without calling connect() before", async () => {
            let closeCalled: boolean = false;

            const obj: IWebSocket = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => { },
                close: () => closeCalled = true,
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            expect(msgChannel.isConnected()).to.be.false;

            msgChannel.close()
            expect(msgChannel.isConnected()).to.be.false;
            expect(closeCalled).to.be.false;
        });
    });

    it("isConnected() works even if connect() hasn't been called", async () => {
        const obj: IWebSocket = {
            onmessage: null,
            onopen: () => { },
            send: (msg: Buffer) => { },
            close: () => { },
            onerror: () => { },
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
            networkId: "mainnet",
            webSocketCreateFunc: webSocketOverrideCreateFunc
        });

        expect(msgChannel.isConnected()).to.be.false;
    });

    it("Works if an error occurs", async () => {
        let url: string = "";

        const obj: IWebSocket = {
            onmessage: async (m: any) => { },
            onopen: () => { },
            send: () => { },
            close: () => { },
            onerror: () => { },
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
            networkId: "mainnet",
            webSocketCreateFunc: webSocketOverrideCreateFunc
        });

        const opener = async () => {
            while(obj.onmessage === null) {
                await sleep(20);
            }

            obj.readyState = WebSocket.OPEN;
            obj.onopen?.("hey");
        };

        await Promise.all([
            msgChannel.connect(),
            opener()
        ]);

        expect(url).to.equal("wss://host:1337/API-KEY/ws");
        expect(msgChannel.isConnected()).to.be.true;

        obj.onerror?.("err");

        expect(msgChannel.isConnected()).to.be.false;
    });

    describe("messageHandler()", () => {
        it("Works", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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
            await obj.onmessage?.({
                data: handshakeMsg,
            });

            expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
        });

        it("Works when message.data is a Blob", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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

            class Blob {
                private _buf: Buffer;

                constructor(buf: Buffer) {
                    this._buf = buf;
                }

                public async arrayBuffer(): Promise<Buffer> {
                    return this._buf;
                }
            }
            (global as any).Blob = Blob;

            const blob = new Blob(handshakeMsg);
            await obj.onmessage?.({
                data: blob,
            });

            expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
        });

        it("Works when message.data is a Buffer array", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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
            await obj.onmessage?.({
                data: [handshakeMsg,],
            });

            expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
        });

        it("Works when message.data is an ArrayBuffer", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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

            const ab = new ArrayBuffer(handshakeMsg.length);
            const view = new Uint8Array(ab);
            for(let i = 0; i < handshakeMsg.length; ++i) {
                view[i] = handshakeMsg[i];
            }

            await obj.onmessage?.({
                data: ab,
            });

            expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
        });

        it("Ignores messages that are less than 5 bytes long", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
            };

            await Promise.all([
                msgChannel.connect(),
                opener()
            ]);

            expect(url).to.equal("wss://host:1337/API-KEY/ws");
            expect(sentMessages).to.equal(1);

            await obj.onmessage?.({
                data: Buffer.from([1, 2, 3, 4]),
            });

            expect(lastMessageHandled.toString("hex")).to.equal("");
        });

        it("Works for messages that have an id", async () => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.handshake;
            msg.id = 1337;
            msg.data = Serializer.serialize(handshake).toString("hex");

            const handshakeMsg: Buffer = Serializer.serialize(msg);

            await obj.onmessage?.({
                data: handshakeMsg,
            });

            expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
        });

        const _testMessageAssembly1 = async (useMessageId: boolean) => {
            let url: string = "";
            let sentMessages: number = 0;
            let lastMessageHandled = Buffer.from([]);

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.handshake;
            msg.id = useMessageId ? 31337 : null;
            msg.data = Serializer.serialize(handshake).toString("hex");

            const handshakeMsg: Buffer = Serializer.serialize(msg);

            const cutoff = handshakeMsg.byteLength / 3;
            const msgPart1 = handshakeMsg.slice(0, cutoff);
            const msgPart2 = handshakeMsg.slice(cutoff);

            expect(
                msgPart1.toString("hex") + msgPart2.toString("hex")
            ).to.equal(handshakeMsg.toString("hex"));

            await obj.onmessage?.({
                data: msgPart1
            });

            expect(lastMessageHandled.byteLength).to.equal(0);

            await obj.onmessage?.({
                data: msgPart2
            });

            expect(lastMessageHandled.byteLength).to.not.equal(0);
            expect(lastMessageHandled.toString("hex")).to.equal(handshakeMsg.toString("hex"));
        };

        it(
            "Correcty assembles messages (1 message over two packets, no message id)",
            () => _testMessageAssembly1(false)
        );

        it(
            "Correcty assembles messages (1 message over two packets, message has id)",
            () => _testMessageAssembly1(true)
        );

        const _testMessageAssembly2 = async (useMessageId1: boolean, useMessageId2: boolean) => {
            let url: string = "";
            let sentMessages: number = 0;
            const handledMessages: Buffer[] = [];

            const obj: IWebSocket = {
                onmessage: async (m: any) => { },
                onopen: () => { },
                send: (msg: Buffer) => sentMessages += 1,
                close: () => { },
                onerror: () => { },
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
                onMessage: (m: Buffer) => handledMessages.push(m),
                networkId: "mainnet",
                webSocketCreateFunc: webSocketOverrideCreateFunc
            });

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
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

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.handshake;
            msg1.id = useMessageId1 ? 31337 : null;
            msg1.data = Serializer.serialize(handshake).toString("hex");

            const handshakeMsg: Buffer = Serializer.serialize(msg1);

            const request: RequestPuzzleSolution = new RequestPuzzleSolution();
            request.coinName = "4e1c31ee52b974dcf4a9dbf5040e462b91413dc6c913dc5aa4783fbf78b3f423"; // SHA256('yakuhito')
            request.height = 42;

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.request_puzzle_solution;
            msg2.id = useMessageId2 ? 69 : null;
            msg2.data = Serializer.serialize(request).toString("hex");

            const requestMsg: Buffer = Serializer.serialize(msg2);

            await obj.onmessage?.({
                data: Buffer.concat([handshakeMsg, requestMsg])
            });


            expect(handledMessages.length).to.equal(2);
            expect(handledMessages[0].toString("hex")).to.equal(handshakeMsg.toString("hex"));
            expect(handledMessages[1].toString("hex")).to.equal(requestMsg.toString("hex"));
        };

        it(
            "Correcty assembles messages (2 messages in the same packet, no message ids)",
            () => _testMessageAssembly2(false, false)
        );

        it(
            "Correcty assembles messages (2 messages in the same packet, first message has id)",
            () => _testMessageAssembly2(true, false)
        );

        it(
            "Correcty assembles messages (2 messages in the same packet, second message has id)",
            () => _testMessageAssembly2(false, true)
        );

        it(
            "Correcty assembles messages (2 messages in the same packet, both messages have ids)",
            () => _testMessageAssembly2(true, true)
        );
    });
});