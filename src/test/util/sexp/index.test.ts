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
});
