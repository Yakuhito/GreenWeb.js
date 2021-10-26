// https://github.com/Chia-Network/chia-blockchain/blob/ec8d3ae2f9c96c880b0ab32d912aa30c67b4121c/chia/types/spend_bundle.py#L20

import { bytes32 } from "./bytes"
import { CoinSpend } from "./coin_spend"

export type SpendBundle = {
    coin_spends: Array<CoinSpend>,
    aggregated_signature: bytes32
}