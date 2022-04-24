/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { op_sha256 } from "clvm";
import { SmartCoin } from "../smart_coin";
import { Util } from "../util";
import { Coin } from "../xch/providers/provider_types";
import { _SExpFromSerialized } from "./xch/providers/private_key/sign_utils.test";

describe("SmartCoin", () => {
    /*
    (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod (conditions) (list conditions))'
    (c 2 ())
    (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(c 2 ())'
    ff04ff02ff8080
    */
    const TEST_COIN_PUZZLE = _SExpFromSerialized("ff04ff02ff8080");
    const TEST_COIN_SOLUTION = _SExpFromSerialized("80"); // ()

    const TEST_COIN = new Coin();
    TEST_COIN.amount = 1337;
    TEST_COIN.parentCoinInfo = "01".repeat(32);
    TEST_COIN.puzzleHash = "a8d5dd63fba471ebcb1f3e8f7c1e1879b7152a6e7298a91ce119a63400ade7c5"; //todo

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
                    expect(sc.puzzle?.as_bin().hex()).to.equal(TEST_COIN_PUZZLE.as_bin().hex());
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
            expect(sc.puzzle?.as_bin().hex()).to.equal(TEST_COIN_PUZZLE.as_bin().hex());
        });

        it("Works if given a coin and a puzzle", () => {
            const sc: SmartCoin = SmartCoin.fromCoin(TEST_COIN, TEST_COIN_PUZZLE);

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.amount?.toString()).to.equal(TEST_COIN.amount.toString());
            expect(sc.puzzle?.as_bin().hex()).to.equal(TEST_COIN_PUZZLE.as_bin().hex());
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
            expect(sc.puzzle?.as_bin().hex()).to.equal(TEST_COIN_PUZZLE.as_bin().hex());
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
            expect(sc.puzzle?.as_bin().hex()).to.equal(TEST_COIN_PUZZLE.as_bin().hex());
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
            expect(spendBundle?.puzzleReveal.as_bin().hex()).to.equal(TEST_COIN_PUZZLE.as_bin().hex());
            expect(spendBundle?.solution.as_bin().hex()).to.equal(TEST_COIN_SOLUTION.as_bin().hex());

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

    //todo: test with real coin
});