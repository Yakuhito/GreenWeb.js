import { bytes } from "../../xch/providers/provider_types";
import CryptoJS from "crypto-js";
import { BIP39_WORD_LIST } from "./bip39_word_list";

export class MnemonicUtils {
    private static stdHash(data: bytes): bytes {
        return CryptoJS.enc.Hex.stringify(
            CryptoJS.SHA256(
                CryptoJS.enc.Hex.parse(
                    data
                )
            )
        );
    }

    public static bytesToMnemonic(mnemonicBytes: bytes): string {
        if(![16, 20, 24, 28, 32].includes(mnemonicBytes.length / 2)) {
            throw new Error(`Data length should be one of the following: [16, 20, 24, 28, 32], but it is ${mnemonicBytes.length / 2}.`);
        }

        // word_list = BIP39_WORD_LIST
        const CS = Math.floor(mnemonicBytes.length / 4);
        const checksum = this.stdHash(mnemonicBytes).slice(0, CS * 2);
        const bitarray = Buffer.from(mnemonicBytes + checksum, "hex").toString("binary");
        console.log({bitarray}) //a
        console.log({assertion: bitarray.length % 11, shouldEqual: 0}) //b

        const mnemonics = [];
        for(let i = 0; i < Math.floor(bitarray.length / 11); i += 11) {
            const start = i * 11;
            const end = start + 11;
            const bits = bitarray.slice(start, end);
            const mWordPosition = parseInt(bits, 2);
            const mWord = BIP39_WORD_LIST[mWordPosition];
            mnemonics.push(mWord);
        }

        return mnemonics.join(" ");
    }
}