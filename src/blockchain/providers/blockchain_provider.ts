import { Optional, Coin, CoinState, BlockHeader, PuzzleSolution } from "./blockchain_provider_types";
import { getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs } from "./blockchain_provider_args";

export * from "./blockchain_provider_types";
export * from "./blockchain_provider_args";

export interface BlockchainProvider {
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