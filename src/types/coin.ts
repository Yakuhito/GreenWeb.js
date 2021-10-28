// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/coin.py#L13

import { fields } from "../serializer";
import { uint, bytes } from "../serializer/basic_types";

export class Coin {
    @fields.FixedSizeBytes(32) parent_coin_info: bytes;
    @fields.FixedSizeBytes(32) puzzle_hash: bytes;
    @fields.Uint(64) amount: uint;
}