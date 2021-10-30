// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/spend_bundle.py#L20
import { fields } from "../serializer";
import { bytes } from "../serializer/basic_types";
import { CoinSpend } from "./coin_spend";

export class SpendBundle {
    @fields.List(fields.Object(CoinSpend)) coin_spends: CoinSpend[];
    @fields.Bytes(96) aggregated_signature: bytes;
}