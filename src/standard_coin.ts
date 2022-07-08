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
            this.syntheticKey = Util.key.publicKeyToHex(synthKey);
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

    public withAmount(amount: uint): StandardCoin {
        return this.copyWith({
            amount: BigNumber.from(amount),
        });
    }

    // private createCreateCoinCondition(puzzleHash: bytes, amount: BigNumber): SExp {
    //     return SExp.to([
    //         Bytes.from(
    //             Buffer.from(ConditionOpcode.CREATE_COIN, "hex"),
    //         ),
    //         Bytes.from(
    //             Buffer.from(puzzleHash, "hex"),
    //         ),
    //         Bytes.from(
    //             Util.coin.amountToBytes(amount), "hex"
    //         ),
    //     ]);
    // }

    // private createReserveFeeCondition(fee: BigNumber): SExp {
    //     return SExp.to([
    //         Bytes.from(
    //             Buffer.from(ConditionOpcode.RESERVE_FEE, "hex"),
    //         ),
    //         Bytes.from(
    //             Util.coin.amountToBytes(fee), "hex"
    //         ),
    //     ]);
    // }

    // public send(
    //     addressOrPuzzleHash: string,
    //     fee?: BigNumberish,
    //     amount?: BigNumberish,
    //     changeAddressOrPuzzleHash?: string
    // ): CoinSpend | null {
    //     if(amount === undefined) {
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         amount = this.amount!;
    //     }

    //     const recipientsAndAmounts: Array<[string, BigNumberish]> = [
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         [addressOrPuzzleHash, amount!]
    //     ];
    //     return this.multisend(
    //         recipientsAndAmounts,
    //         fee,
    //         changeAddressOrPuzzleHash
    //     );
    // }

    // public multisend(
    //     recipientsAndAmounts: Array<[string, BigNumberish]>,
    //     fee?: BigNumberish,
    //     changeAddressOrPuzzleHash?: string
    // ): CoinSpend | null {
    //     if(!this.hasCoinInfo()) {
    //         return null;
    //     }

    //     const txFee: BigNumber = fee === undefined ? BigNumber.from(0) : BigNumber.from(fee);
    //     let totalSpent: BigNumber = BigNumber.from(0);
    //     const conditions: SExp[] = [];

    //     for(const recipientAndAmount of recipientsAndAmounts) {
    //         const recipient = recipientAndAmount[0];
    //         const amount = BigNumber.from(recipientAndAmount[1]);
    //         totalSpent = totalSpent.add(amount);

    //         const recipientPh = Util.address.validateHashString(recipient);
    //         const targetPuzzleHash = recipientPh === "" ? Util.address.addressToPuzzleHash(recipient) : recipientPh;
    //         if(targetPuzzleHash === "") {
    //             throw new Error(`StandardCoin: Invalid recipient ${recipient}`);
    //         }

    //         conditions.push(
    //             this.createCreateCoinCondition(targetPuzzleHash, amount)
    //         );
    //     }

    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     if(txFee.add(totalSpent).gt(this.amount!)) {
    //         throw new Error("StandardCoin: fee + totalSpent > currentCoinAmount");
    //     }

    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     if(txFee.add(totalSpent).lt(this.amount!)) {
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         const changeAmount = this.amount!.sub(totalSpent).sub(txFee);
    //         let changePuzzleHash: string = changeAddressOrPuzzleHash === undefined ?
    //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //             this.puzzleHash! : Util.address.validateHashString(changeAddressOrPuzzleHash);

    //         if(changePuzzleHash === "") {
    //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //             changePuzzleHash = Util.address.addressToPuzzleHash(changeAddressOrPuzzleHash!)
    //         }
    //         if(changePuzzleHash === "") {
    //             throw new Error("StandardCoin: changeAddressOrPuzzleHash is not a valid puzzle hash or address")
    //         }

    //         conditions.push(
    //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //             this.createCreateCoinCondition(changePuzzleHash, changeAmount)
    //         );
    //     }

    //     if(!txFee.eq(0)) {
    //         conditions.push(
    //             this.createReserveFeeCondition(txFee)
    //         );
    //     }

    //     const solution: SExp = SExp.to([
    //         SExp.to([]),
    //         SExp.to([1, ...conditions]), // 1 = 'q'
    //         SExp.to([])
    //     ]);

    //     return this.withSolution(solution).spend(); //todo
    // }
}