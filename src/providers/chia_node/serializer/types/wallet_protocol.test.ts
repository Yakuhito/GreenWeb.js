import { Serializer } from "../serializer";
import { assert } from "chai";
import { SendTransaction } from "./wallet_protocol";
import { SpendBundle } from "./spend_bundle";
import { Coin } from "./coin";
import { CoinSpend } from "./coin_spend";
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

describe("Serializer", () => {
    describe("SendTransaction", () => {
        it("serialize()", () => {
            // eslint-disable-next-line max-len
            const expectedOutput = "00000001010101010101010101010101010101010101010101010101010101010101010102020202020202020202020202020202020202020202020202020202020202020000013efa5d0400ff10ff01ffff018200af8019c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            const dummyCoin: Coin = new Coin();
            dummyCoin.parentCoinInfo = "01".repeat(32);
            dummyCoin.puzzleHash = "02".repeat(32);
            dummyCoin.amount = 1.37  * 1000000000000;

            const coinSpend: CoinSpend = new CoinSpend();
            coinSpend.coin = dummyCoin;
            const plus = h(KEYWORD_TO_ATOM["+"]);
            const q = h(KEYWORD_TO_ATOM["q"]);
            coinSpend.puzzleReveal = SExp.to([plus, 1, t(q, 175)]);
            coinSpend.solution = SExp.to(25);
    
            const spendBundle: SpendBundle = new SpendBundle();
            spendBundle.coinSpends = [coinSpend];
            // empty agg_sig (has to be valid)
            // eslint-disable-next-line max-len
            spendBundle.aggregatedSignature = "c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

            const obj: SendTransaction = new SendTransaction();
            obj.transaction = spendBundle;

            const s: Buffer = Serializer.serialize(obj);
            assert.equal(s.toString("hex"), expectedOutput);
        });

        it("deserialize()", () => {
            // eslint-disable-next-line max-len
            const input = "00000001010101010101010101010101010101010101010101010101010101010101010102020202020202020202020202020202020202020202020202020202020202020000013efa5d0400ff10ff01ffff018200af8019c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            const testObj = Serializer.deserialize(
                SendTransaction,
                Buffer.from(input, "hex")
            );

            assert.isDefined(testObj);
            assert.instanceOf(testObj, SendTransaction);
            // eslint-disable-next-line max-len
            assert.equal(testObj.transaction.aggregatedSignature, "c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(testObj.transaction.coinSpends.length, 1);
    
            const coinSpend: CoinSpend = testObj.transaction.coinSpends[0];
            const plus = h(KEYWORD_TO_ATOM["+"]);
            const q = h(KEYWORD_TO_ATOM["q"]);
            assert.equal(coinSpend.solution.toString(), SExp.to(25).toString());
            assert.equal(coinSpend.puzzleReveal.toString(), SExp.to([plus, 1, t(q, 175)]).toString());
            assert.equal(coinSpend.coin.parentCoinInfo, "01".repeat(32));
            assert.equal(coinSpend.coin.puzzleHash, "02".repeat(32));
            assert.equal(coinSpend.coin.amount, 1.37  * 1000000000000);
        })
    });
});