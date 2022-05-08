// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/derive_keys.py

import { getBLSModule } from "clvm";
import { Optional } from "../../xch/providers/provider_types";

export class DeriveKeysUtils {
    static MAX_POOL_WALLETS = 100;

    private static derivePath(
        sk: any,
        path: number[],
    ): any {
        const { AugSchemeMPL } = getBLSModule();

        for(const index of path) {
            sk = AugSchemeMPL.derive_child_sk(sk, index);
        }

        return sk;
    }

    private static derivePathUnhardened(
        sk: any,
        path: number[],
    ): any {
        const { AugSchemeMPL } = getBLSModule();

        for(const index of path) {
            sk = AugSchemeMPL.derive_child_sk_unhardened(sk, index);
        }

        return sk;
    }

    public static masterSkToFarmerSk(master: any): any {
        return this.derivePath(master, [12381, 8444, 0, 0]);
    }

    public static masterSkToPoolSk(master: any): any {
        return this.derivePath(master, [12381, 8444, 1, 0]);
    }
    
    private static masterSkToWalletSkIntermediate(master: any): any {
        return this.derivePath(master, [12381, 8444, 2]);
    }

    public static masterSkToWalletSk(master: any, index: number): any {
        const intermediate = this.masterSkToWalletSkIntermediate(master);
        return this.derivePath(intermediate, [index]);
    }

    private static masterSkToWalletSkUnhardenedIntermediate(master: any): any {
        return this.derivePathUnhardened(master, [12381, 8444, 2]);
    }

    public static masterSkToWalletSkUnhardened(master: any, index: number): any {
        const intermediate = this.masterSkToWalletSkIntermediate(master);
        return this.derivePathUnhardened(intermediate, [index]);
    }

    public static masterSkToLocalSk(master: any): any {
        return this.derivePath(master, [12381, 8444, 3, 0]);
    }

    public static masterSkToBackupSk(master: any): any {
        return this.derivePath(master, [12381, 8444, 4, 0]);
    }

    public static masterSkToSingletonOwnerSk(master: any, pool_wallet_index: number): any {
        // This key controls a singleton on the blockchain, allowing for dynamic pooling (changing pools)
        return this.derivePath(master, [12381, 8444, 5, pool_wallet_index]);
    }

    public static masterSkToPoolingAuthenticationSk(master: any, pool_wallet_index: number, index: number): any {
        // This key is used for the farmer to authenticate to the pool when sending partials
        if(index >= 100000) {
            throw new Error("assert index < 10000");
        }
        if(pool_wallet_index >= 100000) {
            throw new Error("assert pool_wallet_index < 10000");
        }
        return this.derivePath(master, [12381, 8444, 6, pool_wallet_index * 10000 + index]);
    }

    public static findOwnerSk(allSks: any[], ownerPk: any): Optional<[any, number]> {
        for(let poolWalletIndex = 0; poolWalletIndex < this.MAX_POOL_WALLETS; ++poolWalletIndex) {
            for(const sk of allSks) {
                const tryOwnerSk = this.masterSkToSingletonOwnerSk(sk, poolWalletIndex);
                if(tryOwnerSk.get_g1() === ownerPk) {
                    return [tryOwnerSk, poolWalletIndex];
                }
            }
        }

        return null;
    }

    public static findAuthenticationSk(allSks: any[], ownerPk: any): Optional<any> {
        // NOTE: might need to increase this if using a large number of wallets, or have switched authentication keys
        // many times.
        for(let poolWalletIndex = 0; poolWalletIndex < this.MAX_POOL_WALLETS; ++poolWalletIndex) {
            for(const sk of allSks) {
                const tryOwnerSk = this.masterSkToSingletonOwnerSk(sk, poolWalletIndex);
                if(tryOwnerSk.get_g1() === ownerPk) {
                    // NOTE: ONLY use 0 for authentication key index to ensure compatibility
                    return this.masterSkToPoolingAuthenticationSk(sk, poolWalletIndex, 0);
                }
            }
        }

        return null;
    }

    // public static matchAddressToSk(
    //     sk: PrivateKey,
    //     addressesToSearch: bytes[],
    //     maxPhToSearch = 500
    // ): bytes[] {
    //     // Checks the list of given address is a derivation of the given sk within the given number of derivations
    //     // Returns a Set of the addresses that are derivations of the given sk
    //     if(sk === undefined || addressesToSearch === undefined) {
    //         return [];
    //     }

    //     const foundAddresses: bytes[] = [];
    //     const searchList: bytes[] = addressesToSearch;

    //     for(let i = 0; i < maxPhToSearch; ++i) {
    //         const phs = [
    //         ];
    //     }

    //     for i in range(max_ph_to_search):

    //     phs = [
    //         create_puzzlehash_for_pk(master_sk_to_wallet_sk(sk, uint32(i)).get_g1()),
    //         create_puzzlehash_for_pk(master_sk_to_wallet_sk_unhardened(sk, uint32(i)).get_g1()),
    //     ]

    //     for address in search_list:
    //         if address in phs:
    //             found_addresses.add(address)

    //     search_list = search_list - found_addresses
    //     if not len(search_list):
    //         return found_addresses

    // return found_addresses
    // }
}
