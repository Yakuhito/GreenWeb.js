/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Provider, BlockHeader, Coin, CoinState, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, Optional, PuzzleSolution, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs, acceptOfferArgs, transferCATArgs, transferArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs, pushSpendBundleArgs, changeNetworkArgs } from "./providers/provider";
import { LeafletProvider } from "./providers/leaflet";
import { GobyProvider } from "./providers/goby";
import { MultiProvider } from "./providers/multi";
import { BigNumber } from "@ethersproject/bignumber";
import { PrivateKeyProvider } from "./providers/private_key";
import { SpendBundle } from "../util/serializer/types/spend_bundle";
import { Network } from "../util/network";

export type CreateProviderArgs = {
    leafletHost?: string,
    leafletAPIKey?: string,
    leafletPort?: number,
    useGoby?: boolean,
    gobyTryNonInteractiveConnect?: boolean,
    network?: Network,
    privateKey?: string,
};

export class XCHModule {
    public static providers = {
        LeafletProvider,
        GobyProvider,
        MultiProvider,
        PrivateKeyProvider
    };

    public static provider: Provider | null = null;

    static setProvider(p: Provider): void {
        this.provider = p;
    }

    static createProvider({
        leafletHost = "leaflet.fireacademy.io",
        leafletAPIKey,
        leafletPort = 18444,
        useGoby = false,
        gobyTryNonInteractiveConnect = true,
        network = Network.mainnet,
        privateKey,
    }: CreateProviderArgs): void {
        const providers: Provider[] = [];

        if(leafletAPIKey) {
            providers.push(
                new LeafletProvider(leafletHost, leafletAPIKey, leafletPort, network)
            );
        }
        if(useGoby) {
            providers.push(
                new GobyProvider(gobyTryNonInteractiveConnect)
            );
        }
        if(privateKey) {
            providers.push(
                new PrivateKeyProvider(privateKey, network)
            );
        }

        this.setProvider(new MultiProvider(providers));
    }

    static clearProvider(): void {
        this.provider = null;
    }

    // Provider method wrappers
    static connect(): Promise<void> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");
        
        return XCHModule.provider!.connect();
    }
    static close(): Promise<void> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.close();
    }
    static getNetworkId(): Network {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getNetworkId();
    }
    static isConnected(): boolean {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.isConnected();
    }
    static getBlockNumber(): Promise<Optional<number>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getBlockNumber();
    }
    static getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getBalance(args);
    }
    static subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.subscribeToPuzzleHashUpdates(args);
    }
    static subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.subscribeToCoinUpdates(args);
    }
    static getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getPuzzleSolution(args);
    }
    static getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getCoinChildren(args);
    }
    static getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getBlockHeader(args);
    }
    static getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getBlocksHeaders(args);
    }
    static getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getCoinRemovals(args);
    }
    static getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getCoinAdditions(args);
    }
    static pushSpendBundle(args: pushSpendBundleArgs): Promise<boolean> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.pushSpendBundle(args);
    }
    static getAddress(): Promise<string> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.getAddress();
    }
    static transfer(args: transferArgs): Promise<Optional<SpendBundle>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.transfer(args);
    }
    static transferCAT(args: transferCATArgs): Promise<Optional<SpendBundle>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.transferCAT(args);
    }
    static acceptOffer(args: acceptOfferArgs): Promise<Optional<SpendBundle>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.acceptOffer(args);
    }
    static subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.subscribeToAddressChanges(args);
    }
    static signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.signCoinSpends(args);
    }
    static changeNetwork(args: changeNetworkArgs): Promise<boolean> {
        if(XCHModule.provider === null)
            throw new Error("Provider not set!");

        return XCHModule.provider!.changeNetwork(args);
    }
}