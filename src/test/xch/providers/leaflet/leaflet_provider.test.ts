/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */

import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { SExp } from "clvm";
import { AddressUtil } from "../../../../util/address";
import { CoinUtil } from "../../../../util/coin";
import { Network } from "../../../../util/network";
import { Serializer } from "../../../../util/serializer/serializer";
import { Coin } from "../../../../util/serializer/types/coin";
import { Foliage, FoliageBlockData, TransactionsInfo } from "../../../../util/serializer/types/foliage";
import { HeaderBlock } from "../../../../util/serializer/types/header_block";
import { Message, NodeType } from "../../../../util/serializer/types/outbound_message";
import { PoolTarget } from "../../../../util/serializer/types/pool_target";
import { ProofOfSpace } from "../../../../util/serializer/types/proof_of_space";
import { ProtocolMessageTypes } from "../../../../util/serializer/types/protocol_message_types";
import { RewardChainBlock } from "../../../../util/serializer/types/reward_chain_block";
import { Capability, Handshake } from "../../../../util/serializer/types/shared_protocol";
import { VDFInfo, VDFProof } from "../../../../util/serializer/types/vdf";
import { CoinState, NewPeakWallet, PuzzleSolutionResponse, RejectAdditionsRequest, RejectHeaderBlocks, RejectHeaderRequest, RejectPuzzleSolution, RejectRemovalsRequest, RespondAdditions, RespondBlockHeader, RespondChildren, RespondHeaderBlocks, RespondRemovals, RespondToCoinUpdates, RespondToPhUpdates } from "../../../../util/serializer/types/wallet_protocol";
import { getSoftwareVersion } from "../../../../util/software_version";
import { LeafletProvider } from "../../../../xch/providers/leaflet";
import { IWebSocket } from "../../../../xch/providers/leaflet/chia_message_channel";
import { Optional, PuzzleSolution } from "../../../../xch/providers/provider_types";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const addressUtil = new AddressUtil();
const coinUtil = new CoinUtil();

describe("LeafletProvider", () => {
    let openProvider: LeafletProvider;
    const _setup: (onMessageSent: (msg: Message) => void) => Promise<[LeafletProvider, (msg: Message) => void]> =
        async (onMessageSent) => {
            const obj: IWebSocket = {
                onmessage: null,
                onopen: () => { },
                send: (msg: Buffer) => onMessageSent(
                    Serializer.deserialize(Message, msg)
                ),
                close: () => { },
                onerror: () => { },
                readyState: WebSocket.CONNECTING
            };
            const webSocketOverrideCreateFunc = (_url: string) => obj;
            const provider: LeafletProvider = new LeafletProvider(
                "leaflet.fireacademy.io", "TEST-API-KEY", 12345, Network.testnet10, webSocketOverrideCreateFunc
            );

            const opener = async () => {
                while(obj.onmessage === null) {
                    await sleep(20);
                }

                obj.readyState = WebSocket.OPEN;
                obj.onopen?.("hey");
            };

            await Promise.all([
                provider.connect(),
                opener()
            ]);

            expect(provider.isConnected()).to.be.true;

            const sendMessage = (msg: Message) => obj.onmessage?.({
                data: Serializer.serialize(msg)
            });

            openProvider = provider;
            return [provider, sendMessage]
        };

    afterEach(async () => {
        if(openProvider !== undefined && openProvider?.isConnected()) {
            await openProvider?.close();
        }
    });

    describe("constructor", () => {
        it("Works", async () => {
            // as idiotic as this test is, line 29 needs to be used in a test to get full coverage :|
            // webSocketCreateFunc: (url: string) => IWebSocket = (url: string) => new WebSocket(url),
            const p = new LeafletProvider(
                "nonexistent.fireacademy.io", "TEST-API-KEY", 18444, Network.testnet0
            );
            expect(p.isConnected()).to.be.false;
            expect(p.close).to.not.throw;
            expect(p.getNetworkId()).to.equal(Network.testnet0);
            expect(await p.getBlockNumber()).to.be.null;

            await p.connect();

            expect(p.isConnected()).to.be.true;

            await p.close();
        });
    }).timeout(10000);

    describe("connect()", () => {
        it("Sends handshake message", async () => {
            let sentMessages: number = 0;
            let lastSentMessage: Message;

            const [provider] = await _setup((msg) => {
                sentMessages += 1;
                lastSentMessage = msg;
            });

            expect(provider.isConnected()).to.be.true;
            expect(sentMessages).to.equal(1);

            expect(lastSentMessage!).to.not.be.undefined;
            expect(
                BigNumber.from(lastSentMessage!.type).toNumber()
            ).to.equal(ProtocolMessageTypes.handshake);
            expect(lastSentMessage!.id).to.be.null;

            const handshake: Handshake = Serializer.deserialize(
                Handshake,
                Buffer.from(lastSentMessage!.data, "hex")
            );
            expect(handshake.networkId).to.equal(Network.testnet10);
            expect(
                handshake.protocolVersion.startsWith("0.0.")
            ).to.be.true;
            expect(handshake.softwareVersion).to.equal(getSoftwareVersion());
            expect(
                BigNumber.from(handshake.serverPort).toNumber()
            ).to.equal(12345);
            expect(
                BigNumber.from(handshake.nodeType).toNumber()
            ).to.equal(NodeType.WALLET);
            expect(handshake.capabilities.length).to.equal(1);
            expect(
                BigNumber.from(handshake.capabilities[0][0]).toNumber()
            ).to.equal(Capability.BASE);
            expect(handshake.capabilities[0][1]).to.equal("1");
        });
    });

    describe("getNetworkId()", () => {
        it("Correctly reports network id when none is provided", async () => {
            const provider: LeafletProvider = new LeafletProvider(
                "leaflet.fireacademy.io", "TEST-API-KEY"
            );

            expect(provider.getNetworkId()).to.equal(Network.mainnet);
        });

        it("Correctly reports network id when one is provided", async () => {
            const provider: LeafletProvider = new LeafletProvider(
                "leaflet.fireacademy.io", "TEST-API-KEY", 12345, Network.testnet7
            );

            expect(provider.getNetworkId()).to.equal(Network.testnet7);
        });
    });

    describe("getBlockNumber()", () => {
        it("Returns null if the channel is not connected", async () => {
            const provider: LeafletProvider = new LeafletProvider(
                "leaflet.fireacademy.io", "TEST-API-KEY"
            );

            expect(await provider.getBlockNumber()).to.be.null;
        });

        it("Returns correct values if new_peak_wallet messages are received", async () => {
            const [provider, sendMessage] = await _setup(() => {});

            const newPeak: NewPeakWallet = new NewPeakWallet();
            newPeak.headerHash = "00".repeat(32);
            newPeak.height = 1337;
            newPeak.weight = 1;
            newPeak.forkPointWithPreviousPeak = 176;
            
            const newPeakMessage: Message = new Message();
            newPeakMessage.type = ProtocolMessageTypes.new_peak_wallet;
            newPeakMessage.id = null;
            newPeakMessage.data = Serializer.serialize(newPeak).toString("hex");

            sendMessage(newPeakMessage);
            expect(await provider.getBlockNumber()).to.equal(1337);

            const notAPeak: RespondChildren = new RespondChildren();
            notAPeak.coinStates = [];

            const notAPeakMessage: Message = new Message();
            notAPeakMessage.type = ProtocolMessageTypes.respond_children;
            notAPeakMessage.id = null;
            notAPeakMessage.data = Serializer.serialize(notAPeak).toString("hex");

            sendMessage(notAPeakMessage);
            expect(await provider.getBlockNumber()).to.equal(1337);

            const newNewPeak: NewPeakWallet = new NewPeakWallet();
            newNewPeak.headerHash = "01".repeat(32);
            newNewPeak.height = 42000000;
            newNewPeak.weight = 2;
            newNewPeak.forkPointWithPreviousPeak = 177;

            const newNewPeakMessage: Message = new Message();
            newNewPeakMessage.type = ProtocolMessageTypes.new_peak_wallet;
            newNewPeakMessage.id = null;
            newNewPeakMessage.data = Serializer.serialize(newNewPeak).toString("hex");

            sendMessage(newNewPeakMessage);
            expect(await provider.getBlockNumber()).to.equal(42000000);
        });
    });

    const _getMockCoinStates = (puzzHash: string) => {
        // will be included in balance
        const coin1 = new Coin();
        coin1.puzzleHash = puzzHash;
        coin1.parentCoinInfo = "01".repeat(32);
        coin1.amount = 13;
        const coinState1 = new CoinState();
        coinState1.createdHeight = 10;
        coinState1.spentHeight = null;
        coinState1.coin = coin1;

        // will NOT be included in balance
        const coin2 = new Coin();
        coin2.puzzleHash = "43".repeat(32);
        coin2.parentCoinInfo = "02".repeat(32);
        coin2.amount = 100;
        const coinState2 = new CoinState();
        coinState2.createdHeight = 10;
        coinState2.spentHeight = null;
        coinState2.coin = coin2;

        // will NOT be included in balance
        const coin3 = new Coin();
        coin3.puzzleHash = puzzHash;
        coin3.parentCoinInfo = "03".repeat(32);
        coin3.amount = 100;
        const coinState3 = new CoinState();
        coinState3.createdHeight = 10;
        coinState3.spentHeight = 11;
        coinState3.coin = coin3;

        // will be be included in balance
        const coin4 = new Coin();
        coin4.puzzleHash = puzzHash;
        coin4.parentCoinInfo = "04".repeat(32);
        coin4.amount = 29;
        const coinState4 = new CoinState();
        coinState4.createdHeight = 10;
        coinState4.spentHeight = null;
        coinState4.coin = coin4;

        return [coinState1, coinState2, coinState3, coinState4];
    }

    describe("getBalance()", () => {
        it("Returns null if neither address nor puzzleHash are supplied", async () => {
            const [provider] = await _setup(() => { });
            expect(
                await provider.getBalance({})
            ).to.be.null;
        });

        it("Returns null if the supplied address is not valid", async () => {
            const [provider] = await _setup(() => { });
            expect(
                await provider.getBalance({
                    address: "xchnotvalid"
                })
            ).to.be.null;
        });

        it("Works if given a puzzle hash", async () => {
            let lastMessage: Message;
            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });

            const puzzHash = "42".repeat(32);
            const funcPromise = provider.getBalance({
                puzzleHash: puzzHash,
                minHeight: 0x1337
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.register_interest_in_puzzle_hash
            ) {
                await sleep(10);
            }
            
            const resp: RespondToPhUpdates = new RespondToPhUpdates();
            resp.puzzleHashes = [puzzHash];
            resp.minHeight = 0x1337;
            resp.coinStates = [];

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.respond_to_ph_update;
            msg.id = null;
            msg.data = Serializer.serialize(resp).toString("hex");

            sendMessage(msg);

            const result = await funcPromise;
            expect(
                BigNumber.from(result ?? 5).eq(0)
            ).to.be.true;
        });

        it("Works if given an address", async () => {
            let lastMessage: Message;
            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });

            const puzzHash = "42".repeat(32);
            const address = addressUtil.puzzleHashToAddress(puzzHash);
            const funcPromise = provider.getBalance({
                address
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.register_interest_in_puzzle_hash
            ) {
                await sleep(10);
            }

            const [coinState1, coinState2, coinState3, coinState4] = _getMockCoinStates(puzzHash);

            const resp: RespondToPhUpdates = new RespondToPhUpdates();
            resp.puzzleHashes = [ puzzHash, "43".repeat(32) ];
            resp.minHeight = 1;
            resp.coinStates = [ coinState1, coinState2, coinState3, coinState4 ];

            // test to make sure that the filter doesn't pick other message types
            const resp2: RespondToPhUpdates = new RespondToPhUpdates();
            resp2.puzzleHashes = [ puzzHash, "43".repeat(32) ];
            resp2.minHeight = 1;
            resp2.coinStates = [ coinState1 ];

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.respond_additions;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);

            // test to make sure that the filter doesn't pick messages about other puzzle hashes
            const resp3: RespondToPhUpdates = new RespondToPhUpdates();
            resp3.puzzleHashes = [ "43".repeat(32) ];
            resp3.minHeight = 1;
            resp3.coinStates = [ coinState1 ];

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.respond_to_ph_update;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);

            // test to make sure that the filter doesn't pick messages with other minHeight
            const resp4: RespondToPhUpdates = new RespondToPhUpdates();
            resp4.puzzleHashes = [ puzzHash, "43".repeat(32) ];
            resp4.minHeight = 50;
            resp4.coinStates = [ coinState1 ];

            const msg4: Message = new Message();
            msg4.type = ProtocolMessageTypes.respond_to_ph_update;
            msg4.id = null;
            msg4.data = Serializer.serialize(resp4).toString("hex");

            sendMessage(msg4);

            // actual message
            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.respond_to_ph_update;
            msg.id = null;
            msg.data = Serializer.serialize(resp).toString("hex");

            sendMessage(msg);

            const result = await funcPromise;
            expect(
                BigNumber.from(result ?? 5).eq(42)
            ).to.be.true;
        });
    });

    describe("subscribeToPuzzleHashUpdates()", () => {
        it("Retrns if puzzleHash is not valid", async () => {
            let lastMessage: Message = new Message();

            const [provider] = await _setup((msg) => {
                lastMessage = msg;
            });

            provider.subscribeToPuzzleHashUpdates({
                puzzleHash: "42".repeat(33),
                callback: () => { }
            });

            await sleep(42);

            expect(
                BigNumber.from(lastMessage.type).toNumber()
            ).to.not.equal(ProtocolMessageTypes.register_interest_in_puzzle_hash);
        });

        it("Works", async () => {
            const puzzHash = "42".repeat(32);
            let callbackCalls: number = 0;
            let lastStates: CoinState[] = [];
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });

            provider.subscribeToPuzzleHashUpdates({
                puzzleHash: puzzHash,
                callback: (states) => {
                    callbackCalls += 1;
                    lastStates = states;
                }
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.register_interest_in_puzzle_hash
            ) {
                await sleep(10);
            }

            expect(callbackCalls).to.equal(0);
            expect(lastStates.length).to.equal(0);

            const [coinState1, coinState2, coinState3, coinState4] = _getMockCoinStates(puzzHash);
            const coinStates = [coinState1, coinState2, coinState3, coinState4];

            const resp1: RespondToPhUpdates = new RespondToPhUpdates();
            resp1.minHeight = 1;
            resp1.coinStates = [coinState1 ];
            resp1.puzzleHashes = [ puzzHash, "43".repeat(32) ];

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.respond_to_ph_update;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            expect(callbackCalls).to.equal(1);
            expect(lastStates.length).to.equal(1);
            expect(lastStates[0].coin.parentCoinInfo).to.equal("01".repeat(32));

            // test to make sure that the filter doesn't pick messages about other puzzle hashes
            const resp2: RespondToPhUpdates = new RespondToPhUpdates();
            resp2.minHeight = 1;
            resp2.coinStates = [coinState1];
            resp2.puzzleHashes = ["43".repeat(32)];

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.respond_to_ph_update;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);
            expect(callbackCalls).to.equal(1);

            // test to make sure that the filter doesn't pick messages with other minHeight
            const resp3: RespondToPhUpdates = new RespondToPhUpdates();
            resp3.minHeight = 10;
            resp3.coinStates = [coinState1];
            resp3.puzzleHashes = [puzzHash];

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.respond_to_ph_update;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);
            expect(callbackCalls).to.equal(1);

            // test to make sure that the filter doesn't pick other message types
            const resp4: RespondToPhUpdates = new RespondToPhUpdates();
            resp4.minHeight = 1;
            resp4.coinStates = [coinState1];
            resp4.puzzleHashes = [puzzHash];

            const msg4: Message = new Message();
            msg4.type = ProtocolMessageTypes.respond_to_coin_update;
            msg4.id = null;
            msg4.data = Serializer.serialize(resp4).toString("hex");

            sendMessage(msg4);
            expect(callbackCalls).to.equal(1);

            // test another one
            const resp5: RespondToPhUpdates = new RespondToPhUpdates();
            resp5.minHeight = 1;
            resp5.coinStates = coinStates;
            resp5.puzzleHashes = [puzzHash, "43".repeat(32)];

            const msg5: Message = new Message();
            msg5.type = ProtocolMessageTypes.respond_to_ph_update;
            msg5.id = null;
            msg5.data = Serializer.serialize(resp5).toString("hex");

            sendMessage(msg5);
            expect(callbackCalls).to.equal(2);
            expect(lastStates.length).to.equal(3);
            expect(lastStates[0].coin.parentCoinInfo).to.equal("01".repeat(32));
            expect(lastStates[1].coin.parentCoinInfo).to.equal("03".repeat(32));
            expect(lastStates[2].coin.parentCoinInfo).to.equal("04".repeat(32));
        });
    });

    describe("subscribeToCoinUpdates()", () => {
        it("Retrns if coinId is not valid", async () => {
            let lastMessage: Message = new Message();

            const [provider] = await _setup((msg) => {
                lastMessage = msg;
            });

            provider.subscribeToCoinUpdates({
                coinId: "42".repeat(33),
                callback: () => { }
            });

            await sleep(42);

            expect(
                BigNumber.from(lastMessage.type).toNumber()
            ).to.not.equal(ProtocolMessageTypes.register_interest_in_coin);
        });

        it("Works", async () => {
            let callbackCalls: number = 0;
            let lastStates: CoinState[] = [];
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });

            const coin = new Coin();
            coin.amount = 1;
            coin.parentCoinInfo = "12".repeat(32);
            coin.puzzleHash = "34".repeat(32);

            const coinState = new CoinState();
            coinState.coin = coin;
            coinState.createdHeight = 7;
            coinState.spentHeight = null;

            const coinId = coinUtil.getId(coin);

            provider.subscribeToCoinUpdates({
                coinId,
                callback: (states) => {
                    callbackCalls += 1;
                    lastStates = states;
                }
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.register_interest_in_coin
            ) {
                await sleep(10);
            }

            expect(callbackCalls).to.equal(0);
            expect(lastStates.length).to.equal(0);

            const resp1: RespondToCoinUpdates = new RespondToCoinUpdates();
            resp1.minHeight = 1;
            resp1.coinIds = [ coinId, "42".repeat(32) ];
            resp1.coinStates = [];
            
            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.respond_to_coin_update;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            expect(callbackCalls).to.equal(1);
            expect(lastStates.length).to.equal(0);

            // test to make sure that the filter doesn't pick messages about other puzzle hashes
            const resp2: RespondToCoinUpdates = new RespondToCoinUpdates();
            resp2.minHeight = 1;
            resp2.coinIds = ["42".repeat(32)];
            resp2.coinStates = [coinState];

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.respond_to_coin_update;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);
            expect(callbackCalls).to.equal(1);

            // test to make sure that the filter doesn't pick messages with other minHeight
            const resp3: RespondToCoinUpdates = new RespondToCoinUpdates();
            resp3.minHeight = 10;
            resp3.coinStates = [coinState];
            resp3.coinIds = [coinId];

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.respond_to_coin_update;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);
            expect(callbackCalls).to.equal(1);

            // test to make sure that the filter doesn't pick other message types
            const resp4: RespondToCoinUpdates = new RespondToCoinUpdates();
            resp4.minHeight = 1;
            resp4.coinStates = [coinState];
            resp4.coinIds = [coinId];

            const msg4: Message = new Message();
            msg4.type = ProtocolMessageTypes.respond_to_ph_update;
            msg4.id = null;
            msg4.data = Serializer.serialize(resp4).toString("hex");

            sendMessage(msg4);
            expect(callbackCalls).to.equal(1);

            // test another one
            const resp5: RespondToCoinUpdates = new RespondToCoinUpdates();
            resp5.minHeight = 1;
            resp5.coinIds = [coinId];
            resp5.coinStates = [coinState];

            const msg5: Message = new Message();
            msg5.type = ProtocolMessageTypes.respond_to_coin_update;
            msg5.id = null;
            msg5.data = Serializer.serialize(resp5).toString("hex");

            sendMessage(msg5);
            expect(callbackCalls).to.equal(2);
            expect(lastStates.length).to.equal(1);
            expect(coinUtil.getId(lastStates[0].coin)).to.equal(coinId);
        });
    });

    describe("getPuzzleSolution()", () => {
        it("Returns null if an invalid coinId is given", async () => {
            let sentMessages: number = 0;
            const [provider] = await _setup(() => { sentMessages += 1; });
            expect(
                await provider.getPuzzleSolution({
                    height: 5, coinId: "0xinvalid"
                })
            ).to.be.null;
            expect(sentMessages).to.equal(1);
        });

        it("Correctly handles puzzle solution responses", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });

            const coinId = "42".repeat(32);
            const promise = provider.getPuzzleSolution({
                height: 5, coinId
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_puzzle_solution
            ) {
                await sleep(10);
            }

            // test to make sure that the filter doesn't pick messages about other coins
            const resp1: PuzzleSolutionResponse = new PuzzleSolutionResponse();
            resp1.coinName = "43".repeat(7);
            resp1.height = 5;
            resp1.puzzle = SExp.to(1);
            resp1.solution = SExp.to(2);

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.respond_puzzle_solution;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            // test to make sure that the filter doesn't pick messages with other height
            const resp2: PuzzleSolutionResponse = new PuzzleSolutionResponse();
            resp2.coinName = coinId;
            resp2.height = 1337;
            resp2.puzzle = SExp.to(3);
            resp2.solution = SExp.to(4);

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.respond_puzzle_solution;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);

            // test to make sure that the filter doesn't pick other message types
            const resp3: PuzzleSolutionResponse = new PuzzleSolutionResponse();
            resp3.coinName = coinId;
            resp3.height = 5;
            resp3.puzzle = SExp.to(5);
            resp3.solution = SExp.to(6);

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.respond_additions;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);

            // real response packet
            const resp4: PuzzleSolutionResponse = new PuzzleSolutionResponse();
            resp4.coinName = coinId;
            resp4.height = 5;
            resp4.puzzle = SExp.to(7);
            resp4.solution = SExp.to(8);

            const msg4: Message = new Message();
            msg4.type = ProtocolMessageTypes.respond_puzzle_solution;
            msg4.id = null;
            msg4.data = Serializer.serialize(resp4).toString("hex");

            sendMessage(msg4);

            const resp: Optional<PuzzleSolution> = await promise;

            expect(resp).to.not.be.null;
            expect(resp?.coinName).to.equal(coinId);
            expect(
                BigNumber.from(resp?.height).toNumber()
            ).to.equal(5);
            expect(resp?.puzzle.toString()).to.equal("07");
            expect(resp?.solution.toString()).to.equal("08");
        });
        
        it("Correctly handles puzzle solution rejections", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });

            const coinId = "42".repeat(32);
            const promise = provider.getPuzzleSolution({
                coinId, height: 19
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_puzzle_solution
            ) {
                await sleep(10);
            }

            // test to make sure that the filter doesn't pick messages about other coins
            const resp1: RejectPuzzleSolution = new RejectPuzzleSolution();
            resp1.coinName = "43".repeat(7);
            resp1.height = 19;

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.reject_puzzle_solution;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            // test to make sure that the filter doesn't pick messages with other height
            const resp2: RejectPuzzleSolution = new RejectPuzzleSolution();
            resp2.coinName = coinId;
            resp2.height = 20;

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.reject_puzzle_solution;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);

            // test to make sure that the filter doesn't pick other message types
            const resp3: RejectPuzzleSolution = new RejectPuzzleSolution();
            resp3.coinName = coinId;
            resp3.height = 19;

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.reject_additions_request;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);

            // real response packet
            const resp4: RejectPuzzleSolution = new RejectPuzzleSolution();
            resp4.coinName = coinId;
            resp4.height = 19;

            const msg4: Message = new Message();
            msg4.type = ProtocolMessageTypes.reject_puzzle_solution;
            msg4.id = null;
            msg4.data = Serializer.serialize(resp4).toString("hex");

            sendMessage(msg4);

            const resp: Optional<PuzzleSolution> = await promise;

            expect(resp).to.be.null;
        });
    });

    describe("getCoinChildren()", () => {
        it("Correctly handles incorrect coin ids", async () => {
            const [provider] = await _setup(() => {});
            const resp = await provider.getCoinChildren({
                coinId: "0a1b2cinvalid"
            });

            expect(resp.length).to.equal(0);
        });

        it("Correctly handles empty RespondChildren packets", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const coinId = "42".repeat(32);

            const promise = provider.getCoinChildren({ coinId });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_children
            ) {
                await sleep(10);
            }

            const resp1: RespondChildren = new RespondChildren();
            resp1.coinStates = [];

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.respond_children;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            const response = await promise;
            expect(response.length).to.equal(0);
        });

        it("Correctly matches RespondChildren packets", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const coinId = "42".repeat(32);

            const promise = provider.getCoinChildren({ coinId });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_children
            ) {
                await sleep(10);
            }

            // test to make sure that the filter doesn't pick messages about other coins
            const otherCoin: Coin = new Coin();
            otherCoin.puzzleHash = "01".repeat(32);
            otherCoin.amount = 1;
            otherCoin.parentCoinInfo = "43".repeat(32);

            const otherCoinState: CoinState = new CoinState();
            otherCoinState.coin = otherCoin;
            otherCoinState.createdHeight = 1;
            otherCoinState.spentHeight = null;

            const resp1: RespondChildren = new RespondChildren();
            resp1.coinStates = [ otherCoinState];

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.respond_children;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            // test to make sure that the filter doesn't pick other message types
            const theCoin: Coin = new Coin();
            theCoin.puzzleHash = "02".repeat(32);
            theCoin.amount = 2;
            theCoin.parentCoinInfo = coinId;

            const theCoinState: CoinState = new CoinState();
            theCoinState.coin = theCoin;
            theCoinState.createdHeight = 2;
            theCoinState.spentHeight = 3;

            const resp2: RespondChildren = new RespondChildren();
            resp2.coinStates = [theCoinState];

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.request_children;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);

            // real packet
            const coin: Coin = new Coin();
            coin.puzzleHash = "03".repeat(32);
            coin.amount = 3;
            coin.parentCoinInfo = coinId;

            const coinState: CoinState = new CoinState();
            coinState.coin = coin;
            coinState.createdHeight = 7;
            coinState.spentHeight = 7;

            const resp3: RespondChildren = new RespondChildren();
            resp3.coinStates = [coinState];

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.respond_children;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);

            const response = await promise;

            expect(response.length).to.equal(1);
            expect(
                BigNumber.from(response[0].createdHeight).toNumber()
            ).to.equal(7);
            expect(
                BigNumber.from(response[0].spentHeight).toNumber()
            ).to.equal(7);
            expect(
                BigNumber.from(response[0].coin.amount).toNumber()
            ).to.equal(3);
            expect(response[0].coin.parentCoinInfo).to.equal(coinId);
            expect(response[0].coin.puzzleHash).to.equal("03".repeat(32));
        });
    });

    const _createDummyHeaderBlock = (height: number, dummyStr: string, dummyNum: number, makeFees: boolean = false) => {
        const ti: TransactionsInfo = new TransactionsInfo();
        ti.generatorRoot = dummyStr.repeat(32);
        ti.generatorRefsRoot = dummyStr.repeat(32);
        ti.aggregatedSignature = dummyStr.repeat(96);
        ti.fees = dummyNum;
        ti.cost = dummyNum;
        ti.rewardClaimsIncorporated = [];
        
        const pt: PoolTarget = new PoolTarget();
        pt.puzzleHash = dummyStr.repeat(32);
        pt.maxHeight = height;

        const fbd: FoliageBlockData = new FoliageBlockData();
        fbd.unfinishedRewardBlockHash = dummyStr.repeat(32);
        fbd.poolTarget = pt;
        fbd.poolSignature = null;
        fbd.farmerRewardPuzzleHash = dummyStr.repeat(32);
        fbd.extensionData = dummyStr.repeat(32);

        const f: Foliage = new Foliage();
        f.prevBlockHash = dummyStr.repeat(32);
        f.rewardBlockHash = dummyStr.repeat(32);
        f.foliageBlockData = fbd;
        f.foliageBlockDataSignature = dummyStr.repeat(96);
        f.foliageTransactionBlockHash = null;
        f.foliageTransactionBlockSignature = null;

        const vdfp: VDFProof = new VDFProof();
        vdfp.witnessType = dummyNum;
        vdfp.witness = dummyStr;
        vdfp.normalizedToIdentity = false;

        const vdfi: VDFInfo = new VDFInfo();
        vdfi.challenge = dummyStr.repeat(32);
        vdfi.numberOfIterations = dummyNum;
        vdfi.output = dummyStr.repeat(100);

        const pos: ProofOfSpace = new ProofOfSpace();
        pos.challenge = dummyStr.repeat(32);
        pos.poolPublicKey = null;
        pos.poolContractPuzzleHash = null;
        pos.plotPublicKey = dummyStr.repeat(48);
        pos.size = dummyNum;
        pos.proof = dummyStr;
        
        const rcb: RewardChainBlock = new RewardChainBlock();
        rcb.weight = dummyNum;
        rcb.height = height;
        rcb.totalIters = dummyNum;
        rcb.signagePointIndex = dummyNum;
        rcb.posSsCcChallengeHash = dummyStr.repeat(32);
        rcb.proofOfSpace = pos;
        rcb.challengeChainSpVdf = null;
        rcb.challengeChainSpSignature = dummyStr.repeat(96);
        rcb.challengeChainIpVdf = vdfi;
        rcb.rewardChainSpVdf = null;
        rcb.rewardChainSpSignature = dummyStr.repeat(96);
        rcb.rewardChainIpVdf = vdfi;
        rcb.infusedChallengeChainIpVdf = null;
        rcb.isTransactionBlock = false;
        
        const hb: HeaderBlock = new HeaderBlock();
        hb.finishedSubSlots = [];
        hb.rewardChainBlock = rcb;
        hb.challengeChainSpProof = null;
        hb.challengeChainIpProof = vdfp;
        hb.rewardChainSpProof = null;
        hb.rewardChainIpProof = vdfp;
        hb.infusedChallengeChainIpProof = null;
        hb.foliage = f;
        hb.foliageTransactionBlock = null;
        hb.transactionsFilter = dummyStr;
        hb.transactionsInfo = makeFees ? ti : null;

        return hb;
    }

    describe("getBlockHeader()", () => {
        it("Correctly handles RejectHeaderRequest messages", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const height = 7;

            const promise = provider.getBlockHeader({ height });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_block_header
            ) {
                await sleep(10);
            }

            const resp: RejectHeaderRequest = new RejectHeaderRequest();
            resp.height = height;

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.reject_header_request;
            msg.id = null;
            msg.data = Serializer.serialize(resp).toString("hex");

            sendMessage(msg);

            const result = await promise;
            expect(result).to.be.null;
        });

        it("Works", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const height = 7;

            const promise = provider.getBlockHeader({ height });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_block_header
            ) {
                await sleep(10);
            }

            // it should ignore reject messages with a different height
            const resp1: RejectHeaderRequest = new RejectHeaderRequest();
            resp1.height = height + 1;

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.reject_header_request;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            // it should ignore response messages with a different height
            const resp2: RespondBlockHeader = new RespondBlockHeader();
            resp2.headerBlock = _createDummyHeaderBlock(height + 1, "01", 1);

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.respond_block_header;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);

            // real packet
            const resp3: RespondBlockHeader = new RespondBlockHeader();
            resp3.headerBlock = _createDummyHeaderBlock(height, "02", 2, true);

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.respond_block_header;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);

            const result = await promise;
            expect(result).to.not.be.null;
            expect(
                BigNumber.from(result?.height).toNumber()
            ).to.equal(height);
            expect(result?.headerHash).to.equal(resp3.headerBlock.headerHash()); // only this check is actually needed
            expect(result?.prevBlockHash).to.equal("02".repeat(32));
            expect(result?.isTransactionBlock).to.be.false;
            expect(
                BigNumber.from(result?.fees).toNumber()
            ).to.equal(2);
            expect(result?.farmerPuzzleHash).to.equal("02".repeat(32));
            expect(result?.poolPuzzleHash).to.equal("02".repeat(32));
        });
    });

    describe("getBlocksHeaders()", () => {
        it("Correctly handles RejectHeaderBlocks messages", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const startHeight = 7;
            const endHeight = 13;

            const promise = provider.getBlocksHeaders({ startHeight, endHeight });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_header_blocks
            ) {
                await sleep(10);
            }

            const resp: RejectHeaderBlocks = new RejectHeaderBlocks();
            resp.startHeight = startHeight;
            resp.endHeight = endHeight;

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.reject_header_blocks;
            msg.id = null;
            msg.data = Serializer.serialize(resp).toString("hex");

            sendMessage(msg);

            const result = await promise;
            expect(result).to.be.null;
        });

        it("Works", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const startHeight = 7;
            const endHeight = 8;

            const promise = provider.getBlocksHeaders({ startHeight, endHeight });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_header_blocks
            ) {
                await sleep(10);
            }

            // it should ignore reject messages with a different startHeight
            const resp1: RejectHeaderBlocks = new RejectHeaderBlocks();
            resp1.startHeight = startHeight - 1;
            resp1.endHeight = endHeight;

            const msg1: Message = new Message();
            msg1.type = ProtocolMessageTypes.reject_header_blocks;
            msg1.id = null;
            msg1.data = Serializer.serialize(resp1).toString("hex");

            sendMessage(msg1);

            // it should ignore reject messages with a different endHeight
            const resp2: RejectHeaderBlocks = new RejectHeaderBlocks();
            resp2.startHeight = startHeight;
            resp2.endHeight = endHeight + 1;

            const msg2: Message = new Message();
            msg2.type = ProtocolMessageTypes.reject_header_blocks;
            msg2.id = null;
            msg2.data = Serializer.serialize(resp2).toString("hex");

            sendMessage(msg2);

            // it should ignore reject messages with different startHeight and endHeight
            const resp3: RejectHeaderBlocks = new RejectHeaderBlocks();
            resp3.startHeight = startHeight - 1;
            resp3.endHeight = endHeight + 1;

            const msg3: Message = new Message();
            msg3.type = ProtocolMessageTypes.reject_header_blocks;
            msg3.id = null;
            msg3.data = Serializer.serialize(resp3).toString("hex");

            sendMessage(msg3);

            // it should ignore response messages with a different startHeight
            const resp4: RespondHeaderBlocks = new RespondHeaderBlocks();
            resp4.startHeight = startHeight - 1;
            resp4.endHeight = endHeight;
            resp4.headerBlocks = [];
            for(let i = startHeight - 1; i <= endHeight; ++i) {
                resp4.headerBlocks.push(
                    _createDummyHeaderBlock(i, "00", 0)
                );
            }

            const msg4: Message = new Message();
            msg4.type = ProtocolMessageTypes.respond_header_blocks;
            msg4.id = null;
            msg4.data = Serializer.serialize(resp4).toString("hex");

            sendMessage(msg4);

            // it should ignore response messages with a different endHeight
            const resp5: RespondHeaderBlocks = new RespondHeaderBlocks();
            resp5.startHeight = startHeight;
            resp5.endHeight = endHeight + 1;
            resp5.headerBlocks = [];
            for(let i = startHeight; i <= endHeight + 1; ++i) {
                resp5.headerBlocks.push(
                    _createDummyHeaderBlock(i, "00", 0)
                );
            }

            const msg5: Message = new Message();
            msg5.type = ProtocolMessageTypes.respond_header_blocks;
            msg5.id = null;
            msg5.data = Serializer.serialize(resp5).toString("hex");

            sendMessage(msg5);

            // it should ignore response messages with different startHeight and endHeight
            const resp6: RespondHeaderBlocks = new RespondHeaderBlocks();
            resp6.startHeight = startHeight - 1;
            resp6.endHeight = endHeight + 1;
            resp6.headerBlocks = [];
            for(let i = startHeight - 1; i <= endHeight + 1; ++i) {
                resp6.headerBlocks.push(
                    _createDummyHeaderBlock(i, "00", 0)
                );
            }

            const msg6: Message = new Message();
            msg6.type = ProtocolMessageTypes.respond_header_blocks;
            msg6.id = null;
            msg6.data = Serializer.serialize(resp6).toString("hex");

            sendMessage(msg6);

            // real packet
            const expectedHeaderBlocks: HeaderBlock[] = [];
            for(let i = startHeight; i <= endHeight; ++i) {
                expectedHeaderBlocks.push(
                    _createDummyHeaderBlock(i, "42", 3)
                );
            }

            const resp7: RespondHeaderBlocks = new RespondHeaderBlocks();
            resp7.startHeight = startHeight;
            resp7.endHeight = endHeight;
            resp7.headerBlocks = expectedHeaderBlocks;

            const msg7: Message = new Message();
            msg7.type = ProtocolMessageTypes.respond_header_blocks;
            msg7.id = null;
            msg7.data = Serializer.serialize(resp7).toString("hex");

            sendMessage(msg7);

            const result = await promise;
            expect(result).to.not.be.null;
            expect(result?.length).to.equal(endHeight - startHeight + 1);
            for(let i  = 0; i <= endHeight - startHeight; ++i) {
                expect(result?.[i].headerHash).to.equal(expectedHeaderBlocks[i].headerHash());
            }
        });
    });

    describe("getCoinRemovals()", () => {
        it("Correctly handles an invalid headerHash", async () => {
            const [provider] = await _setup(() => { });
            const res = await provider.getCoinRemovals({
                height: 18,
                headerHash: "42".repeat(31),
            });

            expect(res).to.be.null;
        });

        it("Correctly handles invalid coinIds", async () => {
            const [provider] = await _setup(() => { });
            const res = await provider.getCoinRemovals({
                height: 18,
                headerHash: "42".repeat(32),
                coinIds: ["41".repeat(32), "43".repeat(32), "44"]
            });

            expect(res).to.be.null;
        });

        it("Correcly handles a RejectRemovalsRequest message", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const headerHash = "42".repeat(32);
            const height = 18;

            const promise = provider.getCoinRemovals({
                headerHash,
                height,
                coinIds: ["41".repeat(32)]
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_removals
            ) {
                await sleep(10);
            }

            const resp: RejectRemovalsRequest = new RejectRemovalsRequest();
            resp.headerHash = headerHash;
            resp.height = height;

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.reject_removals_request;
            msg.id = null;
            msg.data = Serializer.serialize(resp).toString("hex");

            sendMessage(msg);

            const result = await promise;
            expect(result).to.be.null;
        });

        it("Works", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const headerHash = "42".repeat(32);
            const height = 18;

            const promise = provider.getCoinRemovals({ headerHash, height });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_removals
            ) {
                await sleep(10);
            }

            const _createDummyCoin = (dummyStr: string) => {
                const c: Coin = new Coin();
                c.amount = 1;
                c.parentCoinInfo = dummyStr.repeat(32);
                c.puzzleHash = dummyStr.repeat(32);

                return c;
            };


            const wrongCoins: Array<[string, Optional<Coin>]> = [
                ["01".repeat(32), _createDummyCoin("00")]
            ];

            const goodCoins: Array<[string, Optional<Coin>]> = [
                ["01".repeat(32), _createDummyCoin("31")],
                ["02".repeat(32), null],
                ["03".repeat(32), _createDummyCoin("33")],
                ["04".repeat(32), _createDummyCoin("37")]
            ];

            [true, false].forEach((wrongHeight) => {
                [true, false].forEach((wrongHeaderHash) => {
                    const rejectResp: RejectRemovalsRequest = new RejectRemovalsRequest();
                    rejectResp.headerHash = wrongHeaderHash ? ("00".repeat(32)) : headerHash;
                    rejectResp.height = (wrongHeight ? 1 : 0) + height;

                    const rejectMsg: Message = new Message();
                    rejectMsg.type = ProtocolMessageTypes.reject_removals_request;
                    rejectMsg.id = null;
                    rejectMsg.data = Serializer.serialize(rejectResp).toString("hex");

                    if(wrongHeight || wrongHeaderHash) { // don't send a valid reject message
                        sendMessage(rejectMsg);
                    }

                    const acceptResp: RespondRemovals = new RespondRemovals();
                    acceptResp.headerHash = wrongHeaderHash ? ("00".repeat(32)) : headerHash;
                    acceptResp.height = (wrongHeight ? 1 : 0) + height;
                    acceptResp.proofs = null;
                    acceptResp.coins = (wrongHeight || wrongHeaderHash) ? wrongCoins : goodCoins;

                    const acceptMsg: Message = new Message();
                    acceptMsg.type = ProtocolMessageTypes.respond_removals;
                    acceptMsg.id = null;
                    acceptMsg.data = Serializer.serialize(acceptResp).toString("hex");

                    sendMessage(acceptMsg);
                });
            });

            const result = await promise;
            expect(result).to.not.be.null;
            expect(result?.length).to.equal(3);
            expect(result?.[0].puzzleHash).to.equal("31".repeat(32));
            expect(result?.[1].puzzleHash).to.equal("33".repeat(32));
            expect(result?.[2].puzzleHash).to.equal("37".repeat(32));
        });
    });

    describe("getCoinAdditions()", () => {
        it("Correctly handles an invalid headerHash", async () => {
            const [provider] = await _setup(() => { });
            const res = await provider.getCoinAdditions({
                height: 18,
                headerHash: "42".repeat(31)
            });

            expect(res).to.be.null;
        });

        it("Correctly handles invalid puzzleHashes", async () => {
            const [provider] = await _setup(() => { });
            const res = await provider.getCoinAdditions({
                height: 18,
                headerHash: "42".repeat(32),
                puzzleHashes: ["41".repeat(32), "43".repeat(32), "44"]
            });

            expect(res).to.be.null;
        });

        it("Correcly handles a RejectAdditionsRequest message", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const headerHash = "42".repeat(32);
            const height = 18;

            const promise = provider.getCoinAdditions({
                headerHash, height,
                puzzleHashes: ["41".repeat(32), "43".repeat(32) ]
            });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_additions
            ) {
                await sleep(10);
            }

            const resp: RejectAdditionsRequest = new RejectAdditionsRequest();
            resp.headerHash = headerHash;
            resp.height = height;

            const msg: Message = new Message();
            msg.type = ProtocolMessageTypes.reject_additions_request;
            msg.id = null;
            msg.data = Serializer.serialize(resp).toString("hex");

            sendMessage(msg);

            const result = await promise;
            expect(result).to.be.null;
        });

        it("Works", async () => {
            let lastMessage: Message;

            const [provider, sendMessage] = await _setup((msg) => {
                lastMessage = msg;
            });
            const headerHash = "42".repeat(32);
            const height = 18;

            const promise = provider.getCoinAdditions({ headerHash, height });

            while(
                BigNumber.from(lastMessage!.type).toNumber() !== ProtocolMessageTypes.request_additions
            ) {
                await sleep(10);
            }

            const _createDummyCoin = (dummyStr: string) => {
                const c: Coin = new Coin();
                c.amount = 1;
                c.parentCoinInfo = dummyStr.repeat(32);
                c.puzzleHash = dummyStr.repeat(32);

                return c;
            };


            const wrongCoins: Array<[string, Coin[]]> = [
                ["01".repeat(32), [_createDummyCoin("00")]]
            ];

            const goodCoins: Array<[string, Coin[]]>  = [
                ["01".repeat(32), [_createDummyCoin("31")]],
                ["03".repeat(32), [_createDummyCoin("33"), _createDummyCoin("37")]],
            ];

            [true, false].forEach((wrongHeight) => {
                [true, false].forEach((wrongHeaderHash) => {
                    const rejectResp: RejectAdditionsRequest = new RejectAdditionsRequest();
                    rejectResp.headerHash = wrongHeaderHash ? ("00".repeat(32)) : headerHash;
                    rejectResp.height = (wrongHeight ? 1 : 0) + height;

                    const rejectMsg: Message = new Message();
                    rejectMsg.type = ProtocolMessageTypes.reject_additions_request;
                    rejectMsg.id = null;
                    rejectMsg.data = Serializer.serialize(rejectResp).toString("hex");

                    if(wrongHeight || wrongHeaderHash) { // don't send a valid reject message
                        sendMessage(rejectMsg);
                    }

                    const acceptResp: RespondAdditions = new RespondAdditions();
                    acceptResp.headerHash = wrongHeaderHash ? ("00".repeat(32)) : headerHash;
                    acceptResp.height = (wrongHeight ? 1 : 0) + height;
                    acceptResp.proofs = null;
                    acceptResp.coins = (wrongHeight || wrongHeaderHash) ? wrongCoins : goodCoins;

                    const acceptMsg: Message = new Message();
                    acceptMsg.type = ProtocolMessageTypes.respond_additions;
                    acceptMsg.id = null;
                    acceptMsg.data = Serializer.serialize(acceptResp).toString("hex");

                    sendMessage(acceptMsg);
                });
            });

            const result = await promise;
            expect(result).to.not.be.null;
            expect(result?.length).to.equal(3);
            expect(result?.[0].puzzleHash).to.equal("31".repeat(32));
            expect(result?.[1].puzzleHash).to.equal("33".repeat(32));
            expect(result?.[2].puzzleHash).to.equal("37".repeat(32));
        });
    });

    const _throwsNotImplemented = (func: any) => {
        it("Throws 'not implemented' error.", async () => {
            const [provider] = await _setup(() => { });
            let errOk: boolean = false;

            try {
                await func(provider);
            } catch(e: any) {
                errOk = e.message === "LeafletProvider does not implement this method.";
            }
            
            expect(errOk).to.be.true;
        });
    };

    describe("getAddress()", () => {
        _throwsNotImplemented(
            (p: LeafletProvider) => p.getAddress()
        );
    });

    describe("transfer()", () => {
        _throwsNotImplemented(
            (p: LeafletProvider) => p.transfer({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 1337
            })
        );
    });

    describe("transferCAT()", () => {
        _throwsNotImplemented(
            (p: LeafletProvider) => p.transferCAT({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                assetId: "00".repeat(32),
                value: 1337
            })
        );
    });
    
    describe("acceptOffer()", () => {
        _throwsNotImplemented(
            (p: LeafletProvider) => p.acceptOffer({
                offer: "offer12345"
            })
        );
    });

    describe("subscribeToAddressChanges()", () => {
        _throwsNotImplemented(
            (p: LeafletProvider) => p.subscribeToAddressChanges({
                callback: () => { }
            })
        );
    });

    describe("signCoinSpends()", () => {
        _throwsNotImplemented(
            (p: LeafletProvider) => p.signCoinSpends({
                coinSpends: []
            })
        );
    });
});