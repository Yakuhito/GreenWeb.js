// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/header_block.py#L13

import { fields, Serializer } from "../serializer";
import { bytes, Optional } from "../serializer/basic_types";
import { EndOfSubSlotBundle } from "./end_of_sub_slot_bundle";
import { RewardChainBlock } from "./reward_chain_block";
import { VDFProof } from "./vdf";
import { Foliage, FoliageTransactionBlock, TransactionsInfo } from "./foliage";
import CryptoJS from 'crypto-js';

export class HeaderBlock {
    @fields.List(fields.Object(EndOfSubSlotBundle)) finishedSubSlots: EndOfSubSlotBundle[];
    @fields.Object(RewardChainBlock) rewardChainBlock: RewardChainBlock;
    @fields.Optional(fields.Object(VDFProof)) challengeChainSpProof: Optional<VDFProof>;
    @fields.Object(VDFProof) challengeChainIpProof: VDFProof;
    @fields.Optional(fields.Object(VDFProof)) rewardChainSpProof: Optional<VDFProof>;
    @fields.Object(VDFProof) rewardChainIpProof: VDFProof
    @fields.Optional(fields.Object(VDFProof)) infusedChallengeChainIpProof: Optional<VDFProof>;
    @fields.Object(Foliage) foliage: Foliage;
    @fields.Optional(fields.Object(FoliageTransactionBlock)) foliageTransactionBlock: Optional<FoliageTransactionBlock>;
    @fields.Bytes() transactionsFilter: bytes;
    @fields.Optional(fields.Object(TransactionsInfo)) transactionsInfo: Optional<TransactionsInfo>;

    headerHash(): string {
        const toHash: Buffer = Serializer.serialize(this.foliage);

        return CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(
            toHash.toString("hex")
        )));
    }
}