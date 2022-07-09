/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Bytes, initializeBLS, SExp } from "clvm";
import { StandardCoin } from "../standard_coin";
import { Util } from "../util";
import { Coin } from "../util/serializer/types/coin";
import { bytes } from "../xch/providers/provider_types";

describe("StandardCoin", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_SYNTH_KEY: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_PUZZLE_IS_SYNT: SExp;
    let TEST_PUZZLE_IS_SYNT_STR: bytes;
    let TEST_COIN: Coin;

    beforeEach(async () => {
        await initializeBLS();
        TEST_PRIV_KEY = Util.key.hexToPrivateKey(TEST_PRIV_KEY_STR);
        const g1Elem = TEST_PRIV_KEY.get_g1();
        TEST_PUB_KEY = Util.key.publicKeyToHex(g1Elem);
        TEST_SYNTH_KEY = Util.key.publicKeyToHex(
            Util.sexp.calculateSyntheticPublicKey(g1Elem)
        );
        
        TEST_PUZZLE = Util.sexp.standardCoinPuzzle(g1Elem);
        TEST_PUZZLE_STR = Util.sexp.toHex(TEST_PUZZLE);
        TEST_PUZZLE_IS_SYNT = Util.sexp.standardCoinPuzzle(g1Elem, true);
        TEST_PUZZLE_IS_SYNT_STR = Util.sexp.toHex(TEST_PUZZLE_IS_SYNT);

        TEST_COIN = new Coin();
        TEST_COIN.amount = 1338;
        TEST_COIN.parentCoinInfo = "02".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_PUZZLE);
    });

    describe("constructor", function () {
        it("Works", () => {
            const sc = new StandardCoin({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                publicKey: TEST_PUB_KEY
            });

            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(sc.syntheticKey).to.equal(
                TEST_SYNTH_KEY
            );
        });

        it("Correctly sets values if given no arguments", () => {
            const sc = new StandardCoin({});

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.syntheticKey).to.be.null;
        });

        it("Correctly sets values if given no arguments (#2)", () => {
            const sc = new StandardCoin();

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.syntheticKey).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const sc = new StandardCoin({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                publicKey: undefined,
                syntheticKey: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.syntheticKey).to.be.null;
        });

        it("Prefers coin to parentCoinInfo / puzzleHash / amount", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                amount: 31337,
                parentCoinInfo: "02".repeat(32),
                puzzleHash: "00".repeat(32),
            });

            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
        });

        it("Correctly overwrites wrong puzzleHash", () => {
            const sc = new StandardCoin({
                puzzleHash: "00".repeat(32),
                syntheticKey: TEST_SYNTH_KEY,
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });

        it("Does not override puzzleHash if puzzle cannot be calculated", () => {
            const sc = new StandardCoin({
                puzzleHash: "00".repeat(32),
            });

            expect(sc.puzzleHash).to.equal("00".repeat(32));
        });

        it("Correctly sets puzzle if given public key", () => {
            const sc = new StandardCoin({
                publicKey: TEST_PUB_KEY
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly sets puzzle if given synthetic key", () => {
            const sc = new StandardCoin({
                syntheticKey: TEST_PUB_KEY,
            });

            expect(sc.puzzleHash).to.equal(Util.sexp.sha256tree(TEST_PUZZLE_IS_SYNT));
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_IS_SYNT_STR);
        });
    });

    describe("copyWith()", () => {
        it("Works", () => {
            const sc = new StandardCoin().copyWith({
                amount: TEST_COIN.amount,
                puzzleHash: TEST_COIN.puzzleHash,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                publicKey: TEST_PUB_KEY,
            });

            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.syntheticKey).to.equal(TEST_SYNTH_KEY);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const sc = new StandardCoin().copyWith({});

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.syntheticKey).to.be.null;
        });

        it("Correctly sets values if all arguments are undefined", () => {
            const sc = new StandardCoin().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                publicKey: undefined,
                syntheticKey: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.syntheticKey).to.be.null;
        });

        it("Correctly overwrites syntheticKey is publicKey is provided", () => {
            const sc = new StandardCoin({
                syntheticKey: TEST_PUB_KEY,
            });
            const sc2 = sc.copyWith({
                publicKey: TEST_PUB_KEY
            });

            expect(sc2.syntheticKey).to.equal(TEST_SYNTH_KEY);
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const sc = new StandardCoin().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                publicKey: undefined,
                syntheticKey: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.syntheticKey).to.be.null;
        });

        it("Prefers coin to parentCoinInfo / puzzleHash / amount", () => {
            const sc = new StandardCoin().copyWith({
                coin: TEST_COIN,
                amount: 31337,
                parentCoinInfo: "02".repeat(32),
                puzzleHash: "00".repeat(32),
            });

            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
        });

        it("Prefers publicKey to puzzleHash", () => {
            const sc = new StandardCoin().copyWith({
                puzzleHash: "00".repeat(32),
                publicKey: TEST_PUB_KEY,
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.syntheticKey).to.not.be.null;
            expect(sc.puzzle).to.not.be.null;
        });

        it("Prefers syntheticKey to puzzleHash", () => {
            const sc = new StandardCoin().copyWith({
                puzzleHash: "00".repeat(32),
                syntheticKey: TEST_SYNTH_KEY,
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.syntheticKey).to.not.be.null;
            expect(sc.puzzle).to.not.be.null;
        });
    });

    describe("withPublicKey()", () => {
        it("Correctly creates a new StandardCoin with modified public key", () => {
            const sc = new StandardCoin();

            expect(sc.syntheticKey).to.be.null;
            expect(sc.puzzle).to.be.null;
            const sc2 = sc.withPublicKey(TEST_PUB_KEY);
            expect(sc2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin();

            expect(sc.syntheticKey).to.be.null;
            expect(sc.puzzle).to.be.null;
            sc.withPublicKey(TEST_PUB_KEY);
            expect(sc.syntheticKey).to.be.null;
            expect(sc.puzzle).to.be.null;
        });
    });

    describe("withSyntheticKey()", () => {
        it("Correctly creates a new StandardCoin with modified synthetic key", () => {
            const sc = new StandardCoin();

            expect(sc.syntheticKey).to.be.null;
            expect(sc.puzzle).to.be.null;
            const sc2 = sc.withSyntheticKey(TEST_SYNTH_KEY);
            expect(sc2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin();

            expect(sc.syntheticKey).to.be.null;
            expect(sc.puzzle).to.be.null;
            sc.withSyntheticKey(TEST_SYNTH_KEY);
            expect(sc.syntheticKey).to.be.null;
            expect(sc.puzzle).to.be.null;
        });
    });

    describe("withParentCoinInfo()", () => {
        it("Correctly creates a new SmartCoin with modified parentCoinInfo", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            const sc2 = sc.withParentCoinInfo(TEST_VAL);
            expect(sc2.parentCoinInfo).to.equal(TEST_VAL);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            sc.withParentCoinInfo(TEST_VAL);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });
    });

    describe("withPuzzleHash()", () => {
        it("Correctly creates a new SmartCoin with modified puzzleHash", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            const sc2 = sc.withPuzzleHash(TEST_VAL);
            expect(sc2.puzzleHash).to.equal(TEST_VAL);
            expect(sc2.puzzle).to.be.null;
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                publicKey: TEST_PUB_KEY
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            sc.withPuzzleHash(TEST_VAL);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Does nothing if coin has puzzle", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                publicKey: TEST_PUB_KEY
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            const sc2 = sc.withPuzzleHash(TEST_VAL);
            expect(sc2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });
    });

    describe("withAmount()", () => {
        it("Correctly creates a new SmartCoin with modified amount", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = BigNumber.from(1234);

            expect(TEST_VAL.eq(TEST_COIN.amount)).to.be.false;
            const sc2 = sc.withAmount(TEST_VAL);
            expect(sc2.amount?.eq(TEST_VAL)).to.be.true;
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = BigNumber.from(1234);

            expect(TEST_VAL.eq(TEST_COIN.amount)).to.be.false;
            sc.withAmount(TEST_VAL);
            expect(sc.amount?.eq(TEST_VAL)).to.be.false;
        });
    });

    describe("addConditionsToSolution()", () => {
        it("Correctly handles solution = null", () => {
            const c = new StandardCoin({
                coin: TEST_COIN,
            });
            const conditionsToAdd = [SExp.FALSE, SExp.TRUE];
            const c2 = c.addConditionsToSolution(conditionsToAdd);

            expect(c2.solution).to.not.be.null;
            expect(
                Util.sexp.toHex(c2.solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.standardCoinSolution(conditionsToAdd)
                )
            );
            expect(c2.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });

        it("Does not modify solution if it is not a list", () => {
            const c = new StandardCoin({
                solution: SExp.to(Bytes.from("4242", "hex"))
            });
            const c2 = c.addConditionsToSolution([SExp.FALSE, SExp.TRUE]);

            expect(
                Util.sexp.toHex(c2.solution)
            ).to.equal("824242");
        });

        it("Does not modify solution if it is not valid", () => {
            const c = new StandardCoin({
                solution: SExp.to([1, 2, 3, 4])
            });
            const c2 = c.addConditionsToSolution([SExp.FALSE, SExp.TRUE]);

            expect(
                Util.sexp.toHex(c2.solution)
            ).to.equal("ff01ff02ff03ff0480");
        });

        it("Does not modify solution if it is not valid (#2)", () => {
            const c = new StandardCoin({
                solution: SExp.to([1, 2, 3])
            });
            const c2 = c.addConditionsToSolution([SExp.FALSE, SExp.TRUE]);

            expect(
                Util.sexp.toHex(c2.solution)
            ).to.equal("ff01ff02ff0380");
        });

        it("Works", () => {
            const initialConds = [SExp.TRUE, SExp.TRUE];
            const condsToAdd = [SExp.FALSE, SExp.TRUE, SExp.TRUE];
            const finalConds = [...initialConds, ...condsToAdd];

            const c = new StandardCoin({
                solution: Util.sexp.standardCoinSolution(initialConds)
            });
            const c2 = c.addConditionsToSolution(condsToAdd);

            expect(
                Util.sexp.toHex(c.solution)
            ).to.equal(
                Util.sexp.toHex(Util.sexp.standardCoinSolution(initialConds)),
            );
            expect(
                Util.sexp.toHex(c2.solution)
            ).to.equal(
                Util.sexp.toHex(Util.sexp.standardCoinSolution(finalConds)),
            );
        });
    });
});