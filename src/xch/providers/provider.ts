import { Optional, Coin, CoinState, BlockHeader, PuzzleSolution } from "./provider_types";
import { acceptOfferArgs, changeNetworkArgs, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getCoinsArgs, getPuzzleSolutionArgs, pushSpendBundleArgs, signCoinSpendsArgs, subscribeToAddressChangesArgs, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs, transferArgs, transferCATArgs } from "./provider_args";
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
    getCoins(args: getCoinsArgs): Promise<Optional<CoinState[]>>;

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

    /* deserves its own category */
    pushSpendBundle(args: pushSpendBundleArgs): Promise<boolean>;

    /* wallet */
    getAddress(): Promise<string>;
    transfer(args: transferArgs): Promise<Optional<SpendBundle>>;
    transferCAT(args: transferCATArgs): Promise<Optional<SpendBundle>>;
    acceptOffer(args: acceptOfferArgs): Promise<Optional<SpendBundle>>;
    subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void;
    signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>>;
    changeNetwork(args: changeNetworkArgs): Promise<boolean>;
}