// https://github.com/Chia-Network/chia-blockchain/blob/ec8d3ae2f9c96c880b0ab32d912aa30c67b4121c/chia/types/blockchain_format/coin.py#L13

import { bytes32 } from './bytes';
import { uint64 } from "./uints";

export type Coin = {
    parent_coin_info: bytes32,
    puzzle_hash: bytes32,
    amount: uint64
}