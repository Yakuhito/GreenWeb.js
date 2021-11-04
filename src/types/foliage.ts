// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/foliage.py#L50

import { fields } from "../serializer";
import { bytes, Optional, uint } from "../serializer/basic_types";
import { Coin } from "./coin";
import { PoolTarget } from "./pool_target";

export class TransactionsInfo {
    @fields.Bytes(32) generatorRoot: bytes;
    @fields.Bytes(32) generatorRefsRoot: bytes;
    @fields.Bytes(96) aggregatedSignature: bytes; // G2Element
    @fields.Uint(64) fees: uint;
    @fields.Uint(64) cost: uint;
    @fields.List(fields.Object(Coin)) rewardClaimsIncorporated: Coin[];
}


export class FoliageTransactionBlock {
    @fields.Bytes(32) prevTransactionBlockHash: bytes;
    @fields.Uint(64) timestamp: uint;
    @fields.Bytes(32) filterHash: bytes;
    @fields.Bytes(32) additionsRoot: bytes;
    @fields.Bytes(32) removalsroot: bytes;
    @fields.Bytes(32) transactionsInfoHash: bytes;
}


export class FoliageBlockData {
    @fields.Bytes(32) unfinishedRewardBlockHash: bytes;
    @fields.Object(PoolTarget) poolTarget: PoolTarget;
    @fields.Optional(fields.Bytes(96)) poolSignature: Optional<bytes>; // Optional<G2Element>
    @fields.Bytes(32) farmerRewardPuzzleHash: bytes;
    @fields.Bytes(32) extensionData: bytes;
}


export class Foliage {
    @fields.Bytes(32) prevBlockHash: bytes;
    @fields.Bytes(32) rewardBlockHash: bytes;
    @fields.Object(FoliageBlockData) foliageBlockData: FoliageBlockData;
    @fields.Bytes(96) foliageBlockDataSignature: bytes; // G2Element
    @fields.Optional(fields.Bytes(32)) foliageTransactionBlockHash: Optional<bytes>;
    @fields.Optional(fields.Bytes(96)) foliageTransactionBlockSignature: Optional<bytes>; // Optional<G2Element>
}