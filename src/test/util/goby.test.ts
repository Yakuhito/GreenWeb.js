/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { SExp } from "clvm";
import { Util } from "../../util";
import { GobyUtil } from "../../util/goby";
import { CoinSpend } from "../../util/serializer/types/coin_spend";
import { SpendBundle } from "../../util/serializer/types/spend_bundle";
import { Coin } from "../../xch/providers/provider_types";

const gobyUtil = new GobyUtil();

describe("GobyUtil", () => {
    const PARENT_COIN_INFO1 = "parentcoininfo1";
    const PUZZLE_HASH1 = "puzzlehash1";
    const AMOUNT1 = 13337;
    const PUZZLE_REVEAL1 = SExp.to(["puzzlereveal1"]);
    const SOLUTION1 = SExp.to(["solution1"]);

    const PARENT_COIN_INFO2 = "parentcoininfo2";
    const PUZZLE_HASH2 = "puzzlehash2";
    const AMOUNT2 = 42069;
    const PUZZLE_REVEAL2 = SExp.to(["puzzlereveal2"]);
    const SOLUTION2 = SExp.to(["solution2"]);

    const AGG_SIG = "aggsig";

    const coin1 = {
        parent_coin_info: PARENT_COIN_INFO1,
        puzzle_hash: PUZZLE_HASH1,
        amount: AMOUNT1
    };
    const coin2 = {
        parent_coin_info: PARENT_COIN_INFO2,
        puzzle_hash: PUZZLE_HASH2,
        amount: AMOUNT2
    }
    describe("parseGobyCoin()", () => {
        it("Works", () => {
            const c: Coin | null = gobyUtil.parseGobyCoin(coin1);

            expect(c).to.not.be.null;
            expect(c?.parentCoinInfo).to.equal(PARENT_COIN_INFO1);
            expect(c?.puzzleHash).to.equal(PUZZLE_HASH1);
            expect(
                BigNumber.from(c?.amount).eq(AMOUNT1)
            ).to.be.true;
        });

        it("Returns null when parameter can't be convered to Coin", () => {
            const c: Coin | null = gobyUtil.parseGobyCoin({});

            expect(c).to.be.null;
        });
    });

    const coinSpend1 = {
        coin: coin1,
        puzzle_reveal: PUZZLE_REVEAL1,
        solution: SOLUTION1
    };
    const coinSpend2 = {
        coin: coin2,
        puzzle_reveal: PUZZLE_REVEAL2,
        solution: SOLUTION2
    };
    describe("parseGobyCoinSpend()", () => {
        it("Works", () => {
            const cs: CoinSpend | null = gobyUtil.parseGobyCoinSpend(coinSpend1);

            expect(cs).to.not.be.null;
            expect(
                Util.sexp.toHex(cs?.puzzleReveal)
            ).to.equal(Util.sexp.toHex(PUZZLE_REVEAL1));
            expect(
                Util.sexp.toHex(cs?.solution)
            ).to.equal(Util.sexp.toHex(SOLUTION1));
            const c = cs?.coin;
            expect(c?.parentCoinInfo).to.equal(PARENT_COIN_INFO1);
            expect(c?.puzzleHash).to.equal(PUZZLE_HASH1);
            expect(
                BigNumber.from(c?.amount).eq(AMOUNT1)
            ).to.be.true;
        });

        it("Returns null when parameter can't be convered to CoinSpend", () => {
            const cs: CoinSpend | null = gobyUtil.parseGobyCoinSpend({});

            expect(cs).to.be.null;
        });

        it("Returns null when parameter can't be convered to CoinSpend (coin)", () => {
            const cs: CoinSpend | null = gobyUtil.parseGobyCoinSpend({
                puzzle_reveal: PUZZLE_REVEAL1,
                solution: SOLUTION1
            });

            expect(cs).to.be.null;
        });

        it("Returns null is there is an error", () => {
            const cs: CoinSpend | null = gobyUtil.parseGobyCoinSpend(420);

            expect(cs).to.be.null;
        });
    });

    const spendBundle = {
        coin_spends: [coinSpend1, coinSpend2],
        aggregated_signature: AGG_SIG,
    }

    describe("parseGobySpendBundle()", () => {
        it("Works", () => {
            const sb: SpendBundle | null = gobyUtil.parseGobySpendBundle(spendBundle);

            expect(sb).to.not.be.null;
            expect(sb?.aggregatedSignature).to.equal(AGG_SIG);
            expect(sb?.coinSpends.length).to.equal(2);

            const cs1 = sb?.coinSpends[0];
            expect(
                Util.sexp.toHex(cs1?.puzzleReveal)
            ).to.equal(Util.sexp.toHex(PUZZLE_REVEAL1));
            expect(
                Util.sexp.toHex(cs1?.solution)
            ).to.equal(Util.sexp.toHex(SOLUTION1));
            const c1 = cs1?.coin;
            expect(c1?.parentCoinInfo).to.equal(PARENT_COIN_INFO1);
            expect(c1?.puzzleHash).to.equal(PUZZLE_HASH1);
            expect(
                BigNumber.from(c1?.amount).eq(AMOUNT1)
            ).to.be.true;

            const cs2 = sb?.coinSpends[1];
            expect(
                Util.sexp.toHex(cs2?.puzzleReveal)
            ).to.equal(Util.sexp.toHex(PUZZLE_REVEAL2));
            expect(
                Util.sexp.toHex(cs2?.solution)
            ).to.equal(Util.sexp.toHex(SOLUTION2));
            const c2 = cs2?.coin;
            expect(c2?.parentCoinInfo).to.equal(PARENT_COIN_INFO2);
            expect(c2?.puzzleHash).to.equal(PUZZLE_HASH2);
            expect(
                BigNumber.from(c2?.amount).eq(AMOUNT2)
            ).to.be.true;
        });
        
        it("Returns null when parameter can't be convered to SpendBundle", () => {
            const sb: SpendBundle | null = gobyUtil.parseGobySpendBundle({});
    
            expect(sb).to.be.null;
        });
    
        it("Returns null when parameter can't be convered to SpendBundle (coinSpend)", () => {
            const sb: SpendBundle | null = gobyUtil.parseGobySpendBundle({
                aggregated_signature: AGG_SIG,
            });
    
            expect(sb).to.be.null;
        });
    
        it("Returns null when parameter can't be convered to SpendBundle (coin)", () => {
            const sb: SpendBundle | null = gobyUtil.parseGobySpendBundle({
                aggregated_signature: AGG_SIG,
                coin_spends: [
                    {
                        puzzle_reveal: PUZZLE_REVEAL1,
                        solution: SOLUTION1
                    },
                ],
            });
    
            expect(sb).to.be.null;
        });
    });
});