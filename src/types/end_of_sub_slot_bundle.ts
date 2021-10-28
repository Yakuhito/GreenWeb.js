// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/end_of_slot_bundle.py#L15

import { fields } from "../serializer";
import { Optional } from "../serializer/basic_types";
import { ChallengeChainSubSlot, InfusedChallengeChainSubSlot, RewardChainSubSlot, SubSlotProofs } from "./slots";

export class EndOfSubSlotBundle {
    challenge_chain: ChallengeChainSubSlot;
    @fields.Optional(InfusedChallengeChainSubSlot) infused_challenge_chain: Optional<InfusedChallengeChainSubSlot>;
    reward_chain: RewardChainSubSlot;
    proofs: SubSlotProofs;
}