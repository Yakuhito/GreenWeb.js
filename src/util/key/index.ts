import { getBLSModule } from "clvm";
import { DeriveKeysUtils } from "./derive_keys";

export class KeyUtil {
    public impl = DeriveKeysUtils;

    public hexToPrivateKey(hex: string): any {
        const { PrivateKey } = getBLSModule();

        return PrivateKey.from_bytes(
            Buffer.from(hex, "hex"),
            false
        );
    }

    public masterSkToWalletSk(sk: any | string, index: number): any {
        const { PrivateKey } = getBLSModule();

        if(typeof sk === "string") {
            sk = this.hexToPrivateKey(sk);
        }

        if(!(sk instanceof PrivateKey)) {
            return null;
        }

        return DeriveKeysUtils.masterSkToWalletSk(sk, index);
    }

    public masterSkToWalletSkUnhardened(sk: any | string, index: number): any {
        const { PrivateKey } = getBLSModule();

        if(typeof sk === "string") {
            sk = this.hexToPrivateKey(sk);
        }

        if(!(sk instanceof PrivateKey)) {
            return null;
        }

        return DeriveKeysUtils.masterSkToWalletSkUnhardened(sk, index);
    }
}