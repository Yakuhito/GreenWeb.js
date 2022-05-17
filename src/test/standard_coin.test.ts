/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { initializeBLS, SExp } from "clvm";
import { StandardCoin } from "../standard_coin";
import { Util } from "../util";
import { Coin } from "../util/serializer/types/coin";
import { bytes } from "../xch/providers/provider_types";

describe("StandardCoin", () => {
    const TEST_COIN_PRIVATE_KEY_STR = "42".repeat(32);
    const DESTINATION_PUZZLE_HASH = "69".repeat(32);
    let testCoinPrivKey: any;
    let testCoinPubKey: bytes;
    let testCoinPuzzle: SExp;
    let testCoin: Coin;
    let destinationAddress: string;

    beforeEach(async () => {
        await initializeBLS();
        testCoinPrivKey = Util.key.hexToPrivateKey(TEST_COIN_PRIVATE_KEY_STR);
        const g1Elem = testCoinPrivKey.get_g1();
        testCoinPubKey = Util.key.publicKeyToHex(g1Elem);

        testCoinPuzzle = Util.sexp.standardCoinPuzzle(g1Elem);

        testCoin = new Coin();
        testCoin.amount = 1338;
        testCoin.parentCoinInfo = "02".repeat(32);
        testCoin.puzzleHash = Util.sexp.sha256tree(testCoinPuzzle);

        destinationAddress = Util.address.puzzleHashToAddress(DESTINATION_PUZZLE_HASH);
    });

    describe("constructor", () => {
        for(let i = 0; i < 16; ++i) {
            const giveParentCoinInfo = i % 2 === 1;
            const givePuzzleHash = Math.floor(i / 2) % 2 === 1;
            const giveAmount = Math.floor(i / 4) % 2 === 1;
            const givePubKey = Math.floor(i / 8) % 2 === 1;
            let message =  "Correctly constructs coin (";

            if(giveParentCoinInfo) {
                message += "parentCoinInfo, ";
            }
            if(givePuzzleHash) {
                message += "puzzleHash, ";
            }
            if(giveAmount) {
                message += "amount, ";
            }
            if(givePubKey) {
                message += "publicKey, ";
            }
            if(i === 0) {
                message += "no args given)";
            } else {
                message = message.slice(0, -2) + ")";
            }

            it(message, () => {
                const constructorArgs: any = {};
                if(giveParentCoinInfo) {
                    constructorArgs.parentCoinInfo = testCoin.parentCoinInfo;
                }
                if(givePuzzleHash) {
                    constructorArgs.puzzleHash = testCoin.puzzleHash;
                }
                if(giveAmount) {
                    constructorArgs.amount = testCoin.amount;
                }
                if(givePubKey) {
                    constructorArgs.publicKey = testCoinPubKey;
                }

                const sc = new StandardCoin(constructorArgs);
                if(giveParentCoinInfo) {
                    expect(sc.parentCoinInfo).to.equal(testCoin.parentCoinInfo);
                } else {
                    expect(sc.parentCoinInfo).to.be.null;
                }
                if(givePuzzleHash || givePubKey) {
                    expect(sc.puzzleHash).to.equal(testCoin.puzzleHash);
                } else {
                    expect(sc.puzzleHash).to.be.null;
                }
                if(giveAmount) {
                    expect(sc.amount?.toString()).to.equal(testCoin.amount.toString());
                } else {
                    expect(sc.amount).to.be.null;
                }
                if(givePubKey) {
                    expect(Util.sexp.toHex(sc.puzzle ?? SExp.to([]))).to.equal(Util.sexp.toHex(testCoinPuzzle));
                } else {
                    expect(sc.puzzle).to.be.null;
                }
            });
        }

        it("Correctly overwrites wrong puzzleHash if given public key", () => {
            const sc = new StandardCoin({
                puzzleHash: "00".repeat(32),
                publicKey: testCoinPubKey
            });

            expect(sc.puzzleHash).to.equal(testCoin.puzzleHash);
        });
    });

    describe("send()", () => {
        it("Returns 'null' if coin info was not provided", () => {
            const sc = new StandardCoin({});
            expect(
                sc.send(destinationAddress)
            ).to.be.null;
        });

        //todo
    });

    describe("Real test", () => {
        // https://www.chiaexplorer.com/blockchain/coin/0x836253e600f63d0496b5962cd2d044b5eaa8feb90a64c4f9471717017786b295
        // (tx picked at random)
        it("send()", () => {
            const sc = new StandardCoin({
                
            });
        });
    });
});