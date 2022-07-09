import { bytes, Coin } from "../xch/providers/provider_types";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { Util } from ".";

export class CoinUtil {
    public amountToBytes(amount: BigNumberish): bytes {
        amount = BigNumber.from(amount);
        const initialHexLength = amount.toHexString().length;

        if(amount.eq(0)) {
            return "00";
        }

        const isNegative: boolean = amount.lt(0);
        if(isNegative) {
            amount = BigNumber.from(
                "0x" + "f".repeat(amount.toHexString().length - 3) // prefix is -0x
            ).add(1).add(amount);
        }
        let hexStr = amount.toHexString().slice(2);

        while(isNegative && initialHexLength - 3 > hexStr.length) {
            hexStr = "00" + hexStr;
        }
        
        const firstByte: number = BigNumber.from("0x" + hexStr.slice(0, 2)).toNumber();
        if(isNegative && (firstByte & 0x80) === 0) {
            hexStr = "ff" + hexStr;
        }
        if(!isNegative && (firstByte & 0x80) !== 0) {
            hexStr = "00" + hexStr;
        }

        return hexStr;
    }

    public getId(coin: Coin): bytes {
        const toHash = coin.parentCoinInfo + coin.puzzleHash + this.amountToBytes(coin.amount);

        return Util.stdHash(toHash);
    }

    public getName(coin: Coin): bytes {
        return this.getId(coin);
    }

    public toProgram(coin: Coin): SExp {
        return SExp.to([
            Bytes.from(coin.parentCoinInfo, "hex"),
            Bytes.from(coin.puzzleHash, "hex"),
            Bytes.from(this.amountToBytes(coin.amount), "hex"),
        ]);
    }
}