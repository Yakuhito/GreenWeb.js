/* eslint-disable max-len */
import { Bytes, CLVMObject, OPERATOR_LOOKUP, run_program, SExp, sexp_from_stream, Stream } from "clvm";
import { bytes } from "../xch/providers/provider_types";

// todo: get things from PrivateKeyProvider

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
        return Buffer.from(
            sexp.as_bin().hex()
        ).toString("hex");
    }

    public run(program: SExp, solution: SExp, max_cost?: number): CLVMObject {
        return run_program(
            program,
            solution,
            OPERATOR_LOOKUP,
            max_cost
        )[1];
    }

    public run_with_cost(program: SExp, solution: SExp, max_cost?: number): [CLVMObject, number] {
        const r = run_program(
            program,
            solution,
            OPERATOR_LOOKUP,
            max_cost
        );

        return [
            r[1],
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
        const result: CLVMObject = this.run(
            this.fromHex(this.SHA256TREE1_PROGRAM),
            program
        );
        
        return Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result.atom!.data()
        ).toString("hex");
    }
}