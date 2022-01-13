import { bytes, Coin } from "../blockchain/providers/blockchain_provider_types";
// eslint-disable-next-line camelcase
import { int_to_bytes } from "clvm";
import CryptoJS from "crypto-js";

export class CoinUtil {
  static getId(coin: Coin): bytes {
    const toHash: Buffer = Buffer.concat([
      Buffer.from(coin.parentCoinInfo + coin.puzzleHash, "hex"),
      int_to_bytes(coin.amount).data(),
    ]);

    return CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(toHash.toString("hex"))));
  }

  static getName(coin: Coin): bytes {
    return CoinUtil.getId(coin);
  }
}