import { bytes, Coin } from "../xch/providers/provider_types";
// eslint-disable-next-line camelcase
import { int_to_bytes } from "clvm";
import CryptoJS from "crypto-js";

export class CoinUtil {
    public getId(coin: Coin): bytes {
        const toHash: Buffer = Buffer.concat([
            Buffer.from(coin.parentCoinInfo + coin.puzzleHash, "hex"),
            int_to_bytes(coin.amount).data(),
        ]);

        return CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(toHash.toString("hex"))));
    }

    public getName(coin: Coin): bytes {
        return this.getId(coin);
    }
}