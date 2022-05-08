/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-len */
import { expect } from "chai";
import { run_program, h, KEYWORD_TO_ATOM, OPERATOR_LOOKUP, SExp, t, CLVMObject, Tuple, Bytes } from "clvm";
import { bytes } from "../../../util/serializer/basic_types";
import { ConditionsDict, SExpUtil } from "../../../util/sexp";
import { ConditionOpcode } from "../../../util/sexp/condition_opcodes";
import { ConditionWithArgs } from "../../../util/sexp/condition_with_args";

const sexpUtil = new SExpUtil();

describe("SExpUtil", () => {
    describe("fromHex()", () => {
        it("Correctly converts a hex string to a SExp object", () => {
            const plus = h(KEYWORD_TO_ATOM["+"]);
            const q = h(KEYWORD_TO_ATOM["q"]);
            const program1 = SExp.to([plus, 1, t(q, 175)]);
            
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod a (+ a 175))'
            (+ 1 (q . 175))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(+ 1 (q . 175))'
            ff10ff01ffff018200af80
            */
            const program2 = sexpUtil.fromHex("ff10ff01ffff018200af80");
            expect(
                program1.equal_to(program2)
            ).to.be.true;
        });
    });

    describe("toHex()", () => {
        it("Correctly converts a SExp object to a hex string", () => {
            const plus = h(KEYWORD_TO_ATOM["+"]);
            const q = h(KEYWORD_TO_ATOM["q"]);
            const program = SExp.to([plus, 1, t(q, 175)]);
            
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod a (+ a 175))'
            (+ 1 (q . 175))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(+ 1 (q . 175))'
            ff10ff01ffff018200af80
            */
            expect(
                sexpUtil.toHex(program)
            ).to.equal("ff10ff01ffff018200af80");
        });

        it("Works with 'null'", () => {
            expect(
                sexpUtil.toHex(null)
            ).to.equal("");
        });

        it("Works with 'undefined'", () => {
            expect(
                sexpUtil.toHex(undefined)
            ).to.equal("");
        });
    });

    describe("run()", () => {
        it("Correctly runs program without cost", () => {
            const program = sexpUtil.fromHex("ff10ff01ffff018200af80");
            const solution = SExp.to(25);

            const result = sexpUtil.run(program, solution);
            const expectedResult = SExp.to(25 + 175);
            expect(
                expectedResult.equal_to(result)
            ).to.be.true;
            expect(result.as_int()).to.equal(200);
        });

        it("Correctly runs program with cost", () => {
            const program = sexpUtil.fromHex("ff10ff01ffff018200af80");
            const solution = SExp.to(25);

            const expectedCost = run_program(
                program,
                solution,
                OPERATOR_LOOKUP,
                sexpUtil.MAX_BLOCK_COST_CLVM
            )[0];
            const result = sexpUtil.run(program, solution, expectedCost + 1);
            const expectedResult = SExp.to(25 + 175);
            expect(
                expectedResult.equal_to(result)
            ).to.be.true;
            expect(result.as_int()).to.equal(200);
        });

        it("Throws error if the cost is too low", () => {
            const program = sexpUtil.fromHex("ff10ff01ffff018200af80");
            const solution = SExp.to(25);

            const expectedCost = run_program(
                program,
                solution,
                OPERATOR_LOOKUP,
                sexpUtil.MAX_BLOCK_COST_CLVM
            )[0];
            let failed: boolean = false;
            let errOk: boolean = false;
            try {
                sexpUtil.run(program, solution, expectedCost - 1);
            } catch(err: any) {
                failed = true;
                errOk = err.message === "cost exceeded";
            }
             
            expect(failed).to.be.true;
            expect(errOk).to.be.true;
        });
    });

    describe("runWithCost()", () => {
        it("Correctly runs program without cost", () => {
            const program = sexpUtil.fromHex("ff10ff01ffff018200af80");
            const solution = SExp.to(25);

            const expectedCost = run_program(
                program,
                solution,
                OPERATOR_LOOKUP,
                sexpUtil.MAX_BLOCK_COST_CLVM
            )[0];
            const [result, cost] = sexpUtil.runWithCost(program, solution);
            const expectedResult = SExp.to(25 + 175);
            expect(
                expectedResult.equal_to(result)
            ).to.be.true;
            expect(result.as_int()).to.equal(200);
            expect(cost).to.equal(expectedCost);
        });

        it("Correctly runs program with cost", () => {
            const program = sexpUtil.fromHex("ff10ff01ffff018200af80");
            const solution = SExp.to(25);

            const expectedCost = run_program(
                program,
                solution,
                OPERATOR_LOOKUP,
                sexpUtil.MAX_BLOCK_COST_CLVM
            )[0];
            const [result, cost] = sexpUtil.runWithCost(program, solution, expectedCost + 1);
            const expectedResult = SExp.to(25 + 175);
            expect(
                expectedResult.equal_to(result)
            ).to.be.true;
            expect(result.as_int()).to.equal(200);
            expect(cost).to.equal(expectedCost);
        });

        it("Throws error if the cost is too low", () => {
            const program = sexpUtil.fromHex("ff10ff01ffff018200af80");
            const solution = SExp.to(25);

            const expectedCost = run_program(
                program,
                solution,
                OPERATOR_LOOKUP,
                sexpUtil.MAX_BLOCK_COST_CLVM
            )[0];
            let failed: boolean = false;
            let errOk: boolean = false;
            try {
                sexpUtil.run(program, solution, expectedCost - 1);
            } catch(err: any) {
                failed = true;
                errOk = err.message === "cost exceeded";
            }
             
            expect(failed).to.be.true;
            expect(errOk).to.be.true;
        });
    });

    describe("sha256tree()", () => {
        it("Works correctly for string", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run hash.clvm 
            (a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () "yakuhito")'
            (q . "yakuhito")
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q . "yakuhito")'
            ff018879616b756869746f
            (venv) yakuhito@catstation:~/projects/clvm_tools$ brun '(a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))' '(q . "yakuhito")'
            0x88c3d66266c96a7125bc21ec44f386a358f9658559a3699cd2cf0846d57a5e76
            (venv) yakuhito@catstation:~/projects/clvm_tools$ 
            */
            const toHash = sexpUtil.fromHex("ff018879616b756869746f");
            const res = sexpUtil.sha256tree(toHash);

            expect(res).to.equal("88c3d66266c96a7125bc21ec44f386a358f9658559a3699cd2cf0846d57a5e76");
        });

        it("Works correctly for a program", () => {
            /*
            # Hashes itself!
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run hash.clvm 
            (a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ brun '(a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))' '(a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))'
            0x6dba5ecde970b43b7d9366ee1a065ee6aa4478c9b765dad95ab3dec4c3544975
            (venv) yakuhito@catstation:~/projects/clvm_tools$
            */
            const toHash = sexpUtil.fromHex(sexpUtil.SHA256TREE_PROGRAM);
            const res = sexpUtil.sha256tree(toHash);

            expect(res).to.equal("6dba5ecde970b43b7d9366ee1a065ee6aa4478c9b765dad95ab3dec4c3544975");
        });
    });

    describe("conditionsDictForSolution()", () => {
        it("Works", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ cat test.clvm 
            (mod (THROW_ERROR)
                (defconstant AGG_SIG_ME 50)
  	            (defconstant CREATE_COIN 51)

  	            (if (= THROW_ERROR 1)
  		            (x "ERROR")
  		            (list
  			            (list AGG_SIG_ME 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")
  			            (list CREATE_COIN 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)
  		            )
  	            )
            )
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run test.clvm 
            (a (q 2 (i (= 5 (q . 1)) (q 8 (q . "ERROR")) (q 4 (c 4 (q 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")) (c (c 6 (q 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)) ()))) 1) (c (q 50 . 51) 1))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 (i (= 5 (q . 1)) (q 8 (q . "ERROR")) (q 4 (c 4 (q 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")) (c (c 6 (q 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)) ()))) 1) (c (q 50 . 51) 1))'
            ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080
            */

            const program: SExp = sexpUtil.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = sexpUtil.fromHex("ff8080"); // (())
            const res = sexpUtil.conditionsDictForSolution(program, solution, sexpUtil.MAX_BLOCK_COST_CLVM);

            expect(res[0]).to.be.false;
            expect(res[1]).to.not.be.null;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const dict: ConditionsDict = res[1]!;
            expect(dict.size).to.equal(2);

            const aggSigMes = dict.get(ConditionOpcode.AGG_SIG_ME);
            expect(aggSigMes?.length).to.equal(1);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const aggSigMe = aggSigMes![0];
            expect(aggSigMe.opcode).to.equal(ConditionOpcode.AGG_SIG_ME);
            expect(aggSigMe.vars.toString()).to.equal("a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37,79616b756869746f");
            
            const createCoins = dict.get(ConditionOpcode.CREATE_COIN);
            expect(createCoins?.length).to.equal(1);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const createCoin = createCoins![0];
            expect(createCoin.opcode).to.equal(ConditionOpcode.CREATE_COIN);
            expect(createCoin.vars.toString()).to.equal("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664,0a");
        });

        it("Works if puzzle throws an exception", () => {
            const program: SExp = sexpUtil.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = sexpUtil.fromHex("ff0180"); // (1) => should throw exception

            const res = sexpUtil.conditionsDictForSolution(program, solution, sexpUtil.MAX_BLOCK_COST_CLVM);
            expect(res[0]).to.be.true;
            expect(res[1]).to.be.null;
            expect(res[2]).to.equal(0);
        });
    });

    describe("conditionsForSolution()", () => {
        it("Works", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ cat test.clvm 
            (mod (THROW_ERROR)
                (defconstant AGG_SIG_ME 50)
  	            (defconstant CREATE_COIN 51)

  	            (if (= THROW_ERROR 1)
  		            (x "ERROR")
  		            (list
  			            (list AGG_SIG_ME 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")
  			            (list CREATE_COIN 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)
  		            )
  	            )
            )
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run test.clvm 
            (a (q 2 (i (= 5 (q . 1)) (q 8 (q . "ERROR")) (q 4 (c 4 (q 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")) (c (c 6 (q 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)) ()))) 1) (c (q 50 . 51) 1))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 (i (= 5 (q . 1)) (q 8 (q . "ERROR")) (q 4 (c 4 (q 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")) (c (c 6 (q 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)) ()))) 1) (c (q 50 . 51) 1))'
            ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080
            */

            const program: SExp = sexpUtil.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = sexpUtil.fromHex("ff8080"); // (())
            const res = sexpUtil.conditionsForSolution(program, solution, sexpUtil.MAX_BLOCK_COST_CLVM);

            expect(res[0]).to.be.false;
            expect(res[1]).to.not.be.null;
            const arr: ConditionWithArgs[] = res[1] ?? [];
            expect(arr.length).to.equal(2);
            expect(arr[0].opcode).to.equal(ConditionOpcode.AGG_SIG_ME);
            expect(arr[0].vars.toString()).to.equal("a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37,79616b756869746f");
            expect(arr[1].opcode).to.equal(ConditionOpcode.CREATE_COIN);
            expect(arr[1].vars.toString()).to.equal("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664,0a");
        });

        it("Works if puzzle throws an exception", () => {
            const program: SExp = sexpUtil.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = sexpUtil.fromHex("ff0180"); // (1) => should throw exception

            const res = sexpUtil.conditionsForSolution(program, solution, sexpUtil.MAX_BLOCK_COST_CLVM);
            expect(res[0]).to.be.true;
            expect(res[1]).to.be.null;
            expect(res[2]).to.equal(0);
        });
    });

    describe("parseSExpToConditions()", () => {
        it("Works with expected input", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(list (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337) (list 73 100000))'
            ((51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337) (73 0x0186a0))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '((51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337) (73 0x0186a0))'
            ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980ffff49ff830186a08080
            */
            const sexp: SExp = sexpUtil.fromHex("ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980ffff49ff830186a08080"); // ()
            const res = sexpUtil.parseSExpToConditions(sexp);

            expect(res[0]).to.be.false;
            expect(res[1]).to.not.be.null;
            const arr: ConditionWithArgs[] = res[1] ?? [];
            expect(arr.length).to.equal(2);
            expect(arr[0].opcode).to.equal(ConditionOpcode.CREATE_COIN);
            expect(arr[0].vars.toString()).to.equal("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664,0539");
            expect(arr[1].opcode).to.equal(ConditionOpcode.ASSERT_MY_AMOUNT);
            expect(arr[1].vars.toString()).to.equal("0186a0");
        });

        it("Works if given list contains an invalid condition", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(list (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337) () (list 73 100000))'
            ((51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337) () (73 0x0186a0))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '((51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337) () (73 0x0186a0))'
            ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980ff80ffff49ff830186a08080
            */
            const sexp: SExp = sexpUtil.fromHex("ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980ff80ffff49ff830186a08080"); // ()
            const res = sexpUtil.parseSExpToConditions(sexp);

            expect(res[0]).to.be.true;
            expect(res[1]).to.be.null;
        });
    });

    describe("parseSExpToCondition()", () => {
        it("Works for a normal condition", () => {
            /*
                (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337)'
                (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337)
                (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337)'
                ff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980
            */
            const sexp: SExp = sexpUtil.fromHex("ff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980");
            const res = sexpUtil.parseSExpToCondition(sexp);

            expect(res[0]).to.be.false;
            expect(res[1]).to.not.be.null;
            expect(res[1]?.opcode).to.equal(ConditionOpcode.CREATE_COIN);
            expect(res[1]?.vars.length).to.equal(2);
            expect(res[1]?.vars[0]).to.equal("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664");
            expect(res[1]?.vars[1]).to.equal("0539"); // 1337
        });

        it("Works if given () as input", () => {
            const sexp: SExp = sexpUtil.fromHex("80"); // ()
            const res = sexpUtil.parseSExpToCondition(sexp);

            expect(res[0]).to.be.true;
            expect(res[1]).to.be.null;
        });
    });

    describe("asAtomList()", () => {
        it("Works", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(list 0x31 0x33 0x37)'
            (49 51 55)
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(49 51 55)'
            ff31ff33ff3780
            (venv) yakuhito@catstation:~/projects/clvm_tools$
            */
            const sexp: SExp = sexpUtil.fromHex("ff31ff33ff3780");
            const res: bytes[] = sexpUtil.asAtomList(sexp);
            
            expect(res.length).to.equal(3);
            expect(res.toString()).to.equal("31,33,37");
        });

        it("Works if list ends unexpectedly", () => {
            const sexp: SExp = new SExp(
                new CLVMObject(new Tuple(
                    new CLVMObject(
                        Bytes.from([0x31])
                    ),
                    new CLVMObject(
                        new Tuple(
                            Bytes.from([0x33]),
                            Bytes.from([0x37])
                        )
                    )
                ))
            );
            
            const res: bytes[] = sexpUtil.asAtomList(sexp);
            expect(res.length).to.equal(1);
            expect(res[0]).to.equal("31");
        });
    });

    describe("conditionsByOpcode()", () => {
        it("Works", () => {
            const c1 = new ConditionWithArgs();
            c1.opcode = ConditionOpcode.AGG_SIG_ME;
            c1.vars = ["11", "22"];
            const c2 = new ConditionWithArgs();
            c2.opcode = ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT;
            c2.vars = ["33", "44"];
            const c3 = new ConditionWithArgs();
            c3.opcode = ConditionOpcode.AGG_SIG_ME;
            c3.vars = ["55", "66"];

            const conditions: ConditionWithArgs[] = [c1, c2, c3];
            const res = sexpUtil.conditionsByOpcode(conditions);

            expect(res.get(ConditionOpcode.AGG_SIG_ME)?.length).to.equal(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const aggSigMes = res.get(ConditionOpcode.AGG_SIG_ME)!;
            expect(aggSigMes[0].opcode).to.equal(ConditionOpcode.AGG_SIG_ME);
            expect(aggSigMes[0].vars.length).to.equal(2);
            expect(aggSigMes[0].vars[0]).to.equal("11");
            expect(aggSigMes[0].vars[1]).to.equal("22");
            expect(aggSigMes[1].opcode).to.equal(ConditionOpcode.AGG_SIG_ME);
            expect(aggSigMes[1].vars.length).to.equal(2);
            expect(aggSigMes[1].vars[0]).to.equal("55");
            expect(aggSigMes[1].vars[1]).to.equal("66");

            expect(res.get(ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT)?.length).to.equal(1);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const ann = res.get(ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT)![0];
            expect(ann.opcode).to.equal(ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT);
            expect(ann.vars.length).to.equal(2);
            expect(ann.vars[0]).to.equal("33");
            expect(ann.vars[1]).to.equal("44");
        });
    });

    describe("pkmPairsForConditionsDict()", () => {
        it("Returns empty lists if there are no things to sign", () => {
            const conditionsDict = new Map<ConditionOpcode, ConditionWithArgs[]>();

            const cwa = new ConditionWithArgs();
            cwa.opcode = ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT;
            cwa.vars = [""];

            conditionsDict.set(ConditionOpcode.AGG_SIG_UNSAFE, []);
            conditionsDict.set(ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT, [cwa]);

            const res = sexpUtil.pkmPairsForConditionsDict(
                conditionsDict, "11", "22"
            );

            expect(res.length).to.equal(0);
        });

        it("Correctly handles AGG_SIG_UNSAFE conditions", () => {
            const conditionsDict = new Map<ConditionOpcode, ConditionWithArgs[]>();

            const cwa1 = new ConditionWithArgs();
            cwa1.opcode = ConditionOpcode.AGG_SIG_UNSAFE;
            cwa1.vars = ["deadbeef", "313337"];

            const cwa2 = new ConditionWithArgs();
            cwa2.opcode = ConditionOpcode.AGG_SIG_UNSAFE;
            cwa2.vars = ["foodbabe", "909090"];

            conditionsDict.set(ConditionOpcode.AGG_SIG_UNSAFE, [cwa1, cwa2]);

            const res = sexpUtil.pkmPairsForConditionsDict(
                conditionsDict, "11", "22"
            );

            expect(res.length).to.equal(2);
            expect(res[0][0]).to.equal("deadbeef");
            expect(res[0][1]).to.equal("313337");
            expect(res[1][0]).to.equal("foodbabe");
            expect(res[1][1]).to.equal("909090");
        });

        it("Correctly handles AGG_SIG_ME conditions", () => {
            const conditionsDict = new Map<ConditionOpcode, ConditionWithArgs[]>();

            const cwa1 = new ConditionWithArgs();
            cwa1.opcode = ConditionOpcode.AGG_SIG_ME;
            cwa1.vars = ["deadbeef", "313337"];

            const cwa2 = new ConditionWithArgs();
            cwa2.opcode = ConditionOpcode.AGG_SIG_ME;
            cwa2.vars = ["foodbabe", "909090"];

            conditionsDict.set(ConditionOpcode.AGG_SIG_ME, [cwa1, cwa2]);

            const res = sexpUtil.pkmPairsForConditionsDict(
                conditionsDict, "11", "22"
            );

            expect(res.length).to.equal(2);
            expect(res[0][0]).to.equal("deadbeef");
            expect(res[0][1]).to.equal("3133371122");
            expect(res[1][0]).to.equal("foodbabe");
            expect(res[1][1]).to.equal("9090901122");
        });
    });

    describe("curry()", () => {
        it("Works", () => {
            // (mod (arg1 arg2) (+ arg1 arg2))
            const program = sexpUtil.fromHex("ff10ff02ff0580");

            // 7
            const args = [ sexpUtil.fromHex("07") ];

            const result = sexpUtil.curry(
                program, args,
            );

            expect(sexpUtil.toHex(result)).to.equal("ff02ffff01ff10ff02ff0580ffff04ffff0107ff018080");
        });

        // https://github.com/irulast/chia-crypto-utils/blob/main/test/uncurry_test.dart
        // these are tests for uncurry, but can easily be adapted to test the curry function
        /*
        test('uncurry cat parent puzzle reveal', () {
            final program = Program.parse('(a (q 2 (q 2 94 (c 2 (c (c 5 (c (sha256 44 5) (c 11 ()))) (c (a 23 47) (c 95 (c (a 46 (c 2 (c 23 ()))) (c (sha256 639 1407 2943) (c -65 (c 383 (c 767 (c 1535 (c 3071 ())))))))))))) (c (q (((-54 . 61) 70 2 . 51) (60 . 4) 1 1 . -53) ((a 2 (i 5 (q 2 50 (c 2 (c 13 (c (sha256 34 (sha256 44 52) (sha256 34 (sha256 34 (sha256 44 92) 9) (sha256 34 11 (sha256 44 ())))) ())))) (q . 11)) 1) (a (i 11 (q 2 (i (= (a 46 (c 2 (c 19 ()))) 2975) (q 2 38 (c 2 (c (a 19 (c 95 (c 23 (c 47 (c -65 (c 383 (c 27 ()))))))) (c 383 ())))) (q 8)) 1) (q 2 (i 23 (q 2 (i (not -65) (q . 383) (q 8)) 1) (q 8)) 1)) 1) (c (c 5 39) (c (+ 11 87) 119)) 2 (i 5 (q 2 (i (= (a (i (= 17 120) (q . 89) ()) 1) (q . -113)) (q 2 122 (c 2 (c 13 (c 11 (c (c -71 377) ()))))) (q 2 90 (c 2 (c (a (i (= 17 120) (q 4 120 (c (a 54 (c 2 (c 19 (c 41 (c (sha256 44 91) (c 43 ())))))) 57)) (q 2 (i (= 17 36) (q 4 36 (c (sha256 32 41) 57)) (q . 9)) 1)) 1) (c (a (i (= 17 120) (q . 89) ()) 1) (c (a 122 (c 2 (c 13 (c 11 (c 23 ()))))) ())))))) 1) (q 4 () (c () 23))) 1) ((a (i 5 (q 4 9 (a 38 (c 2 (c 13 (c 11 ()))))) (q . 11)) 1) 11 34 (sha256 44 88) (sha256 34 (sha256 34 (sha256 44 92) 5) (sha256 34 (a 50 (c 2 (c 7 (c (sha256 44 44) ())))) (sha256 44 ())))) (a (i (l 5) (q 11 (q . 2) (a 46 (c 2 (c 9 ()))) (a 46 (c 2 (c 13 ())))) (q 11 44 5)) 1) (c (c 40 (c 95 ())) (a 126 (c 2 (c (c (c 47 5) (c 95 383)) (c (a 122 (c 2 (c 11 (c 5 (q ()))))) (c 23 (c -65 (c 383 (c (sha256 1279 (a 54 (c 2 (c 9 (c 2815 (c (sha256 44 45) (c 21 ())))))) 5887) (c 1535 (c 3071 ()))))))))))) 2 42 (c 2 (c 95 (c 59 (c (a (i 23 (q 9 45 (sha256 39 (a 54 (c 2 (c 41 (c 87 (c (sha256 44 -71) (c 89 ())))))) -73)) ()) 1) (c 23 (c 5 (c 767 (c (c (c 36 (c (sha256 124 47 383) ())) (c (c 48 (c (sha256 -65 (sha256 124 21 (+ 383 (- 735 43) 767))) ())) 19)) ()))))))))) 1)) (c (q . 0x72dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc) (c (q . 0x625c2184e97576f5df1be46c15b2b8771c79e4e6f0aa42d3bfecaebe733f4b8c) (c (q 2 (q 2 (q 2 (i 11 (q 2 (i (= 5 (point_add 11 (pubkey_for_exp (sha256 11 (a 6 (c 2 (c 23 ()))))))) (q 2 23 47) (q 8)) 1) (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 23 ()))) ()))) (a 23 47))) 1) (c (q 50 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0x94a96f7397ff4acb08b6532fd20bb975a2c350c19216fef4ae9f64499bc59fe919bcf7b531dd80a371ad7858bfb288d2) 1)) 1))))');
            const expectedUncurriedModule = '(a (q 2 94 (c 2 (c (c 5 (c (sha256 44 5) (c 11 ()))) (c (a 23 47) (c 95 (c (a 46 (c 2 (c 23 ()))) (c (sha256 639 1407 2943) (c -65 (c 383 (c 767 (c 1535 (c 3071 ())))))))))))) (c (q (((-54 . 61) 70 2 . 51) (60 . 4) 1 1 . -53) ((a 2 (i 5 (q 2 50 (c 2 (c 13 (c (sha256 34 (sha256 44 52) (sha256 34 (sha256 34 (sha256 44 92) 9) (sha256 34 11 (sha256 44 ())))) ())))) (q . 11)) 1) (a (i 11 (q 2 (i (= (a 46 (c 2 (c 19 ()))) 2975) (q 2 38 (c 2 (c (a 19 (c 95 (c 23 (c 47 (c -65 (c 383 (c 27 ()))))))) (c 383 ())))) (q 8)) 1) (q 2 (i 23 (q 2 (i (not -65) (q . 383) (q 8)) 1) (q 8)) 1)) 1) (c (c 5 39) (c (+ 11 87) 119)) 2 (i 5 (q 2 (i (= (a (i (= 17 120) (q . 89) ()) 1) (q . -113)) (q 2 122 (c 2 (c 13 (c 11 (c (c -71 377) ()))))) (q 2 90 (c 2 (c (a (i (= 17 120) (q 4 120 (c (a 54 (c 2 (c 19 (c 41 (c (sha256 44 91) (c 43 ())))))) 57)) (q 2 (i (= 17 36) (q 4 36 (c (sha256 32 41) 57)) (q . 9)) 1)) 1) (c (a (i (= 17 120) (q . 89) ()) 1) (c (a 122 (c 2 (c 13 (c 11 (c 23 ()))))) ())))))) 1) (q 4 () (c () 23))) 1) ((a (i 5 (q 4 9 (a 38 (c 2 (c 13 (c 11 ()))))) (q . 11)) 1) 11 34 (sha256 44 88) (sha256 34 (sha256 34 (sha256 44 92) 5) (sha256 34 (a 50 (c 2 (c 7 (c (sha256 44 44) ())))) (sha256 44 ())))) (a (i (l 5) (q 11 (q . 2) (a 46 (c 2 (c 9 ()))) (a 46 (c 2 (c 13 ())))) (q 11 44 5)) 1) (c (c 40 (c 95 ())) (a 126 (c 2 (c (c (c 47 5) (c 95 383)) (c (a 122 (c 2 (c 11 (c 5 (q ()))))) (c 23 (c -65 (c 383 (c (sha256 1279 (a 54 (c 2 (c 9 (c 2815 (c (sha256 44 45) (c 21 ())))))) 5887) (c 1535 (c 3071 ()))))))))))) 2 42 (c 2 (c 95 (c 59 (c (a (i 23 (q 9 45 (sha256 39 (a 54 (c 2 (c 41 (c 87 (c (sha256 44 -71) (c 89 ())))))) -73)) ()) 1) (c 23 (c 5 (c 767 (c (c (c 36 (c (sha256 124 47 383) ())) (c (c 48 (c (sha256 -65 (sha256 124 21 (+ 383 (- 735 43) 767))) ())) 19)) ()))))))))) 1))';
            final expectedUncurriedArguments = [
                '0x72dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc',
                '0x625c2184e97576f5df1be46c15b2b8771c79e4e6f0aa42d3bfecaebe733f4b8c',
                '(a (q 2 (q 2 (i 11 (q 2 (i (= 5 (point_add 11 (pubkey_for_exp (sha256 11 (a 6 (c 2 (c 23 ()))))))) (q 2 23 47) (q 8)) 1) (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 23 ()))) ()))) (a 23 47))) 1) (c (q 50 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0x94a96f7397ff4acb08b6532fd20bb975a2c350c19216fef4ae9f64499bc59fe919bcf7b531dd80a371ad7858bfb288d2) 1))',
            ];
            final uncurried = program.uncurry();
            expect(uncurried.program.toSource(), expectedUncurriedModule);
            final uncurriedArguments = uncurried.arguments;
            for (var i = 0; i < 3; i++) {
                expect(uncurriedArguments[i].toSource(), expectedUncurriedArguments[i]);
            }
            });
        */
        it("irulast/chia-crypto-utils - uncurry cat parent puzzle reveal", () => {
            // (a (q 2 94 (c 2 (c (c 5 (c (sha256 44 5) (c 11 ()))) (c (a 23 47) (c 95 (c (a 46 (c 2 (c 23 ()))) (c (sha256 639 1407 2943) (c -65 (c 383 (c 767 (c 1535 (c 3071 ())))))))))))) (c (q (((-54 . 61) 70 2 . 51) (60 . 4) 1 1 . -53) ((a 2 (i 5 (q 2 50 (c 2 (c 13 (c (sha256 34 (sha256 44 52) (sha256 34 (sha256 34 (sha256 44 92) 9) (sha256 34 11 (sha256 44 ())))) ())))) (q . 11)) 1) (a (i 11 (q 2 (i (= (a 46 (c 2 (c 19 ()))) 2975) (q 2 38 (c 2 (c (a 19 (c 95 (c 23 (c 47 (c -65 (c 383 (c 27 ()))))))) (c 383 ())))) (q 8)) 1) (q 2 (i 23 (q 2 (i (not -65) (q . 383) (q 8)) 1) (q 8)) 1)) 1) (c (c 5 39) (c (+ 11 87) 119)) 2 (i 5 (q 2 (i (= (a (i (= 17 120) (q . 89) ()) 1) (q . -113)) (q 2 122 (c 2 (c 13 (c 11 (c (c -71 377) ()))))) (q 2 90 (c 2 (c (a (i (= 17 120) (q 4 120 (c (a 54 (c 2 (c 19 (c 41 (c (sha256 44 91) (c 43 ())))))) 57)) (q 2 (i (= 17 36) (q 4 36 (c (sha256 32 41) 57)) (q . 9)) 1)) 1) (c (a (i (= 17 120) (q . 89) ()) 1) (c (a 122 (c 2 (c 13 (c 11 (c 23 ()))))) ())))))) 1) (q 4 () (c () 23))) 1) ((a (i 5 (q 4 9 (a 38 (c 2 (c 13 (c 11 ()))))) (q . 11)) 1) 11 34 (sha256 44 88) (sha256 34 (sha256 34 (sha256 44 92) 5) (sha256 34 (a 50 (c 2 (c 7 (c (sha256 44 44) ())))) (sha256 44 ())))) (a (i (l 5) (q 11 (q . 2) (a 46 (c 2 (c 9 ()))) (a 46 (c 2 (c 13 ())))) (q 11 44 5)) 1) (c (c 40 (c 95 ())) (a 126 (c 2 (c (c (c 47 5) (c 95 383)) (c (a 122 (c 2 (c 11 (c 5 (q ()))))) (c 23 (c -65 (c 383 (c (sha256 1279 (a 54 (c 2 (c 9 (c 2815 (c (sha256 44 45) (c 21 ())))))) 5887) (c 1535 (c 3071 ()))))))))))) 2 42 (c 2 (c 95 (c 59 (c (a (i 23 (q 9 45 (sha256 39 (a 54 (c 2 (c 41 (c 87 (c (sha256 44 -71) (c 89 ())))))) -73)) ()) 1) (c 23 (c 5 (c 767 (c (c (c 36 (c (sha256 124 47 383) ())) (c (c 48 (c (sha256 -65 (sha256 124 21 (+ 383 (- 735 43) 767))) ())) 19)) ()))))))))) 1))
            const uncurriedProgram: SExp = sexpUtil.fromHex("ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff2cff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff0bff82027fff82057fff820b7f80ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff81ca3dff46ff0233ffff3c04ff01ff0181cbffffff02ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff22ffff0bff2cff3480ffff0bff22ffff0bff22ffff0bff2cff5c80ff0980ffff0bff22ff0bffff0bff2cff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff26ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ffff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff5affff04ff02ffff04ffff02ffff03ffff09ff11ff7880ffff01ff04ff78ffff04ffff02ff36ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff2cff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff2480ffff01ff04ff24ffff04ffff0bff20ff2980ff398080ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff04ffff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffffff02ffff03ff05ffff01ff04ff09ffff02ff26ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff22ffff0bff2cff5880ffff0bff22ffff0bff22ffff0bff2cff5c80ff0580ffff0bff22ffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff2cff2c80ff8080808080ffff0bff2cff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bff2cff058080ff0180ffff04ffff04ff28ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff7affff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff0bff8204ffffff02ff36ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff2cff2d80ffff04ff15ff80808080808080ff8216ff80ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff2affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff0bff27ffff02ff36ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff2cff81b980ffff04ff59ff80808080808080ff81b78080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff24ffff04ffff0bff7cff2fff82017f80ff808080ffff04ffff04ff30ffff04ffff0bff81bfffff0bff7cff15ffff10ff82017fffff11ff8202dfff2b80ff8202ff808080ff808080ff138080ff80808080808080808080ff018080");
            const toCurry: SExp[] = [
                // 0x72dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc
                sexpUtil.fromHex("a072dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc"),
                // 0x625c2184e97576f5df1be46c15b2b8771c79e4e6f0aa42d3bfecaebe733f4b8c
                sexpUtil.fromHex("a0625c2184e97576f5df1be46c15b2b8771c79e4e6f0aa42d3bfecaebe733f4b8c"),
                // (a (q 2 (q 2 (i 11 (q 2 (i (= 5 (point_add 11 (pubkey_for_exp (sha256 11 (a 6 (c 2 (c 23 ()))))))) (q 2 23 47) (q 8)) 1) (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 23 ()))) ()))) (a 23 47))) 1) (c (q 50 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0x94a96f7397ff4acb08b6532fd20bb975a2c350c19216fef4ae9f64499bc59fe919bcf7b531dd80a371ad7858bfb288d2) 1))
                sexpUtil.fromHex("ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b094a96f7397ff4acb08b6532fd20bb975a2c350c19216fef4ae9f64499bc59fe919bcf7b531dd80a371ad7858bfb288d2ff018080"),
            ];
            // (a (q 2 (q 2 94 (c 2 (c (c 5 (c (sha256 44 5) (c 11 ()))) (c (a 23 47) (c 95 (c (a 46 (c 2 (c 23 ()))) (c (sha256 639 1407 2943) (c -65 (c 383 (c 767 (c 1535 (c 3071 ())))))))))))) (c (q (((-54 . 61) 70 2 . 51) (60 . 4) 1 1 . -53) ((a 2 (i 5 (q 2 50 (c 2 (c 13 (c (sha256 34 (sha256 44 52) (sha256 34 (sha256 34 (sha256 44 92) 9) (sha256 34 11 (sha256 44 ())))) ())))) (q . 11)) 1) (a (i 11 (q 2 (i (= (a 46 (c 2 (c 19 ()))) 2975) (q 2 38 (c 2 (c (a 19 (c 95 (c 23 (c 47 (c -65 (c 383 (c 27 ()))))))) (c 383 ())))) (q 8)) 1) (q 2 (i 23 (q 2 (i (not -65) (q . 383) (q 8)) 1) (q 8)) 1)) 1) (c (c 5 39) (c (+ 11 87) 119)) 2 (i 5 (q 2 (i (= (a (i (= 17 120) (q . 89) ()) 1) (q . -113)) (q 2 122 (c 2 (c 13 (c 11 (c (c -71 377) ()))))) (q 2 90 (c 2 (c (a (i (= 17 120) (q 4 120 (c (a 54 (c 2 (c 19 (c 41 (c (sha256 44 91) (c 43 ())))))) 57)) (q 2 (i (= 17 36) (q 4 36 (c (sha256 32 41) 57)) (q . 9)) 1)) 1) (c (a (i (= 17 120) (q . 89) ()) 1) (c (a 122 (c 2 (c 13 (c 11 (c 23 ()))))) ())))))) 1) (q 4 () (c () 23))) 1) ((a (i 5 (q 4 9 (a 38 (c 2 (c 13 (c 11 ()))))) (q . 11)) 1) 11 34 (sha256 44 88) (sha256 34 (sha256 34 (sha256 44 92) 5) (sha256 34 (a 50 (c 2 (c 7 (c (sha256 44 44) ())))) (sha256 44 ())))) (a (i (l 5) (q 11 (q . 2) (a 46 (c 2 (c 9 ()))) (a 46 (c 2 (c 13 ())))) (q 11 44 5)) 1) (c (c 40 (c 95 ())) (a 126 (c 2 (c (c (c 47 5) (c 95 383)) (c (a 122 (c 2 (c 11 (c 5 (q ()))))) (c 23 (c -65 (c 383 (c (sha256 1279 (a 54 (c 2 (c 9 (c 2815 (c (sha256 44 45) (c 21 ())))))) 5887) (c 1535 (c 3071 ()))))))))))) 2 42 (c 2 (c 95 (c 59 (c (a (i 23 (q 9 45 (sha256 39 (a 54 (c 2 (c 41 (c 87 (c (sha256 44 -71) (c 89 ())))))) -73)) ()) 1) (c 23 (c 5 (c 767 (c (c (c 36 (c (sha256 124 47 383) ())) (c (c 48 (c (sha256 -65 (sha256 124 21 (+ 383 (- 735 43) 767))) ())) 19)) ()))))))))) 1)) (c (q . 0x72dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc) (c (q . 0x625c2184e97576f5df1be46c15b2b8771c79e4e6f0aa42d3bfecaebe733f4b8c) (c (q 2 (q 2 (q 2 (i 11 (q 2 (i (= 5 (point_add 11 (pubkey_for_exp (sha256 11 (a 6 (c 2 (c 23 ()))))))) (q 2 23 47) (q 8)) 1) (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 23 ()))) ()))) (a 23 47))) 1) (c (q 50 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0x94a96f7397ff4acb08b6532fd20bb975a2c350c19216fef4ae9f64499bc59fe919bcf7b531dd80a371ad7858bfb288d2) 1)) 1))))
            const programHex ="ff02ffff01ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff2cff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff0bff82027fff82057fff820b7f80ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff81ca3dff46ff0233ffff3c04ff01ff0181cbffffff02ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff22ffff0bff2cff3480ffff0bff22ffff0bff22ffff0bff2cff5c80ff0980ffff0bff22ff0bffff0bff2cff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff26ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ffff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff5affff04ff02ffff04ffff02ffff03ffff09ff11ff7880ffff01ff04ff78ffff04ffff02ff36ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff2cff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff2480ffff01ff04ff24ffff04ffff0bff20ff2980ff398080ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff04ffff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffffff02ffff03ff05ffff01ff04ff09ffff02ff26ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff22ffff0bff2cff5880ffff0bff22ffff0bff22ffff0bff2cff5c80ff0580ffff0bff22ffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff2cff2c80ff8080808080ffff0bff2cff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bff2cff058080ff0180ffff04ffff04ff28ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff7affff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff0bff8204ffffff02ff36ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff2cff2d80ffff04ff15ff80808080808080ff8216ff80ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff2affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff0bff27ffff02ff36ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff2cff81b980ffff04ff59ff80808080808080ff81b78080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff24ffff04ffff0bff7cff2fff82017f80ff808080ffff04ffff04ff30ffff04ffff0bff81bfffff0bff7cff15ffff10ff82017fffff11ff8202dfff2b80ff8202ff808080ff808080ff138080ff80808080808080808080ff018080ffff04ffff01a072dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdcffff04ffff01a0625c2184e97576f5df1be46c15b2b8771c79e4e6f0aa42d3bfecaebe733f4b8cffff04ffff01ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b094a96f7397ff4acb08b6532fd20bb975a2c350c19216fef4ae9f64499bc59fe919bcf7b531dd80a371ad7858bfb288d2ff018080ff0180808080";
            
            const curried: SExp = sexpUtil.curry(
                uncurriedProgram,
                toCurry
            );

            expect(
                sexpUtil.toHex(curried)
            ).to.equal(programHex);
        });

        it("irulast/chia-crypto-utils - uncurry first cat parent puzzle reveal", () => {
            // (a (q 2 94 (c 2 (c (c 5 (c (sha256 44 5) (c 11 ()))) (c (a 23 47) (c 95 (c (a 46 (c 2 (c 23 ()))) (c (sha256 639 1407 2943) (c -65 (c 383 (c 767 (c 1535 (c 3071 ())))))))))))) (c (q (((-54 . 61) 70 2 . 51) (60 . 4) 1 1 . -53) ((a 2 (i 5 (q 2 50 (c 2 (c 13 (c (sha256 34 (sha256 44 52) (sha256 34 (sha256 34 (sha256 44 92) 9) (sha256 34 11 (sha256 44 ())))) ())))) (q . 11)) 1) (a (i 11 (q 2 (i (= (a 46 (c 2 (c 19 ()))) 2975) (q 2 38 (c 2 (c (a 19 (c 95 (c 23 (c 47 (c -65 (c 383 (c 27 ()))))))) (c 383 ())))) (q 8)) 1) (q 2 (i 23 (q 2 (i (not -65) (q . 383) (q 8)) 1) (q 8)) 1)) 1) (c (c 5 39) (c (+ 11 87) 119)) 2 (i 5 (q 2 (i (= (a (i (= 17 120) (q . 89) ()) 1) (q . -113)) (q 2 122 (c 2 (c 13 (c 11 (c (c -71 377) ()))))) (q 2 90 (c 2 (c (a (i (= 17 120) (q 4 120 (c (a 54 (c 2 (c 19 (c 41 (c (sha256 44 91) (c 43 ())))))) 57)) (q 2 (i (= 17 36) (q 4 36 (c (sha256 32 41) 57)) (q . 9)) 1)) 1) (c (a (i (= 17 120) (q . 89) ()) 1) (c (a 122 (c 2 (c 13 (c 11 (c 23 ()))))) ())))))) 1) (q 4 () (c () 23))) 1) ((a (i 5 (q 4 9 (a 38 (c 2 (c 13 (c 11 ()))))) (q . 11)) 1) 11 34 (sha256 44 88) (sha256 34 (sha256 34 (sha256 44 92) 5) (sha256 34 (a 50 (c 2 (c 7 (c (sha256 44 44) ())))) (sha256 44 ())))) (a (i (l 5) (q 11 (q . 2) (a 46 (c 2 (c 9 ()))) (a 46 (c 2 (c 13 ())))) (q 11 44 5)) 1) (c (c 40 (c 95 ())) (a 126 (c 2 (c (c (c 47 5) (c 95 383)) (c (a 122 (c 2 (c 11 (c 5 (q ()))))) (c 23 (c -65 (c 383 (c (sha256 1279 (a 54 (c 2 (c 9 (c 2815 (c (sha256 44 45) (c 21 ())))))) 5887) (c 1535 (c 3071 ()))))))))))) 2 42 (c 2 (c 95 (c 59 (c (a (i 23 (q 9 45 (sha256 39 (a 54 (c 2 (c 41 (c 87 (c (sha256 44 -71) (c 89 ())))))) -73)) ()) 1) (c 23 (c 5 (c 767 (c (c (c 36 (c (sha256 124 47 383) ())) (c (c 48 (c (sha256 -65 (sha256 124 21 (+ 383 (- 735 43) 767))) ())) 19)) ()))))))))) 1))
            const uncurriedProgram: SExp = sexpUtil.fromHex("ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff2cff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff0bff82027fff82057fff820b7f80ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff81ca3dff46ff0233ffff3c04ff01ff0181cbffffff02ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff22ffff0bff2cff3480ffff0bff22ffff0bff22ffff0bff2cff5c80ff0980ffff0bff22ff0bffff0bff2cff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff26ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ffff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff5affff04ff02ffff04ffff02ffff03ffff09ff11ff7880ffff01ff04ff78ffff04ffff02ff36ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff2cff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff2480ffff01ff04ff24ffff04ffff0bff20ff2980ff398080ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff04ffff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffffff02ffff03ff05ffff01ff04ff09ffff02ff26ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff22ffff0bff2cff5880ffff0bff22ffff0bff22ffff0bff2cff5c80ff0580ffff0bff22ffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff2cff2c80ff8080808080ffff0bff2cff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bff2cff058080ff0180ffff04ffff04ff28ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff7affff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff0bff8204ffffff02ff36ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff2cff2d80ffff04ff15ff80808080808080ff8216ff80ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff2affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff0bff27ffff02ff36ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff2cff81b980ffff04ff59ff80808080808080ff81b78080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff24ffff04ffff0bff7cff2fff82017f80ff808080ffff04ffff04ff30ffff04ffff0bff81bfffff0bff7cff15ffff10ff82017fffff11ff8202dfff2b80ff8202ff808080ff808080ff138080ff80808080808080808080ff018080");
            const toCurry: SExp[] = [
                // 0x72dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc
                sexpUtil.fromHex("a072dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc"),
                // 0xe224fbe34909e0192800a3fe841013572975cac5d7c67ae5e79cef31efb6d808
                sexpUtil.fromHex("a0e224fbe34909e0192800a3fe841013572975cac5d7c67ae5e79cef31efb6d808"),
                // (q (51 () -113 (a (q 2 (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 639 ()))) ()))) (a 639 (c 11 (c 23 (c 47 (c 95 (c -65 1407))))))) (c (q 49 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0xb6b322066033f70cddddf13c0b9762d0b91866d27f40f21b88e569813d0f95d8d274cd97ccf7d707127fa1af1f7d240c) 1)) ((a (q 2 (i 47 (q 8) (q 2 (i (= 45 2) () (q 8)) 1)) 1) (c (q . 0x6468acf73bd52b38ee43ab1462a03121672f5057bfd3f818abeb2eea66f34ecb) 1)) ())) (51 0x9b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490ab 1000 (0x9b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490ab)))
                sexpUtil.fromHex("ff01ffff33ff80ff818fffff02ffff01ff02ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff82027fff80808080ff80808080ffff02ff82027fffff04ff0bffff04ff17ffff04ff2fffff04ff5fffff04ff81bfff82057f80808080808080ffff04ffff01ff31ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0b6b322066033f70cddddf13c0b9762d0b91866d27f40f21b88e569813d0f95d8d274cd97ccf7d707127fa1af1f7d240cff018080ffffff02ffff01ff02ffff03ff2fffff01ff0880ffff01ff02ffff03ffff09ff2dff0280ff80ffff01ff088080ff018080ff0180ffff04ffff01a06468acf73bd52b38ee43ab1462a03121672f5057bfd3f818abeb2eea66f34ecbff018080ff808080ffff33ffa09b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490abff8203e8ffffa09b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490ab808080"),
            ];
            // (a (q 2 (q 2 94 (c 2 (c (c 5 (c (sha256 44 5) (c 11 ()))) (c (a 23 47) (c 95 (c (a 46 (c 2 (c 23 ()))) (c (sha256 639 1407 2943) (c -65 (c 383 (c 767 (c 1535 (c 3071 ())))))))))))) (c (q (((-54 . 61) 70 2 . 51) (60 . 4) 1 1 . -53) ((a 2 (i 5 (q 2 50 (c 2 (c 13 (c (sha256 34 (sha256 44 52) (sha256 34 (sha256 34 (sha256 44 92) 9) (sha256 34 11 (sha256 44 ())))) ())))) (q . 11)) 1) (a (i 11 (q 2 (i (= (a 46 (c 2 (c 19 ()))) 2975) (q 2 38 (c 2 (c (a 19 (c 95 (c 23 (c 47 (c -65 (c 383 (c 27 ()))))))) (c 383 ())))) (q 8)) 1) (q 2 (i 23 (q 2 (i (not -65) (q . 383) (q 8)) 1) (q 8)) 1)) 1) (c (c 5 39) (c (+ 11 87) 119)) 2 (i 5 (q 2 (i (= (a (i (= 17 120) (q . 89) ()) 1) (q . -113)) (q 2 122 (c 2 (c 13 (c 11 (c (c -71 377) ()))))) (q 2 90 (c 2 (c (a (i (= 17 120) (q 4 120 (c (a 54 (c 2 (c 19 (c 41 (c (sha256 44 91) (c 43 ())))))) 57)) (q 2 (i (= 17 36) (q 4 36 (c (sha256 32 41) 57)) (q . 9)) 1)) 1) (c (a (i (= 17 120) (q . 89) ()) 1) (c (a 122 (c 2 (c 13 (c 11 (c 23 ()))))) ())))))) 1) (q 4 () (c () 23))) 1) ((a (i 5 (q 4 9 (a 38 (c 2 (c 13 (c 11 ()))))) (q . 11)) 1) 11 34 (sha256 44 88) (sha256 34 (sha256 34 (sha256 44 92) 5) (sha256 34 (a 50 (c 2 (c 7 (c (sha256 44 44) ())))) (sha256 44 ())))) (a (i (l 5) (q 11 (q . 2) (a 46 (c 2 (c 9 ()))) (a 46 (c 2 (c 13 ())))) (q 11 44 5)) 1) (c (c 40 (c 95 ())) (a 126 (c 2 (c (c (c 47 5) (c 95 383)) (c (a 122 (c 2 (c 11 (c 5 (q ()))))) (c 23 (c -65 (c 383 (c (sha256 1279 (a 54 (c 2 (c 9 (c 2815 (c (sha256 44 45) (c 21 ())))))) 5887) (c 1535 (c 3071 ()))))))))))) 2 42 (c 2 (c 95 (c 59 (c (a (i 23 (q 9 45 (sha256 39 (a 54 (c 2 (c 41 (c 87 (c (sha256 44 -71) (c 89 ())))))) -73)) ()) 1) (c 23 (c 5 (c 767 (c (c (c 36 (c (sha256 124 47 383) ())) (c (c 48 (c (sha256 -65 (sha256 124 21 (+ 383 (- 735 43) 767))) ())) 19)) ()))))))))) 1)) (c (q . 0x72dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdc) (c (q . 0xe224fbe34909e0192800a3fe841013572975cac5d7c67ae5e79cef31efb6d808) (c (q 1 (51 () -113 (a (q 2 (q 4 (c 4 (c 5 (c (a 6 (c 2 (c 639 ()))) ()))) (a 639 (c 11 (c 23 (c 47 (c 95 (c -65 1407))))))) (c (q 49 2 (i (l 5) (q 11 (q . 2) (a 6 (c 2 (c 9 ()))) (a 6 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1)) (c (q . 0xb6b322066033f70cddddf13c0b9762d0b91866d27f40f21b88e569813d0f95d8d274cd97ccf7d707127fa1af1f7d240c) 1)) ((a (q 2 (i 47 (q 8) (q 2 (i (= 45 2) () (q 8)) 1)) 1) (c (q . 0x6468acf73bd52b38ee43ab1462a03121672f5057bfd3f818abeb2eea66f34ecb) 1)) ())) (51 0x9b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490ab 1000 (0x9b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490ab))) 1))))
            const programHex ="ff02ffff01ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff2cff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff0bff82027fff82057fff820b7f80ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff81ca3dff46ff0233ffff3c04ff01ff0181cbffffff02ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff22ffff0bff2cff3480ffff0bff22ffff0bff22ffff0bff2cff5c80ff0980ffff0bff22ff0bffff0bff2cff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff26ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ffff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff5affff04ff02ffff04ffff02ffff03ffff09ff11ff7880ffff01ff04ff78ffff04ffff02ff36ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff2cff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff2480ffff01ff04ff24ffff04ffff0bff20ff2980ff398080ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff04ffff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffffff02ffff03ff05ffff01ff04ff09ffff02ff26ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff22ffff0bff2cff5880ffff0bff22ffff0bff22ffff0bff2cff5c80ff0580ffff0bff22ffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff2cff2c80ff8080808080ffff0bff2cff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bff2cff058080ff0180ffff04ffff04ff28ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff7affff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff0bff8204ffffff02ff36ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff2cff2d80ffff04ff15ff80808080808080ff8216ff80ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff2affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff0bff27ffff02ff36ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff2cff81b980ffff04ff59ff80808080808080ff81b78080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff24ffff04ffff0bff7cff2fff82017f80ff808080ffff04ffff04ff30ffff04ffff0bff81bfffff0bff7cff15ffff10ff82017fffff11ff8202dfff2b80ff8202ff808080ff808080ff138080ff80808080808080808080ff018080ffff04ffff01a072dec062874cd4d3aab892a0906688a1ae412b0109982e1797a170add88bdcdcffff04ffff01a0e224fbe34909e0192800a3fe841013572975cac5d7c67ae5e79cef31efb6d808ffff04ffff01ff01ffff33ff80ff818fffff02ffff01ff02ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff82027fff80808080ff80808080ffff02ff82027fffff04ff0bffff04ff17ffff04ff2fffff04ff5fffff04ff81bfff82057f80808080808080ffff04ffff01ff31ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b0b6b322066033f70cddddf13c0b9762d0b91866d27f40f21b88e569813d0f95d8d274cd97ccf7d707127fa1af1f7d240cff018080ffffff02ffff01ff02ffff03ff2fffff01ff0880ffff01ff02ffff03ffff09ff2dff0280ff80ffff01ff088080ff018080ff0180ffff04ffff01a06468acf73bd52b38ee43ab1462a03121672f5057bfd3f818abeb2eea66f34ecbff018080ff808080ffff33ffa09b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490abff8203e8ffffa09b9eb32223755ac209e0ab0e0e0338d8129cd041bd0da606bc7cb080c54490ab808080ff0180808080";
            
            const curried: SExp = sexpUtil.curry(
                uncurriedProgram,
                toCurry
            );

            expect(
                sexpUtil.toHex(curried)
            ).to.equal(programHex);
        });
    });

    describe.only("P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM", () => {
        it("sha256trees to the correct value", () => {
            const program: SExp = sexpUtil.fromHex(sexpUtil.P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM);
            const hash = sexpUtil.sha256tree(program);

            // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/p2_delegated_puzzle_or_hidden_puzzle.clvm.hex.sha256tree
            const expectedHash = "e9aaa49f45bad5c889b86ee3341550c155cfdd10c3a6757de618d20612fffd52";

            expect(hash).to.equal(expectedHash);
        });
    });
});
