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

    public static bytesFromMnemonic(mnemonicStr: string): bytes {
        const mnemonic: string[] = mnemonicStr.split(" ");
        if(![12, 15, 18, 21, 24].includes(mnemonic.length)) {
            throw new Error("Invalid mnemonic length");
        }

        const wordList: Map<string, number> = new Map<string, number>();
        for(let i = 0; i < BIP39_WORD_LIST.length; ++i) {
            wordList.set(BIP39_WORD_LIST[i], i);
        }
        let bitArray: bytes =  "";
        for(let i = 0; i < mnemonic.length; ++i) {
            const word = mnemonic[i];
            if(!wordList.has(word)) {
                throw new Error(`'${word}' is not in the mnemonic dictionary; may be misspelled`);
            }
            const value = wordList.get(word);
            bitArray += value?.toString(2);
        }

        const CS = Math.floor(mnemonic.length / 3);
        const ENT = mnemonic.length * 11 - CS;
        console.log({assert: bitArray.length, equalTo: mnemonic.length *11}); //a
        console.log({assert: ENT % 32, equalTo: 0}); //b

        const entropyBytes = Buffer.from(bitArray.slice(0, ENT), "binary").toString("hex");
        const checksumBytes = Buffer.from(bitArray.slice(ENT), "binary").toString("hex");

        const checksum = this.stdHash(entropyBytes).slice(0, CS * 2);

        if(checksum !== checksumBytes) {
            throw new Error("Invalid order of mnemonic words");
        }

        return entropyBytes;
    }
}