import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, SExp } from "clvm";
import { Util } from "..";
import { CAT } from "../../cat";
import { StandardCoin } from "../../standard_coin";
import { bytes, Coin, uint } from "../../xch/providers/provider_types";
import { CoinSpend } from "../serializer/types/coin_spend";
import { ConditionsDict } from "../sexp";
import { ConditionOpcode } from "../sexp/condition_opcodes";

export class Announcement {
    public originInfo?: bytes;
    public message?: bytes;
    public morphBytes?: bytes;

    constructor(
        originInfo?: bytes,
        message?: bytes,
        morphBytes?: bytes
    ) {
        this.originInfo = originInfo;
        this.message = message;
        this.morphBytes = morphBytes;
    }

    public name(): bytes {
        const toHash = (this.originInfo ?? "") + (this.morphBytes ?? "") + this.message;

        return Util.stdHash(toHash);
    }
}

export class SpendUtil {
    public Announcement = Announcement;

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

    private createCoinAnnouncementCondition(message: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_COIN_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                message, "hex"
            ),
        ]);
    }

    private assertCoinAnnouncementCondition(announcementId: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_COIN_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                announcementId, "hex"
            ),
        ]);
    }

    private createPuzzleAnnouncementCondition(message: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_PUZZLE_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                message, "hex"
            ),
        ]);
    }

    private assertPuzzleAnnouncementCondition(announcementId: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_PUZZLE_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                announcementId, "hex"
            ),
        ]);
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/749162d9fead35d2beb2d34bdc7d90df4d5ec6d5/chia/wallet/cat_wallet/cat_utils.py#L88
    public spendCATs(
        CATs: CAT[],
        firstCoinConditions: SExp[],
        otherCoinsConditions: SExp[],
    ): CoinSpend[] {
        const N = CATs.length;

        const deltas = [];
        let first: boolean = true;

        for(const _ of CATs) {
            let c = _;
            if(!c.isSpendable()) return [];

            if(first) {
                first = false;
                c = c.addConditionsToInnerSolution(
                    firstCoinConditions
                );
            } else {
                c = c.addConditionsToInnerSolution(otherCoinsConditions);
            }

            const res = Util.sexp.conditionsDictForSolution(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                c.innerPuzzle!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                c.innerSolution!,
                Util.sexp.MAX_BLOCK_COST_CLVM
            );
            if(res[0]) continue;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const conditionsDict: ConditionsDict = res[1]!;
            let total: BigNumber = BigNumber.from(_.extraDelta ?? 0).mul(-1);

            for(const __ of (conditionsDict.get(ConditionOpcode.CREATE_COIN) ?? [])) {
                if(__.vars[1] !== "8f") { // -113 in bytes
                    total = total.add(SExp.to(Bytes.from(__.vars[1], "hex")).as_bigint());
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            deltas.push(c.amount!.sub(total));
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

    public spend(
        things: Array<CAT | StandardCoin>,
        standardCoinOutputConditions: SExp[] = [],
        CATOutputConditions: SExp[] = [],
        fee: uint = 0,
        coinAnnouncementsToConsume: Announcement[] = [],
        puzzleAnnouncementsToConsume: Announcement[] = [],
    ): CoinSpend[] {
        if(things.length === 0) return [];
        const coinSpends: CoinSpend[] = [];

        const CATs: CAT[] = things.filter(e => e instanceof CAT) as CAT[];
        const standardCoins: StandardCoin[] = things.filter(e => e instanceof StandardCoin) as StandardCoin[];
        let feeIncluded = false;

        const conditionsFromParams = [
            ...coinAnnouncementsToConsume.map(e => this.assertCoinAnnouncementCondition(e.name())),
            ...puzzleAnnouncementsToConsume.map(e => this.assertPuzzleAnnouncementCondition(e.name()))
        ];
        const feeBN: BigNumber = BigNumber.from(fee);
        const theHash = Util.stdHash(
            things.map(c => c.getName() ?? "").join()
        );
        const haveCATs = CATs.length > 0;
        const ann = new Announcement(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            haveCATs ? CATs[0].getId()! : standardCoins[0].getId()!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            theHash,
            haveCATs ? "ca" : ""
        );

        if(haveCATs) {
            const firstCoinConditions = conditionsFromParams;
            const otherCoinsConditions = conditionsFromParams;
            firstCoinConditions.push(
                this.createCoinAnnouncementCondition(theHash),
            );
            otherCoinsConditions.push(
                this.assertCoinAnnouncementCondition(ann.name()),
            );

            if(feeBN.gt(0)) {
                firstCoinConditions.push(
                    this.reserveFeeCondition(fee)
                );
                feeIncluded = true;
            }

            const r = this.spendCATs(
                CATs, firstCoinConditions, otherCoinsConditions
            );
            r.forEach(e => coinSpends.push(e));
        }

        if(standardCoins.length > 0) {
            const firstCoinConditions = conditionsFromParams;
            const otherCoinsConditions = conditionsFromParams;
            if(haveCATs) {
                firstCoinConditions.push(
                    this.assertCoinAnnouncementCondition(ann.name()),
                );
            } else {
                firstCoinConditions.push(
                    this.createCoinAnnouncementCondition(theHash),
                );
            }
            otherCoinsConditions.push(
                this.assertCoinAnnouncementCondition(ann.name()),
            );

            if(feeBN.gt(0) && !feeIncluded) {
                firstCoinConditions.push(
                    this.reserveFeeCondition(fee)
                );
            }

            //todo: spendStandardCoins
            // r.forEach(e => coinSpends.push(e));
        }
        
        return coinSpends;
    }
}