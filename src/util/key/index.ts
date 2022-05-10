import { getBLSModule } from "clvm";
import { util } from "../..";
import { bytes } from "../../xch/providers/provider_types";
import { DeriveKeysUtils } from "./derive_keys";

export class KeyUtil {
    public impl = DeriveKeysUtils;

    public hexToPrivateKey(hex: bytes): any {
        const { PrivateKey } = getBLSModule();

        const pkHex = util.address.validateHashString(hex);
        if(pkHex === "") {
            return null;
        }

        return PrivateKey.from_bytes(
            Buffer.from(pkHex, "hex"),
            false
        );
    }

    public privateKeyToHex(pk: any): bytes {
        return Buffer.from(
            pk.serialize()
        ).toString("hex");
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

    public hexToPublicKey(hex: bytes): any {
        const { G1Element } = getBLSModule();

        let ok: boolean = hex.length === 48;
        for(let i = 0; i < hex.length && ok; ++i) {
            if(!"abdef0123456789".includes(hex[i].toLowerCase())) {
                ok = false;
            }
        }

        if(!ok) {
            return null;
        }

        return G1Element.from_bytes(
            Buffer.from(hex, "hex"),
        );
    }

    public publicKeyToHex(pk: any): bytes {
        return Buffer.from(
            pk.serialize()
        ).toString("hex");
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

    public masterPkToWalletPk(pk: any | string, index: number): any {
        const { G1Element } = getBLSModule();

        if(typeof pk === "string") {
            pk = this.hexToPublicKey(pk);
        }

        if(!(pk instanceof G1Element)) {
            return null;
        }

        return DeriveKeysUtils.masterPkToWalletPkUnhardened(pk, index);
    }

    //todo: pk to mnemonic and mnemonic to pk
}