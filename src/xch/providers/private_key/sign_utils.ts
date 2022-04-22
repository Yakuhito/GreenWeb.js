import { Bytes, OPERATOR_LOOKUP, run_program, SExp } from "clvm";
import { bytes } from "../provider_types";
import { ConditionOpcode } from "./condition_opcodes";
import { ConditionWithArgs } from "./condition_with_args";

export type ConditionsDict = Map<ConditionOpcode, ConditionWithArgs[]>;

export class SignUtils {
    // returns 3 values:
    // 1: err (false if there wasno error)
    // 2: conditions dictionary
    // 3: cost
    public static conditionsDictForSolution(
        puzzleReveal: SExp,
        solution: SExp,
        maxCost: number
    ): [boolean, ConditionsDict | null, number] {
        const [error, result, cost] = SignUtils.conditionsForSolution(puzzleReveal, solution, maxCost);
        if(error || result === null) {
            return [true, null, 0];
        }
        
        return [false, SignUtils.conditionsByOpcode(result), cost];
    }

    public static conditionsForSolution(
        puzzleReveal: SExp,
        solution: SExp,
        maxCost: number,
    ): [boolean, ConditionWithArgs[] | null, number] {
        try {
            const [cost, r] = run_program(
                puzzleReveal,
                solution,
                OPERATOR_LOOKUP,
                maxCost
            );
            const [error, result] = SignUtils.parseSExpToConditions(r);

            return [error, result,cost];
        } catch(_) {
            return [true, null, 0];
        }
    }

    public static parseSExpToConditions(
        sexp: SExp,
    ): [boolean, ConditionWithArgs[] | null] {
        const results: ConditionWithArgs[] = [];
        for(const e of sexp.as_iter()) {
            const [error, cvp] = SignUtils.parseSExpToCondition(e);
            if(error || cvp === null) {
                return [true, null];
            }
            results.push(cvp);
        }

        return [false, results];
    }

    public static parseSExpToCondition(
        sexp: SExp,
    ): [boolean, ConditionWithArgs | null] {
        const as_atoms = SignUtils.asAtomList(sexp);
        if(as_atoms.length < 1) {
            return [true, null];
        }

        const opcode = as_atoms[0] as ConditionOpcode;
        const cwa = new ConditionWithArgs();
        cwa.opcode = opcode;
        cwa.vars = as_atoms.slice(1);

        return [false, cwa];
    }

    public static asAtomList(
        sexp: SExp,
    ): bytes[] {
        const items = [];
        let obj = sexp;
        // eslint-disable-next-line no-constant-condition
        while(true) {
            const pair = obj.pair;
            if(pair === null || pair === undefined) {
                break;
            }
            const atom: Bytes = pair[0].atom;
            if(atom === null || atom === undefined) {
                break;
            }
            items.push(atom.hex());
            obj = pair[1];
        }

        return items;
    }

    public static conditionsByOpcode(
        conditions: ConditionWithArgs[],
    ): ConditionsDict {
        const d: ConditionsDict = new Map<ConditionOpcode, ConditionWithArgs[]>();
        
        for(let i = 0; i < conditions.length; i++) {
            const cvp = conditions[i];
            if(!d.has(cvp.opcode)) {
                d.set(cvp.opcode, []);
            }
            const newItem = d.get(cvp.opcode) ?? [];
            newItem.push(cvp);

            d.set(cvp.opcode, newItem);
        }

        return d;
    }

    public static pkmPairsForConditionsDict(
        conditionsDict: ConditionsDict,
        coinName: bytes,
        additionalData: bytes,
    ): Array<[bytes, bytes]> {
        const ret: Array<[bytes, bytes]> = [];

        for(const cwa of conditionsDict.get(ConditionOpcode.AGG_SIG_UNSAFE) ?? []) {
            ret.push([cwa.vars[0], cwa.vars[1]]);
        }

        for(const cwa of conditionsDict.get(ConditionOpcode.AGG_SIG_ME) ?? []) {
            ret.push([cwa.vars[0], cwa.vars[1] + coinName + additionalData]);
        }

        return ret;
    }
}