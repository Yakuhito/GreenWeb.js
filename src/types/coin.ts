// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/coin.py#L13

import { fields } from "../serializer";
import { uint, bytes } from "../serializer/basic_types";
// eslint-disable-next-line camelcase
import { int_to_bytes } from "clvm";
import CryptoJS from "crypto-js";

export class Coin {
    @fields.Bytes(32) parentCoinInfo: bytes;
    @fields.Bytes(32) puzzleHash: bytes;
    @fields.Uint(64) amount: uint;

    public getId(): bytes {
        const toHash: Buffer = Buffer.concat([
            Buffer.from(this.parentCoinInfo + this.puzzleHash, "hex"),
            int_to_bytes(this.amount).data(),
        ]);
        
        return CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(toHash.toString("hex"))));
    }
}