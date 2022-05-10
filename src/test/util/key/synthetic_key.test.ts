/* eslint-disable max-len */

import { expect } from "chai";
import { initializeBLS } from "clvm";
import { Util } from "../../../util";
import { SyntheticKeyUtil } from "../../../util/key/synthetic_key";

/*
>>> from chia.wallet.puzzles.p2_delegated_puzzle_or_hidden_puzzle import *
>>> from blspy import PrivateKey, G1Element
>>> sk = PrivateKey.from_bytes(bytes.fromhex("42" * 32))
>>> pk = G1Element.from_bytes(bytes.fromhex("b5b99c967e4c69822f427db1f6871dd119afb95ab9646ba2e707990a3db31777a59b66f69e89c2055699b0ade7357eae"))
>>> hiddenPuzzleHash = bytes.fromhex("69" * 32)
*/

const SK_HEX = "42".repeat(32);
const HIDDEN_PUZZLE_HASH = "69".repeat(32);

describe.only("SyntheticKeyUtil", () => {
    let sk: any;

    beforeEach(async () => {
        await initializeBLS();
        sk = Util.key.hexToPrivateKey(SK_HEX);
    });

    it("calculateSyntheticSecretKey()", () => {
        /*
        >>> calculate_synthetic_secret_key(sk, hiddenPuzzleHash)
        <PrivateKey 536709cb9dc7a11b0ae9a72a918c33476bd60262a435ed0be2e328d62c59d6c3>
        >>>
        */
        const res = SyntheticKeyUtil.calculateSyntheticSecretKey(sk, HIDDEN_PUZZLE_HASH);

        expect(
            Util.key.privateKeyToHex(res)
        ).to.equal("536709cb9dc7a11b0ae9a72a918c33476bd60262a435ed0be2e328d62c59d6c3");
    });

    //todo: l35
});