import { BigNumberish } from "@ethersproject/bignumber";
import { SExp } from "clvm";
import { Coin } from "../../util/serializer/types/coin";

export { Coin } from "../../util/serializer/types/coin";

export type Optional<T> = T | null;
export type bytes = string;
export type uint = BigNumberish;

export class CoinState {
    coin: Coin;
    spentHeight: Optional<uint>;
    createdHeight: Optional<uint>;

    constructor(
        coin: Coin,
        spentHeight: Optional<uint> = null,
        createdHeight: Optional<uint> = null
    ) {
        this.coin = coin;
        this.spentHeight = spentHeight;
        this.createdHeight = createdHeight;
    }
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