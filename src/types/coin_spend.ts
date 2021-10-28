// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/coin_spend.py#L12

import { fields } from "../serializer";
import { bytes } from "../serializer/basic_types";
import { Coin } from "./coin";

export class CoinSpend {
    coin: Coin;
    @fields.Bytes() puzzle_reveal: bytes;;
    @fields.Bytes() solution: bytes;
}