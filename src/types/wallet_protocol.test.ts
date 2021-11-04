import { Serializer } from '../serializer';
import { assert } from 'chai';
import { SendTransaction } from './wallet_protocol';
import { SpendBundle } from './spend_bundle';
import { Coin } from './coin';
import { CoinSpend } from './coin_spend';
import { SExp, KEYWORD_TO_ATOM, h, t } from "clvm";

/*
from chia.util.streamable import Streamable, streamable
from chia.util.ints import uint8, uint32, uint128
from chia.types.blockchain_format.sized_bytes import bytes4
from typing import List, Optional, Tuple
from dataclasses import dataclass
from chia.protocols.wallet_protocol import SendTransaction
from chia.types.coin_solution import CoinSolution
from chia.types.spend_bundle import SpendBundle
from blspy import AugSchemeMPL
from chia.types.blockchain_format.coin import Coin
from clvm import SExp
from clvm.operators import (OPERATOR_LOOKUP, KEYWORD_TO_ATOM)
from chia.types.blockchain_format.program import SerializedProgram

# TODO: Update the 'chia' package (CoinSolution -> CoinSpend)

dummy_coin = Coin(bytes.fromhex("01" * 32), bytes.fromhex("02" * 32), 1.37  * 1000000000000)
def h(val):
	return int(val.hex(), 16)
plus = h(KEYWORD_TO_ATOM["+"])
q = h(KEYWORD_TO_ATOM["q"])
puzzle_reveal = SerializedProgram.from_bytes(SExp.to([plus, 1, (q, 175)]).as_bin())
solution = SerializedProgram.from_bytes(SExp.to(25).as_bin())
coin_solution = CoinSolution(dummy_coin, puzzle_reveal, solution)
agg_sig = AugSchemeMPL.aggregate([])
spend_bundle = SpendBundle([coin_solution,], agg_sig)

print(bytes(spend_bundle).hex())
*/

describe('Serializer', () => {
    describe('SendTransaction', () => {
        it('serialize()', () => {
            const expectedOutput = "00000001010101010101010101010101010101010101010101010101010101010101010102020202020202020202020202020202020202020202020202020202020202020000013efa5d0400ff10ff01ffff018200af8019c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
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

        it('deserialize()', () => {
            const input = "00000001010101010101010101010101010101010101010101010101010101010101010102020202020202020202020202020202020202020202020202020202020202020000013efa5d0400ff10ff01ffff018200af8019c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            const testObj = Serializer.deserialize(
                SendTransaction,
                Buffer.from(input, "hex")
            );

            assert.isDefined(testObj);
            assert.instanceOf(testObj, SendTransaction);
            assert.equal(testObj.transaction.aggregated_signature.toString("hex"), "c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(testObj.transaction.coin_spends.length, 1);
    
            const coin_spend: CoinSpend = testObj.transaction.coin_spends[0];
            const plus = h(KEYWORD_TO_ATOM["+"]);
            const q = h(KEYWORD_TO_ATOM["q"]);
            assert.equal(coin_spend.solution.toString(), SExp.to(25).toString());
            assert.equal(coin_spend.puzzle_reveal.toString(), SExp.to([plus, 1, t(q, 175)]).toString());
            assert.equal(coin_spend.coin.parent_coin_info.toString("hex"), "01".repeat(32));
            assert.equal(coin_spend.coin.puzzle_hash.toString("hex"), "02".repeat(32));
            assert.equal(coin_spend.coin.amount, 1.37  * 1000000000000);
        })
    });
});