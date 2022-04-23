import { BigNumber } from "@ethersproject/bignumber";
import { getBLSModule, initialize, } from "clvm";
import { SpendBundle } from "../../../util/serializer/types/spend_bundle";
import { Provider } from "../provider";
import { getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs, transferArgs, transferCATArgs, acceptOfferArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin, bytes } from "../provider_types";
import { Util } from "../../../util";
import { SignUtils } from "./sign_utils";
import { Network } from "../../../util/network";

export const MAX_BLOCK_COST_CLVM = 11000000000;

export class PrivateKeyProvider implements Provider {
    private privateKey: string;
    private connected: boolean;
    private network: Network;

    constructor(privateKey: bytes, network: Network = Network.mainnet) {
        const key = Util.address.validateHashString(privateKey);

        if(key === "") {
            throw new Error("Invalid private key.");
        }

        this.privateKey = key;
        this.connected = false;
        this.network = network;
    }

    public async connect(): Promise<void> {
        await initialize();

        this.connected = true;
    }

    public async close(): Promise<void> {
        this.connected = false;
    }

    public getNetworkId(): string {
        return Util.network.getNetworkName(this.network);
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public async getBlockNumber(): Promise<Optional<number>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getAddress(): Promise<string> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async transfer(args: transferArgs): Promise<boolean> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async transferCAT(args: transferCATArgs): Promise<boolean> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async acceptOffer(args: acceptOfferArgs): Promise<boolean> {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async signCoinSpends({ coinSpends }: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        // todo
        // network genesis challenge
        const networkData: string = Util.network.getGenesisChallenge(this.network);

        const { PrivateKey, AugSchemeMPL } = getBLSModule();

        const emptySig = AugSchemeMPL.aggregate([]);
        const signatures: Array<typeof emptySig> = [
            AugSchemeMPL.aggregate([]),
        ];
        const sk = PrivateKey.from_bytes(
            Buffer.from(this.privateKey, "hex"),
            false
        );
        const publicKey = Buffer.from(sk.get_g1().serialize()).toString("hex");

        for(let i = 0; i < coinSpends.length; i++) {
            const coinSpend = coinSpends[i];

            const [, conditions, ] = SignUtils.conditionsDictForSolution(
                coinSpend.puzzleReveal,
                coinSpend.solution,
                MAX_BLOCK_COST_CLVM
            );

            if(conditions !== null) {
                const pk_msg_things = SignUtils.pkmPairsForConditionsDict(
                    conditions,
                    Util.coin.getId(coinSpend.coin),
                    networkData
                );
    
                for(const [pk, msg] of pk_msg_things) {
                    if(pk !== publicKey) {
                        continue;
                    }

                    const sig = AugSchemeMPL.sign(
                        sk,
                        Buffer.from(msg, "hex")
                    );
        
                    signatures.push(sig);
                }
                
            }
        }

        const sb = new SpendBundle();
        sb.coinSpends = coinSpends;
        sb.aggregatedSignature = Buffer.from(
            AugSchemeMPL.aggregate(signatures).serialize()
        ).toString("hex");
        return sb;
    }
}