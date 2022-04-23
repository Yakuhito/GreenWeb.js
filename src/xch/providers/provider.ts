import { Optional, Coin, CoinState, BlockHeader, PuzzleSolution } from "./provider_types";
import { acceptOfferArgs, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, signCoinSpendsArgs, subscribeToAddressChangesArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs, transferArgs, transferCATArgs } from "./provider_args";
import { BigNumber } from "@ethersproject/bignumber";
import { SpendBundle } from "../../util/serializer/types/spend_bundle";
import { Network } from "../../util/network";

export * from "./provider_types";
export * from "./provider_args";

export interface Provider {
    /* basics */
    connect(): Promise<void>;
    close(): Promise<void>;
    getNetworkId(): Network;
    isConnected(): boolean;

    /* blockchain-related */
    getBlockNumber(): Promise<Optional<number>>;
    getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>>;

    /* callbacks */
    subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void;
    subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void;

    /* advanced */
    getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>>;
    getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]>;

    /* very advanced */
    getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>>;
    getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>>;

    /* also very advanced */
    getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>>;
    getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>>;

    /* wallet */
    getAddress(): Promise<string>;
    transfer(args: transferArgs): Promise<boolean>;
    transferCAT(args: transferCATArgs): Promise<boolean>;
    acceptOffer(args: acceptOfferArgs): Promise<boolean>;
    subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void;
    signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>>;
}