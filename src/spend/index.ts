import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, getBLSModule, SExp } from "clvm";
import { CAT } from "../cat";
import { StandardCoin } from "../standard_coin";
import { Util } from "../util";
import { uint } from "../util/serializer/basic_types";
import { CoinSpend } from "../util/serializer/types/coin_spend";
import { SpendBundle } from "../util/serializer/types/spend_bundle";
import { ConditionsDict } from "../util/sexp";
import { ConditionOpcode } from "../util/sexp/condition_opcodes";
import { bytes } from "../xch/providers/provider_types";

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

export class SpendModule {
    public static Announcement = Announcement;

    public static createCoinCondition(puzzleHash: bytes, amount: uint, memos: bytes[] = []): SExp {
        return SExp.to([
            Bytes.from(ConditionOpcode.CREATE_COIN, "hex"),
            Bytes.from(puzzleHash, "hex"),
            Bytes.from(Util.coin.amountToBytes(amount), "hex"),
            ...(memos.length > 0 ? [SExp.to(memos.map(e => Bytes.from(e, "hex")))] : []),
        ]);
    }

    public static reserveFeeCondition(fee: uint): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.RESERVE_FEE, "hex"),
            ),
            Bytes.from(
                Util.coin.amountToBytes(fee), "hex"
            ),
        ]);
    }

    public static createCoinAnnouncementCondition(message: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_COIN_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                message, "hex"
            ),
        ]);
    }

    public static assertCoinAnnouncementCondition(announcementId: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                announcementId, "hex"
            ),
        ]);
    }

    public static createPuzzleAnnouncementCondition(message: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.CREATE_PUZZLE_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                message, "hex"
            ),
        ]);
    }

    public static assertPuzzleAnnouncementCondition(announcementId: bytes): SExp {
        return SExp.to([
            Bytes.from(
                Buffer.from(ConditionOpcode.ASSERT_PUZZLE_ANNOUNCEMENT, "hex"),
            ),
            Bytes.from(
                announcementId, "hex"
            ),
        ]);
    }

    public static bundleStandardCoins(
        standardCoins: StandardCoin[],
        firstCoinConditions: SExp[],
        otherCoinsConditions: SExp[],
    ): CoinSpend[] {
        const coinSpends = [];
        for(let index = 0; index < standardCoins.length; ++index) {
            const spendInfo = standardCoins[index].addConditionsToSolution(
                index === 0 ? firstCoinConditions : otherCoinsConditions,
            );
            if(!spendInfo.isSpendable()) {
                throw new Error("StandardCoin not spendable");
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            coinSpends.push(spendInfo.spend()!);
        }

        return coinSpends;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/749162d9fead35d2beb2d34bdc7d90df4d5ec6d5/chia/wallet/cat_wallet/cat_utils.py#L88
    public static bundleCATs(
        CATs: CAT[],
        firstCoinConditions: SExp[],
        otherCoinsConditions: SExp[],
    ): CoinSpend[] {
        const N = CATs.length;
        const deltas = [];
        
        for(let index = 0; index < CATs.length; ++index) {
            CATs[index] = CATs[index].addConditionsToInnerSolution(
                index === 0 ? firstCoinConditions : otherCoinsConditions
            );
            const c = CATs[index];

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
            let total: BigNumber = BigNumber.from(c.extraDelta ?? 0).mul(-1);

            for(const _ of (conditionsDict.get(ConditionOpcode.CREATE_COIN) ?? [])) {
                if(_.vars[1] !== "8f") { // -113 in bytes
                    total = total.add(SExp.to(Bytes.from(_.vars[1], "hex")).as_bigint());
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            infosForNext.push(_.toCoin()!);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            infosForMe.push(_ .toCoin()!);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ids.push(_.getId()!);
        }

        const coinSpends = [];
        for(let index = 0; index < N; ++index) {
            const prevIndex = (index - 1) % N;
            const nextIndex = (index + 1) % N;
            const prevId = ids[prevIndex];
            const myInfo = infosForMe[index];
            const nextInfo = infosForNext[nextIndex];

            const spendInfo = CATs[index].copyWith({
                prevCoinId: prevId,
                coin: myInfo,
                nextCoin: nextInfo,
                prevSubtotal: subtotals[index],
            });
            if(!spendInfo.isSpendable()) {
                throw new Error("CAT not spendable");
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            coinSpends.push(spendInfo.spend()!);
        }

        return coinSpends;
    }

    // https://github.com/Chia-Network/chia-blockchain/blob/749162d9fead35d2beb2d34bdc7d90df4d5ec6d5/chia/wallet/cat_wallet/cat_utils.py#L63
    public static subtotalsForDeltas(deltas: BigNumber[]): BigNumber[] {
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

    public static bundle(
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
            const firstCoinConditions = [...conditionsFromParams, ...CATOutputConditions];
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

            const r = this.bundleCATs(
                CATs, firstCoinConditions, otherCoinsConditions
            );
            r.forEach(e => coinSpends.push(e));
        }

        if(standardCoins.length > 0) {
            const firstCoinConditions = [...conditionsFromParams, ...standardCoinOutputConditions];
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

            const r = this.bundleStandardCoins(
                standardCoins, firstCoinConditions, otherCoinsConditions
            );
            r.forEach(e => coinSpends.push(e));
        }
        
        return coinSpends;
    }

    public static merge(things: Array<SpendBundle | CoinSpend | CoinSpend[]>): SpendBundle {
        const { AugSchemeMPL, G2Element } = getBLSModule();
        
        const sb = new SpendBundle();
        sb.coinSpends = things
            .map(t => t instanceof SpendBundle ? t.coinSpends : (t instanceof CoinSpend ? [t, ] : t))
            .reduce((acc, x) => [...acc, ...x]);

        const sigs = [];
        for(const t of things) {
            if(!(t instanceof SpendBundle)) continue;

            const sigStr = t.aggregatedSignature;
            sigs.push(
                G2Element.from_bytes(
                    Buffer.from(sigStr, "hex")
                ),
            );
        }
        sb.aggregatedSignature = Buffer.from(
            AugSchemeMPL.aggregate(sigs).serialize()
        ).toString("hex");

        return sb;
    }
}