/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Bytes, initializeBLS, SExp } from "clvm";
import { CAT } from "../cat";
import { Util } from "../util";
import { ConditionOpcode } from "../util/sexp/condition_opcodes";
import { bytes, Coin } from "../xch/providers/provider_types";


describe.only("CAT", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_SYNTH_KEY: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_PUZZLE_HASH: bytes;
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
        TEST_PUZZLE_HASH = Util.sexp.sha256tree(TEST_PUZZLE);

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
                innerPuzzle: undefined,
                innerSolution: undefined,
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

            expect(c.innerPuzzleHash).to.equal(TEST_PUZZLE_HASH);
            expect(
                Util.sexp.toHex(c.innerPuzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly sets innerPuzzle if given syntheticKey", () => {
            const c = new CAT({
                syntheticKey: TEST_SYNTH_KEY
            });

            expect(c.innerPuzzleHash).to.equal(TEST_PUZZLE_HASH);
            expect(
                Util.sexp.toHex(c.innerPuzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly derives TAILProgram and TAILSolution from innerSolution", () => {
            const TAIL_PROGRAM_HEX = "ff0eff02ff0580"; // (mod (arg1 arg2) (concat arg1 arg2))
            const TAIL_SOLUTION_HEX = "ff85676f6f6420ff876d6f726e696e6780"; // ("good " "morning")

            const TAILProgram = Util.sexp.fromHex(TAIL_PROGRAM_HEX);
            const TAILSolution = Util.sexp.fromHex(TAIL_SOLUTION_HEX);
            const innerSol = SExp.to([
                SExp.to([
                    Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
                    SExp.FALSE,
                    Bytes.from("8f", "hex"),
                    TAILProgram,
                    TAILSolution
                ]),
            ]);
            const c = new CAT({
                innerPuzzle: Util.sexp.fromHex("01"), // 1
                innerSolution: innerSol
            });

            expect(
                Util.sexp.toHex(c.TAILProgram)
            ).to.equal(TAIL_PROGRAM_HEX);
            expect(
                Util.sexp.toHex(c.TAILSolution)
            ).to.equal(TAIL_SOLUTION_HEX);
        });

        it("Correctly calculates puzzle and puzzleHash given TAILProgramHash and innerPuzzle", () => {
            const c = new CAT({
                innerPuzzle: TEST_PUZZLE,
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
    });

    describe("copyWith()", () => {
        // lolcommits test #2
    });
});