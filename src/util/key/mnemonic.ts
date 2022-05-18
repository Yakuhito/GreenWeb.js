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

    // https://stackoverflow.com/questions/45053624/convert-hex-to-binary-in-javascript
    private static hex2bin(hex: bytes): string {
        hex = hex.replace("0x", "").toLowerCase();
        let out = "";
        for(const c of hex) {
            let b = parseInt(c, 16).toString(2);
            if(b.length < 4) {
                b = "0".repeat(4 - b.length) + b;
            }
            out += b;
        }

        return out;
    }

    private static bin2hex(bin: string): bytes {
        let out = "";
        let x = "";
        for(const c of bin) {
            x += c;
            if(x.length === 4) {
                out += parseInt(x, 2).toString(16);
                x = "";
            }
        }

        return out;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/util/keychain.py#L147
    public static bytesToMnemonic(mnemonicBytes: bytes): string {
        if(![16, 20, 24, 28, 32].includes(mnemonicBytes.length / 2)) {
            throw new Error(`Data length should be one of the following: [16, 20, 24, 28, 32], but it is ${mnemonicBytes.length / 2}.`);
        }

        const CS = Math.floor(mnemonicBytes.length / 8);
        const checksum = this.hex2bin(this.stdHash(mnemonicBytes)).slice(0, CS);
        const bitarray = this.hex2bin(mnemonicBytes) + checksum;

        const mnemonics = [];
        const lim = Math.floor(bitarray.length / 11);
        for(let i = 0; i < lim; ++i) {
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
            const value = wordList.get(word);

            let toAdd = value?.toString(2);
            if(toAdd === undefined) {
                throw new Error(`'${word}' is not in the mnemonic dictionary; may be misspelled`);
            }
            if(toAdd.length < 11) {
                toAdd = "0".repeat(11 - toAdd.length) + toAdd;
            }
            bitArray += toAdd;
        }

        const CS = Math.floor(mnemonic.length / 3);
        const ENT = mnemonic.length * 11 - CS;
        
        const entropyBytes = this.bin2hex(bitArray.slice(0, ENT));
        const checksumBytes = bitArray.slice(ENT);

        const checksum = this.hex2bin(this.stdHash(entropyBytes)).slice(0, CS);

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
            CryptoJS.PBKDF2(mnemonicNormalized, salt, {
                iterations: 2048,
                hasher: CryptoJS.algo.SHA512,
                keySize: 16
            })
        );
        
        return res;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/a4ec7e7cb8d8ecfa2a50c038e5dd94ef3e620c6c/chia/cmds/keys_funcs.py#L644
    public static privateKeyFromMnemonic(mnemonic: string, passphrase?: string): any {
        const { AugSchemeMPL } = getBLSModule();

        const seed = this.mnemonicToSeed(mnemonic, passphrase ?? "");
        return AugSchemeMPL.key_gen(
            Buffer.from(seed, "hex")
        );
    }
}