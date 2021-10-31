import { Serializer } from '../serializer';
import { assert } from 'chai';
import { SendTransaction } from './wallet_protocol';
import { SpendBundle } from './spend_bundle';
import { Coin } from './coin';
import { CoinSpend } from './coin_spend';
import { SExp, KEYWORD_TO_ATOM, h, t } from "clvm";

it('Serializer.serialize() - SendTransaction', () => {
    const expectedOutput: string = "00000001010101010101010101010101010101010101010101010101010101010101010102020202020202020202020202020202020202020202020202020202020202020000013efa5d0400ff10ff01ffff018200af8019c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const dummy_coin: Coin = new Coin();
    dummy_coin.parent_coin_info = Buffer.from("01".repeat(32), "hex");
    dummy_coin.puzzle_hash = Buffer.from("02".repeat(32), "hex");
    dummy_coin.amount = 1.37  * 1000000000000;

    const coin_spend: CoinSpend = new CoinSpend();
    coin_spend.coin = dummy_coin;
    const plus = h(KEYWORD_TO_ATOM["+"]);
    const q = h(KEYWORD_TO_ATOM["q"]);
    coin_spend.puzzle_reveal = SExp.to([plus, 1, t(q, 175)]);
    coin_spend.solution = SExp.to(25);
    
    const spend_bundle: SpendBundle = new SpendBundle();
    spend_bundle.coin_spends = [coin_spend];
    // empty agg_sig (has to be valid)
    spend_bundle.aggregated_signature = Buffer.from("c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "hex");

    const obj: SendTransaction = new SendTransaction();
    obj.transaction = spend_bundle;

    const s: Buffer = Serializer.serialize(obj);
    assert.equal(s.toString('hex'), expectedOutput);
});