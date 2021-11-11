// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/protocols/wallet_protocol.py

import { fields } from "..";
import { uint, bytes, Optional } from "../basic_types";
import { SpendBundle } from "./spend_bundle";
import { Coin } from "./coin";
import { HeaderBlock } from "./header_block";
import { SExp } from "clvm";

export class RequestPuzzleSolution {
    @fields.Bytes(32) coinName: bytes;
    @fields.Uint(32) height: uint;
}


export class PuzzleSolutionResponse {
    @fields.Bytes(32) coinName: bytes;
    @fields.Uint(32) height: uint;
    @fields.SExp() puzzle: SExp;
    @fields.SExp() solution: SExp;
}


export class RespondPuzzleSolution {
    @fields.Object(PuzzleSolutionResponse) response: PuzzleSolutionResponse
}


export class RejectPuzzleSolution {
    @fields.Bytes(32) coinName: bytes;
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
    @fields.Bytes(32) headerHash: bytes;
    @fields.Uint(32) height: uint;
    @fields.Uint(128) weight: uint;
    @fields.Uint(32) forkPointWithPreviousPeak: uint;
}


export class RequestBlockHeader {
    @fields.Uint(32) height: uint;
}


export class RespondBlockHeader {
    @fields.Object(HeaderBlock) headerBlock: HeaderBlock;
}


export class RejectHeaderRequest {
    @fields.Uint(32) height: uint;
}


export class RequestRemovals {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) headerHash: bytes;
    @fields.Optional(fields.List(fields.Bytes(32))) coinNames: Optional<bytes[]>
}


export class RespondRemovals {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) headerHash: bytes;
    @fields.List(fields.Tuple([fields.Bytes(32), fields.Optional(fields.Object(Coin))])) coins: Array<[bytes, Optional<Coin>]>;
    @fields.Optional(fields.List(fields.Tuple([fields.Bytes(32), fields.Bytes()]))) proofs: Optional<Array<[bytes, bytes]>>;
}


export class RejectRemovalsRequest {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) headerHash: bytes;
}


export class RequestAdditions {
    @fields.Uint(32) height: uint;
    @fields.Optional(fields.Bytes(32)) headerHash: Optional<bytes>;
    @fields.Optional(fields.List(fields.Bytes(32))) puzzleHashes: Optional<bytes[]>;
}


export class RespondAdditions {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) headerHash: bytes;
    @fields.List(fields.Tuple([fields.Bytes(32), fields.List(fields.Object(Coin))])) coins: Array<[bytes, Coin[]]>;
    @fields.Optional(fields.List(fields.Tuple([
        fields.Bytes(32),
        fields.Bytes(),
        fields.Optional(fields.Bytes())
    ]))) proofs: Optional<Array<[bytes, bytes, Optional<bytes>]>>;
}


export class RejectAdditionsRequest {
    @fields.Uint(32) height: uint;
    @fields.Bytes(32) headerHash: bytes;
}


export class RequestHeaderBlocks {
    @fields.Uint(32) startHeight: uint;
    @fields.Uint(32) endHeight: uint;
}


export class RejectHeaderBlocks {
    @fields.Uint(32) startHeight: uint;
    @fields.Uint(32) endHeight: uint;
}


export class RespondHeaderBlocks {
    @fields.Uint(32) startHeight: uint;
    @fields.Uint(32) endHeight: uint;
    @fields.List(fields.Object(HeaderBlock)) headerBlocks: HeaderBlock[];
}


export class CoinState {
    @fields.Object(Coin) coin: Coin;
    @fields.Optional(fields.Uint(32)) spentHeight: Optional<uint>;
    @fields.Optional(fields.Uint(32)) createdHeight: Optional<uint>;
}


export class RegisterForPhUpdates {
    @fields.List(fields.Bytes(32)) puzzleHashes: bytes[];
    @fields.Uint(32) minHeight: uint;
}


export class RespondToPhUpdates {
    @fields.List(fields.Bytes(32)) puzzleHashes: bytes[];
    @fields.Uint(32) minHeight: uint;
    @fields.List(fields.Object(CoinState)) coinStates: CoinState[];
}


export class RegisterForCoinUpdates {
    @fields.List(fields.Bytes(32)) coinIds: bytes[];
    @fields.Uint(32) minHeight: uint;
}


export class RespondToCoinUpdates {
    @fields.List(fields.Bytes(32)) coinIds: bytes[];
    @fields.Uint(32) minHeight: uint;
    @fields.List(fields.Object(CoinState)) coinStates: CoinState[];
}


export class CoinStateUpdate {
    @fields.Uint(32) height: uint;
    @fields.Uint(32) forkHeight: uint;
    @fields.Bytes(32) peakHash: bytes;
    @fields.List(fields.Object(CoinState)) items: CoinState[];
}


export class RequestChildren {
    @fields.Bytes(32) coinName: bytes;
}


export class RespondChildren {
    @fields.List(fields.Object(CoinState)) coinStates: CoinState[];
}


export class RequestSESInfo {
    @fields.Uint(32) height: uint;
    @fields.Uint(32) endHeight: uint;
}


export class RespondSESInfo {
    @fields.List(fields.Bytes(32)) coinRewardChainHash: bytes[];
    @fields.List(fields.List(fields.Uint(32))) heights: uint[][];
}