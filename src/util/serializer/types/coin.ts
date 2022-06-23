// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/coin.py#L13

import fields from "./fields";
import { uint, bytes } from "../basic_types";


export class Coin {
    @fields.Bytes(32) parentCoinInfo: bytes;
    @fields.Bytes(32) puzzleHash: bytes;
    @fields.Uint(64) amount: uint;
}