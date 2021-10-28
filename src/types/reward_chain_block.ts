// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/reward_chain_block.py#L28

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";
import { ProofOfSpace } from "./proof_of_space";
import { VDFInfo } from "./vdf";

export class RewardChainBlock {
    @fields.Uint(128) weight: uint;
    @fields.Uint(32) height: uint;
    @fields.Uint(128) total_iters: uint;
    @fields.Uint(8) signage_point_index: uint;
    @fields.Bytes(32) pos_ss_cc_challenge_hash: bytes;
    proof_of_space: ProofOfSpace;
    @fields.Optional(VDFInfo) challenge_chain_sp_vdf: Optional<VDFInfo>;
    @fields.Bytes(96) challenge_chain_sp_signature: bytes; // G2Element
    challenge_chain_ip_vdf: VDFInfo;
    @fields.Optional(VDFInfo) reward_chain_sp_vdf: Optional<VDFInfo>;
    @fields.Bytes(96) reward_chain_sp_signature: bytes; // G2Element
    reward_chain_ip_vdf: VDFInfo;
    @fields.Optional(VDFInfo) infused_challenge_chain_ip_vdf: Optional<VDFInfo>;
    @fields.Boolean() is_transaction_block: boolean;
}