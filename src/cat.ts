import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { SmartCoin } from "./smart_coin";
import { Util } from "./util";
import { bytes, Coin, uint } from "./xch/providers/provider_types";

export type CATConstructorArgs = {
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    puzzle?: SExp | null,
    TAILProgramHash?: bytes | null,
    TAILProgram?: SExp | null,
    innerPuzzleHash?: bytes | null,
    innerPuzzle?: SExp | null,
};

export class CAT extends SmartCoin {
    public TAILProgramHash: bytes | null = null;
    public TAILProgram: SExp | null = null;
    public innerPuzzleHash: bytes | null = null;
    public innerPuzzle: SExp | null = null;

    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,
        TAILProgramHash = null,
        TAILProgram = null,
        innerPuzzleHash = null,
        innerPuzzle = null,
    }: CATConstructorArgs = {}) {
        super({
            parentCoinInfo, puzzleHash, amount, coin
        });

        this.TAILProgram = TAILProgram;
        this.TAILProgramHash = TAILProgramHash;
        this.innerPuzzle = innerPuzzle;
        this.innerPuzzleHash = innerPuzzleHash;

        this.deriveArgsFromPuzzle(puzzle);
        this.calculateInnerPuzzleHash();
        this.calculateTAILPuzzleHash();
        this.constructPuzzle();
    }

    public deriveArgsFromPuzzle(puzzle: SExp | null) {
        if(puzzle === null || puzzle === undefined) return;

        const res = Util.sexp.uncurry(puzzle);
        if(res === null) return;
        
        const args: SExp[] = res[1];
        if(args.length !== 3) return;
        if(args[0].as_bin().hex() !== Util.sexp.CAT_PROGRAM_MOD_HASH) return;

        this.TAILProgramHash = args[1].as_bin().hex();
        this.innerPuzzle = args[2];

        this.calculatePuzzleHash();
    }

    public constructPuzzle() {
        if(this.TAILProgramHash === null) return;
        if(this.innerPuzzle === null) return;

        this.puzzle = Util.sexp.curry(
            Util.sexp.CAT_PROGRAM,
            [
                SExp.to(Bytes.from(Util.sexp.CAT_PROGRAM_MOD_HASH, "hex")),
                SExp.to(Bytes.from(this.TAILProgramHash, "hex")),
                this.innerPuzzle
            ]
        );
        this.calculatePuzzleHash();
    }

    protected calculateInnerPuzzleHash(): void {
        if(this.innerPuzzle === null) return;

        this.innerPuzzleHash = Util.sexp.sha256tree(this.innerPuzzle);
    }

    protected calculateTAILPuzzleHash(): void {
        if(this.TAILProgram === null) return;

        this.TAILProgramHash = Util.sexp.sha256tree(this.TAILProgram);
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,
        TAILProgramHash = null,
        TAILProgram = null,
        innerPuzzleHash = null,
        innerPuzzle = null,
    }: CATConstructorArgs = {}): CAT {
        return new CAT({
            parentCoinInfo: parentCoinInfo ?? this.parentCoinInfo,
            puzzleHash: puzzleHash ?? this.puzzleHash,
            amount: amount ?? this.amount,
            coin: coin,
            puzzle: puzzle ?? this.puzzle,
            TAILProgramHash: TAILProgramHash ?? this.TAILProgramHash,
            TAILProgram: TAILProgram ?? this.TAILProgram,
            innerPuzzleHash: innerPuzzleHash ?? this.innerPuzzleHash,
            innerPuzzle: innerPuzzle ?? this.innerPuzzle
        });
    }

    public withParentCoinInfo(newValue: string): CAT {
        return this.copyWith({
            parentCoinInfo: newValue
        });
    }

    public withPuzzleHash(newValue: string): CAT {
        return this.copyWith({
            puzzleHash: newValue,
            puzzle: null
        });
    }

    public withAmount(newValue: uint): CAT {
        return this.copyWith({
            amount: BigNumber.from(newValue),
        });
    }

    public withTAILProgramHash(newValue: bytes): CAT {
        return this.copyWith({
            TAILProgramHash: newValue
        });
    }

    public withTAILProgram(newValue: SExp): CAT {
        return this.copyWith({
            TAILProgram: newValue
        });
    }

    public withInnerPuzzle(newValue: SExp): CAT {
        return this.copyWith({
            innerPuzzle: newValue
        });
    }

    public withInnerPuzzleHash(newValue: bytes): CAT {
        return this.copyWith({
            innerPuzzleHash: newValue
        });
    }
}