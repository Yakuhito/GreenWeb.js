import { bech32m } from 'bech32';

export class AddressUtil {
    static validateHashString(puzzleHash: string): string {
        var ph: string = puzzleHash;
            if(ph.startsWith("0x"))
                ph = ph.slice(2, ph.length);
                
            if(ph.length != 64 || !(new RegExp( /^[0-9A-Fa-f]+$/ )).test(ph))
                return "";

            return ph;
    }

    static puzzleHashToAddress(puzzleHash: Buffer | string, prefix: string = "xch"): string {
        if(!(puzzleHash instanceof Buffer)) {
            puzzleHash = Buffer.from(AddressUtil.validateHashString(puzzleHash), "hex");
        }

        if(puzzleHash.length != 32)
            return "";

        return bech32m.encode(prefix, bech32m.toWords(puzzleHash));
    }

    static addressToPuzzleHash(address: string): Buffer {
        try {
            return Buffer.from(
                bech32m.fromWords(bech32m.decode(address).words)
            );
        } catch(_) {
            return Buffer.from([]);
        }
    }
}