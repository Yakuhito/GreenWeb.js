// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/pool_target.py#L10

import fields from "./fields";
import { bytes, uint } from "../basic_types";

export class PoolTarget {
    @fields.Bytes(32) puzzleHash: bytes;
    @fields.Uint(32) maxHeight: uint;
}