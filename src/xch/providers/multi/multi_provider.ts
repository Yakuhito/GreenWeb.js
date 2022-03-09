import { BigNumber } from "@ethersproject/bignumber";
import { Provider } from "../provider";
import { getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs, transferArgs, transferCATArgs, acceptOfferArgs, subscribeToAddressChangesArgs } from "../provider_args";
import { Optional, PuzzleSolution, CoinState, BlockHeader, Coin } from "../provider_types";

export class MultiProvider implements Provider {
    public providers: Provider[] = [];

    constructor(providers: Provider[]) {
        this.providers = providers;
    }

    public async connect(): Promise<void> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                await this.providers[i].connect();
            } catch(_) {
                continue;
            }
        }
    }

    public async close(): Promise<void> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                await this.providers[i].close();
            } catch (_) {
                continue;
            }
        }
    }

    public getNetworkId(): string {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return this.providers[i].getNetworkId();
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public isConnected(): boolean {
        for (let i = 0; i < this.providers.length; ++i) {
            if(this.providers[i].isConnected())
                return true;
        }

        return false;
    }

    public async getBlockNumber(): Promise<Optional<number>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getBlockNumber();
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }
    
    public async getBalance(args: getBalanceArgs): Promise<Optional<BigNumber>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getBalance(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public subscribeToPuzzleHashUpdates(args: subscribeToPuzzleHashUpdatesArgs): void {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return this.providers[i].subscribeToPuzzleHashUpdates(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public subscribeToCoinUpdates(args: subscribeToCoinUpdatesArgs): void {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return this.providers[i].subscribeToCoinUpdates(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getPuzzleSolution(args: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolution>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getPuzzleSolution(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getCoinChildren(args: getCoinChildrenArgs): Promise<CoinState[]> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getCoinChildren(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getBlockHeader(args: getBlockHeaderArgs): Promise<Optional<BlockHeader>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getBlockHeader(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getBlocksHeaders(args: getBlocksHeadersArgs): Promise<Optional<BlockHeader[]>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getBlocksHeaders(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getCoinRemovals(args: getCoinRemovalsArgs): Promise<Optional<Coin[]>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getCoinRemovals(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getCoinAdditions(args: getCoinAdditionsArgs): Promise<Optional<Coin[]>> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getCoinAdditions(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async getAddress(): Promise<string> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].getAddress();
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async transfer(args: transferArgs): Promise<boolean> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].transfer(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async transferCAT(args: transferCATArgs): Promise<boolean> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].transferCAT(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public async acceptOffer(args: acceptOfferArgs): Promise<boolean> {
        for(let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return await this.providers[i].acceptOffer(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }

    public subscribeToAddressChanges(args: subscribeToAddressChangesArgs): void {
        for (let i = 0; i < this.providers.length; ++i) {
            try {
                if(!this.providers[i].isConnected()) {
                    continue;
                }

                return this.providers[i].subscribeToAddressChanges(args);
            } catch (_) {
                continue;
            }
        }

        throw new Error("MultiProvider could not find an active Provider that implements this method.");
    }
}