import { Coin } from "./coin";
import { CoinSpend } from "./coin_spend";
import { EndOfSubSlotBundle } from "./end_of_sub_slot_bundle";
import fields from "./fields";
import { Foliage, FoliageBlockData, FoliageTransactionBlock, TransactionsInfo } from "./foliage";
import { HeaderBlock } from "./header_block";
import { Message } from "./outbound_message";
import { PoolTarget } from "./pool_target";
import { ProofOfSpace } from "./proof_of_space";
import { RewardChainBlock } from "./reward_chain_block";
import { Handshake } from "./shared_protocol";
import { ChallengeBlockInfo, ChallengeChainSubSlot, InfusedChallengeChainSubSlot, RewardChainSubSlot, SubSlotProofs } from "./slots";
import { SpendBundle } from "./spend_bundle";
import { VDFInfo, VDFProof } from "./vdf";
import { CoinState, CoinStateUpdate, NewPeakWallet, PuzzleSolutionResponse, RegisterForCoinUpdates, RegisterForPhUpdates, RejectAdditionsRequest, RejectHeaderBlocks, RejectHeaderRequest, RejectPuzzleSolution, RejectRemovalsRequest, RequestAdditions, RequestBlockHeader, RequestChildren, RequestHeaderBlocks, RequestPuzzleSolution, RequestRemovals, RequestSESInfo, RespondAdditions, RespondBlockHeader, RespondChildren, RespondHeaderBlocks, RespondPuzzleSolution, RespondRemovals, RespondSESInfo, RespondToCoinUpdates, RespondToPhUpdates, SendTransaction, TransactionAck } from "./wallet_protocol";

export default {
  fields,
  CoinSpend,
  Coin,
  EndOfSubSlotBundle,
  TransactionsInfo,
  FoliageTransactionBlock,
  FoliageBlockData,
  Foliage,
  HeaderBlock,
  Message,
  PoolTarget,
  ProofOfSpace,
  RewardChainBlock,
  Handshake,
  ChallengeBlockInfo,
  ChallengeChainSubSlot,
  InfusedChallengeChainSubSlot,
  RewardChainSubSlot,
  SubSlotProofs,
  SpendBundle,
  VDFInfo,
  VDFProof,
  RequestPuzzleSolution,
  PuzzleSolutionResponse,
  RespondPuzzleSolution,
  RejectPuzzleSolution,
  SendTransaction,
  TransactionAck,
  NewPeakWallet,
  RequestBlockHeader,
  RespondBlockHeader,
  RejectHeaderRequest,
  RequestRemovals,
  RespondRemovals,
  RejectRemovalsRequest,
  RequestAdditions,
  RespondAdditions,
  RejectAdditionsRequest,
  RequestHeaderBlocks,
  RejectHeaderBlocks,
  RespondHeaderBlocks,
  CoinState,
  RegisterForPhUpdates,
  RespondToPhUpdates,
  RegisterForCoinUpdates,
  RespondToCoinUpdates,
  CoinStateUpdate,
  RequestChildren,
  RespondChildren,
  RequestSESInfo,
  RespondSESInfo
};