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
    puzzle?: SExp | null
};

export class SmartCoin {
    public parentCoinInfo: string | null = null;
    public puzzleHash: string | null = null;
    public amount: BigNumber | null = null;

    public puzzle: SExp | null = null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,
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

        if(puzzle !== null && puzzle !== undefined) {
            this.puzzle = puzzle;
            this.calculatePuzzleHash();
        }
    }

    private calculatePuzzleHash(): void {
        if(this.puzzle === null) return;

        this.puzzleHash = Util.sexp.sha256tree(this.puzzle);
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        puzzle = null,
    }: SmartCoinConstructorArgs = {}): SmartCoin {
        return new SmartCoin({
            parentCoinInfo: parentCoinInfo !== undefined && parentCoinInfo !== null ? parentCoinInfo : this.parentCoinInfo,
            puzzleHash: puzzleHash !== undefined && puzzleHash !== null ? puzzleHash : this.puzzleHash,
            amount: amount !== undefined && amount !== null ? amount : this.amount,
            puzzle: puzzle !== undefined && puzzle !== null ? puzzle : this.puzzle,
        });
    }

    public withParentCoinInfo(newValue: string): SmartCoin {
        return this.copyWith({
            parentCoinInfo: newValue
        });
    }

    public withPuzzleHash(newValue: string): SmartCoin {
        return this.copyWith({
            puzzleHash: newValue,
            puzzle: null
        });
    }

    public withAmount(newValue: uint): SmartCoin {
        return this.copyWith({
            amount: BigNumber.from(newValue),
        });
    }

    public withPuzzle(newValue: SExp): SmartCoin {
        return this.copyWith({
            puzzle: newValue,
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
        const sc = new SmartCoin({ coin: c, puzzle: newPuzzle });

        return sc;
    }
}