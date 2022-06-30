import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { SmartCoin } from "./smart_coin";
import { Util } from "./util";
import { bytes, Coin, uint } from "./xch/providers/provider_types";

export type LineageProof = {
    parentName?: bytes | null,
    innerPuzzleHash?: bytes | null,
    amount?: uint | null,
};

export type CATConstructorArgs = {
    // standard SmartCoin
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    puzzle?: SExp | null,
    // CAT-specific
    TAILProgramHash?: bytes | null,
    innerPuzzleHash?: bytes | null,
    innerPuzzle?: SExp | null,
    // spend
    innerSolution?: SExp | null,
    // or (spend 2)
    extraDelta?: uint | null,
    TAILProgram?: SExp | null,
    TAILSolution?: SExp | null,
    lineageProof?: LineageProof | null,
};

export class CAT extends SmartCoin {
    public TAILProgramHash: bytes | null = null;
    public innerPuzzleHash: bytes | null = null;
    public innerPuzzle: SExp | null = null;

    public innerSolution: SExp | null = null;

    public extraDelta: uint | null = null;
    public TAILProgram: SExp | null = null;
    public TAILSolution: SExp | null = null;
    public lineageProof: LineageProof | null = null;

    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,

        TAILProgramHash = null,
        innerPuzzleHash = null,
        innerPuzzle = null,

        innerSolution = null,

        extraDelta = null,
        TAILProgram = null,
        TAILSolution = null,
        lineageProof = null,
    }: CATConstructorArgs = {}) {
        super({
            parentCoinInfo, puzzleHash, amount, coin
        });

        this.TAILProgramHash = TAILProgramHash;
        this.innerPuzzle = innerPuzzle;
        this.innerPuzzleHash = innerPuzzleHash;
        this.innerSolution = innerSolution;
        if(extraDelta !== null) {
            this.extraDelta = BigNumber.from(extraDelta);
        }
        this.TAILProgram = TAILProgram;
        this.TAILSolution = TAILSolution;
        this.lineageProof = lineageProof;

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
        innerPuzzleHash = null,
        innerPuzzle = null,

        innerSolution = null,

        extraDelta = null,
        TAILProgram = null,
        TAILSolution = null,
        lineageProof = null,
    }: CATConstructorArgs = {}): CAT {
        return new CAT({
            parentCoinInfo: parentCoinInfo ?? this.parentCoinInfo,
            puzzleHash: puzzleHash ?? this.puzzleHash,
            amount: amount ?? this.amount,
            coin: coin,
            puzzle: puzzle ?? this.puzzle,
            TAILProgramHash: TAILProgramHash ?? this.TAILProgramHash,
            innerPuzzleHash: innerPuzzleHash ?? this.innerPuzzleHash,
            innerPuzzle: innerPuzzle ?? this.innerPuzzle,
            innerSolution: innerSolution ?? this.innerSolution,
            extraDelta: extraDelta ?? this.extraDelta,
            TAILProgram: TAILProgram ?? this.TAILProgram,
            TAILSolution: TAILSolution ?? this.TAILSolution,
            lineageProof: lineageProof ?? this.lineageProof,
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

    public withInnerSolution(newValue: SExp): CAT {
        return this.copyWith({
            innerSolution: newValue
        });
    }

    public withExtraDelta(newValue: uint): CAT {
        return this.copyWith({
            extraDelta: newValue
        });
    }

    public withTAILProgram(newValue: SExp): CAT {
        return this.copyWith({
            TAILProgram: newValue
        });
    }

    public withTAILSolution(newValue: SExp): CAT {
        return this.copyWith({
            TAILSolution: newValue
        });
    }

    public withLineageProof(newValue: LineageProof): CAT {
        return this.copyWith({
            lineageProof: newValue
        });
    }

    public isSpendable(): boolean {
        if(!this.hasCoinInfo()) return false;

        if(this.innerSolution !== null && this.innerPuzzle !== null) return true;

        if(
            this.TAILProgram !== null &&
            this.TAILSolution !== null &&
            this.extraDelta !== null &&
            !BigNumber.from(this.extraDelta).eq(0)
        ) return true;

        return false;
    }
}