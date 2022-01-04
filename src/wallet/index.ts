import { WalletProvider } from "./providers/wallet_provider";

export class WalletModule {
    public static providers = {};

    public static provider: WalletProvider | null = null;

    static setProvider(p: WalletProvider): void {
        this.provider = p;
    }
}