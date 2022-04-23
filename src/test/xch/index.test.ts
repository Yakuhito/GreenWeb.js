/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Network } from "../../util/network";
import { SpendBundle } from "../../util/serializer/types/spend_bundle";
import { XCHModule } from "../../xch";
import { acceptOfferArgs, BlockHeader, changeNetworkArgs, Coin, CoinState, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, Optional, Provider, pushSpendBundleArgs, PuzzleSolution, signCoinSpendsArgs, subscribeToAddressChangesArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs, transferArgs, transferCATArgs } from "../../xch/providers/provider";

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
    async pushSpendBundle(args: pushSpendBundleArgs): Promise<boolean> {
        return true;
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
    async changeNetwork(args: changeNetworkArgs): Promise<boolean> {
        return true;
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

        const _throwsException = (funcName: string, func: any) => {
            it(funcName, async () => {
                let errOk: boolean = false;
                try {
                    await func();
                } catch(e: any) {
                    errOk = e.message === "Provider not set!";
                }

                expect(errOk).to.be.true;
            });
        };
        
        _throwsException("connect()", () => XCHModule.connect());
        _throwsException("close()", () => XCHModule.close());
        _throwsException("getNetworkId()", () => XCHModule.getNetworkId());
        _throwsException("isConnected()", () => XCHModule.isConnected());
        _throwsException("getBlockNumber()", () => XCHModule.getBlockNumber());
        _throwsException("getBalance()", () => XCHModule.getBalance({
            address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
            minHeight: 7,
        }));
        _throwsException("subscribeToPuzzleHashUpdates()", () => XCHModule.subscribeToPuzzleHashUpdates({
            puzzleHash: "testtest",
            callback: () => { throw new Error("oops"); },
        }));
        _throwsException("subscribeToCoinUpdates()", () => XCHModule.subscribeToCoinUpdates({
            coinId: "testtest",
            callback: () => { throw new Error("oops"); },
        }));
        _throwsException("getPuzzleSolution()", () => XCHModule.getPuzzleSolution({
            coinId: "testtest",
            height: 5,
        }));
        _throwsException("getCoinChildren()", () => XCHModule.getCoinChildren({
            coinId: "testtest",
        }));
        _throwsException("getBlockHeader()", () => XCHModule.getBlockHeader({
            height: 42,
        }));
        _throwsException("getBlocksHeaders()", () => XCHModule.getBlocksHeaders({
            startHeight: 7,
            endHeight: 42,
        }));
        _throwsException("getCoinRemovals()", () => XCHModule.getCoinRemovals({
            height: 5,
            headerHash: "testtest",
        }));
        _throwsException("getCoinAdditions()", () => XCHModule.getCoinAdditions({
            height: 5,
            headerHash: "testtest",
        }));
        _throwsException("pushSpendBundle()", () => XCHModule.pushSpendBundle({
            spendBundle: new SpendBundle(),
        }));
        _throwsException("getAddress()", () => XCHModule.getAddress());
        _throwsException("transfer()", () => XCHModule.transfer({
            to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
            value: 5,
        }));
        _throwsException("transferCAT()", () => XCHModule.transferCAT({
            to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
            assetId: "Kitty",
            value: 5,
        }));
        _throwsException("acceptOffer()", () => XCHModule.acceptOffer({
            offer: "offer",
        }));
        _throwsException("subscribeToAddressChanges()", () => XCHModule.subscribeToAddressChanges({
            callback: (addr) => { throw new Error("oops"); },
        }));
        _throwsException("signCoinSpends()", () => XCHModule.signCoinSpends({
            coinSpends: [],
        }));
        _throwsException("changeNetwork()", () => XCHModule.changeNetwork({
            network: Network.mainnet,
        }));
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

        it("pushSpendBundle()", async () => {
            expect(
                await XCHModule.pushSpendBundle({
                    spendBundle: new SpendBundle(),
                })
            ).to.be.true;
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

        it("changeNetwork()", async () => {
            const res = await XCHModule.changeNetwork({
                network: Network.mainnet
            });

            expect(res).to.be.true;
        });
    });
});