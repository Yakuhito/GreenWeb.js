/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { SExp } from "clvm";
import { SmartCoin } from "../smart_coin";
import { Util } from "../util";
import { Coin } from "../xch/providers/provider_types";

describe("SmartCoin", () => {
    /*
    (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod (conditions) (list conditions))'
    (c 2 ())
    (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(c 2 ())'
    ff04ff02ff8080
    */
    const TEST_COIN_PUZZLE_STR = "ff04ff02ff8080";
    const TEST_COIN_PUZZLE = Util.sexp.fromHex(TEST_COIN_PUZZLE_STR);
    const TEST_COIN_SOLUTION_STR = "80"; // {}
    const TEST_COIN_SOLUTION = Util.sexp.fromHex(TEST_COIN_SOLUTION_STR); // ()

    const TEST_COIN = new Coin();
    TEST_COIN.amount = 1337;
    TEST_COIN.parentCoinInfo = "01".repeat(32);
    TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_COIN_PUZZLE);

    describe("constructor", () => {
        it("Works", () => {
            const sc = new SmartCoin({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                puzzle: TEST_COIN_PUZZLE,
                solution: TEST_COIN_SOLUTION
            });

            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_COIN_PUZZLE_STR);
            expect(
                Util.sexp.toHex(sc.solution)
            ).to.equal(TEST_COIN_SOLUTION_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const sc = new SmartCoin({});

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.solution).to.be.null;
        });

        it("Correctly sets values if given no arguments (#2)", () => {
            const sc = new SmartCoin();

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.solution).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const sc = new SmartCoin({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                puzzle: undefined,
                solution: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.solution).to.be.null;
        });

        it("Prefers coin to parentCoinInfo / puzzleHash / amount", () => {
            const sc = new SmartCoin({
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

        it("Correctly overwrites wrong puzzleHash if given puzzle", () => {
            const sc = new SmartCoin({
                puzzleHash: "00".repeat(32),
                puzzle: TEST_COIN_PUZZLE
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });
    });

    describe("copyWith()", () => {
        it("Works", () => {
            const sc = new SmartCoin().copyWith({
                amount: TEST_COIN.amount,
                puzzleHash: TEST_COIN.puzzleHash,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzle: TEST_COIN_PUZZLE,
                solution: TEST_COIN_SOLUTION
            });

            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_COIN_PUZZLE_STR);
            expect(
                Util.sexp.toHex(sc.solution)
            ).to.equal(TEST_COIN_SOLUTION_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const sc = new SmartCoin().copyWith({});

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.solution).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const sc = new SmartCoin().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                puzzle: undefined,
                solution: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.solution).to.be.null;
        });

        it("Prefers coin to parentCoinInfo / puzzleHash / amount", () => {
            const sc = new SmartCoin().copyWith({
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
    });

    describe("withParentCoinInfo()", () => {
        it("Correctly creates a new SmartCoin with modified parentCoinInfo", () => {
            const sc = new SmartCoin({coin: TEST_COIN});
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            const sc2 = sc.withParentCoinInfo(TEST_VAL);
            expect(sc2.parentCoinInfo).to.equal(TEST_VAL);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new SmartCoin({coin: TEST_COIN});
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            sc.withParentCoinInfo(TEST_VAL);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });
    });

    describe("withPuzzleHash()", () => {
        it("Correctly creates a new SmartCoin with modified puzzleHash and no puzzle", () => {
            const sc = new SmartCoin({
                coin: TEST_COIN,
                puzzle: TEST_COIN_PUZZLE
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            const sc2 = sc.withPuzzleHash(TEST_VAL);
            expect(sc2.puzzleHash).to.equal(TEST_VAL);
            expect(sc2.puzzle).to.be.null;
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new SmartCoin({
                coin: TEST_COIN,
                puzzle: TEST_COIN_PUZZLE
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            sc.withPuzzleHash(TEST_VAL);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_COIN_PUZZLE_STR);
        });
    });

    describe("withAmount()", () => {
        it("Correctly creates a new SmartCoin with modified amount", () => {
            const sc = new SmartCoin({coin: TEST_COIN});
            const TEST_VAL = BigNumber.from(1338);

            expect(TEST_VAL.eq(TEST_COIN.amount)).to.be.false;
            const sc2 = sc.withAmount(TEST_VAL);
            expect(sc2.amount?.eq(TEST_VAL)).to.be.true;
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new SmartCoin({coin: TEST_COIN});
            const TEST_VAL = BigNumber.from(1338);

            expect(TEST_VAL.eq(TEST_COIN.amount)).to.be.false;
            sc.withAmount(TEST_VAL);
            expect(sc.amount?.eq(TEST_VAL)).to.be.false;
        });
    });

    describe("withPuzzle()", () => {
        it("Correctly creates a new SmartCoin with modified puzzle and puzzleHash", () => {
            const sc = new SmartCoin({
                puzzleHash: "00".repeat(32)
            });

            expect(sc.puzzleHash).to.not.equal(TEST_COIN.puzzleHash);
            const sc2 = sc.withPuzzle(TEST_COIN_PUZZLE);
            expect(sc2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc2.puzzle)
            ).to.equal(TEST_COIN_PUZZLE_STR);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new SmartCoin({
                puzzleHash: "00".repeat(32)
            });

            expect(sc.puzzleHash).to.not.equal(TEST_COIN.puzzleHash);
            sc.withPuzzle(TEST_COIN_PUZZLE);
            expect(sc.puzzleHash).to.not.equal(TEST_COIN.puzzleHash);
            expect(sc.puzzle).to.be.null;
        });
    });

    describe("withSolution()", () => {
        it("Correctly creates a new SmartCoin with modified solution", () => {
            const sc = new SmartCoin({
                solution: SExp.TRUE,
            });

            expect(
                Util.sexp.toHex(sc.solution)
            ).to.not.equal(TEST_COIN_SOLUTION_STR);
            const sc2 = sc.withSolution(TEST_COIN_SOLUTION);
            expect(
                Util.sexp.toHex(sc2.solution)
            ).to.equal(TEST_COIN_SOLUTION_STR);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new SmartCoin({
                solution: SExp.TRUE,
            });

            expect(
                Util.sexp.toHex(sc.solution)
            ).to.not.equal(TEST_COIN_SOLUTION_STR);
            sc.withSolution(TEST_COIN_SOLUTION);
            expect(
                Util.sexp.toHex(sc.solution)
            ).to.not.equal(TEST_COIN_SOLUTION_STR);
        });
    });

    describe("toCoin()", () => {
        it("Returns null if SmartCoin doesn't have coin info", () => {
            const sc = new SmartCoin({puzzle: TEST_COIN_PUZZLE});

            expect(sc.toCoin()).to.be.null;
        });

        it("Works if coin info is available", () => {
            const sc = new SmartCoin({coin: TEST_COIN, puzzle: TEST_COIN_PUZZLE});

            const c = sc.toCoin();
            expect(c?.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(c?.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(c?.amount.toString()).to.equal(TEST_COIN.amount.toString());
        });
    });

    describe("spend()", () => {
        it("Returns null if puzzle is not available", () => {
            const sc = new SmartCoin({coin: TEST_COIN, solution: TEST_COIN_SOLUTION});

            expect(sc.spend()).to.be.null;
        });

        it("Returns null if coin info is not available", () => {
            const sc = new SmartCoin({puzzle: TEST_COIN_PUZZLE, solution: TEST_COIN_SOLUTION});

            expect(sc.spend()).to.be.null;
        });

        it("Returns null if solution is not available", () => {
            const sc = new SmartCoin({coin: TEST_COIN, puzzle: TEST_COIN_PUZZLE});

            expect(sc.spend()).to.be.null;
        });

        it("Works if coin info and puzzle are available", () => {
            const sc = new SmartCoin({coin: TEST_COIN, puzzle: TEST_COIN_PUZZLE, solution: TEST_COIN_SOLUTION});

            const coinSpend = sc.spend();
            expect(coinSpend).to.not.be.null;
            expect(
                Util.sexp.toHex(coinSpend?.puzzleReveal)
            ).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
            expect(Util.sexp.toHex(coinSpend?.solution)).to.equal(Util.sexp.toHex(TEST_COIN_SOLUTION));

            const c = coinSpend?.coin;
            expect(c?.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(c?.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(c?.amount.toString()).to.equal(TEST_COIN.amount.toString());
        });
    });

    const methods = ["getId()", "getName()"];
    for(let i = 0; i < methods.length; ++i) {
        describe(methods[i], () => {
            it("Returns null if coin info is not available", () => {
                const sc = new SmartCoin({puzzle: TEST_COIN_PUZZLE});

                const result = i === 0 ? sc.getId() : sc.getName();
                expect(result).to.be.null;
            });

            it("Works correctly if coin info is available", () => {
                const sc = new SmartCoin({coin: TEST_COIN});

                const result = i === 0 ? sc.getId() : sc.getName();
                expect(result).to.equal(
                    Util.coin.getId(TEST_COIN)
                );
            });
        });
    }

    describe("curry()", () => {
        const PROGRAM = Util.sexp.fromHex("ff10ff02ff0580");
        const ARGS = [ Util.sexp.fromHex("07") ];
        const CURRIED_PROGRAM_HEX = "ff02ffff01ff10ff02ff0580ffff04ffff0107ff018080";

        it("Works if coin info is not set", () => {
            const sc = new SmartCoin({puzzle: PROGRAM, solution: TEST_COIN_SOLUTION});
            const newSc = sc.curry(ARGS);

            expect(newSc).to.not.be.null;
            expect(newSc?.toCoin()).to.be.null;
            expect(newSc?.parentCoinInfo).to.be.null;
            expect(newSc?.amount).to.be.null;
            expect(
                Util.sexp.toHex(newSc?.puzzle)
            ).to.equal(CURRIED_PROGRAM_HEX);
            expect(newSc?.solution).to.be.null;
        });

        it("Works if coin info is set", () => {
            const c = new Coin();
            c.amount = 1337;
            c.puzzleHash = "11".repeat(32);
            c.parentCoinInfo = "22".repeat(32);

            const sc = new SmartCoin({
                coin: c,
                puzzle: PROGRAM
            });
            const newSc = sc.curry(ARGS);

            expect(newSc).to.not.be.null;
            expect(newSc?.toCoin()).to.not.be.null;
            expect(newSc?.parentCoinInfo).to.equal(c.parentCoinInfo);
            expect(
                BigNumber.from(newSc?.amount).eq(c.amount)
            ).to.be.true;
            expect(newSc?.puzzleHash).to.not.be.null;
            expect(newSc?.puzzleHash).to.not.equal(c.puzzleHash);
            expect(
                Util.sexp.toHex(newSc?.puzzle)
            ).to.equal(CURRIED_PROGRAM_HEX);
        });

        it("Returns null if puzzle is not set", () => {
            const c = new Coin();
            c.amount = 1337;
            c.puzzleHash = "11".repeat(32);
            c.parentCoinInfo = "22".repeat(32);

            const sc = new SmartCoin({coin: c});
            const newSc = sc.curry(ARGS);

            expect(newSc).to.be.null;
        });
    });

    // https://www.chiaexplorer.com/blockchain/coin/0x8679275b9b69a13a17343f877b13914974d0f834f612d9cfc2ebd79c9ea12dce
    /*
    (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 (q 2 (i 11 (q 2 (i (= 5 (point_add 11 (pubkey_for_exp (sha256 11 (a 6 (c 2 (c 23 ()))))))) (q 2 23 47) (q 8)) 1) (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 23 ()))) ()))) (a 23 47))) 1) (c (q 50 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0x8ea8d21d93ee454c302d0bb3865a819a04030697e4541ba4c6bce9ca35c6c3186b8286af2765c5f472cd53128c7b5af7) 1))'
    ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b08ea8d21d93ee454c302d0bb3865a819a04030697e4541ba4c6bce9ca35c6c3186b8286af2765c5f472cd53128c7b5af7ff018080
    */
    describe("Real Coin", () => {
        it("Correctly calculates puzzleHash given puzzle", () => {
            const sc = new SmartCoin({
                puzzle: Util.sexp.fromHex("ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b08ea8d21d93ee454c302d0bb3865a819a04030697e4541ba4c6bce9ca35c6c3186b8286af2765c5f472cd53128c7b5af7ff018080")
            });

            expect(sc.puzzleHash).to.equal("ef08849a943832f633f472962b36ff0e949e27b044bd3b82a4c7ef3ec36435a7");
        });

        it("Correctly calculates the coin's id", () => {
            const c = new Coin();
            c.parentCoinInfo = "9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84";
            c.amount = 1394;
            c.puzzleHash = "ef08849a943832f633f472962b36ff0e949e27b044bd3b82a4c7ef3ec36435a7";

            const sc = new SmartCoin({coin: c});

            expect(sc.getId()).to.equal("1cc5ca8441d8c37ef7be224cbc5b24acb83da17970a4652ad0788d6f29e0846e");
        });
    });

    describe("isSpendable()", () => {
        it("Returns false if coin info is not available", () => {
            const sc = new SmartCoin({
                puzzle: TEST_COIN_PUZZLE,
                solution: TEST_COIN_SOLUTION
            });

            expect(sc.isSpendable()).to.be.false;
        });

        it("Returns false if coin info is incomplete", () => {
            const sc = new SmartCoin({
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                puzzle: TEST_COIN_PUZZLE,
                solution: TEST_COIN_SOLUTION
            });

            expect(sc.isSpendable()).to.be.false;
        });

        it("Returns false if puzzle is not available", () => {
            const sc = new SmartCoin({
                coin: TEST_COIN,
                solution: TEST_COIN_SOLUTION
            });

            expect(sc.isSpendable()).to.be.false;
        });

        it("Returns false if solution is not available", () => {
            const sc = new SmartCoin({
                coin: TEST_COIN,
                puzzle: TEST_COIN_PUZZLE
            });

            expect(sc.isSpendable()).to.be.false;
        });

        it("Works", () => {
            const sc = new SmartCoin({
                coin: TEST_COIN,
                puzzle: TEST_COIN_PUZZLE,
                solution: TEST_COIN_SOLUTION
            });

            expect(sc.isSpendable()).to.be.true;
        });
    });
});