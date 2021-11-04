// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/coin_spend.py#L12

import { fields } from "../serializer";
import { Coin } from "./coin";
import { SExp } from "clvm";

export class CoinSpend {
    @fields.Object(Coin) coin: Coin;
    @fields.SExp() puzzle_reveal: SExp;
    @fields.SExp() solution: SExp;
}