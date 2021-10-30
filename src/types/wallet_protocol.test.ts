import { Serializer } from '../serializer';
import { assert } from 'chai';
import { SendTransaction } from './wallet_protocol';
import { SpendBundle } from './spend_bundle';
import { Coin } from './coin';
import { CoinSpend } from './coin_spend';

it('Serializer.serialize() - SendTransaction', () => {
    const expectedOutput: string = "00000001010101010101010101010101010101010101010101010101010101010101010102020202020202020202020202020202020202020202020202020202020202020000013efa5d04000303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const dummy_coin: Coin = new Coin();
    dummy_coin.parent_coin_info = Buffer.from("01".repeat(32), "hex");
    dummy_coin.puzzle_hash = Buffer.from("02".repeat(32), "hex");
    dummy_coin.amount = 1.37  * 1000000000000;

    const coin_spend: CoinSpend = new CoinSpend();
    coin_spend.coin = dummy_coin;
    coin_spend.puzzle_reveal = Buffer.from("03".repeat(71), "hex");
    coin_spend.solution = Buffer.from("04".repeat(57), "hex");
    
    const spend_bundle: SpendBundle = new SpendBundle();
    spend_bundle.coin_spends = [coin_spend];
    // empty agg_sig (has to be valid)
    spend_bundle.aggregated_signature = Buffer.from("c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "hex");

    const obj: SendTransaction = new SendTransaction();
    obj.transaction = spend_bundle;

    const s: Buffer = Serializer.serialize(obj);
    console.log('-');
    console.log(s.toString("hex"));
    console.log('-');
    console.log(expectedOutput);
});