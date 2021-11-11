import { Optional, Coin, CoinState, BlockHeader, PuzzleSolution } from "./provider_types";
import { getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs } from "./provider_args";

export * from "./provider_types";

export interface Provider {
    initialize(): Promise<void>;
    close(): Promise<void>;
    getNetworkId(): string;

    getBlockNumber(): Promise<Optional<number>>;
    getBalance(args: getBalanceArgs): Promise<Optional<number>>;

    subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void;
    subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void;

    getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>>;
    getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]>;

    getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>>;
    getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>>;

    getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>>;
    getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>>;
}