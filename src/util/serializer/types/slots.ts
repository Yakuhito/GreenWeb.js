// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/slots.py#L24

import fields from "./fields";
import { uint, bytes, Optional } from "../basic_types";
import { ProofOfSpace } from "./proof_of_space";
import { VDFInfo, VDFProof } from "./vdf";

export class ChallengeBlockInfo {
    @fields.Object(ProofOfSpace) proofOfSpace: ProofOfSpace;
    @fields.Optional(fields.Object(VDFInfo)) challengeChainSpVdf: Optional<VDFInfo>;
    @fields.Bytes(96) challengeChainSpSignature: bytes;
    @fields.Object(VDFInfo) challengeChainIpVdf: VDFInfo;
}


export class ChallengeChainSubSlot {
    @fields.Object(VDFInfo) challengeChainEndOfSlotVdf: VDFInfo;
    @fields.Optional(fields.Bytes(32)) infusedChallengeChainSubSlotHash: Optional<bytes>;
    @fields.Optional(fields.Bytes(32)) subepochSummaryHash: Optional<bytes>;
    @fields.Optional(fields.Uint(64)) newSubSlotIters: Optional<uint>;
    @fields.Optional(fields.Uint(64)) newDifficulty: Optional<uint>;
}


export class InfusedChallengeChainSubSlot {
    @fields.Object(VDFInfo) infusedChallengeChainEndOfSlotVdf: VDFInfo;
}


export class RewardChainSubSlot {
    @fields.Object(VDFInfo) endOfSlotVdf: VDFInfo;
    @fields.Bytes(32) challengeChainSubSlotHash: bytes;
    @fields.Optional(fields.Bytes(32)) infusedChallengeChainSubSlotHash: Optional<bytes>;
    @fields.Uint(8) deficit: uint;
}


export class SubSlotProofs {
    @fields.Object(VDFProof) challengeChainSlotProof: VDFProof;
    @fields.Optional(fields.Object(VDFProof)) infusedChallengeChainSlotProof: Optional<VDFProof>;
    @fields.Object(VDFProof) rewardChainSlotProof: VDFProof;
}