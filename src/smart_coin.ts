import { Coin } from "./util/serializer/types/coin";
import { CoinSpend } from "./util/serializer/types/coin_spend";
import { bytes, uint } from "./xch/providers/provider_types";
import { Util } from  "./util";
import { BigNumber } from "@ethersproject/bignumber";
import { SExp } from "clvm";

export type SmartCoinConstructorArgs = {
    parentCoinInfo?: string | null,
    puzzleHash?: string | null,
    amount?: uint | null,
    puzzle?: SExp | null
};

export class SmartCoin {
    public parentCoinInfo: string | null;
    public puzzleHash: string | null;
    public amount: uint | null;

    public puzzle: SExp | null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        puzzle = null,
    }: SmartCoinConstructorArgs) {
        this.parentCoinInfo = parentCoinInfo;
        this.puzzleHash = puzzleHash;
        this.amount = amount !== null ? BigNumber.from(amount) : null;
        this.puzzle = puzzle;

        this.calculatePuzzleHash();
    }

    public static fromCoin(coin: Coin | null, puzzle?: SExp | null): SmartCoin {
        if(puzzle === undefined) {
            puzzle = null;
        }

        let amount = coin?.amount ?? null;
        if(amount !== null) {
            amount = BigNumber.from(amount);
        }

        return new SmartCoin({
            parentCoinInfo: coin?.parentCoinInfo ?? null,
            puzzleHash: coin?.puzzleHash ?? null,
            amount,
            puzzle: puzzle ?? null
        });
    }

    private calculatePuzzleHash(): void {
        if(this.puzzle === null) return;

        this.puzzleHash = Util.sexp.sha256tree(this.puzzle);
    }

    public setParentCoinInfo(newValue: string): void {
        this.parentCoinInfo = newValue;
    }

    public setPuzzleHash(newValue: string): void {
        if(this.puzzle === null) {
            this.puzzleHash = newValue;
        }
    }

    public setAmount(newValue: uint): void {
        this.amount = BigNumber.from(newValue);
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.parentCoinInfo = this.parentCoinInfo!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.puzzleHash = this.puzzleHash!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.amount = this.amount!;

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

    public curry(args: SExp[]): SmartCoin | null {
        if(this.puzzle === null) {
            return null;
        }

        const c = this.toCoin();
        const newPuzzle = Util.sexp.curry(
            this.puzzle, args
        );
        return SmartCoin.fromCoin(
            c,
            newPuzzle
        );
    }
}