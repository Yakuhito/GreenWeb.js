/*
Special thanks to donate.goby.app and offerpool.io
*/

import { BigNumber } from "@ethersproject/bignumber";
import { Provider } from "../provider";
import { getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs, acceptOfferArgs, transferArgs, transferCATArgs, subscribeToAddressChangesArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin } from "../provider_types";

// https://stackoverflow.com/questions/56457935/typescript-error-property-x-does-not-exist-on-type-window
declare global {
    interface Window {
        chia: any;
    }
}

export class GobyProvider implements Provider {
    private _address: string = "";
    private _networkId: string = "mainnet";
    private _callbacks: Array<(address: string) => void> = [];

    constructor(tryNonInteractiveConnect: boolean = true) {
        if (!tryNonInteractiveConnect || !this._isGobyInstalled()) {
            return;
        }

        window.chia.request({ method: "accounts" }).then(
            (accounts: string[]) => this._changeAddress(accounts?.[0] ?? "")
        );
    }

    // https://github.com/offerpool/offerpool/commit/06178554cb35d985def1f77ebf56fa110bafed37#diff-ebb1516e535afb1a750fde696b67201f7e1afb997d33d8462f41cca6c670d36d
    private _isGobyInstalled(): boolean {
        const { chia } = window;
        return Boolean(chia && chia.isGoby)
    }

    private _changeAddress(newAddress: string): void {
        this._address = newAddress;

        for(let i = 0; i < this._callbacks.length; ++i) {
            this._callbacks[i](newAddress);
        }
    }

    public async connect(): Promise<void> {
        if(!this._isGobyInstalled()) {
            return;
        }

        window.chia.on("accountsChanged", (accounts: string[]) => {
            this._changeAddress(accounts?.[0] ?? "");
        })
        window.chia.on("chainChanged", async () => {
            await this.close();
            await this.connect();
        });

        const accounts: string[] = await window.chia.request({ method: "requestAccounts" });
        this._changeAddress(accounts?.[0] ?? "");
    }

    public async close(): Promise<void> {
        this._changeAddress("");
    }

    public getNetworkId(): string {
        return this._networkId;
    }

    public isConnected(): boolean {
        return this._address !== "";
    }

    public async getBlockNumber(): Promise<Optional<number>> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        throw new Error("GobyProvider does not implement this method.");
    }

    public subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        throw new Error("GobyProvider does not implement this method.");
    }

    public async getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        throw new Error("GobyProvider does not implement this method.");
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

            value = value.toNumber();
            fee = fee.toNumber();
            await window.chia.request({
                method: "transfer",
                params: {
                    to,
                    amount: value,
                    memos: "",
                    assetId,
                    fee
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

            fee = fee.toNumber();
            await window.chia.request({
                method: "takeOffer",
                params: {
                    offer,
                    fee
                }
            });
        } catch (_) {
            return false;
        }

        return true;
    }

    public subscribeToAddressChanges({ callback }: subscribeToAddressChangesArgs): void {
        this._callbacks.push(callback);
    }
}