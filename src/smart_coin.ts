import { Bytes, CLVMObject, OPERATOR_LOOKUP, op_sha256, run_program, SExp, sexp_from_stream, Stream } from "clvm";
import { Coin } from "./util/serializer/types/coin";
import { CoinSpend } from "./util/serializer/types/coin_spend";
import { bytes, uint } from "./xch/providers/provider_types";
import { Util } from  "./util";
import { BigNumber } from "@ethersproject/bignumber";

export type SmartCoinConstructorArgs = {
    parentCoinInfo?: string | null,
    puzzleHash?: string | null,
    amount?: uint | null,
    puzzle?: SExp | null
};

export class SmartCoin {
    public parentCoinInfo: string | null;
    public puzzleHash: string | null;
    public amount: uint | null;

    public puzzle: SExp | null;
    
    constructor({
        parentCoinInfo = null,
        puzzleHash = null,
        amount = null,
        puzzle = null,
    }: SmartCoinConstructorArgs) {
        this.parentCoinInfo = parentCoinInfo;
        this.puzzleHash = puzzleHash;
        this.amount = amount !== null ? BigNumber.from(amount) : null;
        this.puzzle = puzzle;

        this.calculatePuzzleHash();
    }

    public static fromCoin(coin: Coin | null, puzzle?: SExp | null): SmartCoin {
        if(puzzle === undefined) {
            puzzle = null;
        }

        let amount = coin?.amount ?? null;
        if(amount !== null) {
            amount = BigNumber.from(amount);
        }

        return new SmartCoin({
            parentCoinInfo: coin?.parentCoinInfo ?? null,
            puzzleHash: coin?.puzzleHash ?? null,
            amount,
            puzzle: puzzle ?? null
        });
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
    //todo
    private SExpFromHex(hex: string): SExp {
        //aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        const s: Stream = new Stream(new Bytes(
            Buffer.from(hex, "hex")
        ));
        const sexp: SExp = sexp_from_stream(s, SExp.to);
        return sexp;
    }

    private calculatePuzzleHash(): void {
        if(this.puzzle === null) return;

        const sha256tree1Program = this.SExpFromHex("ff02ffff01ff02ff02ffff04ff02ffff04ff05ff80808080ffff04ffff01ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff02ffff04ff02ffff04ff09ff80808080ffff02ff02ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080");
        const sha256tree1ProgramSolution = this.puzzle;
        const result: CLVMObject = run_program(
            sha256tree1Program,
            sha256tree1ProgramSolution,
            OPERATOR_LOOKUP
        )[1];
        this.puzzleHash = Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result.atom!.data()
        ).toString("hex");
    }

    public setParentCoinInfo(newValue: string): void {
        this.parentCoinInfo = newValue;
    }

    public setPuzzleHash(newValue: string): void {
        if(this.puzzle === null) {
            this.puzzleHash = newValue;
        }
    }

    public setAmount(newValue: uint): void {
        this.amount = BigNumber.from(newValue);
    }

    public setPuzzle(newValue: SExp): void {
        this.puzzle = newValue;
        this.calculatePuzzleHash();
    }

    private hasCoinInfo(): boolean {
        return this.parentCoinInfo !== null &&
            this.puzzleHash !== null &&
            this.amount !== null;
    }

    public toCoin(): Coin | null {
        if(!this.hasCoinInfo()) {
            return null;
        }

        const c = new Coin();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.parentCoinInfo = this.parentCoinInfo!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.puzzleHash = this.puzzleHash!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        c.amount = this.amount!;

        return c;
    }

    public spend(solution: SExp): CoinSpend | null {
        if(this.puzzle === null) {
            return null;
        }

        const c = this.toCoin();
        if(c === null) {
            return null;
        }

        const cs = new CoinSpend();
        cs.coin = c;
        cs.puzzleReveal = this.puzzle;
        cs.solution = solution;

        return cs;
    }

    public getId(): bytes | null {
        const c = this.toCoin();
        if(c === null) {
            return null;
        }

        return Util.coin.getId(c);
    }

    public getName(): bytes | null {
        return this.getId();
    }
}