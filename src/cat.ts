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
        this.innerSolution = innerSolution;
        if(extraDelta !== null && extraDelta !== undefined) {
            this.extraDelta = BigNumber.from(extraDelta);
        }
        this.TAILProgram = TAILProgram;
        this.TAILSolution = TAILSolution;
        if(lineageProof !== null && lineageProof !== undefined) {
            this.lineageProof = {
                amount: lineageProof.amount ? BigNumber.from(lineageProof.amount) : null,
                parentName: lineageProof.parentName ?? null,
                innerPuzzleHash: lineageProof.innerPuzzleHash ?? null,
            };
        }

        let synthKey: any | null = null;
        if(publicKey !== null && publicKey !== undefined) {
            synthKey = Util.sexp.calculateSyntheticPublicKey(
                Util.key.hexToPublicKey(publicKey),
            );
            this.syntheticKey = Util.key.publicKeyToHex(synthKey);
        } else if(syntheticKey !== null && syntheticKey !== undefined) {
            synthKey = Util.key.hexToPublicKey(syntheticKey);
            this.syntheticKey = syntheticKey;
        }

        if(synthKey !== null) {
            this.syntheticKey = Util.key.publicKeyToHex(synthKey);
            this.innerPuzzle = Util.sexp.standardCoinPuzzle(synthKey, true);
        }

        this.deriveTAILProgramAndSolutionFromSolution();
        this.constructInnerSolution();
        this.constructPuzzle();
        this.calculateTAILPuzzleHash();
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
            if(_.vars[1] === "8f" && _.vars.length >= 4) { // -113 in bytes
                this.TAILProgram = Util.sexp.fromHex(_.vars[2]);
                this.TAILSolution = Util.sexp.fromHex(_.vars[3]);
                this.calculateTAILPuzzleHash();
                break;
            }
        }
    }

    protected constructPuzzle() {
        if(this.TAILProgramHash === null || this.innerPuzzle === null) return;
    
        this.puzzle = Util.sexp.CATPuzzle(this.TAILProgramHash, this.innerPuzzle);
        this.calculatePuzzleHash();
    }

    protected calculateTAILPuzzleHash(): void {
        if(this.TAILProgram === null) return;

        this.TAILProgramHash = Util.sexp.sha256tree(this.TAILProgram);
    }

    protected constructInnerSolution(): void {
        if(this.innerSolution !== null) return;
        if(this.TAILProgram === null || this.TAILSolution === null) return;
        if(this.extraDelta === null || BigNumber.from(this.extraDelta).eq(0)) return;

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

        innerSolution = null,

        publicKey = null,
        syntheticKey = null,

        extraDelta = null,
        TAILProgram = null,
        TAILSolution = null,
        lineageProof = null,
    }: CATConstructorArgs): CAT {
        return new CAT({
            parentCoinInfo: parentCoinInfo ?? this.parentCoinInfo,
            puzzleHash: puzzleHash ?? this.puzzleHash,
            amount: amount ?? this.amount,
            coin: coin,
            TAILProgramHash: TAILProgramHash ?? this.TAILProgramHash,
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
            amount: newValue,
        });
    }

    public withTAILProgramHash(newValue: bytes): CAT {
        return this.copyWith({
            TAILProgramHash: newValue
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

    public addConditionsToInnerSolution(conditions: SExp[]): CAT {
        if(this.innerSolution === null) this.innerSolution = SExp.to([])

        try {
            const cl = [];
            for(const elem of this.innerSolution.as_iter()) {
                cl.push(elem);
            }
            for(const elem of conditions) {
                cl.push(elem);
            }

            return this.copyWith({
                innerSolution: SExp.to(cl),
            });
        } catch(_) {
            return this;
        }
    }
}