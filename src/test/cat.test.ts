/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { initializeBLS, SExp } from "clvm";
import { CAT } from "../cat";
import { Util } from "../util";
import { bytes, Coin } from "../xch/providers/provider_types";


describe.only("CAT", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_SYNTH_KEY: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_COIN: Coin;
    let OTHER_PUB_KEY: bytes;
    let TEST_TAIL: SExp;
    let TEST_TAIL_HASH: bytes;

    beforeEach(async () => {
        await initializeBLS();
        TEST_PRIV_KEY = Util.key.hexToPrivateKey(TEST_PRIV_KEY_STR);
        const g1Elem = TEST_PRIV_KEY.get_g1();
        TEST_PUB_KEY = Util.key.publicKeyToHex(g1Elem);
        TEST_SYNTH_KEY = Util.key.publicKeyToHex(
            Util.sexp.calculateSyntheticPublicKey(g1Elem)
        );
        OTHER_PUB_KEY = Util.key.publicKeyToHex(Util.key.masterSkToWalletSk(TEST_PRIV_KEY, 1337).get_g1());

        TEST_PUZZLE = Util.sexp.standardCoinPuzzle(g1Elem);
        TEST_PUZZLE_STR = Util.sexp.toHex(TEST_PUZZLE);

        TEST_TAIL = Util.sexp.everythingWithSignatureTAIL(OTHER_PUB_KEY);
        TEST_TAIL_HASH = Util.sexp.sha256tree(TEST_TAIL);

        TEST_COIN = new Coin();
        TEST_COIN.amount = 1339;
        TEST_COIN.parentCoinInfo = "03".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(Util.sexp.CATPuzzle(
            TEST_TAIL_HASH,
            TEST_PUZZLE
        ));
    });

    describe("constructor", () => {
        it("Works", () => {
            const cat = new CAT({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                innerPuzzle: TEST_PUZZLE,
                TAILProgramHash: TEST_TAIL_HASH,
                publicKey: TEST_PUB_KEY,
                innerSolution: SExp.to([]),
            });

            expect(
                cat.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(cat.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(cat.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(cat.innerPuzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(cat.TAILProgramHash).to.equal(TEST_TAIL_HASH);
            expect(cat.syntheticKey).to.equal(TEST_SYNTH_KEY);
            expect(
                Util.sexp.toHex(cat.innerSolution)
            ).to.equal("80");
            expect(cat.extraDelta).to.be.null;
            expect(cat.TAILProgram).to.be.null;
            expect(cat.TAILSolution).to.be.null;
            expect(cat.lineageProof).to.be.null;
        });
    });
});