import { CoinUtil } from "../../../util/coin";
import * as providerTypes from "../provider_types";
import { ProviderUtil } from "./provider_util";
import { CoinState, RespondToCoinUpdates, RespondToPhUpdates } from "../../../util/serializer/types/wallet_protocol";

export class CoinStateStorage {
    private callbacks: { [key: string]: Array<(coin_states: providerTypes.CoinState[]) => void> } = {};
    private coinStates: { [puzHash: string]: providerTypes.Optional<CoinState[]> } = {};

    private _execCallbacks(callbacks: Array<(coin_states: providerTypes.CoinState[]) => void>, cs: CoinState[]) {
        const coinStates: providerTypes.CoinState[] = [];

        for(let i = 0;i < cs.length; ++i) {
            coinStates.push(
                ProviderUtil.serializerCoinStateToProviderCoinState(cs[i])
            );
        }

        for(let j = 0;j < callbacks.length; ++j) {
            callbacks[j](coinStates);
        }
    }

    public processPhPacket(pckt: RespondToPhUpdates) {
        const puzzleHashes: string[] = pckt.puzzleHashes;

        for(let i = 0;i < puzzleHashes.length; ++i) {
            const puzzleHash: string = puzzleHashes[i];

            const coinStates = pckt.coinStates.filter((e) => e.coin.puzzleHash === puzzleHash);
            this.coinStates[puzzleHash] = coinStates;

            if(this.callbacks[puzzleHash] !== undefined && this.callbacks[puzzleHash].length > 0) {
                this._execCallbacks(
                    this.callbacks[puzzleHash],
                    coinStates
                );
            }
        }
    }

    public processCoinPacket(pckt: RespondToCoinUpdates) {
        const coinIds: string[] = pckt.coinIds.map((e) => e);

        for(let i = 0;i < coinIds.length; ++i) {
            const coinId: string = coinIds[i];

            const coinStates = pckt.coinStates.filter((e) => (new CoinUtil()).getId(e.coin) === coinId);
            this.coinStates[coinId] = coinStates;

            if(this.callbacks[coinId] !== undefined && this.callbacks[coinId].length > 0) {
                this._execCallbacks(
                    this.callbacks[coinId],
                    coinStates
                );
            }
        }
    }

    public get(key: string): providerTypes.Optional<CoinState[]> {
        return this.coinStates[key] ?? null;
    }

    public addCallback(puzzleHashOrCoinId: string, callback: (coin_states: providerTypes.CoinState[]) => void) {
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