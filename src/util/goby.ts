import { Coin } from "./serializer/types/coin";
import { CoinSpend } from "./serializer/types/coin_spend";
import { SpendBundle } from "./serializer/types/spend_bundle";

export class GobyUtil {
    public parseGobyCoin(coin: any): Coin {
        const c = new Coin();
        c.parentCoinInfo = coin["parent_coin_info"];
        c.puzzleHash = coin["puzzle_hash"];
        c.amount = Buffer.from(coin["amount"]);

        return c;
    }

    public parseGobyCoinSpend(coinSpend: any): CoinSpend {
        const cs = new CoinSpend();
        cs.coin = this.parseGobyCoin(coinSpend["coin"]);
        cs.puzzleReveal = coinSpend["puzzle_reveal"];
        cs.solution = coinSpend["solution"];

        return cs;
    }

    public parseGobySpendBundle(spendBundle: any): SpendBundle {
        const sb = new SpendBundle();
        sb.coinSpends = [];

        const coinSpends = spendBundle["coin_spends"];
        for(let i = 0; i < coinSpends; ++i) {
            sb.coinSpends.push(
                this.parseGobyCoinSpend(coinSpends[i])
            );
        }

        sb.aggregatedSignature = spendBundle["aggregated_signature"];

        return sb;
    }
}