// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/slots.py#L24

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";
import { ProofOfSpace } from "./proof_of_space";
import { VDFInfo, VDFProof } from "./vdf";

export class ChallengeBlockInfo {
    proof_of_space: ProofOfSpace;
    @fields.Optional(VDFInfo) challenge_chain_sp_vdf: Optional<VDFInfo>;
    @fields.Bytes(96) challenge_chain_sp_signature: bytes;
    challenge_chain_ip_vdf: VDFInfo;
}


export class ChallengeChainSubSlot {
    challenge_chain_end_of_slot_vdf: VDFInfo;
    @fields.Optional(fields.Bytes(32)) infused_challenge_chain_sub_slot_hash: Optional<bytes>;
    @fields.Optional(fields.Bytes(32)) subepoch_summary_hash: Optional<bytes>;
    @fields.Optional(fields.Uint(64)) new_sub_slot_iters: Optional<uint>;
    @fields.Optional(fields.Uint(64)) new_difficulty: Optional<uint>;
}


export class InfusedChallengeChainSubSlot {
    infused_challenge_chain_end_of_slot_vdf: VDFInfo;
}


export class RewardChainSubSlot {
    end_of_slot_vdf: VDFInfo;
    @fields.Bytes(32) challenge_chain_sub_slot_hash: bytes;
    @fields.Optional(fields.Bytes(32)) infused_challenge_chain_sub_slot_hash: Optional<bytes>;
    @fields.Uint(8) deficit: uint;
}


export class SubSlotProofs {
    challenge_chain_slot_proof: VDFProof;
    @fields.Optional(VDFProof) infused_challenge_chain_slot_proof: Optional<VDFProof>;
    reward_chain_slot_proof: VDFProof;
}