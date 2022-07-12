/* eslint-disable max-len */
import { BigNumberish } from "@ethersproject/bignumber";
import { Bytes, CLVMType, getBLSModule, OPERATOR_LOOKUP, run_program, SExp, sexp_from_stream, Stream } from "clvm";
import { Util } from "..";
import { bytes, Coin } from "../../xch/providers/provider_types";
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

    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/sha256tree_module.clvm.hex
    public readonly SHA256TREE_MODULE_PROGRAM = this.fromHex("ff02ffff01ff02ff02ffff04ff02ffff04ff05ff80808080ffff04ffff01ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff02ffff04ff02ffff04ff09ff80808080ffff02ff02ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080");
    public sha256tree(program: SExp): bytes {
        const result: SExp = this.run(
            this.SHA256TREE_MODULE_PROGRAM,
            SExp.to([program])
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
        cwa.vars = as_atoms.slice(1) as bytes[];

        return [false, cwa];
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/types/blockchain_format/program.py#L104
    public asAtomList(
        sexp: SExp,
    ): bytes[] {
        const items = [];
        // eslint-disable-next-line no-constant-condition
        try {
            for(const e of sexp.as_iter()) {
                if(e.atom) {
                    items.push(e.atom.hex());
                } else {
                    items.push(
                        this.toHex(SExp.to(e))
                    );
                }
            }
        } catch(_) {
            // do nothing
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
    public readonly CURRY_PROGRAM = this.fromHex("ff02ffff01ff02ff04ffff04ff02ffff04ff05ffff04ff07ff8080808080ffff04ffff01ffff04ffff0102ffff04ffff04ffff0101ff0580ffff04ffff02ff06ffff04ff02ffff04ff0bffff01ff0180808080ff80808080ff02ffff03ff05ffff01ff04ffff0104ffff04ffff04ffff0101ff0980ffff04ffff02ff06ffff04ff02ffff04ff0dffff04ff0bff8080808080ff80808080ffff010b80ff0180ff018080");
    public curry(program: SExp, args: SExp[]): SExp {
        const currySolution: SExp = SExp.to([
            program,
            ...args
        ]);

        return this.run(
            this.CURRY_PROGRAM,
            currySolution
        );
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/p2_delegated_puzzle_or_hidden_puzzle.clvm.hex
    public readonly P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM_MOD = this.fromHex("ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080");
    // https://github.com/Chia-Network/chia-blockchain/blob/5f4e39480e2312dc93a7b3609bcea576a9a758f9/chia/wallet/puzzles/p2_delegated_puzzle_or_hidden_puzzle.py#L70
    public readonly DEFAULT_HIDDEN_PUZZLE_PROGRAM = this.fromHex("ff0980");
    public readonly DEFAULT_HIDDEN_PUZZLE_HASH = "711d6c4e32c92e53179b199484cf8c897542bc57f2b22582799f9d657eec4699";
    // https://github.com/Chia-Network/chia-blockchain/blob/5f4e39480e2312dc93a7b3609bcea576a9a758f9/chia/wallet/puzzles/calculate_synthetic_public_key.clvm.hex
    public readonly CALCULATE_SYNTHETIC_PUBLIC_KEY_PROGRAM = this.fromHex("ff1dff02ffff1effff0bff02ff05808080");

    // https://github.com/Chia-Network/chia-blockchain/blob/5f4e39480e2312dc93a7b3609bcea576a9a758f9/chia/wallet/puzzles/p2_delegated_puzzle_or_hidden_puzzle.py
    public calculateSyntheticPublicKey(publicKey: any, hiddenPuzzleHash = this.DEFAULT_HIDDEN_PUZZLE_HASH): any {
        const { G1Element } = getBLSModule();
        
        const r = this.run(
            this.CALCULATE_SYNTHETIC_PUBLIC_KEY_PROGRAM,
            SExp.to([
                Bytes.from(Util.key.publicKeyToHex(publicKey), "hex"),
                Bytes.from(hiddenPuzzleHash, "hex")
            ]),
        );

        return G1Element.from_bytes(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            r.atom!.data()
        );
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/5f4e39480e2312dc93a7b3609bcea576a9a758f9/chia/wallet/puzzles/p2_delegated_puzzle_or_hidden_puzzle.py
    public standardCoinPuzzle(key: any, isSyntheticKey: boolean = false): SExp {
        const syntheticPublicKey = isSyntheticKey ?
            key : this.calculateSyntheticPublicKey(key, this.DEFAULT_HIDDEN_PUZZLE_HASH);

        return this.curry(
            this.P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM_MOD,
            [
                SExp.to(Bytes.from(Util.key.publicKeyToHex(syntheticPublicKey), "hex")),
            ]
        );
    }
    // https://github.com/Chia-Network/chia-blockchain/blob/main/chia/wallet/puzzles/p2_conditions.clvm.hex
    public readonly P2_CONDITIONS_PROGRAM = this.fromHex("ff04ffff0101ff0280");
    public standardCoinSolution(conditions: SExp[]): SExp {
        return SExp.to([
            SExp.to([]),
            this.run(
                this.P2_CONDITIONS_PROGRAM,
                SExp.to([
                    SExp.to(conditions),
                ])
            ),
            SExp.to([])
        ]);
    }

    // https://github.com/irulast/chia-crypto-utils/blob/f1d8ef4c8ed6134e392f4b42ef9a4e30d449f3d3/lib/src/clvm/program.dart#L158
    // https://github.com/Chia-Network/chia-blockchain/blob/22e47a81dfbed053c7a8044b6dc254b8b152b0ab/chia/types/blockchain_format/program.py#L113
    public uncurry(program: SExp): [SExp, SExp[]] | null {
        const programList = [];
        try {
            for(const elem of program.as_iter()) {
                programList.push(elem);
            }
        // eslint-disable-next-line no-empty
        } catch(_) {}

        if(programList.length !== 3) {
            // 'Program is wrong length, should contain 3: (operator, puzzle, arguments)',
            return null;
        }

        if(programList[0].atom?.hex() !== "02") {
            // 'Program is missing apply operator (a)'
            return null;
        }

        const uncurriedModule = this._matchQuotedProgram(programList[1]);
        if (uncurriedModule === null) {
            // 'Puzzle did not match expected pattern'
            return null;
        }

        const uncurriedArgs = this._matchCurriedArgs(programList[2]);
        if(uncurriedArgs.length === 0) {
            return null;
        }
        
        return [uncurriedModule, uncurriedArgs];
    }

    // https://github.com/irulast/chia-crypto-utils/blob/f1d8ef4c8ed6134e392f4b42ef9a4e30d449f3d3/lib/src/clvm/program.dart#L177
    private _matchQuotedProgram(program: SExp): SExp | null {
        const cons = program.as_pair() ?? [null, null];
        if(cons[0]?.atom.hex() === "01" && !cons[1].atom) {
            return cons[1];
        }

        return null;
    }

    // https://github.com/irulast/chia-crypto-utils/blob/f1d8ef4c8ed6134e392f4b42ef9a4e30d449f3d3/lib/src/clvm/program.dart#L185
    private _matchCurriedArgs(program: SExp): SExp[] {
        try {
            const result = this._matchCurriedArgsHelper([], program);
            return result;
        } catch(_) {
            return [];
        }
    }

    // https://github.com/irulast/chia-crypto-utils/blob/f1d8ef4c8ed6134e392f4b42ef9a4e30d449f3d3/lib/src/clvm/program.dart#L190
    private _matchCurriedArgsHelper(
        uncurriedArguments: SExp[],
        inputProgram: SExp,
    ): SExp[] {
        const inputProgramList = []
        if(inputProgram.atom === null) {
            for(const elem of inputProgram.as_iter()) {
                inputProgramList.push(new SExp(elem));
            }
        }

        // base case
        if (inputProgramList.length === 0) {
            return uncurriedArguments;
        }

        const atom = this._matchQuotedAtom(inputProgramList[1]);
        if (atom !== null) {
            uncurriedArguments.push(atom);
        } else {
            const program = this._matchQuotedProgram(inputProgramList[1]);
            if (program === null) {
                return uncurriedArguments;
            }
            uncurriedArguments.push(program);
        }

        const nextArgumentToParse = inputProgramList[2];
        return this._matchCurriedArgsHelper(uncurriedArguments, nextArgumentToParse);
    }

    // https://github.com/irulast/chia-crypto-utils/blob/f1d8ef4c8ed6134e392f4b42ef9a4e30d449f3d3/lib/src/clvm/program.dart#L213
    private _matchQuotedAtom(program: SExp): SExp | null {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cons = program.as_pair()!;
        if(cons[0].atom.hex() === "01" && cons[1].atom) {
            return cons[1];
        }
        return null;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/d0de8038cd95b71fa050f79e3685c51dcf05e13e/chia/wallet/puzzles/cat.clvm.hex
    public readonly CAT_PROGRAM_MOD = this.fromHex("ff02ffff01ff02ff5effff04ff02ffff04ffff04ff05ffff04ffff0bff2cff0580ffff04ff0bff80808080ffff04ffff02ff17ff2f80ffff04ff5fffff04ffff02ff2effff04ff02ffff04ff17ff80808080ffff04ffff0bff82027fff82057fff820b7f80ffff04ff81bfffff04ff82017fffff04ff8202ffffff04ff8205ffffff04ff820bffff80808080808080808080808080ffff04ffff01ffffffff81ca3dff46ff0233ffff3c04ff01ff0181cbffffff02ff02ffff03ff05ffff01ff02ff32ffff04ff02ffff04ff0dffff04ffff0bff22ffff0bff2cff3480ffff0bff22ffff0bff22ffff0bff2cff5c80ff0980ffff0bff22ff0bffff0bff2cff8080808080ff8080808080ffff010b80ff0180ffff02ffff03ff0bffff01ff02ffff03ffff09ffff02ff2effff04ff02ffff04ff13ff80808080ff820b9f80ffff01ff02ff26ffff04ff02ffff04ffff02ff13ffff04ff5fffff04ff17ffff04ff2fffff04ff81bfffff04ff82017fffff04ff1bff8080808080808080ffff04ff82017fff8080808080ffff01ff088080ff0180ffff01ff02ffff03ff17ffff01ff02ffff03ffff20ff81bf80ffff0182017fffff01ff088080ff0180ffff01ff088080ff018080ff0180ffff04ffff04ff05ff2780ffff04ffff10ff0bff5780ff778080ff02ffff03ff05ffff01ff02ffff03ffff09ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff01818f80ffff01ff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ffff04ff81b9ff82017980ff808080808080ffff01ff02ff5affff04ff02ffff04ffff02ffff03ffff09ff11ff7880ffff01ff04ff78ffff04ffff02ff36ffff04ff02ffff04ff13ffff04ff29ffff04ffff0bff2cff5b80ffff04ff2bff80808080808080ff398080ffff01ff02ffff03ffff09ff11ff2480ffff01ff04ff24ffff04ffff0bff20ff2980ff398080ffff010980ff018080ff0180ffff04ffff02ffff03ffff09ff11ff7880ffff0159ff8080ff0180ffff04ffff02ff7affff04ff02ffff04ff0dffff04ff0bffff04ff17ff808080808080ff80808080808080ff0180ffff01ff04ff80ffff04ff80ff17808080ff0180ffffff02ffff03ff05ffff01ff04ff09ffff02ff26ffff04ff02ffff04ff0dffff04ff0bff808080808080ffff010b80ff0180ff0bff22ffff0bff2cff5880ffff0bff22ffff0bff22ffff0bff2cff5c80ff0580ffff0bff22ffff02ff32ffff04ff02ffff04ff07ffff04ffff0bff2cff2c80ff8080808080ffff0bff2cff8080808080ffff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff2effff04ff02ffff04ff09ff80808080ffff02ff2effff04ff02ffff04ff0dff8080808080ffff01ff0bff2cff058080ff0180ffff04ffff04ff28ffff04ff5fff808080ffff02ff7effff04ff02ffff04ffff04ffff04ff2fff0580ffff04ff5fff82017f8080ffff04ffff02ff7affff04ff02ffff04ff0bffff04ff05ffff01ff808080808080ffff04ff17ffff04ff81bfffff04ff82017fffff04ffff0bff8204ffffff02ff36ffff04ff02ffff04ff09ffff04ff820affffff04ffff0bff2cff2d80ffff04ff15ff80808080808080ff8216ff80ffff04ff8205ffffff04ff820bffff808080808080808080808080ff02ff2affff04ff02ffff04ff5fffff04ff3bffff04ffff02ffff03ff17ffff01ff09ff2dffff0bff27ffff02ff36ffff04ff02ffff04ff29ffff04ff57ffff04ffff0bff2cff81b980ffff04ff59ff80808080808080ff81b78080ff8080ff0180ffff04ff17ffff04ff05ffff04ff8202ffffff04ffff04ffff04ff24ffff04ffff0bff7cff2fff82017f80ff808080ffff04ffff04ff30ffff04ffff0bff81bfffff0bff7cff15ffff10ff82017fffff11ff8202dfff2b80ff8202ff808080ff808080ff138080ff80808080808080808080ff018080");
    // https://github.com/Chia-Network/chia-blockchain/blob/d0de8038cd95b71fa050f79e3685c51dcf05e13e/chia/wallet/puzzles/cat.clvm.hex.sha256tree
    public readonly CAT_PROGRAM_MOD_HASH = this.sha256tree(this.CAT_PROGRAM_MOD);
    public CATPuzzle(TAILProgramHash: bytes, innerPuzzle: SExp): SExp {
        return this.curry(
            this.CAT_PROGRAM_MOD,
            [
                SExp.to(Bytes.from(this.CAT_PROGRAM_MOD_HASH, "hex")),
                SExp.to(Bytes.from(TAILProgramHash, "hex")),
                innerPuzzle
            ]
        );
    }
    public CATSolution(
        innerPuzzleSolution: SExp,
        lineageProof: SExp | null,
        prevCoinId: bytes,
        thisCoinInfo: Coin,
        nextCoinProof: Coin,
        prevSubtotal: BigNumberish,
        extraDelta: BigNumberish
    ): SExp {
        return SExp.to([
            innerPuzzleSolution,
            lineageProof ?? SExp.FALSE,
            Bytes.from(prevCoinId, "hex"),
            Util.coin.toProgram(thisCoinInfo),
            Util.coin.toProgram(nextCoinProof),
            Bytes.from(Util.coin.amountToBytes(prevSubtotal), "hex"),
            Bytes.from(Util.coin.amountToBytes(extraDelta), "hex"),
        ]);
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/d0de8038cd95b71fa050f79e3685c51dcf05e13e/chia/wallet/puzzles/genesis_by_coin_id.clvm.hex
    public readonly GENESIS_BY_COIN_ID_TAIL_MOD = this.fromHex("ff02ffff03ff2fffff01ff0880ffff01ff02ffff03ffff09ff2dff0280ff80ffff01ff088080ff018080ff0180");
    public genesisByCoinIdTAIL(genesisId: bytes): SExp {
        return this.curry(
            this.GENESIS_BY_COIN_ID_TAIL_MOD,
            [
                SExp.to(Bytes.from(genesisId, "hex"))
            ]
        );
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/d0de8038cd95b71fa050f79e3685c51dcf05e13e/chia/wallet/puzzles/genesis_by_puzzle_hash.clvm.hex
    public readonly GENESIS_BY_PUZZLE_HASH_TAIL_MOD = this.fromHex("ff02ffff03ff2fffff01ff0880ffff01ff02ffff03ffff09ffff0bff82013fff02ff8202bf80ff2d80ff80ffff01ff088080ff018080ff0180");
    public genesisByPuzzleHashTAIL(puzzleHash: bytes): SExp {
        return this.curry(
            this.GENESIS_BY_PUZZLE_HASH_TAIL_MOD,
            [
                SExp.to(Bytes.from(puzzleHash, "hex"))
            ]
        );
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/d0de8038cd95b71fa050f79e3685c51dcf05e13e/chia/wallet/puzzles/everything_with_signature.clvm.hex
    public readonly EVERYTHING_WITH_SIGNATURE_TAIL_MOD = this.fromHex("ff02ffff01ff04ffff04ff02ffff04ff05ffff04ff5fff80808080ff8080ffff04ffff0132ff018080");
    public everythingWithSignatureTAIL(pubKey: bytes): SExp {
        return this.curry(
            this.EVERYTHING_WITH_SIGNATURE_TAIL_MOD,
            [
                SExp.to(Bytes.from(pubKey, "hex"))
            ]
        );
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/d0de8038cd95b71fa050f79e3685c51dcf05e13e/chia/wallet/puzzles/delegated_tail.clvm.hex
    public readonly DELEGATED_TAIL_MOD = this.fromHex("ff02ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff82027fff80808080ff80808080ffff02ff82027fffff04ff0bffff04ff17ffff04ff2fffff04ff5fffff04ff81bfff82057f80808080808080ffff04ffff01ff31ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080");
    public delegatedTAIL(pubKey: bytes): SExp {
        return this.curry(
            this.DELEGATED_TAIL_MOD,
            [
                SExp.to(Bytes.from(pubKey, "hex"))
            ]
        );
    }
}