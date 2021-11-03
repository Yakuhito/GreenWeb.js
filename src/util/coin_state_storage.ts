import { Optional } from "../providers/provider";
import { CoinState, RespondToPhUpdates } from "../types/wallet_protocol";

export class CoinStateStorage {
    private puzzle_hashes_to_listen_for: string[] = [];
    private coin_states: { [puzHash: string]: Optional<CoinState[]> } = {};

    public update(pckt: RespondToPhUpdates) {
        const puzzle_hashes: string[] = pckt.puzzle_hashes.map((e) => e.toString("hex"));

        for(var i = 0;i < puzzle_hashes.length; ++i) {
            const puzzle_hash: string = puzzle_hashes[i];
            if(!this.puzzle_hashes_to_listen_for.includes(puzzle_hash)) {
                continue;
            }

            const coin_states = pckt.coin_states.filter((e) => e.coin.puzzle_hash.toString("hex") == puzzle_hash);
            this.coin_states[puzzle_hash] = coin_states;
        }
    }

    public get(puzzleHash: string): Optional<CoinState[]> {
        return this.coin_states[puzzleHash] ?? null;
    }

    public listenForPuzzleHash(puzzleHash: string) {
        if(!this.puzzle_hashes_to_listen_for.includes(puzzleHash)) {
            this.puzzle_hashes_to_listen_for.push(puzzleHash);
        }
        this.coin_states[puzzleHash] = null;
    }

    public stopListeningForPuzzleHash(puzzleHash: string) {
        this.puzzle_hashes_to_listen_for = this.puzzle_hashes_to_listen_for.filter((e) => e != puzzleHash);
    }

    public async waitFor(puzzleHash: string): Promise<CoinState[]> {
        while(true) {
            var resp = this.get(puzzleHash);
            if(resp != null)
                return resp;
            await new Promise( resolve => setTimeout(resolve, 100));
        }
    }
}