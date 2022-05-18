import { expect } from "chai";
import { BIP39_WORD_LIST } from "../../../util/key/bip39_word_list";
import CryptoJS from "crypto-js";

describe("BIP39 Word List", () => {
    it("Hashes to the correct checksum", () => {
        // curl -s https://raw.githubusercontent.com/Chia-Network/chia-blockchain/main/chia/util/english.txt | sha256sum
        expect(
            CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(BIP39_WORD_LIST.join("\n") + "\n"))
        ).to.equal("2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda");
    });
});