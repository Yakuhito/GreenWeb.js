import { assert } from "chai";
import { Coin } from "../xch/providers/provider_types";
import { CoinUtil } from "./coin";

const coinUtil = new CoinUtil();

describe("CoinUtil", () => {
    describe("getId()", () => {
        it("Works as expected", () => {
            // https://www.chiaexplorer.com/blockchain/coin/0x7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8
            const coin: Coin = new Coin();
            coin.amount = 87;
            coin.puzzleHash = "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664";
            coin.parentCoinInfo = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

            assert.equal(
                coinUtil.getId(coin),
                "7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8"
            );
        });
    });

    describe("getName()", () => {
        it("Works as expected", () => {
            // https://www.chiaexplorer.com/blockchain/coin/0x7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8
            const coin: Coin = new Coin();
            coin.amount = 87;
            coin.puzzleHash = "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664";
            coin.parentCoinInfo = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

            assert.equal(
                coinUtil.getName(coin),
                "7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8"
            );
        });
    });
});