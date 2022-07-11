import { BigNumber } from "@ethersproject/bignumber";
import { SExp } from "clvm";
import { SmartCoin } from "./smart_coin"
import { Util } from "./util";
import { uint } from "./util/serializer/basic_types";
import { bytes, Coin } from "./xch/providers/provider_types";

export type StandardCoinConstructorArgs = {
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    solution?: SExp | null,
    publicKey?: bytes | null,
    syntheticKey?: bytes | null
};

export class StandardCoin extends SmartCoin {
    public syntheticKey: bytes | null = null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        solution = null,
        publicKey = null,
        syntheticKey = null,
    }: StandardCoinConstructorArgs = {}) {
        super({
            parentCoinInfo, puzzleHash, amount, coin, solution
        });

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
            this.puzzle = this.getPuzzleForSyntheticPublicKey(synthKey);
            this.calculatePuzzleHash();
        }
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        solution = null,
        publicKey = null,
        syntheticKey = null,
    }: StandardCoinConstructorArgs): StandardCoin {
        return new StandardCoin({
            parentCoinInfo: parentCoinInfo ?? this.parentCoinInfo,
            puzzleHash: puzzleHash ?? this.puzzleHash,
            amount: amount ?? this.amount,
            solution: solution ?? this.solution,
            coin,
            publicKey: publicKey,
            syntheticKey: syntheticKey ?? this.syntheticKey,
        });
    }

    private getPuzzleForSyntheticPublicKey(publicKey: any): SExp {
        return Util.sexp.standardCoinPuzzle(publicKey, true);
    }

    public withPublicKey(publicKey: bytes) : StandardCoin {
        return this.copyWith({
            publicKey,
        });
    }

    public withSyntheticKey(syntheticKey: bytes) : StandardCoin {
        return this.copyWith({
            syntheticKey,
        });
    }

    public withParentCoinInfo(parentCoinInfo: bytes): StandardCoin {
        return this.copyWith({
            parentCoinInfo,
        });
    }

    public withPuzzleHash(puzzleHash: bytes): StandardCoin {
        return this.copyWith({
            puzzleHash,
        });
    }


    private createCreateCoinCondition(puzzleHash: bytes, amount: BigNumber): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_COIN, "hex"),
            ),
            Bytes.from(
                Buffer.from(puzzleHash, "hex"),
            ),
            Bytes.from(Util.coin.amountToBytes(amount), "hex"),
        ]);
    }

    private createReserveFeeCondition(fee: BigNumber): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.RESERVE_FEE, "hex"),
            ),
            Bytes.from(
                Buffer.from(fee.toHexString().slice(2), "hex")
            ),
        ]);
    }

    public send(
        addressOrPuzzleHash: string,
        fee?: BigNumberish,
        amount?: BigNumberish,
        changeAddressOrPuzzleHash?: string
    ): CoinSpend | null {
        if(amount === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            amount = this.amount!;
        }

        const recipientsAndAmounts: Array<[string, BigNumberish]> = [
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            [addressOrPuzzleHash, amount!]
        ];
        return this.multisend(
            recipientsAndAmounts,
            fee,
            changeAddressOrPuzzleHash
        );

    public withAmount(amount: uint): StandardCoin {
        return this.copyWith({
            amount: BigNumber.from(amount),
        });
    }

    public addConditionsToSolution(conditions: SExp[]): StandardCoin {
        if(this.solution === null) {
            this.solution = Util.sexp.standardCoinSolution([]);
        }

        try {
            const e = [];
            for(const elem of this.solution.as_iter()) {
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
                solution: Util.sexp.standardCoinSolution(conditionList),
            });
        } catch(_) {
            return this;
        }
    }
}