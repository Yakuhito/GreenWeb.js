import { SExp } from "clvm";
import { Coin } from "../util/serializer/types/coin";
import { CoinSpend } from "../util/serializer/types/coin_spend";
import { bytes, uint } from "./providers/provider_types";
import { Util } from  "../util";

export class SmartCoin {
    public parentCoinInfo: string | null;
    public puzzleHash: string | null;
    public amount: uint | null;

    public puzzle: SExp | null;
    
    constructor(coin: Coin | null, puzzle: SExp | null) {
        this.parentCoinInfo = coin?.parentCoinInfo ?? null;
        this.puzzleHash = coin?.puzzleHash ?? null;
        this.amount = coin?.amount ?? null;

        this.puzzle = puzzle;
        this.calculatePuzzleHash();
    }

    private calculatePuzzleHash(): void {
        if(this.puzzle === null) return;

        this.puzzleHash = Buffer.from(
            this.puzzle.as_bin().data()
        ).toString("hex");
    }

    public setParentCoinInfo(newValue: string): void {
        this.parentCoinInfo = newValue;
    }

    public setAmount(newValue: uint): void {
        this.amount = newValue;
    }

    public setPuzzle(newValue: SExp): void {
        this.puzzle = newValue;
        this.calculatePuzzleHash();
    }

    private hasCoinInfo(): boolean {
        return this.parentCoinInfo !== null &&
            this.puzzleHash !== null &&
            this.amount !== null;
    }

    public toCoin(): Coin | null {
        if(!this.hasCoinInfo()) {
            return null;
        }

        const c = new Coin();
        c.parentCoinInfo = this.parentCoinInfo ?? "";
        c.puzzleHash = this.puzzleHash ?? "";
        c.amount = this.amount ?? 0;

        return c;
    }

    public spend(solution: SExp): CoinSpend | null {
        if(this.puzzle === null) {
            return null;
        }

        const c = this.toCoin();
        if(c === null) {
            return null;
        }

        const cs = new CoinSpend();
        cs.coin = c;
        cs.puzzleReveal = this.puzzle;
        cs.solution = solution;

        return cs;
    }

    public getId(): bytes | null {
        const c = this.toCoin();
        if(c === null) {
            return null;
        }

        return Util.coin.getId(c);
    }

    public getName(): bytes | null {
        return this.getId();
    }
}