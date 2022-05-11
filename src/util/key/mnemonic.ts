import { bytes } from "../../xch/providers/provider_types";
import CryptoJS from "crypto-js";
import { BIP39_WORD_LIST } from "./bip39_word_list";
import { getBLSModule } from "clvm";

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

    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/util/keychain.py#L147
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

    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/util/keychain.py#L172
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

    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/util/keychain.py#L203
    public static mnemonicToSeed(mnemonic: string, passphrase: string) {
        // Uses BIP39 standard to derive a seed from entropy bytes.
        const saltStr = "mnemonic" + passphrase;
        const salt = saltStr.normalize("NFKD");
        const mnemonicNormalized = mnemonic.normalize("NFKD");

        const res =  CryptoJS.enc.Hex.stringify(
            CryptoJS.PBKDF2(salt, mnemonicNormalized, {
                iterations: 2048,
                hasher: CryptoJS.algo.SHA512
            })
        );
        
        console.log({assert: res.length, equalTo: 64}) //c
        return res;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/a4ec7e7cb8d8ecfa2a50c038e5dd94ef3e620c6c/chia/cmds/keys_funcs.py#L644
    public static privateKeyFromMnemonic(mnemonic: string): any {
        const { AugSchemeMPL } = getBLSModule();

        const seed = this.mnemonicToSeed(mnemonic, "");
        return AugSchemeMPL.key_gen(
            Buffer.from(seed, "hex")
        );
    }
}