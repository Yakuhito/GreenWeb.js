import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
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
    prevCoinId?: bytes | null,
    nextCoin?: Coin | null,
    prevSubtotal?: BigNumberish | null,
    // spend extra
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
    public prevCoinId: bytes | null = null;
    public nextCoin: Coin | null = null;
    public prevSubtotal: BigNumberish | null = null;

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

        publicKey = null,
        syntheticKey = null,

        innerSolution = null,
        prevCoinId = null,
        nextCoin = null,
        prevSubtotal = null,

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
        this.prevCoinId = prevCoinId;
        this.nextCoin = nextCoin;
        if(prevSubtotal !== null && prevSubtotal !== undefined) {
            this.prevSubtotal = BigNumber.from(prevSubtotal);
        }
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
            this.innerPuzzleHash = Util.sexp.sha256tree(this.innerPuzzle);
        }

        this.deriveTAILProgramAndSolutionFromSolution();
        this.constructInnerSolution();
        this.constructPuzzle();
        this.calculateTAILPuzzleHash();
        this.constructSolution();
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

        this.innerSolution = Util.sexp.standardCoinSolution([
            SExp.to([
                Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
                Bytes.from("yakuhitoyakuhitoyakuhitoyakuhito"),
                Bytes.from("8f", "hex"),
                this.TAILProgram,
                this.TAILSolution
            ]),
        ]);
    }

    protected lineageProofToProgram(): SExp | null {
        if(
            !this.lineageProof ||
            !this.lineageProof.amount ||
            !this.lineageProof.innerPuzzleHash ||
            !this.lineageProof.parentName
        ) {
            return null;
        }

        const c = new Coin();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.parentCoinInfo = this.lineageProof!.parentName!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.puzzleHash = this.lineageProof!.innerPuzzleHash!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.amount = this.lineageProof!.amount!;

        return Util.coin.toProgram(c);
    }

    protected constructSolution(): void {
        if(this.innerSolution === null || !this.hasCoinInfo()) return;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const thisCoin = this.toCoin()!;
        this.solution = Util.sexp.CATSolution(
            this.innerSolution,
            this.lineageProofToProgram(),
            this.prevCoinId ?? Util.coin.getId(thisCoin),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.toCoin()!,
            this.nextCoin ?? thisCoin,
            this.prevSubtotal ?? 0,
            this.extraDelta ?? 0
        );
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,

        TAILProgramHash = null,

        innerSolution = null,
        prevCoinId = null,
        nextCoin = null,
        prevSubtotal = null,

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
            prevCoinId: prevCoinId ?? this.prevCoinId,
            nextCoin: nextCoin ?? this.nextCoin,
            prevSubtotal: prevSubtotal ?? this.prevSubtotal,
            extraDelta: extraDelta ?? this.extraDelta,
            TAILProgram: TAILProgram ?? this.TAILProgram,
            TAILSolution: TAILSolution ?? this.TAILSolution,
            lineageProof: lineageProof ?? this.lineageProof,
        });
    }

    public withParentCoinInfo(parentCoinInfo: bytes): CAT {
        return this.copyWith({
            parentCoinInfo,
        });
    }

    public withPuzzleHash(puzzleHash: bytes): CAT {
        return this.copyWith({
            puzzleHash,
        });
    }

    public withAmount(amount: uint): CAT {
        return this.copyWith({
            amount,
        });
    }

    public withTAILProgramHash(TAILProgramHash: bytes): CAT {
        return this.copyWith({
            TAILProgramHash,
        });
    }

    public withPublicKey(publicKey: bytes): CAT {
        return this.copyWith({
            publicKey,
        });
    }

    public withSyntheticKey(syntheticKey: bytes): CAT {
        return this.copyWith({
            syntheticKey,
        });
    }

    public withInnerSolution(innerSolution: SExp): CAT {
        return this.copyWith({
            innerSolution,
        });
    }

    public withExtraDelta(extraDelta: uint): CAT {
        return this.copyWith({
            extraDelta,
        });
    }

    public withTAILProgram(TAILProgram: SExp): CAT {
        return this.copyWith({
            TAILProgram,
        });
    }

    public withTAILSolution(TAILSolution: SExp): CAT {
        return this.copyWith({
            TAILSolution,
        });
    }

    public withLineageProof(lineageProof: LineageProof): CAT {
        return this.copyWith({
            lineageProof,
        });
    }

    public addConditionsToInnerSolution(conditions: SExp[]): CAT {
        if(this.innerSolution === null) {
            this.innerSolution = Util.sexp.standardCoinSolution([]);
        }
        
        try {
            const e = [];
            for(const elem of this.innerSolution.as_iter()) {
                e.push(elem);
            }
            if(e.length !== 3) return this;

            const conditionList: SExp[] = [];
            const cl = e[1];
            let first = true;

            for(const elem of cl.as_iter()) {
                if(first) {
                    first = false;
                } else {
                    conditionList.push(elem);
                }
            }
            for(const elem of conditions) {
                conditionList.push(elem);
            }

            return this.copyWith({
                innerSolution: Util.sexp.standardCoinSolution(conditionList),
            });
        } catch(_) {
            return this;
        }
    }
}