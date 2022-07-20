import { BigNumber } from "@ethersproject/bignumber";
import { Network } from "../../../util/network";
import { SpendBundle } from "../../../util/serializer/types/spend_bundle";
import { Provider, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs } from "../provider";
import { pushSpendBundleArgs, transferArgs, transferCATArgs, acceptOfferArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs, changeNetworkArgs, getCoinsArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin, bytes } from "../provider_types";
import axios from "axios";
import { Util } from "../../../util";
import { uint } from "../../../util/serializer/basic_types";

const sleep = (milliseconds: number) => new Promise(r => setTimeout(r, milliseconds));

type CoinRecord = {
    coin: {
        amount: uint,
        parent_coin_info: bytes,
        puzzle_hash: bytes
    },
    confirmed_block_index: uint | null,
    spent_block_index: uint | null
};

export class LeafletRPCProvider implements Provider {
    public baseUrl: string;

    private network: Network;
    private connected = false;
    private overwriteGetRPCResponse: (<T>(endpoint: string, params: any) => Promise<T | null>) | null;

    private _subscriptionActive: boolean[] = [];
    private _subscriptions: Array<() => Promise<void>> = [];

    constructor(
        host: string,
        apiKey: string,
        port = 18444,
        network = Network.mainnet,
        useHTTP = false,
        overwriteGetRPCResponse: (<T>(endpoint: string, params: any) => Promise<T | null>) | null = null
    ) {
        this.baseUrl = (useHTTP ? "http://" : "https://") + `${host}:${port}/${apiKey}/rpc/`;
        this.network = network;
        this.overwriteGetRPCResponse = overwriteGetRPCResponse;
    }

    public async connect(): Promise<void> {
        this.connected = true;
    }

    public async close(): Promise<void> {
        this.connected = false;
    }

    public getNetworkId(): Network {
        return this.network;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private async getRPCResponse<T>(endpoint: string, params: any): Promise<T | null> {
        if(!this.connected) return null;

        try {
            const { data } = await axios.post<T>(this.baseUrl + endpoint, params, {
                headers: {
                    "Content-Type": "application/json"
                },
            });
    
            return data;
        } catch(_) {
            return null;
        }
    }

    public async getBlockNumber(): Promise<Optional<number>> {
        const resp = await this.getRPCResponse<{
            blockchain_state: {
                peak: {
                    height: number
                }
            },
            success: boolean
        }>("get_blockchain_state", {});

        if(!resp?.success) return null;
        return resp?.blockchain_state.peak.height ?? null;
    }

    private coinRecordToCoinState(cr: CoinRecord): CoinState {
        const c = new Coin();
        c.amount = BigNumber.from(cr.coin.amount);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.parentCoinInfo = Util.dehexlify(cr.coin.parent_coin_info)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.puzzleHash = Util.dehexlify(cr.coin.puzzle_hash)!;

        const coinState = new CoinState();
        coinState.coin = c;
        coinState.createdHeight = cr.confirmed_block_index;
        coinState.spentHeight = cr.spent_block_index;
        return coinState;
    }

    public async getBalance({ address, puzzleHash, minHeight = 1 }: getBalanceArgs): Promise<Optional<BigNumber>> {
        const cs: CoinState[] | null = await this.getCoins({
            address,
            puzzleHash,
            startHeight:
            minHeight,
            includeSpentCoins: false
        });
        if(cs === null) return null;
        
        let balance: BigNumber = BigNumber.from(0);

        for(const coinState of cs) {
            balance = balance.add(coinState.coin.amount);
        }

        return balance;
    }

    public async getCoins({
        address,
        puzzleHash,
        startHeight,
        endHeight,
        includeSpentCoins
    }: getCoinsArgs): Promise<Optional<CoinState[]>> {
        let puzHash: string;
        
        // get puzHash: Buffer from address / puzzle hash
        if(address !== undefined) {
            puzHash = Util.address.addressToPuzzleHash(address);
            if(puzHash.length === 0) {
                return null;
            }
        }
        else if(puzzleHash !== undefined) {
            puzHash = Util.address.validateHashString(puzzleHash);
        }
        else return null;

        const reqParams: any = { puzzle_hash: Util.unhexlify(puzHash) };
        if(startHeight !== undefined) { reqParams.start_height = startHeight }
        if(endHeight !== undefined) { reqParams.end_height = endHeight }
        if(includeSpentCoins !== undefined) { reqParams.include_spent_coins = includeSpentCoins; }

        const resp = await this.getRPCResponse<{
            success: boolean,
            coin_records: CoinRecord[],
        }>("get_coin_records_by_puzzle_hash", reqParams);

        if(!resp?.success) return null;
        const cs: CoinState[] = [];

        for(const cr of resp.coin_records) {
            cs.push(this.coinRecordToCoinState(cr));
        }

        return cs;
    }

    public async subscribeToPuzzleHashUpdates({
        puzzleHash,
        callback,
        minHeight
    }: subscribeToPuzzleHashUpdatesArgs, timeBetweenRequests: number = 5000): Promise<() => void> {
        const i = this._subscriptions.length;
        this._subscriptionActive.push(true);
        const provObj = this;

        const reqParams: any = { puzzle_hash: Util.unhexlify(puzzleHash) };
        if(minHeight !== undefined) { reqParams.start_height = minHeight; }
        this._subscriptions.push(async () => {
            while(provObj._subscriptionActive[i]) {
                try {
                    const resp = await provObj.getRPCResponse<{
                        success: boolean,
                        coin_records: CoinRecord[]
                    }>("get_coin_records_by_puzzle_hash", reqParams);

                    if(resp?.success) {
                        callback(resp.coin_records.map(e => provObj.coinRecordToCoinState(e)))
                    }
                } catch(_) {
                    // pass
                }
                await sleep(timeBetweenRequests);
            }
        });

        return () => provObj._subscriptionActive[i] = false;
    }

    subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        throw new Error("Method not implemented.");
    }

    getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        throw new Error("Method not implemented.");
    }

    getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        throw new Error("Method not implemented.");
    }

    getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        throw new Error("Method not implemented.");
    }

    getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        throw new Error("Method not implemented.");
    }

    getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        throw new Error("Method not implemented.");
    }

    getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        throw new Error("Method not implemented.");
    }

    pushSpendBundle(args: pushSpendBundleArgs): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    private _doesNotImplementError(): any {
        throw new Error("LeafletRPCProvider does not implement this method.");
    }

    public getAddress(): Promise<string> {
        return this._doesNotImplementError();
    }

    public transfer(args: transferArgs): Promise<Optional<SpendBundle>> {
        return this._doesNotImplementError();
    }

    public transferCAT(args: transferCATArgs): Promise<Optional<SpendBundle>> {
        return this._doesNotImplementError();
    }

    public acceptOffer(args: acceptOfferArgs): Promise<Optional<SpendBundle>> {
        return this._doesNotImplementError();
    }

    public subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        return this._doesNotImplementError();
    }

    public signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        return this._doesNotImplementError();
    }

    public async changeNetwork({ network }: changeNetworkArgs): Promise<boolean> {
        this.network = network;
        return true;
    }
}