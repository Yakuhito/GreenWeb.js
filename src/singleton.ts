import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { LineageProof } from "./cat";
import { SmartCoin } from "./smart_coin";
import { Util } from "./util";
import { bytes, Coin, uint } from "./xch/providers/provider_types";

export type SingletonConstructorArgs = {
    // SmartCoin
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    // singleton-specific
    launcherId?: bytes | null,
    innerPuzzle?: SExp | null,
    // spend
    lineageProof?: LineageProof | null,
    innerSolution?: SExp | null,
};

export class Singleton extends SmartCoin {
    public launcherId: bytes | null = null;

    public innerPuzzle: SExp | null = null;
    public innerPuzzleHash: bytes | null = null;
    
    public lineageProof: LineageProof | null = null;
    public innerSolution: SExp | null = null;

    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,

        launcherId = null,
        innerPuzzle = null,

        lineageProof = null,
        innerSolution = null,
    }: SingletonConstructorArgs = {}) {
        super({
            parentCoinInfo, puzzleHash, amount, coin
        });

        this.launcherId = Util.dehexlify(launcherId);
        this.innerPuzzle = innerPuzzle;
        this.innerSolution = innerSolution;
        
        if(lineageProof !== null && lineageProof !== undefined) {
            this.lineageProof = {
                amount: lineageProof.amount ? BigNumber.from(lineageProof.amount) : null,
                parentName: Util.dehexlify(lineageProof.parentName ?? null),
                innerPuzzleHash: Util.dehexlify(lineageProof.innerPuzzleHash ?? null),
            };
        }

        this.calculateInnerPuzzleHash();
        this.constructPuzzle();
        this.constructSolution();
    }

    protected calculateInnerPuzzleHash() {
        if(this.innerPuzzle === null) return;

        this.innerPuzzleHash = Util.sexp.sha256tree(this.innerPuzzle);
    }

    protected constructPuzzle() {
        if(this.launcherId === null || this.innerPuzzle === null) return;

        this.puzzle = Util.sexp.singletonPuzzle(this.launcherId, this.innerPuzzle);
        this.calculatePuzzleHash();
    }

    private lineageProofToSExpForSolution(): SExp {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const lp = this.lineageProof!;

        return SExp.to([
            Bytes.from(lp.parentName, "hex"),
            ...(lp.innerPuzzleHash === null ? [] : [ // account for eve spend
                Bytes.from(lp.innerPuzzleHash, "hex"),
            ]) ,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Bytes.from(Util.coin.amountToBytes(lp.amount!), "hex"),
        ]);
    }

    protected constructSolution() {
        if(
            this.lineageProof === null ||
            this.amount === null ||
            this.innerSolution === null ||
            this.lineageProof.parentName === null ||
            this.lineageProof.amount === null
        ) return;

        this.solution = this.solution = Util.sexp.singletonSolution(
            this.lineageProofToSExpForSolution(),
            this.amount,
            this.innerSolution
        );
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,

        launcherId = null,
        innerPuzzle = null,

        lineageProof = null,
        innerSolution = null,
    }: SingletonConstructorArgs): Singleton {
        return new Singleton({
            parentCoinInfo: parentCoinInfo ?? this.parentCoinInfo,
            puzzleHash: puzzleHash ?? this.puzzleHash,
            amount: amount ?? this.amount,
            coin: coin,
            launcherId: launcherId ?? this.launcherId,
            innerPuzzle: innerPuzzle ?? this.innerPuzzle,
            lineageProof: lineageProof ?? this.lineageProof,
            innerSolution: innerSolution ?? this.innerSolution,
        });
    }

    public withParentCoinInfo(parentCoinInfo: bytes): Singleton {
        return this.copyWith({
            parentCoinInfo,
        });
    }

    public withPuzzleHash(puzzleHash: bytes): Singleton {
        return this.copyWith({
            puzzleHash,
        });
    }

    public withAmount(amount: uint): Singleton {
        return this.copyWith({
            amount,
        });
    }

    public withLauncherId(launcherId: bytes): Singleton {
        return this.copyWith({
            launcherId,
        });
    }

    public withInnerPuzzle(innerPuzzle: SExp): Singleton {
        return this.copyWith({
            innerPuzzle,
        });
    }
    
    public withLineageProof(lineageProof: LineageProof): Singleton {
        return this.copyWith({
            lineageProof,
        });
    }
    
    public withInnerSolution(innerSolution: SExp): Singleton {
        return this.copyWith({
            innerSolution,
        });
    }

    public getPayToPuzzleHash(): bytes | null {
        if(this.launcherId === null) return null;

        return Util.sexp.sha256tree(
            Util.sexp.payToSingletonPuzzle(this.launcherId)
        );
    }

    public getPayToAddress(): string | null {
        const ph = this.getPayToPuzzleHash();
        if(ph === null) return null;
        
        return Util.address.puzzleHashToAddress(ph);
    }
}