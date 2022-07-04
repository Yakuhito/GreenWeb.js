import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { Util } from "..";
import { CAT } from "../../cat";
import { bytes, Coin, uint } from "../../xch/providers/provider_types";
import { CoinSpend } from "../serializer/types/coin_spend";
import { ConditionsDict } from "../sexp";
import { ConditionOpcode } from "../sexp/condition_opcodes";

export class SpendUtil {
    private createCoinCondition(puzzleHash: bytes, amount: uint, memos: bytes[] = []): SExp {
        return SExp.to([
            Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
            Bytes.from(puzzleHash, "hex"),
            Bytes.from(Util.coin.amountToBytes(amount), "hex"),
            ...memos.map(e => Bytes.from(e, "hex"))
        ]);
    }

    private reserveFeeCondition(fee: uint): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.RESERVE_FEE, "hex"),
            ),
            Bytes.from(
                Util.coin.amountToBytes(fee), "hex"
            ),
        ]);
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/749162d9fead35d2beb2d34bdc7d90df4d5ec6d5/chia/wallet/cat_wallet/cat_utils.py#L88
    public spendCATs(CATs: CAT[]): CoinSpend[] {
        const N = CATs.length;

        const deltas = [];
        for(const _ of CATs) {
            if(!_.isSpendable()) return [];

            const res = Util.sexp.conditionsDictForSolution(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                _.innerPuzzle!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                _.innerSolution!,
                Util.sexp.MAX_BLOCK_COST_CLVM
            );
            if(res[0]) continue;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const conditionsDict: ConditionsDict = res[1]!;
            let total: BigNumber = BigNumber.from(_.extraDelta ?? 0).mul(-1);

            for(const _ of (conditionsDict.get(ConditionOpcode.CREATE_COIN) ?? [])) {
                if(_.vars[1] !== "8f") { // -113 in bytes
                    total = total.add(SExp.to(Bytes.from(_.vars[1], "hex")).as_bigint());
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            deltas.push(_.amount!.sub(total));
        }

        if(!deltas.reduce((acc, x) => acc.add(x)).eq(0)) {
            throw new Error("input and output amounts don't match");
        }

        const subtotals = this.subtotalsForDeltas(deltas);

        const infosForNext = [];
        const infosForMe = [];
        const ids = [];
        for(const _ of CATs) {
            infosForNext.push(this.nextInfoForSpendableCat(_));
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            infosForMe.push(Util.coin.toProgram(_ .toCoin()!));
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ids.push(_.getId()!);
        }

        const coinSpends = [];
        for(let index = 0; index < N; ++index) {
            const spendInfo = CATs[index];

            const puzzleReveal = Util.sexp.CATPuzzle(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                spendInfo.TAILProgramHash!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                spendInfo.innerPuzzle!
            );

            const prevIndex = (index - 1) % N;
            const nextIndex = (index + 1) % N;
            const prevId = ids[prevIndex];
            const myInfo = infosForMe[index];
            const nextInfo = infosForNext[nextIndex];

            const solution = [
                spendInfo.innerSolution,
                spendInfo.lineageProof === null ? SExp.FALSE : Util.coin.toProgram(spendInfo.lineageProof as Coin),
                Bytes.from(prevId, "hex"),
                myInfo,
                nextInfo,
                Bytes.from(Util.coin.amountToBytes(subtotals[index]), "hex"),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                Bytes.from(Util.coin.amountToBytes(spendInfo.extraDelta!), "hex"),
            ];

            const coinSpend = new CoinSpend();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            coinSpend.coin = spendInfo.toCoin()!;
            coinSpend.puzzleReveal = puzzleReveal;
            coinSpend.solution = SExp.to(solution);

            coinSpends.push(coinSpend);
        }

        return coinSpends;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/749162d9fead35d2beb2d34bdc7d90df4d5ec6d5/chia/wallet/cat_wallet/cat_utils.py#L63
    private subtotalsForDeltas(deltas: BigNumber[]): BigNumber[] {
        const subtotals = [];
        let subtotal = BigNumber.from(0);

        for(const delta of deltas) {
            subtotals.push(subtotal);
            subtotal = subtotal.add(delta);
        }

        // tweak the subtotals so the smallest value is 0
        const subtotalOffset = subtotals.reduce((acc, x) => acc.gt(x) ? x : acc);
        const newSubtotals = subtotals.map(e => e.sub(subtotalOffset));

        return newSubtotals;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/749162d9fead35d2beb2d34bdc7d90df4d5ec6d5/chia/wallet/cat_wallet/cat_utils.py#L82
    private nextInfoForSpendableCat(spendableCAT: CAT): SExp {
        const list = [
            Bytes.from(spendableCAT.parentCoinInfo, "hex"),
            Bytes.from(spendableCAT.innerPuzzleHash, "hex"),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Bytes.from(Util.coin.amountToBytes(spendableCAT.amount!), "hex")
        ];

        return SExp.to(list);
    }
}