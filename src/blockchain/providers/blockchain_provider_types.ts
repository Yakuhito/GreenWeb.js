import { SExp } from "clvm";

export type Optional<T> = T | null;
export type bytes = string;
export type uint = number;

export class Coin {
    id: bytes;
    parentCoinInfo: bytes;
    puzzleHash: bytes;
    amount: uint;
}

export class CoinState {
    coin: Coin;
    spentHeight: Optional<uint>;
    createdHeight: Optional<uint>;
}

export class BlockHeader {
    height: uint;
    headerHash: bytes;
    prevBlockHash: Optional<bytes>;
    isTransactionBlock: Optional<boolean>;
    fees: Optional<uint>;
    farmerPuzzleHash: Optional<bytes>;
    poolPuzzleHash: Optional<bytes>;
}

export class PuzzleSolution {
    coinName: bytes;
    height: uint;
    puzzle: SExp;
    solution: SExp;
}