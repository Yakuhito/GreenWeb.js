/* eslint-disable max-len */
import { assert, expect } from "chai";
import { Coin } from "../../xch/providers/provider_types";
import { CoinUtil } from "../../util/coin";
import { Util } from "../../util";

const coinUtil = new CoinUtil();

describe("CoinUtil", () => {
    describe("amountToBytes", () => {
        it("Works as expected", () => {
            const inputs = [0, 1, -1, -11, 0x7f, 0x80, 0xff, -0x7f, -0x80, -0xff, -0x808080, 0x808080, 0xff010203, -0xff010203, -0xffffffffff];
            const expected_outputs = ["00", "01", "ff", "f5", "7f", "0080", "00ff", "81", "80", "ff01", "ff7f7f80", "00808080", "00ff010203", "ff00fefdfd", "ff0000000001"];

            for(let i = 0; i < inputs.length; ++i) {
                expect(
                    coinUtil.amountToBytes(inputs[i])
                ).to.equal(expected_outputs[i]);
            }
        });
    });

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

        it("Works with big amounts", () => {
            // Za premine
            // https://www.chiaexplorer.com/blockchain/coin/0xd7a81eece6b0450c9eaf3b3a9cdbff5bde0f1e51f1f18fcf50cc533296cb04b6
            const coin: Coin = new Coin();
            coin.amount = Util.parseChia("9187500");
            coin.puzzleHash = "1b7ab2079fa635554ad9bd4812c622e46ee3b1875a7813afba127bb0cc9794f9";
            coin.parentCoinInfo = "1fd60c070e821d785b65e10e5135e52d12c8f4d902a506f48bc1c5268b7bb45b";

            assert.equal(
                coinUtil.getId(coin),
                "d7a81eece6b0450c9eaf3b3a9cdbff5bde0f1e51f1f18fcf50cc533296cb04b6"
            );
        });

        it("Works with huge amounts", () => {
            /* 
            >>> from chia.types.blockchain_format.coin import Coin
            >>> c = Coin(parent_coin_info=bytes.fromhex("1fd60c070e821d785b65e10e5135e52d12c8f4d902a506f48bc1c5268b7bb45b"), puzzle_hash=bytes.fromhex("1b7ab2079fa635554ad9bd4812c622e46ee3b1875a7813afba127bb0cc9794f9"), amount=18000000000000000000)
            >>> c.get_hash().hex()
            '10c8c57ef747382753477ce2c3bb77dd078c3c2b987f82e049dfe716dedce0bd'
            */
            const coin: Coin = new Coin();
            coin.amount = Util.parseChia("18000000");
            coin.puzzleHash = "1b7ab2079fa635554ad9bd4812c622e46ee3b1875a7813afba127bb0cc9794f9";
            coin.parentCoinInfo = "1fd60c070e821d785b65e10e5135e52d12c8f4d902a506f48bc1c5268b7bb45b";

            assert.equal(
                coinUtil.getId(coin),
                "10c8c57ef747382753477ce2c3bb77dd078c3c2b987f82e049dfe716dedce0bd"
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

    describe("toProgram()", () => {
        it("Works", () => {
            const coin: Coin = new Coin();
            coin.amount = 87;
            coin.puzzleHash = "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664";
            coin.parentCoinInfo = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

            const program = coinUtil.toProgram(coin);
            const programHex = Util.sexp.toHex(program);

            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ brun -x 01 ffa08c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff5780
            (0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 87)
            */
            expect(programHex).to.equal("ffa08c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff5780");
        });
    });
});