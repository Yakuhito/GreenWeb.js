import { initializeBLS, SExp } from "clvm";
import { CAT } from "../cat";
import { Util } from "../util";
import { bytes, Coin } from "../xch/providers/provider_types";


describe("CAT", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_SYNTH_KEY: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_PUZZLE_IS_SYNT: SExp;
    let TEST_PUZZLE_IS_SYNT_STR: bytes;
    let TEST_COIN: Coin;
    let OTHER_PUB_KEY: bytes;

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
        TEST_PUZZLE_IS_SYNT = Util.sexp.standardCoinPuzzle(g1Elem, true);
        TEST_PUZZLE_IS_SYNT_STR = Util.sexp.toHex(TEST_PUZZLE_IS_SYNT);

        TEST_COIN = new Coin();
        TEST_COIN.amount = 1339;
        TEST_COIN.parentCoinInfo = "03".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_PUZZLE);
    });

    describe("constructor", () => {
        it("Works", () => {
            const cat = new CAT({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
            });
        });
    });
});