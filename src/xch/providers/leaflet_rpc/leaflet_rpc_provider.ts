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

type ResponseCoin = {
    amount: uint,
    parent_coin_info: bytes,
    puzzle_hash: bytes
};

type ResponseCoinRecord = {
    coin: ResponseCoin,
    confirmed_block_index: uint | null,
    spent_block_index: uint | null
};

type ResponseBlockRecord = {
    height: uint,
    header_hash: bytes,
    prev_hash: bytes,
    pool_puzzle_hash: bytes,
    farmer_puzzle_hash: bytes,
    fees?: Optional<uint>,
};

export class LeafletRPCProvider implements Provider { //todo: provider type return callback cancel
    public baseUrl: string;

    private network: Network;
    private connected = false;
    private overwriteGetRPCResponse: (<T>(endpoint: string, params: any) => Promise<T | null>) | null;

    private _subscriptionActive: boolean[] = [];
    private _subscriptions: Array<() => Promise<void>> = [];
    private _lastCallbackData: string[] = []

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

    private responseCoinToCoin(rc: ResponseCoin): Coin {
        const c = new Coin();
        c.amount = BigNumber.from(rc.amount);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.parentCoinInfo = Util.dehexlify(rc.parent_coin_info)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.puzzleHash = Util.dehexlify(rc.puzzle_hash)!;

        return c;
    }

    private responseCoinRecordToCoinState(cr: ResponseCoinRecord): CoinState {
        const coinState = new CoinState();
        coinState.coin = this.responseCoinToCoin(cr.coin);
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
            coin_records: ResponseCoinRecord[],
        }>("get_coin_records_by_puzzle_hash", reqParams);

        if(!resp?.success) return null;
        const cs: CoinState[] = [];

        for(const cr of resp.coin_records) {
            cs.push(this.responseCoinRecordToCoinState(cr));
        }

        return cs;
    }

    private checkCallbackData(i: number, cs: CoinState[]): boolean {
        const s = cs.map(
            e => `${e.createdHeight}|${e.spentHeight}|${e.coin.amount}|${e.coin.parentCoinInfo}|${e.coin.puzzleHash}`
        ).join("-");

        if(this._lastCallbackData[i] !== s) {
            this._lastCallbackData[i] = s;
            return true;
        }
        return false;
    }

    public subscribeToPuzzleHashUpdates({
        puzzleHash,
        callback,
        minHeight
    }: subscribeToPuzzleHashUpdatesArgs, timeBetweenRequests: number = 5000): () => void {
        const i = this._subscriptions.length;
        this._subscriptionActive.push(true);
        this._lastCallbackData.push("");

        const provObj = this;

        const reqParams: any = { puzzle_hash: Util.unhexlify(puzzleHash) };
        if(minHeight !== undefined) { reqParams.start_height = minHeight; }
        this._subscriptions.push(async () => {
            while(provObj._subscriptionActive[i]) {
                try {
                    const resp = await provObj.getRPCResponse<{
                        success: boolean,
                        coin_records: ResponseCoinRecord[]
                    }>("get_coin_records_by_puzzle_hash", reqParams);

                    if(resp?.success) {
                        const callbackData = resp.coin_records.map(e => provObj.responseCoinRecordToCoinState(e));
                        if(this.checkCallbackData(i, callbackData)) {
                            callback(callbackData);
                        }
                    }
                } catch(_) {
                    // pass
                }
                await sleep(timeBetweenRequests);
            }
        });

        return () => { provObj._subscriptionActive[i] = false; }
    }

    public subscribeToCoinUpdates({
        coinId,
        callback,
        minHeight
    }: subscribeToCoinUpdatesArgs, timeBetweenRequests: number = 5000): () => void {
        const i = this._subscriptions.length;
        this._subscriptionActive.push(true);
        this._lastCallbackData.push("");

        const provObj = this;

        const reqParams: any = { name: Util.unhexlify(coinId) };
        if(minHeight !== undefined) { reqParams.start_height = minHeight; }
        this._subscriptions.push(async () => {
            while(provObj._subscriptionActive[i]) {
                try {
                    const resp = await provObj.getRPCResponse<{
                        success: boolean,
                        coin_records: ResponseCoinRecord[]
                    }>("get_coin_record_by_name", reqParams);

                    if(resp?.success) {
                        const callbackData = resp.coin_records.map(e => provObj.responseCoinRecordToCoinState(e));
                        if(this.checkCallbackData(i, callbackData)) {
                            callback(callbackData);
                        }
                    }
                } catch(_) {
                    // pass
                }
                await sleep(timeBetweenRequests);
            }
        });

        return () => { provObj._subscriptionActive[i] = false; };
    }

    public async getPuzzleSolution({ coinId, height }: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        const reqParams = {
            coin_id: Util.unhexlify(coinId),
            height
        };

        const resp = await this.getRPCResponse<{
            success: boolean,
            puzzle_reveal: bytes,
            solution: bytes
        }>("get_puzzle_and_solution", reqParams);

        if(!resp?.success) return null;

        const ps = new PuzzleSolution();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ps.coinName = reqParams.coin_id!;
        ps.height = height;
        ps.puzzle = Util.sexp.fromHex(resp.puzzle_reveal);
        ps.solution = Util.sexp.fromHex(resp.solution);

        return ps;
    }

    public async getCoinChildren(
        { coinId }: getCoinChildrenArgs,
        startHeight: uint | null = null,
        endHeight: uint | null = null
    ): Promise<CoinState[]> {
        const reqParams: any = {
            coin_id: Util.unhexlify(coinId)
        };
        if(startHeight !== null) { reqParams.start_height = startHeight; }
        if(endHeight !== null) { reqParams.end_height = endHeight; }

        const resp = await this.getRPCResponse<{
            success: boolean,
            coin_records: ResponseCoinRecord[]
        }>("get_coin_records_by_parent_ids", reqParams);

        if(!resp?.success) return [];
        return resp.coin_records.map(e => this.responseCoinRecordToCoinState(e));
    }

    private blockRecordToBlockHeader(br: ResponseBlockRecord): BlockHeader {
        const feeSupplied = br.fees !== null && br.fees !== undefined;

        const bh = new BlockHeader();
        bh.height = br.height;
        bh.headerHash = br.header_hash;
        bh.prevBlockHash = br.prev_hash;
        bh.isTransactionBlock = feeSupplied;
        bh.fees = feeSupplied ? BigNumber.from(br.fees) : null;
        bh.farmerPuzzleHash = br.farmer_puzzle_hash;
        bh.poolPuzzleHash = br.pool_puzzle_hash;

        return bh;
    }

    public async getBlockHeader({ height }: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        const reqParams = { height };

        const resp = await this.getRPCResponse<{
            success: boolean,
            block_record: ResponseBlockRecord,
        }>("get_block_record_by_height", reqParams);

        if(!resp?.success) return null;
        return this.blockRecordToBlockHeader(resp.block_record);
    }

    public async getBlocksHeaders({ startHeight, endHeight }: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        const reqParams = {
            start: startHeight,
            end: endHeight
        };

        const resp = await this.getRPCResponse<{
            success: boolean,
            block_records: ResponseBlockRecord[],
        }>("get_block_records", reqParams);

        if(!resp?.success) return null;
        return resp.block_records.map(e => this.blockRecordToBlockHeader(e));
    }

    public async getCoinRemovals({ headerHash, coinIds }: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        const reqParams = { header_hash: headerHash };

        const resp = await this.getRPCResponse<{
            success: boolean,
            removals: ResponseCoinRecord[],
        }>("get_additions_and_removals", reqParams);

        if(!resp?.success) return null;
        
        let removals: Coin[] = resp.removals.map(e => this.responseCoinToCoin(e.coin));
        if(coinIds !== undefined) {
            removals = removals.filter(e => coinIds.includes(Util.coin.getId(e)))
        }

        return removals;
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