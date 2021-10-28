// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/foliage.py#L50

import { fields } from "../serializer";
import { bytes, Optional, uint } from "../serializer/basic_types";
import { Coin } from "./coin";
import { PoolTarget } from "./pool_target";

export class TransactionsInfo {
    @fields.Bytes(32) generator_root: bytes;
    @fields.Bytes(32) generator_refs_root: bytes;
    @fields.Bytes(96) aggregated_signature: bytes; // G2Element
    @fields.Uint(64) fees: uint;
    @fields.Uint(64) cost: uint;
    @fields.List(Coin) reward_claims_incorporated: Coin[];
}


export class FoliageTransactionBlock {
    @fields.Bytes(32) prev_transaction_block_hash: bytes;
    @fields.Uint(64) timestamp: uint;
    @fields.Bytes(32) filter_hash: bytes;
    @fields.Bytes(32) additions_root: bytes;
    @fields.Bytes(32) removals_root: bytes;
    @fields.Bytes(32) transactions_info_hash: bytes;
}


export class FoliageBlockData {
    @fields.Bytes(32) unfinished_reward_block_hash: bytes;
    pool_target: PoolTarget;
    @fields.Optional(fields.Bytes(96)) pool_signature: Optional<bytes>; // Optional<G2Element>
    @fields.Bytes(32) farmer_reward_puzzle_hash: bytes;
    @fields.Bytes(32) extension_data: bytes;
}


export class Foliage {
    @fields.Bytes(32) prev_block_hash: bytes;
    @fields.Bytes(32) reward_block_hash: bytes;
    foliage_block_data: FoliageBlockData;
    @fields.Bytes(96) foliage_block_data_signature: bytes; // G2Element
    @fields.Optional(fields.Bytes(32)) foliage_transaction_block_hash: Optional<bytes>;
    @fields.Optional(fields.Bytes(96)) foliage_transaction_block_signature: Optional<bytes>; // Optional<G2Element>
}