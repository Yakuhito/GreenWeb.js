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
    coin?: Coin | null,
    puzzle?: SExp | null,
    solution?: SExp | null,
};

export class SmartCoin {
    public parentCoinInfo: string | null = null;
    public puzzleHash: string | null = null;
    public amount: BigNumber | null = null;

    public puzzle: SExp | null = null;
    public solution: SExp | null = null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,
        solution = null,
    }: SmartCoinConstructorArgs = {}) {
        if(coin !== null && coin !== undefined) {
            this.parentCoinInfo = coin.parentCoinInfo;
            this.puzzleHash = coin.puzzleHash;
            this.amount = BigNumber.from(coin.amount);
        } else {
            this.parentCoinInfo = parentCoinInfo;
            this.puzzleHash = puzzleHash;
            this.amount = amount !== null ? BigNumber.from(amount) : null;
        }

        if(puzzle !== undefined) {
            this.puzzle = puzzle;
        }

        if(solution !== undefined) {
            this.solution = solution;
        }

        this.calculatePuzzleHash();
    }

    protected calculatePuzzleHash(): void {
        if(this.puzzle === null) return;

        this.puzzleHash = Util.sexp.sha256tree(this.puzzle);
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,
        solution = null,
    }: SmartCoinConstructorArgs): SmartCoin {
        const puzzleSupplied = puzzle !== undefined && puzzle !== null;
        const puzzleHashSupplied = puzzleHash !== undefined && puzzleHash !== null;
        const givePuzzle = puzzleSupplied || (puzzleHashSupplied && this.puzzleHash !== puzzleHash);

        return new SmartCoin({
            parentCoinInfo: parentCoinInfo ?? this.parentCoinInfo,
            puzzleHash: puzzleHashSupplied ? puzzleHash : this.puzzleHash,
            amount: amount ?? this.amount,
            puzzle: givePuzzle ? puzzle : this.puzzle,
            coin: coin ?? null,
            solution: solution ?? this.solution,
        });
    }

    public withParentCoinInfo(parentCoinInfo: string): SmartCoin {
        return this.copyWith({
            parentCoinInfo,
        });
    }

    public withPuzzleHash(puzzleHash: string): SmartCoin {
        return this.copyWith({
            puzzleHash,
            puzzle: null
        });
    }

    public withAmount(amount: uint): SmartCoin {
        return this.copyWith({
            amount: BigNumber.from(amount),
        });
    }

    public withPuzzle(puzzle: SExp): SmartCoin {
        return this.copyWith({
            puzzle,
        });
    }

    public withSolution(solution: SExp): SmartCoin {
        return this.copyWith({
            solution,
        });
    }

    protected hasCoinInfo(): boolean {
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

    public spend(): CoinSpend | null {
        if(!this.isSpendable()) {
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const c = this.toCoin()!;

        const cs = new CoinSpend();
        cs.coin = c;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cs.puzzleReveal = this.puzzle!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cs.solution = this.solution!;

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
        const sc = new SmartCoin({ coin: c, puzzle: newPuzzle });

        return sc;
    }

    public isSpendable(): boolean {
        return this.hasCoinInfo() && this.puzzle !== null && this.solution !== null;
    }
}