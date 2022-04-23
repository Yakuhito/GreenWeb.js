/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Network } from "../../util/network";
import { SpendBundle } from "../../util/serializer/types/spend_bundle";
import { XCHModule } from "../../xch";
import { acceptOfferArgs, BlockHeader, Coin, CoinState, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, Optional, Provider, PuzzleSolution, signCoinSpendsArgs, subscribeToAddressChangesArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs, transferArgs, transferCATArgs } from "../../xch/providers/provider";

class TestProvider implements Provider {
    async connect(): Promise<void> {
        return;
    }
    async close(): Promise<void> {
        return;
    }
    getNetworkId(): Network {
        return Network.mainnet;
    }
    isConnected(): boolean {
        return true;
    }
    async getBlockNumber(): Promise<Optional<number>> {
        return 1337;
    }
    async getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        return BigNumber.from(31337);
    }
    subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        args.callback([]);
    }
    subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        args.callback([])
    }
    async getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        return null;
    }
    async getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        return [];
    }
    async getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        return null;
    }
    async getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        return [];
    }
    async getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        return [];
    }
    async getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        return [];
    }
    async getAddress(): Promise<string> {
        return "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3";
    }
    async transfer(args: transferArgs): Promise<boolean> {
        return true;
    }
    async transferCAT(args: transferCATArgs): Promise<boolean> {
        return true;
    }
    async acceptOffer(args: acceptOfferArgs): Promise<boolean> {
        return true;
    }
    subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        args.callback("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
    }
    async signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        return null;
    }
}

describe("XCHModule", () => {
    it("Exposes 4 providers", () => {
        expect(
            Object.keys(XCHModule.providers).length
        ).to.be.equal(4);
    });

    it("Exposes its set provider", () => {
        expect(XCHModule.provider).to.be.null;
        XCHModule.setProvider(new TestProvider());
        expect(XCHModule.provider instanceof TestProvider).to.be.true;
        XCHModule.clearProvider();
        expect(XCHModule.provider).to.be.null;
        XCHModule.setProvider(new TestProvider());
        expect(XCHModule.provider instanceof TestProvider).to.be.true;
        XCHModule.clearProvider();
        expect(XCHModule.provider).to.be.null;
        XCHModule.setProvider(new TestProvider());
        expect(XCHModule.provider instanceof TestProvider).to.be.true;
        XCHModule.clearProvider();
        expect(XCHModule.provider).to.be.null;
    });

    describe("No provider set", () => {
        beforeEach(() => {
            XCHModule.clearProvider();
        });
        
        it("connect()", () => {
            expect(XCHModule.connect).to.throw("Provider not set!");
        });

        it("close()", () => {
            expect(XCHModule.close).to.throw("Provider not set!");
        });

        it("getNetworkId()", () => {
            expect(XCHModule.getNetworkId).to.throw("Provider not set!");
        });

        it("isConnected()", () => {
            expect(XCHModule.isConnected).to.throw("Provider not set!");
        });

        it("getBlockNumber()", () => {
            expect(XCHModule.getBlockNumber).to.throw("Provider not set!");
        });

        it("getBalance()", () => {
            expect(
                () => XCHModule.getBalance({
                    address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    minHeight: 7
                })
            ).to.throw("Provider not set!");
        });

        it("subscribeToPuzzleHashUpdates()", () => {
            let callbackCalled: boolean = false;
            expect(
                () => XCHModule.subscribeToPuzzleHashUpdates({
                    puzzleHash: "testtest",
                    callback: () => callbackCalled = true,
                })
            ).to.throw("Provider not set!");
            expect(callbackCalled).to.be.false;
        });

        it("subscribeToCoinUpdates()", () => {
            let callbackCalled: boolean = false;
            expect(
                () => XCHModule.subscribeToCoinUpdates({
                    coinId: "testtest",
                    callback: () => callbackCalled = true,
                })
            ).to.throw("Provider not set!");
            expect(callbackCalled).to.be.false;
        });

        it("getPuzzleSolution()", () => {
            expect(
                () => XCHModule.getPuzzleSolution({
                    coinId: "testtest",
                    height: 5,
                })
            ).to.throw("Provider not set!");
        });

        it("getCoinChildren()", () => {
            expect(
                () => XCHModule.getCoinChildren({
                    coinId: "testtest"
                })
            ).to.throw("Provider not set!");
        });

        it("getBlockHeader()", () => {
            expect(
                () => XCHModule.getBlockHeader({
                    height: 42
                })
            ).to.throw("Provider not set!");
        });

        it("getBlocksHeaders()", () => {
            expect(
                () => XCHModule.getBlocksHeaders({
                    startHeight: 7,
                    endHeight: 42
                })
            ).to.throw("Provider not set!");
        });

        it("getCoinRemovals()", () => {
            expect(
                () => XCHModule.getCoinRemovals({
                    height: 5,
                    headerHash: "testtest"
                })
            ).to.throw("Provider not set!");
        });

        it("getCoinAdditions()", () => {
            expect(
                () => XCHModule.getCoinAdditions({
                    height: 5,
                    headerHash: "testtest"
                })
            ).to.throw("Provider not set!");
        });

        it("getAddress()", () => {
            expect(
                () => XCHModule.getAddress()
            ).to.throw("Provider not set!");
        });

        it("transfer()", () => {
            expect(
                () => XCHModule.transfer({
                    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    value: 5
                })
            ).to.throw("Provider not set!");
        });

        it("transferCAT()", () => {
            expect(
                () => XCHModule.transferCAT({
                    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    assetId: "Kitty",
                    value: 5
                })
            ).to.throw("Provider not set!");
        });

        it("acceptOffer()", () => {
            expect(
                () => XCHModule.acceptOffer({
                    offer: "offer"
                })
            ).to.throw("Provider not set!");
        });

        it("subscribeToAddressChanges()", () => {
            let callbackCalled: boolean = false;
            expect(
                () => XCHModule.subscribeToAddressChanges({
                    callback: (addr) => callbackCalled = true
                })
            ).to.throw("Provider not set!");
            expect(callbackCalled).to.be.false;
        });

        it("signCoinSpends()", () => {
            expect(
                () => XCHModule.signCoinSpends({
                    coinSpends: []
                })
            ).to.throw("Provider not set!");
        });
    });

    describe("TestProvider", () => {
        beforeEach(() => {
            XCHModule.setProvider(new TestProvider());
        });

        it("connect()", () => {
            // required for coverage :|
            let thrown: boolean = false;
            try {
                XCHModule.connect();
            } catch(_) {
                thrown = true;
            }

            expect(thrown).to.to.false;
        });

        it("close()", () => {
            // required for coverage :|
            let thrown: boolean = false;
            try {
                XCHModule.close();
            } catch(_) {
                thrown = true;
            }

            expect(thrown).to.to.false;
        });

        it("getNetworkId()", () => {
            expect(XCHModule.getNetworkId()).to.equal(Network.mainnet);
        });

        it("isConnected()", () => {
            expect(XCHModule.isConnected()).to.equal(true);
        });

        it("getBlockNumber()", async () => {
            expect(await XCHModule.getBlockNumber()).to.equal(1337);
        });

        it("getBalance()", async () => {
            const balance: BigNumber | null = await XCHModule.getBalance({
                address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                minHeight: 7
            });

            expect(
                balance?.eq(31337)
            ).to.be.true;
        });

        it("subscribeToPuzzleHashUpdates()", () => {
            let callbackCalled: boolean = false;
            
            XCHModule.subscribeToPuzzleHashUpdates({
                puzzleHash: "testtest",
                callback: () => callbackCalled = true,
            });

            expect(callbackCalled).to.be.true;
        });

        it("subscribeToCoinUpdates()", () => {
            let callbackCalled: boolean = false;

            XCHModule.subscribeToCoinUpdates({
                coinId: "testtest",
                callback: () => callbackCalled = true,
            });

            expect(callbackCalled).to.be.true;
        });

        it("getPuzzleSolution()", async () => {
            expect(
                await XCHModule.getPuzzleSolution({
                    coinId: "testtest",
                    height: 5,
                })
            ).to.be.null;
        });

        it("getCoinChildren()", async () => {
            const res = await XCHModule.getCoinChildren({
                coinId: "testtest"
            });

            expect(res instanceof Array).to.be.true;
            expect(res.length).to.equal(0);
        });

        it("getBlockHeader()", async () => {
            expect(
                await XCHModule.getBlockHeader({
                    height: 42
                })
            ).to.be.null;
        });

        it("getBlocksHeaders()", async () => {
            const res = await XCHModule.getBlocksHeaders({
                startHeight: 7,
                endHeight: 42
            });

            expect(res).to.not.be.null;
            expect(res instanceof Array).to.be.true;
            expect(res?.length).to.equal(0);
        });

        it("getCoinRemovals()", async () => {
            const res = await XCHModule.getCoinRemovals({
                height: 5,
                headerHash: "testtest"
            });

            expect(res).to.not.be.null;
            expect(res instanceof Array).to.be.true;
            expect(res?.length).to.equal(0);
        });

        it("getCoinAdditions()", async () => {
            const res = await XCHModule.getCoinAdditions({
                height: 5,
                headerHash: "testtest"
            });

            expect(res).to.not.be.null;
            expect(res instanceof Array).to.be.true;
            expect(res?.length).to.equal(0);
        });

        it("getAddress()", async () => {
            expect(
                await XCHModule.getAddress()
            ).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
        });

        it("transfer()", async () => {
            expect(
                await XCHModule.transfer({
                    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    value: 5
                })
            ).to.be.true;
        });

        it("transferCAT()", async () => {
            expect(
                await XCHModule.transferCAT({
                    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    assetId: "Kitty",
                    value: 5
                })
            ).to.be.true;
        });

        it("acceptOffer()", async () => {
            expect(
                await XCHModule.acceptOffer({
                    offer: "offer"
                })
            ).to.be.true;
        });

        it("subscribeToAddressChanges()", async () => {
            let callbackCalled: boolean = false;
            XCHModule.subscribeToAddressChanges({
                callback: () => callbackCalled = true
            });

            expect(callbackCalled).to.be.true;
        });

        it("signCoinSpends()", async () => {
            const res = await XCHModule.signCoinSpends({
                coinSpends: []
            });

            expect(res).to.be.null;
        });
    });
});