import { BigNumber } from "@ethersproject/bignumber";
import { Network } from "../../../util/network";
import { SpendBundle } from "../../../util/serializer/types/spend_bundle";
import { Provider, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs } from "../provider";
import { pushSpendBundleArgs, transferArgs, transferCATArgs, acceptOfferArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs, changeNetworkArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin } from "../provider_types";
import axios from "axios";

export class LeafletRPCProvider implements Provider {
    public baseUrl: string;

    private network: Network;
    private connected = false;

    constructor(
        host: string,
        apiKey: string,
        port = 18444,
        network = Network.mainnet,
        useHTTP = false,
    ) {
        this.baseUrl = (useHTTP ? "http://" : "https://") + `${host}:${port}/${apiKey}/rpc/`;
        this.network = network;
    }

    public async connect(): Promise<void> {
        this.connected = true;
    }

    public async close(): Promise<void> {
        this.connected = false;
    }

    public getNetworkId(): Network {
        return this.network;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private async getRPCResponse<T>(endpoint: string, params: any): Promise<T | null> {
        if(!this.connected) return null;

        try {
            const { data } = await axios.post<T>(this.baseUrl + endpoint, params, {
                headers: {
                    "Content-Type": "application/json"
                },
            });
    
            return data;
        } catch(_) {
            return null;
        }
    }

    public async getBlockNumber(): Promise<Optional<number>> {
        const resp = await this.getRPCResponse<{
            blockchain_state: {
                peak: {
                    height: number
                }
            }
        }>("get_blockchain_state", {});

        return resp?.blockchain_state.peak.height ?? null;
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

    public async changeNetwork({ network }: changeNetworkArgs): Promise<boolean> {
        this.network = network;
    }
}