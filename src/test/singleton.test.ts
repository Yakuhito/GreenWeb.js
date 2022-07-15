/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { initializeBLS, SExp } from "clvm";
import { LineageProof } from "../cat";
import { Singleton } from "../singleton";
import { Util } from "../util";
import { bytes, Coin } from "../xch/providers/provider_types";

describe.only("Singleton", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    const TEST_LAUNCHER_ID = "77".repeat(32);
    const TEST_LINEAGE_RPOOF: LineageProof = {
        parentName: "11".repeat(32),
        innerPuzzleHash: "22".repeat(32),
        amount: 8888
    };

    let TEST_INNER_PUZZLE: SExp;
    let TEST_INNER_PUZZLE_STR: bytes;
    let TEST_INNER_SOLUTION: SExp;
    let TEST_INNER_SOLUTION_STR: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_SOLUTION: SExp;
    let TEST_SOLUTION_STR: bytes;
    let TEST_COIN: Coin;
    
    
    beforeEach(async () => {
        await initializeBLS();
        const privKey = Util.key.hexToPrivateKey(TEST_PRIV_KEY_STR);
        const g1Elem = privKey.get_g1();
        
        TEST_INNER_PUZZLE = Util.sexp.standardCoinPuzzle(g1Elem);
        TEST_INNER_PUZZLE_STR = Util.sexp.toHex(TEST_INNER_PUZZLE);
        TEST_INNER_SOLUTION = Util.sexp.standardCoinSolution([]);
        TEST_INNER_SOLUTION_STR = Util.sexp.toHex(TEST_INNER_SOLUTION);

        TEST_PUZZLE = Util.sexp.singletonPuzzle(
            TEST_LAUNCHER_ID, TEST_INNER_PUZZLE
        );
        TEST_PUZZLE_STR = Util.sexp.toHex(TEST_PUZZLE);

        TEST_COIN = new Coin();
        TEST_COIN.amount = 1234567;
        TEST_COIN.parentCoinInfo = "04".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_PUZZLE);

        TEST_SOLUTION = Util.sexp.singletonSolution(
            SExp.to([
                Util.sexp.bytesToAtom(TEST_LINEAGE_RPOOF.parentName ?? ""),
                Util.sexp.bytesToAtom(TEST_LINEAGE_RPOOF.innerPuzzleHash ?? ""),
                Util.sexp.bytesToAtom(Util.coin.amountToBytes(TEST_LINEAGE_RPOOF.amount ?? 0)),
            ]),
            TEST_COIN.amount,
            TEST_INNER_SOLUTION
        );
        TEST_SOLUTION_STR = Util.sexp.toHex(TEST_SOLUTION)
    });

    describe("constructor", () => {
        it("Works", () => {
            const singleton = new Singleton({
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                amount: TEST_COIN.amount,
                launcherId: TEST_LAUNCHER_ID,
                innerPuzzle: TEST_INNER_PUZZLE,
                lineageProof: TEST_LINEAGE_RPOOF,
                innerSolution: TEST_INNER_SOLUTION
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(
                singleton.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(singleton.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(singleton.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(singleton.innerPuzzle)
            ).to.equal(TEST_INNER_PUZZLE_STR);
            expect(singleton.innerPuzzleHash).to.equal(
                Util.sexp.sha256tree(TEST_INNER_PUZZLE)
            );
            expect(
                BigNumber.from(singleton.lineageProof?.amount ?? 0).eq(TEST_LINEAGE_RPOOF.amount ?? -1)
            ).to.be.true;
            expect(
                singleton.lineageProof?.innerPuzzleHash
            ).to.equal(TEST_LINEAGE_RPOOF.innerPuzzleHash);
            expect(
                singleton.lineageProof?.parentName
            ).to.equal(TEST_LINEAGE_RPOOF.parentName);
            expect(
                Util.sexp.toHex(singleton.innerSolution)
            ).to.equal(TEST_INNER_SOLUTION_STR);

            expect(
                Util.sexp.toHex(singleton.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(
                Util.sexp.toHex(singleton.solution)
            ).to.equal(TEST_SOLUTION_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const singleton = new Singleton({});

            expect(singleton.parentCoinInfo).to.be.null;
            expect(singleton.puzzleHash).to.be.null;
            expect(singleton.amount).to.be.null;
            expect(singleton.innerPuzzle).to.be.null;
            expect(singleton.innerPuzzleHash).to.be.null;
            expect(singleton.lineageProof).to.be.null;
            expect(singleton.innerSolution).to.be.null;
            expect(singleton.puzzle).to.be.null;
            expect(singleton.solution).to.be.null;
        });

        it("Correctly sets values if given no arguments (#2)", () => {
            const singleton = new Singleton();

            expect(singleton.parentCoinInfo).to.be.null;
            expect(singleton.puzzleHash).to.be.null;
            expect(singleton.amount).to.be.null;
            expect(singleton.innerPuzzle).to.be.null;
            expect(singleton.innerPuzzleHash).to.be.null;
            expect(singleton.lineageProof).to.be.null;
            expect(singleton.innerSolution).to.be.null;
            expect(singleton.puzzle).to.be.null;
            expect(singleton.solution).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const singleton = new Singleton({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                launcherId: undefined,
                innerPuzzle: undefined,
                lineageProof: undefined,
                innerSolution: undefined
            });

            expect(singleton.parentCoinInfo).to.be.null;
            expect(singleton.puzzleHash).to.be.null;
            expect(singleton.amount).to.be.null;
            expect(singleton.innerPuzzle).to.be.null;
            expect(singleton.innerPuzzleHash).to.be.null;
            expect(singleton.lineageProof).to.be.null;
            expect(singleton.innerSolution).to.be.null;
            expect(singleton.puzzle).to.be.null;
            expect(singleton.solution).to.be.null;
        });

        it("Correctly sets puzzle if given launcherId and innerPuzzle", () => {
            const singleton = new Singleton({
                launcherId: TEST_LAUNCHER_ID,
                innerPuzzle: TEST_INNER_PUZZLE
            });

            expect(
                Util.sexp.toHex(singleton.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Converts LineageProof amount to BigNumber", () => {
            const lp: LineageProof = {
                amount: "0x42"
            };

            const singleton = new Singleton({
                lineageProof: lp
            });
            
            expect(
                singleton.lineageProof?.amount instanceof BigNumber
            ).to.be.true;
            expect(
                (singleton.lineageProof?.amount as BigNumber).toNumber()
            ).to.equal(0x42);
        });

        it("Sets LineageProof amount to null when it is 'undefined'", () => {
            const lp: LineageProof = {
                amount: undefined
            };

            const singleton = new Singleton({
                lineageProof: lp
            });
            
            expect(singleton.lineageProof?.amount).to.be.null;
        });

        it("Sets LineageProof amount to null when it is 'null'", () => {
            const lp: LineageProof = {
                amount: null
            };

            const singleton = new Singleton({
                lineageProof: lp
            });
            
            expect(singleton.lineageProof?.amount).to.be.null;
        });

        it("Correctly constructs solution for Eve spend", () => {
            const lp: LineageProof = {
                parentName: TEST_LINEAGE_RPOOF.parentName,
                amount: TEST_LINEAGE_RPOOF.amount
            };

            const singleton = new Singleton({
                coin: TEST_COIN,
                lineageProof: lp,
                innerSolution: TEST_INNER_SOLUTION
            });

            expect(
                Util.sexp.toHex(singleton.solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.singletonSolution(
                        SExp.to([
                            Util.sexp.bytesToAtom(lp.parentName ?? ""),
                            Util.sexp.bytesToAtom(Util.coin.amountToBytes(lp.amount ?? 0))
                        ]),
                        TEST_COIN.amount,
                        TEST_INNER_SOLUTION
                    )
                )
            );
        });
    });

    describe("copyWith()", () => {
        it("Works", () => {
            const singleton = new Singleton().copyWith({
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                amount: TEST_COIN.amount,
                launcherId: TEST_LAUNCHER_ID,
                innerPuzzle: TEST_INNER_PUZZLE,
                lineageProof: TEST_LINEAGE_RPOOF,
                innerSolution: TEST_INNER_SOLUTION
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(
                singleton.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(singleton.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(singleton.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(singleton.innerPuzzle)
            ).to.equal(TEST_INNER_PUZZLE_STR);
            expect(singleton.innerPuzzleHash).to.equal(
                Util.sexp.sha256tree(TEST_INNER_PUZZLE)
            );
            expect(
                BigNumber.from(singleton.lineageProof?.amount ?? 0).eq(TEST_LINEAGE_RPOOF.amount ?? -1)
            ).to.be.true;
            expect(
                singleton.lineageProof?.innerPuzzleHash
            ).to.equal(TEST_LINEAGE_RPOOF.innerPuzzleHash);
            expect(
                singleton.lineageProof?.parentName
            ).to.equal(TEST_LINEAGE_RPOOF.parentName);
            expect(
                Util.sexp.toHex(singleton.innerSolution)
            ).to.equal(TEST_INNER_SOLUTION_STR);

            expect(
                Util.sexp.toHex(singleton.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(
                Util.sexp.toHex(singleton.solution)
            ).to.equal(TEST_SOLUTION_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const singleton = new Singleton().copyWith({});

            expect(singleton.parentCoinInfo).to.be.null;
            expect(singleton.puzzleHash).to.be.null;
            expect(singleton.amount).to.be.null;
            expect(singleton.innerPuzzle).to.be.null;
            expect(singleton.innerPuzzleHash).to.be.null;
            expect(singleton.lineageProof).to.be.null;
            expect(singleton.innerSolution).to.be.null;
            expect(singleton.puzzle).to.be.null;
            expect(singleton.solution).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const singleton = new Singleton().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                launcherId: undefined,
                innerPuzzle: undefined,
                lineageProof: undefined,
                innerSolution: undefined
            });

            expect(singleton.parentCoinInfo).to.be.null;
            expect(singleton.puzzleHash).to.be.null;
            expect(singleton.amount).to.be.null;
            expect(singleton.innerPuzzle).to.be.null;
            expect(singleton.innerPuzzleHash).to.be.null;
            expect(singleton.lineageProof).to.be.null;
            expect(singleton.innerSolution).to.be.null;
            expect(singleton.puzzle).to.be.null;
            expect(singleton.solution).to.be.null;
        });
    });

    describe("withParentCoinInfo()", () => {
        it("Returns a new Singleton with modified parentCoinInfo", () => {
            const s = new Singleton();
            expect(s.parentCoinInfo).to.be.null;

            const s2 = s.withParentCoinInfo(TEST_COIN.parentCoinInfo)
            expect(s.parentCoinInfo).to.be.null;
            expect(s2.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });
    });
    
    describe("withPuzzleHash()", () => {
        it("Returns a new Singleton with modified puzzleHash", () => {
            const s = new Singleton();
            expect(s.puzzleHash).to.be.null;

            const s2 = s.withPuzzleHash(TEST_COIN.puzzleHash)
            expect(s.puzzleHash).to.be.null;
            expect(s2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });
    });

    describe("withAmount()", () => {
        it("Returns a new Singleton with modified amount", () => {
            const s = new Singleton();
            expect(s.amount).to.be.null;

            const s2 = s.withAmount(TEST_COIN.amount)
            expect(s.amount).to.be.null;
            expect(
                BigNumber.from(s2.amount).eq(TEST_COIN.amount)
            ).to.be.true;
        });
    });

    describe("withLauncherId()", () => {
        it("Returns a new Singleton with modified launcherId", () => {
            const s = new Singleton();
            expect(s.launcherId).to.be.null;

            const s2 = s.withLauncherId(TEST_LAUNCHER_ID)
            expect(s.launcherId).to.be.null;
            expect(s2.launcherId).to.equal(TEST_LAUNCHER_ID);
        });
    });

    describe("withInnerPuzzle()", () => {
        it("Returns a new Singleton with modified innerPuzzle", () => {
            const s = new Singleton();
            expect(s.innerPuzzle).to.be.null;

            const s2 = s.withInnerPuzzle(TEST_INNER_PUZZLE)
            expect(s.innerPuzzle).to.be.null;
            expect(
                Util.sexp.toHex(s2.innerPuzzle)
            ).to.equal(TEST_INNER_PUZZLE_STR);
        });
    });

    describe("withLineageProof()", () => {
        it("Returns a new Singleton with modified lineageProof", () => {
            const s = new Singleton();
            expect(s.lineageProof).to.be.null;

            const s2 = s.withLineageProof(TEST_LINEAGE_RPOOF)
            expect(s.lineageProof).to.be.null;
            expect(
                BigNumber.from(s2.lineageProof?.amount).eq(TEST_LINEAGE_RPOOF.amount ?? 0)
            ).to.be.true;
            expect(
                s2.lineageProof?.innerPuzzleHash
            ).to.equal(TEST_LINEAGE_RPOOF.innerPuzzleHash);
            expect(
                s2.lineageProof?.parentName
            ).to.equal(TEST_LINEAGE_RPOOF.parentName);
        });
    });

    describe("withInnerSolution()", () => {
        it("Returns a new Singleton with modified innerSolution", () => {
            const s = new Singleton();
            expect(s.innerSolution).to.be.null;

            const s2 = s.withInnerSolution(TEST_INNER_SOLUTION)
            expect(s.innerSolution).to.be.null;
            expect(
                Util.sexp.toHex(s2.innerSolution)
            ).to.equal(TEST_INNER_SOLUTION_STR);
        });
    });

    describe("getPayToPuzzleHash()", () => {
        it("Returns 'null' if launcherId is not available", () => {
            const s = new Singleton();
            expect(s.getPayToPuzzleHash()).to.be.null;
        });

        it("Returns correct value when launcherId is available", () => {
            const s = new Singleton({ launcherId: TEST_LAUNCHER_ID });

            expect(s.getPayToPuzzleHash()).to.equal(
                Util.sexp.sha256tree(
                    Util.sexp.payToSingletonPuzzle(TEST_LAUNCHER_ID)
                )
            );
        });
    });

    describe("getPayToAddress()", () => {
        it("Returns 'null' if launcherId is not available", () => {
            const s = new Singleton();
            expect(s.getPayToAddress()).to.be.null;
        });

        it("Returns correct value when launcherId is available", () => {
            const s = new Singleton({ launcherId: TEST_LAUNCHER_ID });

            expect(s.getPayToAddress()).to.equal(
                Util.address.puzzleHashToAddress(
                    Util.sexp.sha256tree(
                        Util.sexp.payToSingletonPuzzle(TEST_LAUNCHER_ID)
                    )
                )
            );
        });
    });
});