/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { SpendBundle } from "../../../../util/serializer/types/spend_bundle";
import { MultiProvider } from "../../../../xch/providers/multi";
import { acceptOfferArgs, BlockHeader, Coin, CoinState, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, Optional, Provider, PuzzleSolution, signCoinSpendsArgs, subscribeToAddressChangesArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs, transferArgs, transferCATArgs } from "../../../../xch/providers/provider";

let calledMethods: Array<{id: number, methodName: string}> = [];
let overwriteMethods: Map<string, (id: number) => any> = new Map<string, (id: number) => any>();

const METHODS: Array<Record<string, any>> = [
    ["connect", (obj: Provider) => obj.connect()],
    ["close", (obj: Provider) => obj.close()],
    ["getNetworkId", (obj: Provider) => obj.getNetworkId()],
    ["isConnected", (obj: Provider) => obj.isConnected()],
    ["getBlockNumber", (obj: Provider) => obj.getBlockNumber()],
    ["getBalance", (obj: Provider) => obj.getBalance({})],
    ["subscribeToPuzzleHashUpdates", (obj: Provider) => obj.subscribeToPuzzleHashUpdates({ puzzleHash: "", callback: () => { } })],
    ["subscribeToCoinUpdates", (obj: Provider) => obj.subscribeToCoinUpdates({ coinId: "", callback: () => { } })],
    ["getPuzzleSolution", (obj: Provider) => obj.getPuzzleSolution({ coinId: "", height: 0 })],
    ["getCoinChildren", (obj: Provider) => obj.getCoinChildren({ coinId: "" })],
    ["getBlockHeader", (obj: Provider) => obj.getBlockHeader({ height: 0 })],
    ["getBlocksHeaders", (obj: Provider) => obj.getBlocksHeaders({ startHeight: 0, endHeight: 0 })],
    ["getCoinRemovals", (obj: Provider) => obj.getCoinRemovals({ height: 0, headerHash: "" })],
    ["getCoinAdditions", (obj: Provider) => obj.getCoinAdditions({ height: 0, headerHash: "" })],
    ["getAddress", (obj: Provider) => obj.getAddress()],
    ["transfer", (obj: Provider) => obj.transfer({ to: "", value: 0 })],
    ["transferCAT", (obj: Provider) => obj.transferCAT({ to: "", assetId: "", value: 5 })],
    ["acceptOffer", (obj: Provider) => obj.acceptOffer({ offer: "" })],
    ["subscribeToAddressChanges", (obj: Provider) => obj.subscribeToAddressChanges({ callback: () => { } })],
    ["signCoinSpends", (obj: Provider) => obj.signCoinSpends({ coinSpends: [] })],
];

const EXCEPTIONS = [0, 1, 3];

class ObservableProvider implements Provider {
    private _id: number;

    constructor(id: number) {
        this._id = id;
    }

    private _processMethod(methodName: string): any {
        calledMethods.push({
            id: this._id, methodName
        });

        if(METHODS.filter((e) => e[0] === methodName).length === 0) {
            console.log("[!] Unknown method name: " + methodName);
        }

        if(overwriteMethods.has(methodName)) {
            return overwriteMethods.get(methodName)?.(this._id);
        }
        return null;
    }

    async connect(): Promise<void> {
        return this._processMethod(METHODS[0][0]);
    }
    async close(): Promise<void> {
        return this._processMethod(METHODS[1][0]);
    }
    getNetworkId(): string {
        return this._processMethod(METHODS[2][0]);
    }
    isConnected(): boolean {
        return this._processMethod(METHODS[3][0]);
    }
    getBlockNumber(): Promise<Optional<number>> {
        return this._processMethod(METHODS[4][0]);
    }
    getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        return this._processMethod(METHODS[5][0]);
    }
    subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        return this._processMethod(METHODS[6][0]);
    }
    subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        return this._processMethod(METHODS[7][0]);
    }
    getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        return this._processMethod(METHODS[8][0]);
    }
    getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        return this._processMethod(METHODS[9][0]);
    }
    getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        return this._processMethod(METHODS[10][0]);
    }
    getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        return this._processMethod(METHODS[11][0]);
    }
    getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        return this._processMethod(METHODS[12][0]);
    }
    getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        return this._processMethod(METHODS[13][0]);
    }
    getAddress(): Promise<string> {
        return this._processMethod(METHODS[14][0]);
    }
    transfer(args: transferArgs): Promise<boolean> {
        return this._processMethod(METHODS[15][0]);
    }
    transferCAT(args: transferCATArgs): Promise<boolean> {
        return this._processMethod(METHODS[16][0]);
    }
    acceptOffer(args: acceptOfferArgs): Promise<boolean> {
        return this._processMethod(METHODS[17][0]);
    }
    subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        return this._processMethod(METHODS[18][0]);
    }
    signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        return this._processMethod(METHODS[19][0]);
    }
}

describe("MultiProvider", () => {
    beforeEach(() => {
        calledMethods = [];
        overwriteMethods = new Map<string, (id: number) => any>();
    });

    it("Calls fallbacks correctly (#1)", async () => {
        const mask = "00011110010110010101";
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);

        const p: MultiProvider = new MultiProvider([provider1, provider2]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => true
        );

        for(let i = 0; i < METHODS.length; ++i) {
            const willProvider1Fail: boolean = mask[i] === "0";
            const methodName = METHODS[i][0];
            calledMethods = [];

            if(EXCEPTIONS.includes(i)) {
                continue;
            }

            overwriteMethods.set(
                methodName,
                (id: number) => {
                    if(id === 1 && willProvider1Fail) {
                        throw new Error("Err");
                    }

                    return null;
                }
            );

            const callFunc = METHODS[i][1];
            await callFunc(p);

            const expectedCalls = willProvider1Fail ? 2 : 1;
            expect(
                calledMethods.filter((e) => e.methodName === methodName).length
            ).to.equal(expectedCalls);
        }
    });

    it("Calls fallbacks correctly (#2)", async () => {
        const mask = "00011110010110010101";
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);

        const p: MultiProvider = new MultiProvider([provider1, provider2]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => true
        );

        for(let i = 0; i < METHODS.length; ++i) {
            const willProvider1Fail: boolean = mask[i] === "1";
            const methodName = METHODS[i][0];
            calledMethods = [];

            if(EXCEPTIONS.includes(i)) {
                continue;
            }

            overwriteMethods.set(
                methodName,
                (id: number) => {
                    if(id === 1 && willProvider1Fail) {
                        throw new Error("Err");
                    }

                    return null;
                }
            );

            const callFunc = METHODS[i][1];
            await callFunc(p);

            const expectedCalls = willProvider1Fail ? 2 : 1;
            expect(
                calledMethods.filter((e) => e.methodName === methodName).length
            ).to.equal(expectedCalls);
        }
    });

    it("Fails if no providers are connected", async () => {
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);

        const p: MultiProvider = new MultiProvider([provider1, provider2]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => false
        );

        for(let i = 0; i < METHODS.length; ++i) {
            calledMethods = [];

            if(EXCEPTIONS.includes(i)) {
                continue;
            }

            const callFunc = METHODS[i][1];
            let thrownOk: boolean = false;

            try {
                await callFunc(p);
            } catch(err) {
                thrownOk =
                    err instanceof Error &&
                    err.message === "MultiProvider could not find an active Provider that implements this method.";
            }

            expect(
                thrownOk
            ).to.be.true;
        }
    });

    it("Falls back to the second provider if the first one is not connected", async () => {
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);

        const p: MultiProvider = new MultiProvider([provider1, provider2]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => id !== 1
        );

        for(let i = 0; i < METHODS.length; ++i) {
            calledMethods = [];
            const methodName: string = METHODS[i][0];

            if(EXCEPTIONS.includes(i)) {
                continue;
            }

            const callFunc = METHODS[i][1];
            await callFunc(p);

            const entries = calledMethods.filter(e => e.methodName === methodName);
            expect(entries.length).to.equal(1);
            expect(entries[0].id).to.equal(2);
        }
    });

    it("connect() calls the connect() method of all Providers that are not connected", async () => {
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);
        const provider3: ObservableProvider = new ObservableProvider(3);

        const p: MultiProvider = new MultiProvider([provider1, provider2, provider3]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => id === 2
        );

        overwriteMethods.set(
            "connect",
            (id: number) => {
                if(id === 3) {
                    throw new Error("err")
                }
            }
        );

        await p.connect();
        const connectEvents = calledMethods.filter(e => e.methodName === "connect");

        expect(connectEvents.length).to.equal(2);
        expect(connectEvents[0].id).to.equal(1);
        expect(connectEvents[1].id).to.equal(3);
    });


    it("close() calls the close() method of all Providers that are connected", async () => {
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);
        const provider3: ObservableProvider = new ObservableProvider(3);

        const p: MultiProvider = new MultiProvider([provider1, provider2, provider3]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => id !== 2
        );

        overwriteMethods.set(
            "close",
            (id: number) => {
                if(id === 3) {
                    throw new Error("err")
                }
            }
        );

        await p.connect();
        await p.close();

        const closeEvents = calledMethods.filter(e => e.methodName === "close");

        expect(closeEvents.length).to.equal(2);
        expect(closeEvents[0].id).to.equal(1);
        expect(closeEvents[1].id).to.equal(3);
    });

    it("isConnected() can determine wether one of the Providers is connected or not", async () => {
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);
        const provider3: ObservableProvider = new ObservableProvider(3);
        const provider4: ObservableProvider = new ObservableProvider(4);

        const p: MultiProvider = new MultiProvider([provider1, provider2, provider3, provider4]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => {
                if(id === 1) {
                    return false;
                } else if(id === 2) {
                    throw new Error("err");
                }

                return true;
            }
        );

        const res = p.isConnected();
        expect(res).to.be.true;

        const isConnectedEvents = calledMethods.filter(e => e.methodName === "isConnected");
        expect(isConnectedEvents.length).to.equal(3);
        expect(isConnectedEvents[0].id).to.equal(1);
        expect(isConnectedEvents[1].id).to.equal(2);
        expect(isConnectedEvents[2].id).to.equal(3);
    });

    it("isConnected() can determine wether one of the Providers is connected or not (#2)", async () => {
        const provider1: ObservableProvider = new ObservableProvider(1);
        const provider2: ObservableProvider = new ObservableProvider(2);
        const provider3: ObservableProvider = new ObservableProvider(3);
        const provider4: ObservableProvider = new ObservableProvider(4);

        const p: MultiProvider = new MultiProvider([provider1, provider2, provider3, provider4]);

        overwriteMethods.set(
            "isConnected",
            (id: number) => {
                if(id === 2) {
                    throw new Error("err");
                }

                return false;
            }
        );

        const res = p.isConnected();
        expect(res).to.be.false;

        const isConnectedEvents = calledMethods.filter(e => e.methodName === "isConnected");
        expect(isConnectedEvents.length).to.equal(4);
        expect(isConnectedEvents[0].id).to.equal(1);
        expect(isConnectedEvents[1].id).to.equal(2);
        expect(isConnectedEvents[2].id).to.equal(3);
        expect(isConnectedEvents[3].id).to.equal(4);
    });
});