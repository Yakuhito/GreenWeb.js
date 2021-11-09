import { Optional } from "../providers/provider";
import { CoinState, RespondToCoinUpdates, RespondToPhUpdates } from "../types/wallet_protocol";

export class CoinStateStorage {
    private callbacks: { [key: string]: Array<(coin_states: CoinState[]) => void> } = {};
    private coinStates: { [puzHash: string]: Optional<CoinState[]> } = {};

    public processPhPacket(pckt: RespondToPhUpdates) {
        const puzzleHashes: string[] = pckt.puzzleHashes.map((e) => e.toString("hex"));

        for(let i = 0;i < puzzleHashes.length; ++i) {
            const puzzleHash: string = puzzleHashes[i];

            const coinStates = pckt.coinStates.filter((e) => e.coin.puzzleHash.toString("hex") === puzzleHash);
            this.coinStates[puzzleHash] = coinStates;

            if(this.callbacks[puzzleHash] !== undefined && this.callbacks[puzzleHash].length > 0) {
                for(let j = 0; j < this.callbacks[puzzleHash].length; ++j) {
                    this.callbacks[puzzleHash][j](coinStates);
                }
            }
        }
    }

    public processCoinPacket(pckt: RespondToCoinUpdates) {
        const coinIds: string[] = pckt.coinIds.map((e) => e.toString("hex"));

        for(let i = 0;i < coinIds.length; ++i) {
            const coinId: string = coinIds[i];

            const coinStates = pckt.coinStates.filter((e) => e.coin.getId().toString("hex") === coinId);
            this.coinStates[coinId] = coinStates;

            if(this.callbacks[coinId] !== undefined && this.callbacks[coinId].length > 0) {
                for(let j = 0; j < this.callbacks[coinId].length; ++j) {
                    this.callbacks[coinId][j](coinStates);
                }
            }
        }
    }

    public get(key: string): Optional<CoinState[]> {
        return this.coinStates[key] ?? null;
    }

    public addCallback(puzzleHashOrCoinId: string, callback: (coin_states: CoinState[]) => void) {
        if(this.callbacks[puzzleHashOrCoinId] === undefined)
            this.callbacks[puzzleHashOrCoinId] = [];
        this.callbacks[puzzleHashOrCoinId].push(callback);
    }

    public willExpectUpdate(puzzleHashOrCoinId: string) {
        this.coinStates[puzzleHashOrCoinId] = null;
    }

    public async waitFor(key: string): Promise<CoinState[]> {
        let resp = this.get(key);
        while(resp == null) {
            resp = this.get(key);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return resp;
    }
}