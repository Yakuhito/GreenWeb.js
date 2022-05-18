// https://github.com/Chia-Network/chia-blockchain/blob/5f4e39480e2312dc93a7b3609bcea576a9a758f9/chia/wallet/puzzles/p2_delegated_puzzle_or_hidden_puzzle.py#L70

import { BigNumber } from "@ethersproject/bignumber";
import CryptoJS from "crypto-js";
import { Util } from "..";
import { bytes } from "../../xch/providers/provider_types";

export class SyntheticKeyUtil {
    public static readonly GROUP_ORDER = BigNumber.from("0x73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000001");

    private static intToBytes(b: bytes): BigNumber {
        return BigNumber.from("0x" + b).fromTwos(256);
    }

    private static calculateSyntheticOffset(publicKey: any, hiddenPuzzleHash: bytes): BigNumber {
        const toHash = Util.key.publicKeyToHex(publicKey) + hiddenPuzzleHash;
        const hash = CryptoJS.enc.Hex.stringify(
            CryptoJS.SHA256(
                CryptoJS.enc.Hex.parse(toHash)
            )
        );

        const blob = this.intToBytes(hash);
        return blob.mod(this.GROUP_ORDER);
    }

    public static calculateSyntheticSecretKey(secretKey: any, hiddenPuzzleHash: bytes = Util.sexp.DEFAULT_HIDDEN_PUZZLE_HASH): any {
        const privKeyNum: BigNumber = BigNumber.from("0x" + Util.key.privateKeyToHex(secretKey));
        const pubKey = secretKey.get_g1();
        const syntheticOffset: BigNumber = this.calculateSyntheticOffset(pubKey, hiddenPuzzleHash);
        const syntheticSecretExponent: BigNumber = privKeyNum.add(syntheticOffset).mod(this.GROUP_ORDER);

        let blob: string = syntheticSecretExponent.toHexString().slice(2);
        if(blob.length < 64) {
            blob = "0".repeat(64 - blob.length) + blob;
        }

        return Util.key.hexToPrivateKey(blob);
    }
}