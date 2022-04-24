/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-len */
import { expect } from "chai";
import { Bytes, CLVMObject, SExp, Tuple } from "clvm";
import { Util } from "../../../../util";
import { ConditionOpcode } from "../../../../xch/providers/private_key/condition_opcodes";
import { ConditionWithArgs } from "../../../../xch/providers/private_key/condition_with_args";
import { ConditionsDict, SignUtils } from "../../../../xch/providers/private_key/sign_utils";
import { bytes } from "../../../../xch/providers/provider_types";

describe("SignUtils", () => {
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

            const program: SExp = Util.sexp.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = Util.sexp.fromHex("ff8080"); // (())
            const res = SignUtils.conditionsDictForSolution(program, solution, Util.sexp.MAX_BLOCK_COST_CLVM);

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
            const program: SExp = Util.sexp.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = Util.sexp.fromHex("ff0180"); // (1) => should throw exception

            const res = SignUtils.conditionsDictForSolution(program, solution, Util.sexp.MAX_BLOCK_COST_CLVM);
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

            const program: SExp = Util.sexp.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = Util.sexp.fromHex("ff8080"); // (())
            const res = SignUtils.conditionsForSolution(program, solution, Util.sexp.MAX_BLOCK_COST_CLVM);

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
            const program: SExp = Util.sexp.fromHex("ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080"); // ()
            const solution: SExp = Util.sexp.fromHex("ff0180"); // (1) => should throw exception

            const res = SignUtils.conditionsForSolution(program, solution, Util.sexp.MAX_BLOCK_COST_CLVM);
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
            const sexp: SExp = Util.sexp.fromHex("ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980ffff49ff830186a08080"); // ()
            const res = SignUtils.parseSExpToConditions(sexp);

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
            const sexp: SExp = Util.sexp.fromHex("ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980ff80ffff49ff830186a08080"); // ()
            const res = SignUtils.parseSExpToConditions(sexp);

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
            const sexp: SExp = Util.sexp.fromHex("ff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980");
            const res = SignUtils.parseSExpToCondition(sexp);

            expect(res[0]).to.be.false;
            expect(res[1]).to.not.be.null;
            expect(res[1]?.opcode).to.equal(ConditionOpcode.CREATE_COIN);
            expect(res[1]?.vars.length).to.equal(2);
            expect(res[1]?.vars[0]).to.equal("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664");
            expect(res[1]?.vars[1]).to.equal("0539"); // 1337
        });

        it("Works if given () as input", () => {
            const sexp: SExp = Util.sexp.fromHex("80"); // ()
            const res = SignUtils.parseSExpToCondition(sexp);

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
            const sexp: SExp = Util.sexp.fromHex("ff31ff33ff3780");
            const res: bytes[] = SignUtils.asAtomList(sexp);
            
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
            
            const res: bytes[] = SignUtils.asAtomList(sexp);
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
            const res = SignUtils.conditionsByOpcode(conditions);

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

            const res = SignUtils.pkmPairsForConditionsDict(
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

            const res = SignUtils.pkmPairsForConditionsDict(
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

            const res = SignUtils.pkmPairsForConditionsDict(
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