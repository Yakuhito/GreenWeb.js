// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/coin.py#L13

import { fields } from "../serializer";
import { uint, bytes } from "../serializer/basic_types";
import { int_to_bytes } from "clvm";
import CryptoJS from 'crypto-js';
import { bech32m } from 'bech32';

export class Coin {
    @fields.Bytes(32) parent_coin_info: bytes;
    @fields.Bytes(32) puzzle_hash: bytes;
    @fields.Uint(64) amount: uint;

    public getId(): bytes {
        const toHash: Buffer = Buffer.concat([
            this.parent_coin_info,
            this.puzzle_hash,
            int_to_bytes(this.amount).data(),
        ]);
        
        return Buffer.from(
            CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(toHash.toString("hex")))),
            "hex"
        );
    }
}