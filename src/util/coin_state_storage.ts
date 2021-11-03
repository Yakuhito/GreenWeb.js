import { Optional } from "../providers/provider";
import { CoinState, RespondToCoinUpdates, RespondToPhUpdates } from "../types/wallet_protocol";

export class CoinStateStorage {
    private callbacks: { [key: string]: { (coin_states: CoinState[]): void; } [] } = {};
    private coin_states: { [puzHash: string]: Optional<CoinState[]> } = {};

    public processPhPacket(pckt: RespondToPhUpdates) {
        const puzzle_hashes: string[] = pckt.puzzle_hashes.map((e) => e.toString("hex"));

        for(var i = 0;i < puzzle_hashes.length; ++i) {
            const puzzle_hash: string = puzzle_hashes[i];

            const coin_states = pckt.coin_states.filter((e) => e.coin.puzzle_hash.toString("hex") == puzzle_hash);
            this.coin_states[puzzle_hash] = coin_states;

            if(this.callbacks[puzzle_hash] !== undefined && this.callbacks[puzzle_hash].length > 0) {
                for(var j = 0; j < this.callbacks[puzzle_hash].length; ++j) {
                    this.callbacks[puzzle_hash][j](coin_states);
                }
            }
        }
    }

    public processCoinPacket(pckt: RespondToCoinUpdates) {
        const coin_ids: string[] = pckt.coin_ids.map((e) => e.toString("hex"));

        for(var i = 0;i < coin_ids.length; ++i) {
            const coin_id: string = coin_ids[i];

            const coin_states = pckt.coin_states.filter((e) => e.coin.getId().toString("hex") == coin_id);
            this.coin_states[coin_id] = coin_states;

            if(this.callbacks[coin_id] !== undefined && this.callbacks[coin_id].length > 0) {
                for(var j = 0; j < this.callbacks[coin_id].length; ++j) {
                    this.callbacks[coin_id][j](coin_states);
                }
            }
        }
    }

    public get(key: string): Optional<CoinState[]> {
        return this.coin_states[key] ?? null;
    }

    public addCallback(puzzleHashOrCoinId: string, callback: { (coin_states: CoinState[]): void; }) {
        if(this.callbacks[puzzleHashOrCoinId] == undefined)
            this.callbacks[puzzleHashOrCoinId] = [];
        this.callbacks[puzzleHashOrCoinId].push(callback);
    }

    public willExpectUpdate(puzzleHashOrCoinId: string) {
        this.coin_states[puzzleHashOrCoinId] = null;
    }

    public async waitFor(key: string): Promise<CoinState[]> {
        while(true) {
            var resp = this.get(key);
            if(resp != null)
                return resp;
            await new Promise( resolve => setTimeout(resolve, 100));
        }
    }
}