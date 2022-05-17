import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { SmartCoin } from "./smart_coin"
import { Util } from "./util";
import { uint } from "./util/serializer/basic_types";
import { CoinSpend } from "./util/serializer/types/coin_spend";
import { ConditionOpcode } from "./util/sexp/condition_opcodes";
import { bytes, Coin } from "./xch/providers/provider_types";

export type StandardCoinConstructorArgs = {
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    puzzle?: SExp | null,
    coin?: Coin | null,
    publicKey?: bytes | null,
    isSyntheticKey?: boolean,
    forceUsePuzzle?: boolean,
};

export class StandardCoin extends SmartCoin {
    public publicKey: bytes | null = null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        coin = null,
        puzzle = null,
        publicKey = null,
        isSyntheticKey = false,
        forceUsePuzzle = false,
    }: StandardCoinConstructorArgs = {}) {
        super({
            parentCoinInfo, puzzleHash, amount, coin
        });

        if(forceUsePuzzle) {
            if(puzzle === null || puzzle === undefined) {
                throw new Error("Please set 'forceUsePuzzle' to true to use a custom puzzle");
            } else {
                this.puzzle = puzzle;
            }
        }

        if(!forceUsePuzzle && publicKey !== null) {
            this.puzzle = this.getPuzzleForPublicKey(publicKey, forceUsePuzzle);
        }
    }

    public copyWith({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        puzzle = null,
        publicKey = null,
        isSyntheticKey = false,
        forceUsePuzzle = false,
    }: StandardCoinConstructorArgs = {}): StandardCoin {
        return new StandardCoin({
            parentCoinInfo: parentCoinInfo !== undefined && parentCoinInfo !== null ? parentCoinInfo : this.parentCoinInfo,
            puzzleHash: puzzleHash !== undefined && puzzleHash !== null ? puzzleHash : this.puzzleHash,
            amount: amount !== undefined && amount !== null ? amount : this.amount,
            puzzle: forceUsePuzzle && puzzle !== undefined && puzzle !== null ? puzzle : null,
            publicKey: publicKey !== undefined && publicKey !== null ? publicKey : this.publicKey,
            isSyntheticKey: isSyntheticKey !== undefined && isSyntheticKey !== null ? isSyntheticKey : false,
            forceUsePuzzle: forceUsePuzzle
        });
    }

    private getPuzzleForPublicKey(publicKey: string, isSyntheticKey: boolean): SExp {
        return Util.sexp.standardCoinPuzzle(
            Util.key.hexToPublicKey(publicKey),
            isSyntheticKey
        );
    }

    public withPublicKey(publicKey: bytes, isSyntheticKey: boolean = false) : StandardCoin {
        return this.copyWith({
            publicKey: publicKey,
            puzzle: this.getPuzzleForPublicKey(publicKey, isSyntheticKey),
            forceUsePuzzle: true,
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
            Bytes.from(
                Buffer.from(amount.toHexString().slice(2), "hex")
            ),
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

    public send(address: string, fee?: BigNumberish, amount?: BigNumberish): CoinSpend | null {
        if(!this.hasCoinInfo()) {
            return null;
        }

        const txFee: BigNumber = fee === undefined ? BigNumber.from(0) : BigNumber.from(fee);
        const newCoinAmount: BigNumber = amount === undefined ? BigNumber.from(this.amount).sub(txFee) : BigNumber.from(amount);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if(txFee.add(newCoinAmount).gt(this.amount!)) {
            throw new Error("fee + newCoinAmount > currentCoinAmount");
        }

        const newCoinPuzzleHash: bytes = Util.address.addressToPuzzleHash(address);
        const conditions: SExp[] = [
            this.createCreateCoinCondition(newCoinPuzzleHash, newCoinAmount),
        ];

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if(txFee.add(newCoinAmount).lt(this.amount!)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const changeAmount = this.amount!.sub(newCoinAmount).sub(txFee);
            conditions.push(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.createCreateCoinCondition(this.puzzleHash!, changeAmount)
            );
        }

        if(!txFee.eq(0)) {
            conditions.push(
                this.createReserveFeeCondition(txFee)
            );
        }

        const solution: SExp = SExp.to([
            SExp.to([]),
            SExp.to(conditions),
            SExp.to([])
        ]);

        return this.spend(solution);
    }
}