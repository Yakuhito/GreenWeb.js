import { SExp } from "clvm";

export class SignUtils {

    // returns 3 values:
    // 1: err (false if there wasno error)
    // 2: conditions dictionary
    // 3: cost
    public static conditionsDictForSolution(
        puzzleReveal: SExp,
        solution: SExp,
        maxCost: number
    ): [boolean, , number] {
        //todo
        return [false, [], 0];
    }
}