/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Bytes, initializeBLS, SExp } from "clvm";
import { CAT, LineageProof } from "../cat";
import { Util } from "../util";
import { ConditionOpcode } from "../util/sexp/condition_opcodes";
import { bytes, Coin } from "../xch/providers/provider_types";


describe("CAT", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_SYNTH_KEY: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_CAT_PUZZLE: SExp;
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

        TEST_CAT_PUZZLE = Util.sexp.CATPuzzle(
            TEST_TAIL_HASH,
            TEST_PUZZLE
        );

        TEST_COIN = new Coin();
        TEST_COIN.amount = 1339;
        TEST_COIN.parentCoinInfo = "03".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_CAT_PUZZLE);
    });

    describe("constructor", () => {
        it("Works", () => {
            const cat = new CAT({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                TAILProgramHash: TEST_TAIL_HASH,
                publicKey: TEST_PUB_KEY,
                innerSolution: SExp.to([]),
                prevCoinId: "00".repeat(32),
                nextCoin: TEST_COIN,
                prevSubtotal: 1
            });

            expect(
                cat.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(cat.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(cat.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(cat.innerPuzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(cat.innerPuzzleHash).to.equal(
                Util.sexp.sha256tree(TEST_PUZZLE)
            );
            expect(cat.TAILProgramHash).to.equal(TEST_TAIL_HASH);
            expect(cat.syntheticKey).to.equal(TEST_SYNTH_KEY);
            expect(
                Util.sexp.toHex(cat.innerSolution)
            ).to.equal("80");
            expect(cat.prevCoinId).to.equal("00".repeat(32));
            expect(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                Util.coin.getId(cat.nextCoin!)
            ).to.equal(
                Util.coin.getId(TEST_COIN)
            );
            expect(
                BigNumber.from(cat.prevSubtotal).eq(1)
            ).to.be.true;
            expect(cat.extraDelta).to.be.null;
            expect(cat.TAILProgram).to.be.null;
            expect(cat.TAILSolution).to.be.null;
            expect(cat.lineageProof).to.be.null;
        });

        it("Correctly sets values if given no arguments", () => {
            const c = new CAT({});

            expect(c.parentCoinInfo).to.be.null;
            expect(c.puzzleHash).to.be.null;
            expect(c.amount).to.be.null;
            expect(c.puzzle).to.be.null;
            expect(c.TAILProgramHash).to.be.null;
            expect(c.innerPuzzle).to.be.null;
            expect(c.innerPuzzleHash).to.be.null;
            expect(c.syntheticKey).to.be.null;
            expect(c.innerSolution).to.be.null;
            expect(c.prevCoinId).to.be.null;
            expect(c.nextCoin).to.be.null;
            expect(c.prevSubtotal).to.be.null;
            expect(c.extraDelta).to.be.null;
            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
            expect(c.lineageProof).to.be.null;
        });

        it("Correctly sets values if given no arguments (#2)", () => {
            const c = new CAT();

            expect(c.parentCoinInfo).to.be.null;
            expect(c.puzzleHash).to.be.null;
            expect(c.amount).to.be.null;
            expect(c.puzzle).to.be.null;
            expect(c.TAILProgramHash).to.be.null;
            expect(c.innerPuzzle).to.be.null;
            expect(c.innerPuzzleHash).to.be.null;
            expect(c.syntheticKey).to.be.null;
            expect(c.innerSolution).to.be.null;
            expect(c.prevCoinId).to.be.null;
            expect(c.nextCoin).to.be.null;
            expect(c.prevSubtotal).to.be.null;
            expect(c.extraDelta).to.be.null;
            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
            expect(c.lineageProof).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const c = new CAT({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                TAILProgramHash: undefined,
                innerSolution: undefined,
                prevCoinId: undefined,
                nextCoin: undefined,
                prevSubtotal: undefined,
                publicKey: undefined,
                syntheticKey: undefined,
                extraDelta: undefined,
                TAILProgram: undefined,
                TAILSolution: undefined,
                lineageProof: undefined,
            });

            expect(c.parentCoinInfo).to.be.null;
            expect(c.puzzleHash).to.be.null;
            expect(c.amount).to.be.null;
            expect(c.puzzle).to.be.null;
            expect(c.TAILProgramHash).to.be.null;
            expect(c.innerPuzzle).to.be.null;
            expect(c.innerPuzzleHash).to.be.null;
            expect(c.prevCoinId).to.be.null;
            expect(c.nextCoin).to.be.null;
            expect(c.prevSubtotal).to.be.null;
            expect(c.syntheticKey).to.be.null;
            expect(c.innerSolution).to.be.null;
            expect(c.extraDelta).to.be.null;
            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
            expect(c.lineageProof).to.be.null;
        });

        it("Correctly sets innerPuzzle if given publicKey", () => {
            const c = new CAT({
                publicKey: TEST_PUB_KEY
            });

            expect(
                Util.sexp.toHex(c.innerPuzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(c.innerPuzzleHash).to.equal(
                Util.sexp.sha256tree(TEST_PUZZLE)
            );
        });

        it("Correctly sets innerPuzzle if given syntheticKey", () => {
            const c = new CAT({
                syntheticKey: TEST_SYNTH_KEY
            });

            expect(
                Util.sexp.toHex(c.innerPuzzle)
            ).to.equal(TEST_PUZZLE_STR);
            expect(c.innerPuzzleHash).to.equal(
                Util.sexp.sha256tree(TEST_PUZZLE)
            );
        });

        it("Correctly derives TAILProgram and TAILSolution from innerSolution", () => {
            const TAIL_PROGRAM_HEX = "ff0eff02ff0580"; // (mod (arg1 arg2) (concat arg1 arg2))
            const TAIL_SOLUTION_HEX = "ff85676f6f6420ff876d6f726e696e6780"; // ("good " "morning")

            const TAILProgram = Util.sexp.fromHex(TAIL_PROGRAM_HEX);
            const TAILSolution = Util.sexp.fromHex(TAIL_SOLUTION_HEX);
            const innerSol = Util.sexp.standardCoinSolution([
                SExp.to([
                    Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
                    SExp.FALSE,
                    Bytes.from("8f", "hex"),
                    TAILProgram,
                    TAILSolution
                ]),
            ]);
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                innerSolution: innerSol
            });

            expect(
                Util.sexp.toHex(c.TAILProgram)
            ).to.equal(TAIL_PROGRAM_HEX);
            expect(
                Util.sexp.toHex(c.TAILSolution)
            ).to.equal(TAIL_SOLUTION_HEX);
        });

        it("Does not derive TAILProgram and TAILSolution from innerSolution if there is no CREATE_COIN condition", () => {
            const TAIL_PROGRAM_HEX = "ff0eff02ff0580"; // (mod (arg1 arg2) (concat arg1 arg2))
            const TAIL_SOLUTION_HEX = "ff85676f6f6420ff876d6f726e696e6780"; // ("good " "morning")

            const TAILProgram = Util.sexp.fromHex(TAIL_PROGRAM_HEX);
            const TAILSolution = Util.sexp.fromHex(TAIL_SOLUTION_HEX);
            const innerSol = Util.sexp.standardCoinSolution([
                SExp.to([
                    Bytes.from(ConditionOpcode.AGG_SIG_ME, "hex"),
                    SExp.FALSE,
                    Bytes.from("8f", "hex"),
                    TAILProgram,
                    TAILSolution
                ]),
            ]);
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                innerSolution: innerSol
            });

            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
        });

        it("Does not derive TAILProgram and TAILSolution from innerSolution if there is no CREATE_COIN -113 condition", () => {
            const TAIL_PROGRAM_HEX = "ff0eff02ff0580"; // (mod (arg1 arg2) (concat arg1 arg2))
            const TAIL_SOLUTION_HEX = "ff85676f6f6420ff876d6f726e696e6780"; // ("good " "morning")

            const TAILProgram = Util.sexp.fromHex(TAIL_PROGRAM_HEX);
            const TAILSolution = Util.sexp.fromHex(TAIL_SOLUTION_HEX);
            const innerSol = Util.sexp.standardCoinSolution([
                SExp.to([
                    Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
                    SExp.FALSE,
                    Bytes.from("8e", "hex"),
                    TAILProgram,
                    TAILSolution
                ]),
            ]);
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                innerSolution: innerSol
            });

            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
        });

        it("Correctly calculates puzzle and puzzleHash given TAILProgramHash and a public key", () => {
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TEST_TAIL_HASH,
            });

            expect(
                Util.sexp.toHex(c.puzzle)
            ).to.equal(
                Util.sexp.toHex(TEST_CAT_PUZZLE)
            );
            expect(
                c.puzzleHash
            ).to.equal(c.puzzleHash);
        });

        it("Correctly calculates TAILProgramHash", () => {
            const c = new CAT({
                TAILProgram: Util.sexp.EVERYTHING_WITH_SIGNATURE_TAIL_MOD
            });

            expect(
                Util.sexp.toHex(c.TAILProgram)
            ).to.equal(
                Util.sexp.toHex(Util.sexp.EVERYTHING_WITH_SIGNATURE_TAIL_MOD)
            );
            expect(
                c.TAILProgramHash
            ).to.equal(
                Util.sexp.sha256tree(Util.sexp.EVERYTHING_WITH_SIGNATURE_TAIL_MOD)
            );
        });

        it("Casts extraDelta to a BigNumber", () => {
            const c = new CAT({
                extraDelta: 1337
            });

            expect(c.extraDelta instanceof BigNumber).to.be.true;
            expect(
                BigNumber.from(c.extraDelta).eq(1337)
            ).to.be.true;
        });

        it("Correctly constructs the inner solution when extraDelta != 0", () => {
            const solution = SExp.to([
                Bytes.from("4242", "hex")
            ]);

            const c = new CAT({
                TAILProgram: TEST_TAIL,
                TAILSolution: solution,
                extraDelta: 1337
            });

            expect(c.innerSolution).to.not.be.null;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const innerSolution: SExp = c.innerSolution!;
            const innerSolutionHex = Util.sexp.toHex(innerSolution);
            // eslint-disable-next-line max-len
            expect(innerSolutionHex).to.equal("ffff33ffa079616b756869746f79616b756869746f79616b756869746f79616b756869746fff818fffff02ffff01ff02ffff01ff04ffff04ff02ffff04ff05ffff04ff5fff80808080ff8080ffff04ffff0132ff018080ffff04ffff01b0b1caabfef7a350bd3d39910f30d844c613916b0d70585f65ba37fec4eefbbc797a5b147f5ab730b77e104cb5ad9d875fff018080ffff824242808080");
        });

        it("Does not construct the inner solution when extraDelta === 0", () => {
            const solution = SExp.to([
                Bytes.from("4242", "hex")
            ]);

            const c = new CAT({
                TAILProgram: TEST_TAIL,
                TAILSolution: solution,
                extraDelta: 0
            });

            expect(c.innerSolution).to.be.null;
        });

        it("Converts LineageProof amount to BigNumber", () => {
            const lp: LineageProof = {
                amount: "0x42"
            };

            const c = new CAT({
                lineageProof: lp
            });
            
            expect(
                c.lineageProof?.amount instanceof BigNumber
            ).to.be.true;
            expect(
                (c.lineageProof?.amount as BigNumber).toNumber()
            ).to.equal(0x42);
        });

        it("Sets LineageProof amount to null when it is 'undefined'", () => {
            const lp: LineageProof = {
                amount: undefined
            };

            const c = new CAT({
                lineageProof: lp
            });
            
            expect(c.lineageProof?.amount).to.be.null;
        });

        it("Sets LineageProof amount to null when it is 'null'", () => {
            const lp: LineageProof = {
                amount: null
            };

            const c = new CAT({
                lineageProof: lp
            });
            
            expect(c.lineageProof?.amount).to.be.null;
        });

        it("Correctly constructs solution", () => {
            const lp: LineageProof = {
                amount: TEST_COIN.amount,
                parentName: TEST_COIN.parentCoinInfo,
                innerPuzzleHash: TEST_COIN.puzzleHash
            };

            const cat = new CAT({
                innerSolution: SExp.to([]),
                coin: TEST_COIN,
                publicKey: TEST_PUB_KEY,
                lineageProof: lp,
                prevCoinId: Util.coin.getId(TEST_COIN),
                nextCoin: TEST_COIN,
                prevSubtotal: 1,
                extraDelta: 2
            });

            const expectedSolution = Util.sexp.CATSolution(
                SExp.to([]),
                Util.coin.toProgram(TEST_COIN),
                Util.coin.getId(TEST_COIN),
                TEST_COIN,
                TEST_COIN,
                1,
                2
            );

            expect(cat.solution).to.not.be.null;
            expect(
                Util.sexp.toHex(cat.solution)
            ).to.equal(
                Util.sexp.toHex(expectedSolution)
            );
        });

        it("Correctly constructs solution (default arguments)", () => {
            const cat = new CAT({
                innerSolution: SExp.to([]),
                coin: TEST_COIN,
            });

            const expectedSolution = Util.sexp.CATSolution(
                SExp.to([]),
                null,
                Util.coin.getId(TEST_COIN),
                TEST_COIN,
                TEST_COIN,
                0,
                0
            );

            expect(cat.solution).to.not.be.null;
            expect(
                Util.sexp.toHex(cat.solution)
            ).to.equal(
                Util.sexp.toHex(expectedSolution)
            );
        });

        
    });

    describe("copyWith()", () => {
        it("Works", () => {
            const cat = new CAT().copyWith({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                TAILProgramHash: TEST_TAIL_HASH,
                publicKey: TEST_PUB_KEY,
                innerSolution: SExp.to([]),
                prevCoinId: "00".repeat(32),
                nextCoin: TEST_COIN,
                prevSubtotal: 1337
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
            expect(cat.prevCoinId).to.equal("00".repeat(32));
            expect(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                Util.coin.getId(cat.nextCoin!)
            ).to.equal(
                Util.coin.getId(TEST_COIN),
            );
            expect(
                BigNumber.from(cat.prevSubtotal).eq(1337)
            ).to.be.true;
            expect(cat.extraDelta).to.be.null;
            expect(cat.TAILProgram).to.be.null;
            expect(cat.TAILSolution).to.be.null;
            expect(cat.lineageProof).to.be.null;
        });

        it("Correctly sets values if given no arguments", () => {
            const c = new CAT().copyWith({});

            expect(c.parentCoinInfo).to.be.null;
            expect(c.puzzleHash).to.be.null;
            expect(c.amount).to.be.null;
            expect(c.puzzle).to.be.null;
            expect(c.TAILProgramHash).to.be.null;
            expect(c.innerPuzzle).to.be.null;
            expect(c.syntheticKey).to.be.null;
            expect(c.innerSolution).to.be.null;
            expect(c.prevCoinId).to.be.null;
            expect(c.nextCoin).to.be.null;
            expect(c.prevSubtotal).to.be.null;
            expect(c.extraDelta).to.be.null;
            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
            expect(c.lineageProof).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const c = new CAT().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                TAILProgramHash: undefined,
                innerSolution: undefined,
                prevCoinId: undefined,
                nextCoin: undefined,
                prevSubtotal: undefined,
                publicKey: undefined,
                syntheticKey: undefined,
                extraDelta: undefined,
                TAILProgram: undefined,
                TAILSolution: undefined,
                lineageProof: undefined,
            });

            expect(c.parentCoinInfo).to.be.null;
            expect(c.puzzleHash).to.be.null;
            expect(c.amount).to.be.null;
            expect(c.puzzle).to.be.null;
            expect(c.TAILProgramHash).to.be.null;
            expect(c.innerPuzzle).to.be.null;
            expect(c.syntheticKey).to.be.null;
            expect(c.innerSolution).to.be.null;
            expect(c.prevCoinId).to.be.null;
            expect(c.nextCoin).to.be.null;
            expect(c.prevSubtotal).to.be.null;
            expect(c.extraDelta).to.be.null;
            expect(c.TAILProgram).to.be.null;
            expect(c.TAILSolution).to.be.null;
            expect(c.lineageProof).to.be.null;
        });
    });

    describe("withParentCoinInfo()", () => {
        it("Returns a new CAT with modified parentCoinInfo and does not modify the original object", () => {
            const c = new CAT();
            expect(c.parentCoinInfo).to.be.null;

            const c2 = c.withParentCoinInfo(TEST_COIN.parentCoinInfo)
            expect(c.parentCoinInfo).to.be.null;
            expect(c2.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });
    });

    describe("withPuzzleHash()", () => {
        it("Returns a new CAT with modified puzzleHash and does not modify the original object", () => {
            const c = new CAT();
            expect(c.puzzleHash).to.be.null;

            const c2 = c.withPuzzleHash(TEST_COIN.puzzleHash);
            expect(c.puzzleHash).to.be.null;
            expect(c2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });
    });

    describe("withAmount()", () => {
        it("Returns a new CAT with modified amount and does not modify the original object", () => {
            const c = new CAT();
            expect(c.amount).to.be.null;

            const c2 = c.withAmount(TEST_COIN.amount);
            expect(c.amount).to.be.null;
            expect(
                BigNumber.from(c2.amount).eq(TEST_COIN.amount)
            ).to.be.true;
        });
    });

    describe("withTAILProgramHash()", () => {
        it("Returns a new CAT with modified TAILProgramHash and does not modify the original object", () => {
            const c = new CAT();
            expect(c.TAILProgramHash).to.be.null;

            const c2 = c.withTAILProgramHash(TEST_TAIL_HASH);
            expect(c.TAILProgramHash).to.be.null;
            expect(c2.TAILProgramHash).to.equal(TEST_TAIL_HASH);
        });
    });

    describe("withPublicKey()", () => {
        it("Returns a new CAT with modified syntheticKey and does not modify the original object", () => {
            const c = new CAT();
            expect(c.syntheticKey).to.be.null;

            const c2 = c.withPublicKey(TEST_PUB_KEY);
            expect(c.syntheticKey).to.be.null;
            expect(c2.syntheticKey).to.equal(TEST_SYNTH_KEY);
        });
    });

    describe("withSyntheticKey()", () => {
        it("Returns a new CAT with modified syntheticKey and does not modify the original object", () => {
            const c = new CAT();
            expect(c.syntheticKey).to.be.null;

            const c2 = c.withSyntheticKey(TEST_SYNTH_KEY);
            expect(c.syntheticKey).to.be.null;
            expect(c2.syntheticKey).to.equal(TEST_SYNTH_KEY);
        });
    });

    describe("withInnerSolution()", () => {
        it("Returns a new CAT with modified innerSolution and does not modify the original object", () => {
            const c = new CAT();
            expect(c.innerSolution).to.be.null;

            const c2 = c.withInnerSolution(TEST_PUZZLE);
            expect(c.innerSolution).to.be.null;
            expect(
                Util.sexp.toHex(c2.innerSolution)
            ).to.equal(TEST_PUZZLE_STR);
        });
    });

    describe("withExtraDelta()", () => {
        it("Returns a new CAT with modified extraDelta and does not modify the original object", () => {
            const c = new CAT();
            expect(c.extraDelta).to.be.null;

            const c2 = c.withExtraDelta(1337);
            expect(c.extraDelta).to.be.null;
            expect(
                BigNumber.from(c2.extraDelta).eq(1337)
            ).to.be.true;
        });
    });

    describe("withTAILProgram()", () => {
        it("Returns a new CAT with modified TAILProgram and does not modify the original object", () => {
            const c = new CAT();
            expect(c.TAILProgram).to.be.null;

            const c2 = c.withTAILProgram(TEST_TAIL);
            expect(c.TAILProgram).to.be.null;
            expect(
                Util.sexp.toHex(c2.TAILProgram)
            ).to.equal(
                Util.sexp.toHex(TEST_TAIL)
            );
            expect(c2.TAILProgramHash).to.equal(TEST_TAIL_HASH);
        });
    });

    describe("withTAILSolution()", () => {
        it("Returns a new CAT with modified TAILSolution and does not modify the original object", () => {
            const c = new CAT();
            expect(c.TAILSolution).to.be.null;

            const c2 = c.withTAILSolution(TEST_TAIL);
            expect(c.TAILSolution).to.be.null;
            expect(
                Util.sexp.toHex(c2.TAILSolution)
            ).to.equal(
                Util.sexp.toHex(TEST_TAIL)
            );
        });
    });

    describe("withLineageProof()", () => {
        it("Returns a new CAT with modified lineageProog and does not modify the original object", () => {
            const lp: LineageProof = {
                parentName: TEST_COIN.parentCoinInfo,
                innerPuzzleHash: TEST_COIN.puzzleHash,
                amount: TEST_COIN.amount
            };

            const c = new CAT();
            expect(c.lineageProof).to.be.null;

            const c2 = c.withLineageProof(lp);
            expect(c.lineageProof).to.be.null;
            expect(c2.lineageProof?.parentName).to.equal(lp.parentName);
            expect(c2.lineageProof?.innerPuzzleHash).to.equal(lp.innerPuzzleHash);
            expect(
                BigNumber.from(c2.lineageProof?.amount).eq(lp.amount ?? -1)
            ).to.be.true;
        });
    });

    describe("addConditionsToInnerSolution()", () => {
        it("Correctly handles innerSolution = null", () => {
            const c = new CAT({
                coin: TEST_COIN,
            });
            const c2 = c.addConditionsToInnerSolution([SExp.FALSE, SExp.TRUE]);

            expect(c2.innerSolution).to.not.be.null;
            expect(
                Util.sexp.toHex(c2.innerSolution)
            ).to.equal(
                Util.sexp.toHex(Util.sexp.standardCoinSolution([SExp.FALSE, SExp.TRUE]))
            );
            expect(c2.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });

        it("Does not modify innerSolution if it is not a list", () => {
            const c = new CAT({
                innerSolution: SExp.to(Bytes.from("4242", "hex"))
            });
            const c2 = c.addConditionsToInnerSolution([SExp.FALSE, SExp.TRUE]);

            expect(
                Util.sexp.toHex(c2.innerSolution)
            ).to.equal("824242");
        });

        it("Does not modify innerSolution if it is not valid", () => {
            const c = new CAT({
                innerSolution: SExp.to([1, 2, 3, 4])
            });
            const c2 = c.addConditionsToInnerSolution([SExp.FALSE, SExp.TRUE]);

            expect(
                Util.sexp.toHex(c2.innerSolution)
            ).to.equal("ff01ff02ff03ff0480");
        });

        it("Works", () => {
            const initialConds = [SExp.TRUE, SExp.TRUE];
            const condsToAdd = [SExp.FALSE, SExp.TRUE, SExp.TRUE];
            const finalConds = [...initialConds, ...condsToAdd];

            const c = new CAT({
                innerSolution: Util.sexp.standardCoinSolution(initialConds),
            });
            const c2 = c.addConditionsToInnerSolution(condsToAdd);

            expect(
                Util.sexp.toHex(c.innerSolution)
            ).to.equal(
                Util.sexp.toHex(Util.sexp.standardCoinSolution(initialConds)),
            );
            expect(
                Util.sexp.toHex(c2.innerSolution)
            ).to.equal(
                Util.sexp.toHex(Util.sexp.standardCoinSolution(finalConds)),
            );
        });
    });
});