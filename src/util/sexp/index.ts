/* eslint-disable max-len */
import { Bytes, CLVMType, OPERATOR_LOOKUP, run_program, SExp, sexp_from_stream, Stream } from "clvm";
import { bytes } from "../../xch/providers/provider_types";
import { ConditionOpcode } from "./condition_opcodes";
import { ConditionWithArgs } from "./condition_with_args";

export type ConditionsDict = Map<ConditionOpcode, ConditionWithArgs[]>;

export class SExpUtil {
    public readonly MAX_BLOCK_COST_CLVM = 11000000000;

    public fromHex(hex: bytes): SExp {
        const s: Stream = new Stream(new Bytes(
            Buffer.from(hex, "hex")
        ));
        const sexp: SExp = sexp_from_stream(s, SExp.to);
        return sexp;
    }

    public toHex(sexp: SExp): bytes {
        return sexp.as_bin().hex();
    }

    public run(program: SExp, solution: SExp, max_cost?: number): SExp {
        const res: CLVMType = run_program(
            program,
            solution,
            OPERATOR_LOOKUP,
            max_cost
        )[1];

        return new SExp(res);
    }

    public runWithCost(program: SExp, solution: SExp, max_cost: number): [SExp, number] {
        const r = run_program(
            program,
            solution,
            OPERATOR_LOOKUP,
            max_cost
        );

        return [
            new SExp(r[1]),
            r[0]
        ];
    }

    /*
    Uses chialisp to get the program's sha256tree1 hash
    (venv) yakuhito@catstation:~/projects/clvm_tools$ cat hash.clvm 
    (mod (program) 
	    (defun sha256tree1 (TREE)
            (if (l TREE)
                (sha256 2 (sha256tree1 (f TREE)) (sha256tree1 (r TREE)))
                (sha256 1 TREE)
            )
        )

        (sha256tree1 program)
    )
    (venv) yakuhito@catstation:~/projects/clvm_tools$ run hash.clvm 
    (a (q 2 2 (c 2 (c 5 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))
    (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 2 (c 2 (c 5 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))'
    ff02ffff01ff02ff02ffff04ff02ffff04ff05ff80808080ffff04ffff01ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff02ffff04ff02ffff04ff09ff80808080ffff02ff02ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080
    (venv) yakuhito@catstation:~/projects/clvm_tools$
    */
    public readonly SHA256TREE1_PROGRAM = "ff02ffff01ff02ff02ffff04ff02ffff04ff05ff80808080ffff04ffff01ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff02ffff04ff02ffff04ff09ff80808080ffff02ff02ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";
    public sha256tree1(program: SExp): bytes {
        const result: SExp = this.run(
            this.fromHex(this.SHA256TREE1_PROGRAM),
            program
        );
        
        return Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result.atom!.data()
        ).toString("hex");
    }

    // returns 3 values:
    // 1: err (false if there wasno error)
    // 2: conditions dictionary
    // 3: cost
    public conditionsDictForSolution(
        puzzleReveal: SExp,
        solution: SExp,
        maxCost: number
    ): [boolean, ConditionsDict | null, number] {
        const [error, result, cost] = this.conditionsForSolution(puzzleReveal, solution, maxCost);
        if(error || result === null) {
            return [true, null, 0];
        }
        
        return [false, this.conditionsByOpcode(result), cost];
    }

    public conditionsForSolution(
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
            const [error, result] = this.parseSExpToConditions(r);

            return [error, result, cost];
        } catch(_) {
            return [true, null, 0];
        }
    }

    public parseSExpToConditions(
        sexp: SExp,
    ): [boolean, ConditionWithArgs[] | null] {
        const results: ConditionWithArgs[] = [];
        for(const e of sexp.as_iter()) {
            const [error, cvp] = this.parseSExpToCondition(e);
            if(error || cvp === null) {
                return [true, null];
            }
            results.push(cvp);
        }

        return [false, results];
    }

    public parseSExpToCondition(
        sexp: SExp,
    ): [boolean, ConditionWithArgs | null] {
        const as_atoms = this.asAtomList(sexp);
        if(as_atoms.length < 1) {
            return [true, null];
        }

        const opcode = as_atoms[0] as ConditionOpcode;
        const cwa = new ConditionWithArgs();
        cwa.opcode = opcode;
        cwa.vars = as_atoms.slice(1);

        return [false, cwa];
    }

    public asAtomList(
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

    public conditionsByOpcode(
        conditions: ConditionWithArgs[],
    ): ConditionsDict {
        const d: ConditionsDict = new Map<ConditionOpcode, ConditionWithArgs[]>();
        
        for(let i = 0; i < conditions.length; i++) {
            const cvp = conditions[i];

            let item = d.get(cvp.opcode);
            if(item === undefined) {
                item = [];
            }

            item.push(cvp);
            d.set(cvp.opcode, item);
        }

        return d;
    }

    public pkmPairsForConditionsDict(
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