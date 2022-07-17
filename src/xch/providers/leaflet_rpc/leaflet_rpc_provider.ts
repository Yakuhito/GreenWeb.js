import { BigNumber } from "@ethersproject/bignumber";
import { Network } from "../../../util/network";
import { SpendBundle } from "../../../util/serializer/types/spend_bundle";
import { Provider, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs } from "../provider";
import { pushSpendBundleArgs, transferArgs, transferCATArgs, acceptOfferArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs, changeNetworkArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin } from "../provider_types";

export class LeafletRPCProvider implements Provider {
    constructor(
        host: string,
        apiKey: string,
        port = 18444,
        network = Network.mainnet,
    ) {
        //pass
    }
    connect(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    close(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getNetworkId(): Network {
        throw new Error("Method not implemented.");
    }
    isConnected(): boolean {
        throw new Error("Method not implemented.");
    }
    getBlockNumber(): Promise<Optional<number>> {
        throw new Error("Method not implemented.");
    }
    getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        throw new Error("Method not implemented.");
    }
    subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        throw new Error("Method not implemented.");
    }
    subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        throw new Error("Method not implemented.");
    }
    getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        throw new Error("Method not implemented.");
    }
    getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        throw new Error("Method not implemented.");
    }
    getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        throw new Error("Method not implemented.");
    }
    getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        throw new Error("Method not implemented.");
    }
    getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        throw new Error("Method not implemented.");
    }
    getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        throw new Error("Method not implemented.");
    }
    pushSpendBundle(args: pushSpendBundleArgs): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getAddress(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    transfer(args: transferArgs): Promise<Optional<SpendBundle>> {
        throw new Error("Method not implemented.");
    }
    transferCAT(args: transferCATArgs): Promise<Optional<SpendBundle>> {
        throw new Error("Method not implemented.");
    }
    acceptOffer(args: acceptOfferArgs): Promise<Optional<SpendBundle>> {
        throw new Error("Method not implemented.");
    }
    subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        throw new Error("Method not implemented.");
    }
    signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        throw new Error("Method not implemented.");
    }
    changeNetwork(args: changeNetworkArgs): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}