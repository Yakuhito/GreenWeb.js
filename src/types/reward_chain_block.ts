// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/reward_chain_block.py#L28

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";
import { ProofOfSpace } from "./proof_of_space";
import { VDFInfo } from "./vdf";

export class RewardChainBlock {
    @fields.Uint(128) weight: uint;
    @fields.Uint(32) height: uint;
    @fields.Uint(128) totalIters: uint;
    @fields.Uint(8) signagePointIndex: uint;
    @fields.Bytes(32) posSsCcChallengeHash: bytes;
    @fields.Object(ProofOfSpace) proofOfSpace: ProofOfSpace;
    @fields.Optional(fields.Object(VDFInfo)) challengeChainSpVdf: Optional<VDFInfo>;
    @fields.Bytes(96) challengeChainSpSignature: bytes; // G2Element
    @fields.Object(VDFInfo) challengeChainIpVdf: VDFInfo;
    @fields.Optional(fields.Object(VDFInfo)) rewardChainSpVdf: Optional<VDFInfo>;
    @fields.Bytes(96) rewardChainSpSignature: bytes; // G2Element
    @fields.Object(VDFInfo) rewardChainIpVdf: VDFInfo;
    @fields.Optional(fields.Object(VDFInfo)) infusedChallengeChainIpVdf: Optional<VDFInfo>;
    @fields.Boolean() isTransactionBlock: boolean;
}