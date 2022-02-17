import { Provider, BlockHeader, Coin, CoinState, getBalanceArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinAdditionsArgs, getCoinChildrenArgs, getCoinRemovalsArgs, getPuzzleSolutionArgs, Optional, PuzzleSolution, subscribeToCoinUpdatesArgs, subscribeToPuzzleHashUpdatesArgs } from "./providers/provider";
import { LeafletProvider } from "./providers/leaflet";

export class XCHModule {
    public static providers = {
        LeafletProvider,
    };

    public static provider: Provider | null = null;

    static setProvider(p: Provider): void {
        this.provider = p;
    }

    // BlockchainProvider method wrappers
    static initialize(): Promise<void> {
        if(this.provider == null)
            throw new Error("Blockchain provider not set!");
        
        return this.provider?.initialize();
    }
    static close(): Promise<void> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.close();
    }
    static getNetworkId(): string {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getNetworkId();
    }
    static getBlockNumber(): Promise<Optional<number>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getBlockNumber();
    }
    static getBalance(args: getBalanceArgs): Promise<Optional<number>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getBalance(args);
    }
    static subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.subscribeToPuzzleHashUpdates(args);
    }
    static subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.subscribeToCoinUpdates(args);
    }
    static getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getPuzzleSolution(args);
    }
    static getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getCoinChildren(args);
    }
    static getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getBlockHeader(args);
    }
    static getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getBlocksHeaders(args);
    }
    static getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getCoinRemovals(args);
    }
    static getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        if (this.provider == null)
            throw new Error("Blockchain provider not set!");

        return this.provider?.getCoinAdditions(args);
    }
}