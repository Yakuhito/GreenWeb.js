// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/spend_bundle.py#L20
import { fields } from "..";
import { bytes } from "../basic_types";
import { CoinSpend } from "./coin_spend";

export class SpendBundle {
    @fields.List(fields.Object(CoinSpend)) coinSpends: CoinSpend[];
    @fields.Bytes(96) aggregatedSignature: bytes;
}