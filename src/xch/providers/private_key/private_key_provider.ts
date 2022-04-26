import { BigNumber } from "@ethersproject/bignumber";
import { getBLSModule, initialize, } from "clvm";
import { SpendBundle } from "../../../util/serializer/types/spend_bundle";
import { Provider } from "../provider";
import { getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs, transferArgs, transferCATArgs, acceptOfferArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs, changeNetworkArgs, pushSpendBundleArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin, bytes } from "../provider_types";
import { Util } from "../../../util";
import { Network } from "../../../util/network";
import { util } from "../../..";

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

    public getNetworkId(): Network {
        return this.network;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private _doesNotImplementError(): any {
        throw new Error("PrivateKeyProvider does not implement this method.");
    }

    public async getBlockNumber(): Promise<Optional<number>> { return this._doesNotImplementError(); }
    public async getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> { return this._doesNotImplementError(); }
    public subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void { return this._doesNotImplementError(); }
    public subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void { return this._doesNotImplementError(); }
    public async getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> { return this._doesNotImplementError(); }
    public async getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> { return this._doesNotImplementError(); }
    public async getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> { return this._doesNotImplementError(); }
    public async getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> { return this._doesNotImplementError(); }
    public async getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> { return this._doesNotImplementError(); }
    public async getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> { return this._doesNotImplementError(); }
    public async pushSpendBundle(args: pushSpendBundleArgs): Promise<boolean> { return this._doesNotImplementError(); }
    public async getAddress(): Promise<string> { return this._doesNotImplementError(); }
    public async transfer(args: transferArgs): Promise<boolean> { return this._doesNotImplementError(); }
    public async transferCAT(args: transferCATArgs): Promise<boolean> { return this._doesNotImplementError(); }
    public async acceptOffer(args: acceptOfferArgs): Promise<boolean> { return this._doesNotImplementError(); }
    public subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void { return this._doesNotImplementError(); }

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

            const [, conditions, ] = util.sexp.conditionsDictForSolution(
                coinSpend.puzzleReveal,
                coinSpend.solution,
                Util.sexp.MAX_BLOCK_COST_CLVM
            );

            if(conditions !== null) {
                const pk_msg_things = util.sexp.pkmPairsForConditionsDict(
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

    public async changeNetwork(args: changeNetworkArgs): Promise<boolean> {
        if(Util.network.networks.includes(args.network)) {
            this.network = args.network;
            return true;
        }

        return false;
    }
}