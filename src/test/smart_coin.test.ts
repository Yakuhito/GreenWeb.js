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
    const TEST_COIN_PUZZLE = Util.sexp.fromHex("ff04ff02ff8080");
    const TEST_COIN_SOLUTION = Util.sexp.fromHex("80"); // ()

    const TEST_COIN = new Coin();
    TEST_COIN.amount = 1337;
    TEST_COIN.parentCoinInfo = "01".repeat(32);
    TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_COIN_PUZZLE);

    describe("constructor", () => {
        for(let i = 0; i < 16; ++i) {
            const giveParentCoinInfo = i % 2 === 1;
            const givePuzzleHash = Math.floor(i / 2) % 2 === 1;
            const giveAmount = Math.floor(i / 4) % 2 === 1;
            const givePuzzle = Math.floor(i / 8) % 2 === 1;
            let message =  "Correctly constructs coin (";

            if(giveParentCoinInfo) {
                message += "parentCoinInfo, ";
            }
            if(givePuzzleHash) {
                message += "puzzleHash, ";
            }
            if(giveAmount) {
                message += "amount, ";
            }
            if(givePuzzle) {
                message += "puzzle, ";
            }
            if(i === 0) {
                message += "no args given)";
            } else {
                message = message.slice(0, -2) + ")";
            }

            it(message, () => {
                const constructorArgs: any = {};
                if(giveParentCoinInfo) {
                    constructorArgs.parentCoinInfo = TEST_COIN.parentCoinInfo;
                }
                if(givePuzzleHash) {
                    constructorArgs.puzzleHash = TEST_COIN.puzzleHash;
                }
                if(giveAmount) {
                    constructorArgs.amount = TEST_COIN.amount;
                }
                if(givePuzzle) {
                    constructorArgs.puzzle = TEST_COIN_PUZZLE;
                }

                const sc = new SmartCoin(constructorArgs);
                if(giveParentCoinInfo) {
                    expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
                } else {
                    expect(sc.parentCoinInfo).to.be.null;
                }
                if(givePuzzleHash || givePuzzle) {
                    expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
                } else {
                    expect(sc.puzzleHash).to.be.null;
                }
                if(giveAmount) {
                    expect(sc.amount?.toString()).to.equal(TEST_COIN.amount.toString());
                } else {
                    expect(sc.amount).to.be.null;
                }
                if(givePuzzle) {
                    expect(Util.sexp.toHex(sc.puzzle ?? SExp.to([]))).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
                } else {
                    expect(sc.puzzle).to.be.null;
                }
            });
        }

        it("Correctly overwrites wrong puzzleHash if given puzzle", () => {
            const sc = new SmartCoin({
                puzzleHash: "00".repeat(32),
                puzzle: TEST_COIN_PUZZLE
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });
    });

    describe("fromCoin()", () => {
        it("Works if only given a coin", () => {
            const sc: SmartCoin = SmartCoin.fromCoin(TEST_COIN);

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.amount?.toString()).to.equal(TEST_COIN.amount.toString());
            expect(sc.puzzle).to.be.null;
        });

        it("Works if only given a puzzle", () => {
            const sc: SmartCoin = SmartCoin.fromCoin(null, TEST_COIN_PUZZLE);

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.amount).to.be.null;
            expect(Util.sexp.toHex(sc.puzzle)).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
        });

        it("Works if given a coin and a puzzle", () => {
            const sc: SmartCoin = SmartCoin.fromCoin(TEST_COIN, TEST_COIN_PUZZLE);

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.amount?.toString()).to.equal(TEST_COIN.amount.toString());
            expect(Util.sexp.toHex(sc.puzzle)).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
        });

        it("Correctly overwrites wrong puzzleHash if given puzzle", () => {
            const c = new Coin();
            c.amount = TEST_COIN.amount;
            c.parentCoinInfo = TEST_COIN.parentCoinInfo;
            c.puzzleHash = "00".repeat(32);

            const sc: SmartCoin = SmartCoin.fromCoin(c, TEST_COIN_PUZZLE);

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.amount?.toString()).to.equal(TEST_COIN.amount.toString());
            expect(Util.sexp.toHex(sc.puzzle)).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
        });
    });

    describe("setParentCoinInfo()", () => {
        it("Correctly sets parentCoinInfo", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN);
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            sc.setParentCoinInfo(TEST_VAL);
            expect(sc.parentCoinInfo).to.equal(TEST_VAL);
        });
    });

    describe("setPuzzleHash()", () => {
        it("Correctly sets puzzleHash if puzzle is not set", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN);
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            sc.setPuzzleHash(TEST_VAL);
            expect(sc.puzzleHash).to.equal(TEST_VAL);
        });

        it("Doesn't overwrite puzzleHash if puzzle is set", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN, TEST_COIN_PUZZLE);
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            sc.setPuzzleHash(TEST_VAL);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });
    });

    describe("setAmount()", () => {
        it("Correctly sets amount", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN);
            const TEST_VAL = BigNumber.from(TEST_COIN.amount).add(7);

            expect(
                TEST_VAL.eq(TEST_COIN.amount)
            ).to.be.false;
            expect(sc.amount?.toString()).to.equal(TEST_COIN.amount.toString());
            sc.setAmount(TEST_VAL);
            expect(sc.amount?.toString()).to.equal(TEST_VAL.toString());
        });
    });

    describe("setPuzzle()", () => {
        it("Correctly sets puzzle and updates puzzleHash", () => {
            const c = new Coin();
            c.amount = TEST_COIN.amount;
            c.parentCoinInfo = TEST_COIN.parentCoinInfo;
            c.puzzleHash = "00".repeat(32);

            const sc = SmartCoin.fromCoin(c);

            expect(sc.puzzleHash).to.equal("00".repeat(32));
            expect(sc.puzzle).to.be.null;
            
            sc.setPuzzle(TEST_COIN_PUZZLE);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(Util.sexp.toHex(sc.puzzle)).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
        });
    });

    describe("toCoin()", () => {
        it("Returns null if SmartCoin doesn't have coin info", () => {
            const sc = SmartCoin.fromCoin(null, TEST_COIN_PUZZLE);

            expect(sc.toCoin()).to.be.null;
        });

        it("Works if coin info is available", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN, TEST_COIN_PUZZLE);

            const c = sc.toCoin();
            expect(c?.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(c?.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(c?.amount.toString()).to.equal(TEST_COIN.amount.toString());
        });
    });

    describe("spend()", () => {
        it("Returns null if puzzle is not available", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN);

            expect(sc.spend(TEST_COIN_SOLUTION)).to.be.null;
        });

        it("Returns null if coin info is not available", () => {
            const sc = SmartCoin.fromCoin(null, TEST_COIN_PUZZLE);

            expect(sc.spend(TEST_COIN_SOLUTION)).to.be.null;
        });

        it("Works if coin info and puzzle are available", () => {
            const sc = SmartCoin.fromCoin(TEST_COIN, TEST_COIN_PUZZLE);

            const spendBundle = sc.spend(TEST_COIN_SOLUTION);
            expect(spendBundle).to.not.be.null;
            expect(
                Util.sexp.toHex(spendBundle?.puzzleReveal)
            ).to.equal(Util.sexp.toHex(TEST_COIN_PUZZLE));
            expect(Util.sexp.toHex(spendBundle?.solution)).to.equal(Util.sexp.toHex(TEST_COIN_SOLUTION));

            const c = spendBundle?.coin;
            expect(c?.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(c?.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(c?.amount.toString()).to.equal(TEST_COIN.amount.toString());
        });
    });

    const methods = ["getId()", "getName()"];
    for(let i = 0; i < methods.length; ++i) {
        describe(methods[i], () => {
            it("Returns null if coin info is not available", () => {
                const sc = SmartCoin.fromCoin(null, TEST_COIN_PUZZLE);

                const result = i === 0 ? sc.getId() : sc.getName();
                expect(result).to.be.null;
            });

            it("Works correctly if coin info is available", () => {
                const sc = SmartCoin.fromCoin(TEST_COIN);

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
            const sc = SmartCoin.fromCoin(null, PROGRAM);
            const newSc = sc.curry(ARGS);

            expect(newSc).to.not.be.null;
            expect(newSc?.toCoin()).to.be.null;
            expect(newSc?.parentCoinInfo).to.be.null;
            expect(newSc?.amount).to.be.null;
            expect(
                Util.sexp.toHex(newSc?.puzzle)
            ).to.equal(CURRIED_PROGRAM_HEX);
        });

        it("Works if coin info is set", () => {
            const c = new Coin();
            c.amount = 1337;
            c.puzzleHash = "11".repeat(32);
            c.parentCoinInfo = "22".repeat(32);

            const sc = SmartCoin.fromCoin(c, PROGRAM);
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

            const sc = SmartCoin.fromCoin(c);
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
            const sc = SmartCoin.fromCoin(
                null,
                Util.sexp.fromHex("ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b08ea8d21d93ee454c302d0bb3865a819a04030697e4541ba4c6bce9ca35c6c3186b8286af2765c5f472cd53128c7b5af7ff018080")
            );

            expect(sc.puzzleHash).to.equal("ef08849a943832f633f472962b36ff0e949e27b044bd3b82a4c7ef3ec36435a7");
        });

        it("Correctly calculates the coin's id", () => {
            const c = new Coin();
            c.parentCoinInfo = "9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84";
            c.amount = 1394;
            c.puzzleHash = "ef08849a943832f633f472962b36ff0e949e27b044bd3b82a4c7ef3ec36435a7";

            const sc = SmartCoin.fromCoin(c);

            expect(sc.getId()).to.equal("1cc5ca8441d8c37ef7be224cbc5b24acb83da17970a4652ad0788d6f29e0846e");
        });
    });
});