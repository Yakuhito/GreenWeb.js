import { BigNumber } from "@ethersproject/bignumber";
import { Coin } from "./serializer/types/coin";
import { CoinSpend } from "./serializer/types/coin_spend";
import { SpendBundle } from "./serializer/types/spend_bundle";

export class GobyUtil {
    public parseGobyCoin(coin: any): Coin | null {
        try {
            const c = new Coin();
            c.parentCoinInfo = coin["parent_coin_info"];
            c.puzzleHash = coin["puzzle_hash"];
            c.amount = BigNumber.from(coin["amount"]);

            return c;
        } catch(_) {
            return null;
        }
    }

    public parseGobyCoinSpend(coinSpend: any): CoinSpend | null {
        const cs = new CoinSpend();

        const coin = this.parseGobyCoin(coinSpend["coin"]);
        if(coin === null) {
            return null;
        }
        cs.coin = coin;

        cs.puzzleReveal = coinSpend["puzzle_reveal"];
        cs.solution = coinSpend["solution"];

        return cs;
    }

    public parseGobySpendBundle(spendBundle: any): SpendBundle | null {
        try {
            const sb = new SpendBundle();
            sb.coinSpends = [];

            const coinSpends = spendBundle["coin_spends"];
            for(let i = 0; i < coinSpends.length; ++i) {
                const coinSpend = this.parseGobyCoinSpend(coinSpends[i]);
                if(coinSpend === null) {
                    return null;
                }

                sb.coinSpends.push(coinSpend);
            }

            sb.aggregatedSignature = spendBundle["aggregated_signature"];

            return sb;
        } catch(_) {
            return null;
        }
    }
}