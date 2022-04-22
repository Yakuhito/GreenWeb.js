/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-len */
import { expect } from "chai";
import { Bytes, CLVMObject, SExp, sexp_from_stream, Stream, Tuple } from "clvm";
import { ConditionOpcode } from "../../../../xch/providers/private_key/condition_opcodes";
import { ConditionWithArgs } from "../../../../xch/providers/private_key/condition_with_args";
import { SignUtils } from "../../../../xch/providers/private_key/sign_utils";
import { bytes } from "../../../../xch/providers/provider_types";

//todo: arrange test describes to match the function definition order in sign_utils.ts

describe.only("SignUtils", () => {
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

    const _SExpFromSerialized = (serialized: bytes) => {
        const s: Stream = new Stream(new Bytes(
            Buffer.from(serialized, "hex")
        ));
        const sexp: SExp = sexp_from_stream(s, SExp.to);
        return sexp;
    }

    describe("asAtomList()", () => {
        it("Works", () => {
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(list 0x31 0x33 0x37)'
            (49 51 55)
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(49 51 55)'
            ff31ff33ff3780
            (venv) yakuhito@catstation:~/projects/clvm_tools$
            */
            const sexp: SExp = _SExpFromSerialized("ff31ff33ff3780");
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

    describe("parseSExpToCondition()", () => {
        it("Works for a normal condition", () => {
            /*
                (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337)'
                (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337)
                (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 1337)'
                ff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980
            */
            const sexp: SExp = _SExpFromSerialized("ff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff82053980");
            const res = SignUtils.parseSExpToCondition(sexp);

            expect(res[0]).to.be.false;
            expect(res[1]).to.not.be.null;
            expect(res[1]?.opcode).to.equal(ConditionOpcode.CREATE_COIN);
            expect(res[1]?.vars.length).to.equal(2);
            expect(res[1]?.vars[0]).to.equal("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664");
            expect(res[1]?.vars[1]).to.equal("0539"); // 1337
        });

        it("Works if given () as input", () => {
            const sexp: SExp = _SExpFromSerialized("80"); // ()
            const res = SignUtils.parseSExpToCondition(sexp);

            expect(res[0]).to.be.true;
            expect(res[1]).to.be.null;
        });
    });
});

/*
(venv) yakuhito@catstation:~/projects/clvm_tools$ cat test.clvm 
(mod (THROW_ERROR)
    (defconstant AGG_SIG 50)
  	(defconstant CREATE_COIN 51)
  	(defconstant AGG_SIG_ME 57)

  	(if (= THROW_ERROR 1)
  		(x "ERROR")
  		(list
  			(list AGG_SIG 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")
  			(list CREATE_COIN 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)
  		)
  	)
)
(venv) yakuhito@catstation:~/projects/clvm_tools$ run test.clvm 
(a (q 2 (i (= 5 (q . 1)) (q 8 (q . "ERROR")) (q 4 (c 4 (q 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")) (c (c 6 (q 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)) ()))) 1) (c (q 50 . 51) 1))
(venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 (i (= 5 (q . 1)) (q 8 (q . "ERROR")) (q 4 (c 4 (q 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito")) (c (c 6 (q 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 10)) ()))) 1) (c (q 50 . 51) 1))'
ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080
(venv) yakuhito@catstation:~/projects/clvm_tools$


            const SERIALIZED_CLVM = "ff02ffff01ff02ffff03ffff09ff05ffff010180ffff01ff08ffff01854552524f5280ffff01ff04ffff04ff04ffff01ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f8080ffff04ffff04ff06ffff01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff0a8080ff80808080ff0180ffff04ffff01ff3233ff018080";
            const s: Stream = new Stream(new Bytes(
                Buffer.from(SERIALIZED_CLVM, "hex")
            ));
            const program: SExp = sexp_from_stream(s, SExp.to);
            const solution: SExp = SExp.to([SExp.FALSE]);
            const result: CLVMType = run_program(program, solution, OPERATOR_LOOKUP)[1];
*/