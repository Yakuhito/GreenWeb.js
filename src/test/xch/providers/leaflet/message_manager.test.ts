/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { bytes } from "../../../../util/serializer/basic_types";
import { Serializer } from "../../../../util/serializer/serializer";
import { Message } from "../../../../util/serializer/types/outbound_message";
import { ProtocolMessageTypes } from "../../../../util/serializer/types/protocol_message_types";
import { IChiaMessageChannel } from "../../../../xch/providers/leaflet/chia_message_channel";
import { MessageManager } from "../../../../xch/providers/leaflet/message_manager";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe("MessageManager", () => {
    describe("initialize()", () => {
        it("Initializes a message channel and updates 'open'", async () => {
            let createdChannels: number = 0;
            let msgChannelConnectCalled: boolean = false;
            let sentMessages: number = 0;
            let msgChannelClosed: boolean = false;
            let handleMsg: (rawMsg: Buffer) => void = () => {};

            const msgChannel: IChiaMessageChannel = {
                connect: async () => { msgChannelConnectCalled = true },
                sendMessage: async () => { sentMessages += 1; },
                close: () => { msgChannelClosed = true; },
                isConnected: () => msgChannelConnectCalled && !msgChannelClosed,
            };
            const manager = new MessageManager(
                async (hMsg) => {
                    handleMsg = hMsg;
                    createdChannels += 1;
                    return msgChannel;
                }
            );

            const handshakeMsg: Message = new Message();
            handshakeMsg.type = ProtocolMessageTypes.handshake;
            handshakeMsg.id = null;
            handshakeMsg.data = "";

            await manager.initialize();
            handleMsg(Serializer.serialize(handshakeMsg));

            expect(createdChannels).to.equal(1);
            expect(manager.open).to.be.true;
            expect(msgChannelConnectCalled).to.be.true;
            expect(sentMessages).to.equal(0);
            expect(msgChannelClosed).to.be.false;

            await manager.close();

            expect(manager.open).to.be.false;
            expect(msgChannelClosed).to.be.true;
        });
    });

    describe("registerFilter()", () => {
        it("Sends message and deletes filter after it is consumed", async () => {
            let msgChannelConnectCalled: boolean = false;
            let sentMessages: number = 0;
            let lastSentMessage: Buffer;
            let msgChannelClosed: boolean = false;
            let handleMsg: (rawMsg: Buffer) => void = () => { };

            const msgChannel: IChiaMessageChannel = {
                connect: async () => { msgChannelConnectCalled = true },
                sendMessage: async (msg) => { sentMessages += 1; lastSentMessage = msg; },
                close: () => { msgChannelClosed = true; },
                isConnected: () => msgChannelConnectCalled && !msgChannelClosed,
            };
            const manager = new MessageManager(
                async (hMsg) => {
                    handleMsg = hMsg;
                    return msgChannel;
                },
                10000,
                100
            );

            const handshakeMsg: Message = new Message();
            handshakeMsg.type = ProtocolMessageTypes.handshake;
            handshakeMsg.id = null;
            handshakeMsg.data = "";

            await manager.initialize();
            handleMsg(Serializer.serialize(handshakeMsg));

            expect(manager.open).to.be.true;

            const msgToSend: Message = new Message();
            msgToSend.type = ProtocolMessageTypes.transaction_ack;
            msgToSend.id = null;
            msgToSend.data = "313337";
            const msgToSendSerialized = Serializer.serialize(msgToSend);

            const msgToReceive: Message = new Message();
            msgToReceive.type = ProtocolMessageTypes.signed_values;
            msgToReceive.id = null;
            msgToReceive.data = "424242";

            let actualReceivedMessage: Message;

            const promise = manager.registerFilter({
                messageToSend: msgToSendSerialized,
                consumeMessage: (msg: Message) => {
                    if(BigNumber.from(msg.type).eq(msgToReceive.type)) {
                        actualReceivedMessage = msg;
                        return true;
                    }

                    return false;
                },
                expectedMaxRensponseWait: 10000
            });

            while(sentMessages !== 1) {
                await sleep(10);
            }
            handleMsg(Serializer.serialize(msgToReceive));

            await promise;

            expect(sentMessages).to.equal(1);
            expect(lastSentMessage!).to.not.be.undefined;
            expect(lastSentMessage!.toString("hex")).to.equal(msgToSendSerialized.toString("hex"));

            expect(actualReceivedMessage!).to.not.be.undefined;
            expect(
                BigNumber.from(actualReceivedMessage!.type).toNumber()
            ).to.equal(msgToReceive.type);
            expect(actualReceivedMessage!.id).to.equal(msgToReceive.id);
            expect(actualReceivedMessage!.data).to.equal(msgToReceive.data);

            handleMsg(Serializer.serialize(msgToReceive));

            expect(sentMessages).to.equal(1);

            await manager.close();
        });

        it("Restarts if expected response is not received in time", async () => {
            let sentMessages: number = 0;
            let channelRestarts: number = 0;
            let handleMsg: (rawMsg: Buffer) => void = () => { };

            const msgChannel: IChiaMessageChannel = {
                connect: async () => { channelRestarts += 1 },
                sendMessage: async (msg) => { sentMessages += 1; },
                close: () => { },
                isConnected: () => channelRestarts > 0,
            };
            const manager = new MessageManager(
                async (hMsg) => {
                    handleMsg = hMsg;
                    return msgChannel;
                },
                10,
                10
            );

            const handshakeMsg: Message = new Message();
            handshakeMsg.type = ProtocolMessageTypes.handshake;
            handshakeMsg.id = null;
            handshakeMsg.data = "";

            await manager.initialize();
            handleMsg(Serializer.serialize(handshakeMsg));

            expect(manager.open).to.be.true;

            const msgToSend: Message = new Message();
            msgToSend.type = ProtocolMessageTypes.transaction_ack;
            msgToSend.id = null;
            msgToSend.data = "313337";
            const msgToSendSerialized = Serializer.serialize(msgToSend);

            manager.registerFilter({
                messageToSend: msgToSendSerialized,
                consumeMessage: (msg: Message) => false,
                expectedMaxRensponseWait: 1000
            });

            await sleep(1100);

            expect(channelRestarts).to.equal(2);
            expect(sentMessages).to.equal(2);
            
            await sleep(1100);

            expect(channelRestarts).to.equal(3);
            expect(sentMessages).to.equal(3);

            await manager.close();
        }).timeout(5000);

        it("Doesn't delete filter if 'deleteAfterFirstMessageConsumed' is set to false", async () => {
            let sentMessages: number = 0;
            let channelRestarts: number = 0;
            let handleMsg: (rawMsg: Buffer) => void = () => { };

            const msgChannel: IChiaMessageChannel = {
                connect: async () => { channelRestarts += 1; },
                sendMessage: async (msg) => { sentMessages += 1; },
                close: () => { },
                isConnected: () => channelRestarts > 0,
            };
            const manager = new MessageManager(
                async (hMsg) => {
                    handleMsg = hMsg;
                    return msgChannel;
                },
                10000,
                10
            );

            const handshakeMsg: Message = new Message();
            handshakeMsg.type = ProtocolMessageTypes.handshake;
            handshakeMsg.id = null;
            handshakeMsg.data = "";

            await manager.initialize();
            handleMsg(Serializer.serialize(handshakeMsg));

            expect(manager.open).to.be.true;

            const msgToConsume: Message = new Message();
            msgToConsume.type = ProtocolMessageTypes.transaction_ack;
            msgToConsume.id = null;
            msgToConsume.data = "313337";
            const msgToConsumeSerialized = Serializer.serialize(msgToConsume);

            const msgToConsume2: Message = new Message();
            msgToConsume2.type = ProtocolMessageTypes.transaction_ack;
            msgToConsume2.id = null;
            msgToConsume2.data = "424242";
            const msgToConsume2Serialized = Serializer.serialize(msgToConsume2);

            const consumedData: bytes[] = [];

            manager.registerFilter({
                consumeMessage: (msg: Message) => {
                    if(BigNumber.from(msg.type).eq(msgToConsume2.type)) {
                        consumedData.push(msg.data);
                        return true;
                    }

                    return false;
                },
                deleteAfterFirstMessageConsumed: false
            });

            handleMsg(msgToConsumeSerialized);
            handleMsg(msgToConsume2Serialized);

            expect(consumedData.length).to.equal(2);
            expect(consumedData[0]).to.equal(msgToConsume.data);
            expect(consumedData[1]).to.equal(msgToConsume2.data);

            expect(sentMessages).to.equal(0);

            await manager.close();
        });

        it("Message gets sent instantly if channel is open when filter is registered", async () => {
            let sentMessages: number = 0;
            let channelRestarts: number = 0;
            let handleMsg: (rawMsg: Buffer) => void = () => { };

            const msgChannel: IChiaMessageChannel = {
                connect: async () => { channelRestarts += 1; },
                sendMessage: async (msg) => { sentMessages += 1; },
                close: () => { },
                isConnected: () => channelRestarts > 0,
            };
            const manager = new MessageManager(
                async (hMsg) => {
                    handleMsg = hMsg;
                    return msgChannel;
                },
                10000,
                10
            );

            const handshakeMsg: Message = new Message();
            handshakeMsg.type = ProtocolMessageTypes.handshake;
            handshakeMsg.id = null;
            handshakeMsg.data = "";

            await manager.initialize();
            handleMsg(Serializer.serialize(handshakeMsg));

            expect(manager.open).to.be.true;

            const msgToSend: Message = new Message();
            msgToSend.type = ProtocolMessageTypes.transaction_ack;
            msgToSend.id = null;
            msgToSend.data = "313337";
            const msgToSendSerialized = Serializer.serialize(msgToSend);

            await sleep(42);

            manager.registerFilter({
                messageToSend: msgToSendSerialized,
                consumeMessage: (msg: Message) => false,
            });

            expect(sentMessages).to.equal(1);

            await manager.close();
        });
    });
});