import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { SmartCoin } from "./smart_coin";
import { Util } from "./util";
import { ConditionsDict } from "./util/sexp";
import { ConditionOpcode } from "./util/sexp/condition_opcodes";
import { bytes, Coin, uint } from "./xch/providers/provider_types";

export type LineageProof = {
    parentName?: bytes | null,
    innerPuzzleHash?: bytes | null,
    amount?: uint | null,
};

export type CATConstructorArgs = {
    // SmartCoin
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    // CAT-specific
    TAILProgramHash?: bytes | null,
    innerPuzzle?: SExp | null,
    // inner puzzle
    publicKey?: bytes | null,
    syntheticKey?: bytes | null,
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

    public innerPuzzle: SExp | null = null;
    public innerPuzzleHash: bytes | null = null;

    public syntheticKey: bytes | null = null;

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

        TAILProgramHash = null,
        innerPuzzle = null,

        innerSolution = null,

        publicKey = null,
        syntheticKey = null,

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
        this.innerSolution = innerSolution;
        if(extraDelta !== null) {
            this.extraDelta = BigNumber.from(extraDelta);
        }
        this.TAILProgram = TAILProgram;
        this.TAILSolution = TAILSolution;
        this.lineageProof = lineageProof;
        if(syntheticKey !== null) {
            this.syntheticKey = syntheticKey;
        } else {
            if(publicKey !== null) {
                const publicKeyObj = Util.key.hexToPublicKey(publicKey);
                this.syntheticKey =Util.sexp.calculateSyntheticPublicKey(publicKeyObj);
            }
        }

        this.constructInnerPuzzle();
        this.deriveTAILProgramAndSolutionFromSolution();
        this.constructInnerSolution();
        this.constructPuzzle();
        this.calculateInnerPuzzleHash();
        this.calculateTAILPuzzleHash();
    }

    protected constructInnerPuzzle(): void {
        if(this.syntheticKey === null) return;

        this.innerPuzzle = Util.sexp.standardCoinPuzzle(
            Util.key.hexToPrivateKey(this.syntheticKey),
            true
        )
    }

    protected deriveTAILProgramAndSolutionFromSolution() {
        if(this.innerPuzzle === null || this.innerSolution === null) return;

        const res = Util.sexp.conditionsDictForSolution(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.innerPuzzle!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.innerSolution!,
            Util.sexp.MAX_BLOCK_COST_CLVM
        );
        if(res[0]) return;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const conditionsDict: ConditionsDict = res[1]!;

        for(const _ of (conditionsDict.get(ConditionOpcode.CREATE_COIN) ?? [])) {
            if(_.vars[1] === "8f") { // -113 in bytes
                this.TAILProgram = Util.sexp.fromHex(_.vars[2]);
                this.TAILSolution = Util.sexp.fromHex(_.vars[3]);
                this.calculateTAILPuzzleHash();
                break;
            }
        }
    }

    protected constructPuzzle() {
        if(this.TAILProgramHash === null || this.innerPuzzle === null) return;
    
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

    protected constructInnerSolution(): void {
        if(this.innerSolution !== null) return;
        if(this.TAILProgram === null || this.TAILSolution === null) return;
        if(BigNumber.from(this.extraDelta).eq(0)) return;

        this.innerSolution = SExp.to([
            SExp.to([
                Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
                Bytes.from("yakuhitoyakuhitoyakuhitoyakuhito"),
                Bytes.from("8f", "hex"),
                this.TAILProgram,
                this.TAILSolution
            ]),
        ]);
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,

        TAILProgramHash = null,
        innerPuzzle = null,

        innerSolution = null,

        publicKey = null,
        syntheticKey = null,

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
            TAILProgramHash: TAILProgramHash ?? this.TAILProgramHash,
            innerPuzzle: innerPuzzle ?? this.innerPuzzle,
            publicKey: publicKey,
            syntheticKey: syntheticKey ?? this.syntheticKey,
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

    public withPublicKey(newValue: bytes): CAT {
        return this.copyWith({
            publicKey: newValue
        });
    }

    public withSyntheticKey(newValue: bytes): CAT {
        return this.copyWith({
            syntheticKey: newValue
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

        if(
            this.innerSolution !== null &&
            this.TAILProgramHash !== null &&
            this.innerPuzzle !== null
        ) return true;

        return false;
    }
}