// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/protocols/wallet_protocol.py

import { uint8, uint32, uint128 } from "./uints";
import { bytes32 } from "./bytes";
import { Program } from "./program";
import { SpendBundle } from "./spend_bundle";
import { Optional } from "./optional";
import { Coin } from "./coin";

export type RequestPuzzleSolution = {
    coin_name: bytes32,
    height: uint32
}


export type PuzzleSolutionResponse = {
    coin_name: bytes32
    height: uint32
    puzzle: Program
    solution: Program
}


export type RespondPuzzleSolution = {
    response: PuzzleSolutionResponse
}


export type RejectPuzzleSolution = {
    coin_name: bytes32,
    height: uint32
}

export type SendTransaction = {
    transaction: SpendBundle
}


export type TransactionAck = {
    txid: bytes32,
    status: uint8,
    error: Optional<string>
}


export type NewPeakWallet = {
    header_hash: bytes32,
    height: uint32,
    weight: uint128,
    fork_point_with_previous_peak: uint32
}


export type RequestBlockHeader = {
    height: uint32
}


/*export type RespondBlockHeader = {
    header_block: HeaderBlock
}*/


export type RejectHeaderRequest = {
    height: uint32
}


export type RequestRemovals = {
    height: uint32,
    header_hash: bytes32,
    coin_names: Optional<Array<bytes32>>
}


/*export type RespondRemovals = {
    height: uint32,
    header_hash: bytes32,
    coins: List[Tuple[bytes32, Optional[Coin]]]
    proofs: Optional[List[Tuple[bytes32, bytes]]]
}


@dataclass(frozen=True)
@streamable
class RejectRemovalsRequest(Streamable):
    height: uint32
    header_hash: bytes32


@dataclass(frozen=True)
@streamable
class RequestAdditions(Streamable):
    height: uint32
    header_hash: Optional[bytes32]
    puzzle_hashes: Optional[List[bytes32]]


@dataclass(frozen=True)
@streamable
class RespondAdditions(Streamable):
    height: uint32
    header_hash: bytes32
    coins: List[Tuple[bytes32, List[Coin]]]
    proofs: Optional[List[Tuple[bytes32, bytes, Optional[bytes]]]]


@dataclass(frozen=True)
@streamable
class RejectAdditionsRequest(Streamable):
    height: uint32
    header_hash: bytes32


@dataclass(frozen=True)
@streamable
class RequestHeaderBlocks(Streamable):
    start_height: uint32
    end_height: uint32


@dataclass(frozen=True)
@streamable
class RejectHeaderBlocks(Streamable):
    start_height: uint32
    end_height: uint32


@dataclass(frozen=True)
@streamable
class RespondHeaderBlocks(Streamable):
    start_height: uint32
    end_height: uint32
    header_blocks: List[HeaderBlock]
*/

export type CoinState = {
    coin: Coin,
    spent_height: Optional<uint32>,
    created_height: Optional<uint32>
}


export type RegisterForPhUpdates = {
    puzzle_hashes: Array<bytes32>,
    min_height: uint32
}


export type RespondToPhUpdates = {
    puzzle_hashes: Array<bytes32>,
    min_height: uint32,
    coin_states: Array<CoinState>
}


export type RegisterForCoinUpdates = {
    coin_ids: Array<bytes32>,
    min_height: uint32
}


export type RespondToCoinUpdates = {
    coin_ids: Array<bytes32>,
    min_height: uint32,
    coin_states: Array<CoinState> 
}


export type CoinStateUpdate = {
    height: uint32,
    fork_height: uint32,
    peak_hash: bytes32,
    items: Array<CoinState>
}


export type RequestChildren = {
    coin_name: bytes32
}


export type RespondChildren = {
    coin_states: Array<CoinState>
}


export type RequestSESInfo = {
    start_height: uint32,
    end_height: uint32
}


export type RespondSESInfo = {
    reward_chain_hash: Array<bytes32>
    heights: Array<Array<uint32>>
}