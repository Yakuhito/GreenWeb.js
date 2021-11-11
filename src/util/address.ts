import { bech32m } from "bech32";

export class AddressUtil {
    static validateHashString(puzzleHash: string): string {
        let ph: string = puzzleHash;
        if(ph.startsWith("0x"))
            ph = ph.slice(2, ph.length);
                
        if(ph.length !== 64 || !(new RegExp(/^[0-9A-Fa-f]+$/)).test(ph))
            return "";

        return ph;
    }

    static puzzleHashToAddress(puzzleHash: string, prefix = "xch"): string {
        const puzzHash: Buffer = Buffer.from(AddressUtil.validateHashString(puzzleHash), "hex");

        if(puzzHash.length !== 32)
            return "";

        return bech32m.encode(prefix, bech32m.toWords(puzzHash));
    }

    static addressToPuzzleHash(address: string): string {
        try {
            return Buffer.from(
                bech32m.fromWords(bech32m.decode(address).words)
            ).toString("hex");
        } catch(_) {
            return "";
        }
    }
}