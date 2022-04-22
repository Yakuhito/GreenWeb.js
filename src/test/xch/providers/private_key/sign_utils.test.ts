import { expect } from "chai";
import { ConditionOpcode } from "../../../../xch/providers/private_key/condition_opcodes";
import { ConditionWithArgs } from "../../../../xch/providers/private_key/condition_with_args";
import { SignUtils } from "../../../../xch/providers/private_key/sign_utils";

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
});