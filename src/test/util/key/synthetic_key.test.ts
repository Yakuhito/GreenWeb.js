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

describe("SyntheticKeyUtil", () => {
    let sk: any;

    beforeEach(async () => {
        await initializeBLS();
        sk = Util.key.hexToPrivateKey(SK_HEX);
    });

    describe("calculateSyntheticSecretKey()", () => {
        /*
        >>> calculate_synthetic_secret_key(sk, hiddenPuzzleHash)
        <PrivateKey 536709cb9dc7a11b0ae9a72a918c33476bd60262a435ed0be2e328d62c59d6c3>
        >>>
        */

        it("Works", () => {
            const res = SyntheticKeyUtil.calculateSyntheticSecretKey(sk, HIDDEN_PUZZLE_HASH);

            expect(
                Util.key.privateKeyToHex(res)
            ).to.equal("536709cb9dc7a11b0ae9a72a918c33476bd60262a435ed0be2e328d62c59d6c3");
        });

        /*
        (venv) yakuhito@catstation:~/projects/chia$ cat bf.py 
        from chia.wallet.puzzles.p2_delegated_puzzle_or_hidden_puzzle import *
        from blspy import PrivateKey
        import random
        import hashlib

        def getRandomPuzHash():
                return hashlib.sha256(str(random.random()).encode()).digest()

        sk = PrivateKey.from_bytes(bytes.fromhex("42" * 32))

        while True:
                puzHash = getRandomPuzHash()
                synth = bytes(calculate_synthetic_secret_key(sk, puzHash)).hex()
                if synth.startswith("00"):
                        print(puzHash.hex(), synth)
                        break
        (venv) yakuhito@catstation:~/projects/chia$ python3 bf.py 
        338cdc2a2d41dd927e27bf3822ff3183d3e139c4a999c78ccbb56938b8359c6e 0028a00013d3f709f9ad00abcd623888ba7a9795bb86f7c533e342f4fd90e7bd
        (venv) yakuhito@catstation:~/projects/chia$
        */
        it("Works when syntheticSecretExponent's hex representation is smaller than 32 bytes", () => {
            const specialPuzzleHash = "338cdc2a2d41dd927e27bf3822ff3183d3e139c4a999c78ccbb56938b8359c6e";

            const res = SyntheticKeyUtil.calculateSyntheticSecretKey(sk, specialPuzzleHash);

            expect(
                Util.key.privateKeyToHex(res)
            ).to.equal("0028a00013d3f709f9ad00abcd623888ba7a9795bb86f7c533e342f4fd90e7bd");
        });

        it("Work correctly when hiddenPuzzleHash is not provided", () => {
            const res = SyntheticKeyUtil.calculateSyntheticSecretKey(sk);

            expect(
                Util.key.privateKeyToHex(res)
            ).to.equal("36b50b35b5c7e30c603f1c20a8dbd79ef5b11920fd00803bd83b0303d4b659c7");
        })
    });
});