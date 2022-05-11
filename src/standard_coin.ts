import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { SmartCoin } from "./smart_coin"
import { Util } from "./util";
import { uint } from "./util/serializer/basic_types";
import { CoinSpend } from "./util/serializer/types/coin_spend";
import { bytes } from "./xch/providers/provider_types";

export type StandardCoinConstructorArgs = {
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    publicKey?: bytes | null,
};

export class StandardCoin extends SmartCoin {
    public publicKey: bytes | null = null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        publicKey = null,
    }: StandardCoinConstructorArgs) {
        const puzzle = publicKey === null ? null :
            Util.sexp.standardCoinPuzzleForPublicKey(
                Util.key.hexToPublicKey(publicKey)
            );

        super({
            parentCoinInfo, puzzleHash, amount, puzzle
        });
        if(publicKey !== null) {
            this.setPublicKey(publicKey);
        }
    }

    public setPublicKey(publicKey: bytes) : void {
        this.publicKey = publicKey;
        const puzzle = publicKey === null ? null : Util.sexp.standardCoinPuzzleForPublicKey(
            Util.key.hexToPublicKey(publicKey)
        );

        if(puzzle !== null) {
            this.setPuzzle(puzzle);
        }
    }

    public send(address: string, fee?: BigNumberish): CoinSpend | null {
        if(!this.hasCoinInfo()) {
            return null;
        }

        const txFee: BigNumber = fee === undefined ?
            BigNumber.from(0) : BigNumber.from(fee);
        const newCoinAmount: BigNumber = BigNumber.from(this.amount).sub(txFee);
        const newCoinPuzzleHash: Bytes = Bytes.from(Buffer.from(
            Util.address.addressToPuzzleHash(address),
            "hex"
        ));

        const solution: SExp = SExp.to([
            SExp.null(),
            SExp.to([
                SExp.to([
                    Bytes.from([51]),
                    newCoinPuzzleHash,
                    Bytes.from(
                        Buffer.from(newCoinAmount.toHexString().slice(2), "hex")
                    ),
                ])
            ]),
            SExp.null()
        ]);

        return this.spend(solution);
    }
}