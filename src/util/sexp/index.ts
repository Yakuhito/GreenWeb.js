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

    public toHex(sexp: SExp | null | undefined): bytes {
        return sexp?.as_bin().hex() ?? "";
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

    public runWithCost(program: SExp, solution: SExp, max_cost?: number): [SExp, number] {
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
    Uses chialisp to get the program's sha256tree hash
    (venv) yakuhito@catstation:~/projects/clvm_tools$ cat hash.clvm 
    (mod program
        (defun sha256tree (TREE)
           (if (l TREE)
               (sha256 2 (sha256tree (f TREE)) (sha256tree (r TREE)))
               (sha256 1 TREE)
            )
        )

        (sha256tree program)
    )
    (venv) yakuhito@catstation:~/projects/clvm_tools$ run hash.clvm 
    (a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))
    (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 2 (c 2 (c 3 ()))) (c (q 2 (i (l 5) (q 11 (q . 2) (a 2 (c 2 (c 9 ()))) (a 2 (c 2 (c 13 ())))) (q 11 (q . 1) 5)) 1) 1))'
    ff02ffff01ff02ff02ffff04ff02ffff04ff03ff80808080ffff04ffff01ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff02ffff04ff02ffff04ff09ff80808080ffff02ff02ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080
    (venv) yakuhito@catstation:~/projects/clvm_tools$
    */
    public readonly SHA256TREE_PROGRAM = "ff02ffff01ff02ff02ffff04ff02ffff04ff03ff80808080ffff04ffff01ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff02ffff04ff02ffff04ff09ff80808080ffff02ff02ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080";
    public sha256tree(program: SExp): bytes {
        const result: SExp = this.run(
            this.fromHex(this.SHA256TREE_PROGRAM),
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
    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L114
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

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L125
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

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L33
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

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L18
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

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/types/blockchain_format/program.py#L104
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

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L52
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

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L81
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

    /*
    Uses chialisp to curry arguments into program (is that how you say it?)
    (venv) yakuhito@catstation:~/projects/clvm_tools$ cat curry.clvm 
    ; https://chialisp.com/docs/common_functions
    (mod args
        ;; utility function used by curry
        (defun fix_curry_args (items core)
            (if items
                (qq (c (q . (unquote (f items))) (unquote (fix_curry_args (r items) core))))
                core
            )
        )

        ; (curry sum (list 50 60)) => returns a function that is like (sum 50 60 ...)
        (defun curry (func list_of_args) (qq (a (q . (unquote func)) (unquote (fix_curry_args list_of_args (q . 1))))))

        (curry (f args) (r args))
    )
    (venv) yakuhito@catstation:~/projects/clvm_tools$ run curry.clvm 
    (a (q 2 4 (c 2 (c 5 (c 7 ())))) (c (q (c (q . 2) (c (c (q . 1) 5) (c (a 6 (c 2 (c 11 (q 1)))) ()))) 2 (i 5 (q 4 (q . 4) (c (c (q . 1) 9) (c (a 6 (c 2 (c 13 (c 11 ())))) ()))) (q . 11)) 1) 1))
    (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(a (q 2 4 (c 2 (c 5 (c 7 ())))) (c (q (c (q . 2) (c (c (q . 1) 5) (c (a 6 (c 2 (c 11 (q 1)))) ()))) 2 (i 5 (q 4 (q . 4) (c (c (q . 1) 9) (c (a 6 (c 2 (c 13 (c 11 ())))) ()))) (q . 11)) 1) 1))'
    ff02ffff01ff02ff04ffff04ff02ffff04ff05ffff04ff07ff8080808080ffff04ffff01ffff04ffff0102ffff04ffff04ffff0101ff0580ffff04ffff02ff06ffff04ff02ffff04ff0bffff01ff0180808080ff80808080ff02ffff03ff05ffff01ff04ffff0104ffff04ffff04ffff0101ff0980ffff04ffff02ff06ffff04ff02ffff04ff0dffff04ff0bff8080808080ff80808080ffff010b80ff0180ff018080
    (venv) yakuhito@catstation:~/projects/clvm_tools$
    */
    public readonly CURRY_PROGRAM = "ff02ffff01ff02ff04ffff04ff02ffff04ff05ffff04ff07ff8080808080ffff04ffff01ffff04ffff0102ffff04ffff04ffff0101ff0580ffff04ffff02ff06ffff04ff02ffff04ff0bffff01ff0180808080ff80808080ff02ffff03ff05ffff01ff04ffff0104ffff04ffff04ffff0101ff0980ffff04ffff02ff06ffff04ff02ffff04ff0dffff04ff0bff8080808080ff80808080ffff010b80ff0180ff018080";
    public curry(program: SExp, args: SExp[]): SExp {
        const currySolution: SExp = SExp.to([
            program,
            ...args
        ]);

        return this.run(
            this.fromHex(this.CURRY_PROGRAM),
            currySolution
        );
    }
}