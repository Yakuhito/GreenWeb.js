// https://github.com/Chia-Network/chia-blockchain/blob/ec8d3ae2f9c96c880b0ab32d912aa30c67b4121c/chia/types/coin_spend.py#L12

import { Coin } from "./coin";

export type CoinSpend = {
    coin: Coin,
    puzzle_reveal: Buffer,
    solution: Buffer
}