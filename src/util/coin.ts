import { bytes, Coin } from "../xch/providers/provider_types";
// eslint-disable-next-line camelcase
import { int_to_bytes } from "clvm";
import CryptoJS from "crypto-js";
import { BigNumber } from "@ethersproject/bignumber";

export class CoinUtil {
    public getId(coin: Coin): bytes {
        const toHash: Buffer = Buffer.concat([
            Buffer.from(coin.parentCoinInfo + coin.puzzleHash, "hex"),
            // todo
            int_to_bytes(BigNumber.from(coin.amount).toNumber()).data(),
        ]);

        return CryptoJS.enc.Hex.stringify(
            CryptoJS.SHA256(
                CryptoJS.enc.Hex.parse(
                    toHash.toString("hex")
                )
            )
        );
    }

    public getName(coin: Coin): bytes {
        return this.getId(coin);
    }
}