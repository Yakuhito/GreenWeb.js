// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/protocols/wallet_protocol.py

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";
import { SpendBundle } from "./spend_bundle";
import { Coin } from "./coin";
import { HeaderBlock } from "./header_block";

export class RequestPuzzleSolution {
    @fields.Bytes(32) coin_name: bytes;
    @fields.Uint(32) height: uint;
}


export class PuzzleSolutionResponse {
    @fields.Bytes(32) coin_name: bytes;
    @fields.Uint(32) height: uint;
    @fields.VariableSizeBytes() puzzle: bytes;
    @fields.VariableSizeBytes() solution: bytes;
}


export class RespondPuzzleSolution {
    @fields.Object(PuzzleSolutionResponse) response: PuzzleSolutionResponse
}


export class RejectPuzzleSolution {
    @fields.Bytes(32) coin_name: bytes;
    @fields.Uint(32) height: uint;
}


export class SendTransaction {
    @fields.Object(SpendBundle) transaction: SpendBundle;
}


export class TransactionAck {
    @fields.Bytes(32) txid: bytes;
    @fields.Uint(8) status: uint;
    @fields.Optional(fields.String) error: Optional<string>;
}


export class NewPeakWallet {
    @fields.Bytes(32) header_hash: bytes;
    @fields.Uint(32) height: uint;
    @fields.Uint(128) weight: uint;
    @fields.Uint(32) fork_point_with_previous_peak: uint;
}


export class RequestBlockHeader {
    @fields.Uint(32) height: uint;
}


export class RespondBlockHeader {
    @fields.Object(HeaderBlock) header_block: HeaderBlock;
}


export class RejectHeaderRequest {
    @fields.Uint(32) height: uint;
}


export class RequestRemovals {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) header_hash: bytes;
    @fields.Optional(fields.List(fields.Bytes(32))) coin_names: Optional<bytes[]>
}


export class RespondRemovals {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) header_hash: bytes;
    @fields.List(fields.Tuple([fields.Bytes(32), fields.Optional(fields.Object(Coin))])) coins: [bytes, Optional<Coin>][];
    @fields.Optional(fields.List(fields.Tuple([fields.Bytes(32), fields.VariableSizeBytes()]))) proofs: Optional<[bytes, bytes][]>;
}


export class RejectRemovalsRequest {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) header_hash: bytes;
}


export class RequestAdditions {
    @fields.Uint(32) height: uint;
    @fields.Optional(fields.Bytes(32)) header_hash: Optional<bytes>;
    @fields.Optional(fields.List(fields.Bytes(32))) puzzle_hashes: Optional<bytes[]>;
}


export class RespondAdditions {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) header_hash: bytes;
    @fields.List(fields.Tuple([fields.Bytes(32), fields.List(fields.Object(Coin))])) coins: [bytes, Coin[]][];
    @fields.Optional(fields.List(fields.Tuple([fields.Bytes(32), fields.VariableSizeBytes(), fields.Optional(fields.VariableSizeBytes())]))) proofs: Optional<[bytes, bytes, Optional<bytes>][]>;
}


export class RejectAdditionsRequest {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) header_hash: bytes;
}


export class RequestHeaderBlocks {
    @fields.Uint(32) start_height: uint;
    @fields.Uint(32) end_height: uint;
}


export class RejectHeaderBlocks {
    @fields.Uint(32) start_height: uint;
    @fields.Uint(32) end_height: uint;
}


export class RespondHeaderBlocks {
    @fields.Uint(32) start_height: uint;
    @fields.Uint(32) end_height: uint;
    @fields.List(fields.Object(HeaderBlock)) header_blocks: HeaderBlock[];
}


export class CoinState {
    coin: Coin;
    @fields.Optional(fields.Uint(32)) spent_height: Optional<uint>;
    @fields.Optional(fields.Uint(32)) created_height: Optional<uint>;
}


export class RegisterForPhUpdates {
    @fields.List(fields.Bytes(32)) puzzle_hashes: bytes[];
    @fields.Uint(32) min_height: uint;
}


export class RespondToPhUpdates {
    @fields.List(fields.Bytes(32)) puzzle_hashes: bytes[];
    @fields.Uint(32) min_height: uint;
    @fields.List(fields.Object(CoinState)) coin_states: CoinState[];
}


export class RegisterForCoinUpdates {
    @fields.List(fields.Bytes(32)) coin_ids: bytes[];
    @fields.Uint(32) min_height: uint;
}


export class RespondToCoinUpdates {
    @fields.List(fields.Bytes(32)) coin_ids: bytes[];
    @fields.Uint(32) min_height: uint;
    @fields.List(fields.Object(CoinState)) coin_states: CoinState[];
}


export class CoinStateUpdate {
    @fields.Uint(32) height: uint;
    @fields.Uint(32) fork_height: uint;
    @fields.Bytes(32) peak_hash: bytes;
    @fields.List(fields.Object(CoinState)) items: CoinState[];
}


export class RequestChildren {
    @fields.Bytes(32) coin_name: bytes;
}


export class RespondChildren {
    @fields.List(CoinState) coin_states: CoinState[];
}


export class RequestSESInfo {
    @fields.Uint(32) height: uint;
    @fields.Uint(32) end_height: uint;
}


export class RespondSESInfo {
    @fields.List(fields.Bytes(32)) coin_reward_chain_hash: bytes[];
    @fields.List(fields.List(fields.Uint(32))) heights: uint[][];
}