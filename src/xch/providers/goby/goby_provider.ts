/*
Special thanks to donate.goby.app and offerpool.io
*/

import { BigNumber } from "@ethersproject/bignumber";
import { Network } from "../../../util/network";
import { SpendBundle } from "../../../util/serializer/types/spend_bundle";
import { Provider } from "../provider";
import { getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs, acceptOfferArgs, transferArgs, transferCATArgs, subscribeToAddressChangesArgs, signCoinSpendsArgs, changeNetworkArgs, pushSpendBundleArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin } from "../provider_types";

// https://stackoverflow.com/questions/56457935/typescript-error-property-x-does-not-exist-on-type-window
declare global {
    interface Window {
        chia: any;
    }
}

export class GobyProvider implements Provider {
    private _address: string = "";
    private _network: Network = Network.mainnet;
    private _callbacks: Array<(address: string) => void> = [];
    private _chiaOverwrite: any = null;
    private _callbacksInitialized: boolean = false;

    constructor(tryNonInteractiveConnect: boolean = true, _chiaOverwrite: any = null) {
        this._chiaOverwrite = _chiaOverwrite; // used for testing purposes
        if (!tryNonInteractiveConnect || !this._isGobyInstalled()) {
            return;
        }

        this._getChia().request({ method: "accounts" }).then(
            (accounts: string[]) => this._changeAddress(
                accounts === null || accounts.length === 0 ? "" : accounts[0],
            )
        );
    }

    private _getChia(): any {
        if(this._chiaOverwrite === null)
            return window.chia;

        return this._chiaOverwrite;
    }

    // https://github.com/offerpool/offerpool/commit/06178554cb35d985def1f77ebf56fa110bafed37#diff-ebb1516e535afb1a750fde696b67201f7e1afb997d33d8462f41cca6c670d36d
    private _isGobyInstalled(): boolean {
        try {
            const chia = this._getChia();
            return Boolean(chia && chia.isGoby);
        } catch(_) {
            return false;
        }
    }

    private _changeAddress(newAddress: string): void {
        if(this._address === "" && newAddress !== "" && !this._callbacksInitialized) {
            this._callbacksInitialized = true;

            this._getChia().on("accountsChanged", (accounts: string[]) => {
                this._changeAddress(accounts?.[0] ?? "");
            });
            this._getChia().on("chainChanged", (chainId: string) => {
                if(chainId === "0x01") {
                    this._network = Network.mainnet;
                } else {
                    this._network = Network.testnet10;
                }
            });
        }
        this._address = newAddress;

        for(let i = 0; i < this._callbacks.length; ++i) {
            this._callbacks[i](newAddress);
        }
    }

    public async connect(): Promise<void> {
        if(!this._isGobyInstalled() || this.isConnected()) {
            return;
        }

        let accounts: string[];
        try {
            accounts = await this._getChia().request({ method: "requestAccounts" });
        } catch(_) {
            accounts = [];
        }
        this._changeAddress(
            accounts === null || accounts.length === 0 ? "" : accounts[0]
        );
    }

    public async close(): Promise<void> {
        if(!this.isConnected()) {
            return;
        }

        this._changeAddress("");
    }

    public getNetworkId(): Network {
        if(!this.isConnected()) {
            return Network.mainnet;
        }

        return this._network;
    }

    public isConnected(): boolean {
        return this._address !== "";
    }

    private _doesNotImplementError(): any {
        throw new Error("GobyProvider does not implement this method.");
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

    public async pushSpendBundle({ spendBundle }: pushSpendBundleArgs): Promise<boolean> {
        // Seems like this feature isn't live yet
        return this._doesNotImplementError();
        // try {
        //     const res = await this._getChia().request({
        //         method: "pushTx",
        //         params: {
        //             spendBundle,
        //         }
        //     });

        //     if(["success", "pending"].includes(res.status)) {
        //         return true;
        //     }
        //     return false;
        // } catch(_) {
        //     return false;
        // }
    }

    public async getAddress(): Promise<string> {
        return this._address;
    }

    public transfer({ to, value, fee = 0 }: transferArgs): Promise<boolean> {
        // you did not see this
        // kapische?

        return this.transferCAT({ to, value, fee, assetId: "" });
    }

    public async transferCAT({ to, value, assetId, fee = 0 }: transferCATArgs): Promise<boolean> {
        if (!this.isConnected()) {
            return false;
        }

        try {
            value = BigNumber.from(value);
            fee = BigNumber.from(fee);
            await this._getChia().request({
                method: "transfer",
                params: {
                    to,
                    amount: value.toString(),
                    memos: "",
                    assetId,
                    fee: fee.toString()
                }
            });
        } catch (_) {
            return false;
        }

        return true;
    }

    public async acceptOffer({ offer, fee = 0 }: acceptOfferArgs): Promise<boolean> {
        if (!this.isConnected()) {
            return false;
        }

        try {
            fee = BigNumber.from(fee);

            await this._getChia().request({
                method: "takeOffer",
                params: {
                    offer,
                    fee: fee.toString()
                }
            });
        } catch (_) {
            return false;
        }

        return true;
    }

    public subscribeToAddressChanges({ callback }: subscribeToAddressChangesArgs): void {
        this._callbacks.push(callback);
        callback(this._address);
    }

    public async signCoinSpends(args: signCoinSpendsArgs): Promise<Optional<SpendBundle>> {
        // hopefully soon
        return this._doesNotImplementError();
    }

    public async changeNetwork({ network }: changeNetworkArgs): Promise<boolean> {
        let chainId: string = "";
        switch (network) {
            case Network.mainnet:
                chainId = "0x01";
                break;
            case Network.testnet10:
                chainId = "0x02";
                break;
            default:
                return false;
        }

        try {
            await this._getChia().request({
                method: "walletSwitchChain",
                params: {
                    chainId,
                }
            });
        } catch (_) {
            return false;
        }

        return true;
    }
}