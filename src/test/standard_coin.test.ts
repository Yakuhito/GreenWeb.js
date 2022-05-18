/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { expect } from "chai";
import { initializeBLS, SExp } from "clvm";
import { StandardCoin } from "../standard_coin";
import { Util } from "../util";
import { Coin } from "../util/serializer/types/coin";
import { ConditionsDict } from "../util/sexp";
import { ConditionOpcode } from "../util/sexp/condition_opcodes";
import { bytes } from "../xch/providers/provider_types";

describe.only("StandardCoin", () => {
    const TEST_PRIV_KEY_STR = "42".repeat(32);
    const TEST_DESTINATION_PUZZLE_HASH = "69".repeat(32);
    const TEST_DESTINATION_ADDRESS = Util.address.puzzleHashToAddress(TEST_DESTINATION_PUZZLE_HASH);
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_SYNTH_KEY: bytes;
    let TEST_PUZZLE: SExp;
    let TEST_PUZZLE_STR: bytes;
    let TEST_PUZZLE_IS_SYNT: SExp;
    let TEST_PUZZLE_IS_SYNT_STR: bytes;
    let TEST_COIN: Coin;
    let OTHER_PUB_KEY: bytes;

    beforeEach(async () => {
        await initializeBLS();
        TEST_PRIV_KEY = Util.key.hexToPrivateKey(TEST_PRIV_KEY_STR);
        const g1Elem = TEST_PRIV_KEY.get_g1();
        TEST_PUB_KEY = Util.key.publicKeyToHex(g1Elem);
        TEST_SYNTH_KEY = Util.key.publicKeyToHex(
            Util.sexp.calculateSyntheticPublicKey(g1Elem)
        );
        OTHER_PUB_KEY = Util.key.publicKeyToHex(Util.key.masterSkToWalletSk(TEST_PRIV_KEY, 1337).get_g1());

        TEST_PUZZLE = Util.sexp.standardCoinPuzzle(g1Elem);
        TEST_PUZZLE_STR = Util.sexp.toHex(TEST_PUZZLE);
        TEST_PUZZLE_IS_SYNT = Util.sexp.standardCoinPuzzle(g1Elem, true);
        TEST_PUZZLE_IS_SYNT_STR = Util.sexp.toHex(TEST_PUZZLE_IS_SYNT);

        TEST_COIN = new Coin();
        TEST_COIN.amount = 1338;
        TEST_COIN.parentCoinInfo = "02".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_PUZZLE);
    });

    const _expectToThrow = async (func: any, message: string) => {
        let errOk: boolean = false;
        try {
            await func();
        } catch (err: any) {
            errOk = err.message === message;
        }

        expect(errOk).to.be.true;
    };

    describe("constructor", function () {
        it("Works", () => {
            const sc = new StandardCoin({
                amount: TEST_COIN.amount,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                puzzleHash: TEST_COIN.puzzleHash,
                publicKey: TEST_PUB_KEY
            });

            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const sc = new StandardCoin({});

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.publicKey).to.be.null;
        });

        it("Correctly sets values if given no arguments (#2)", () => {
            const sc = new StandardCoin();

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.publicKey).to.be.null;
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const sc = new StandardCoin({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                puzzle: undefined,
                publicKey: undefined,
                isSyntheticKey: undefined,
                forceUsePuzzle: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.publicKey).to.be.null;
        });

        it("Prefers coin to parentCoinInfo / puzzleHash / amount", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                amount: 31337,
                parentCoinInfo: "02".repeat(32),
                puzzleHash: "00".repeat(32),
            });

            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
        });

        it("Correctly overwrites wrong puzzleHash if given puzzle", () => {
            const sc = new StandardCoin({
                puzzleHash: "00".repeat(32),
                puzzle: TEST_PUZZLE,
                forceUsePuzzle: true
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
        });

        it("Does not use puzzle if forceUsePuzzle is not true", () => {
            const sc = new StandardCoin({
                puzzleHash: "00".repeat(32),
                puzzle: TEST_PUZZLE
            });

            expect(sc.puzzleHash).to.equal("00".repeat(32));
        });

        it("Does not use puzzle if forceUsePuzzle is not true (#2)", () => {
            const sc = new StandardCoin({
                puzzleHash: "00".repeat(32),
                puzzle: TEST_PUZZLE,
                forceUsePuzzle: undefined
            });

            expect(sc.puzzleHash).to.equal("00".repeat(32));
        });

        it("Correctly sets puzzle if given public key", () => {
            const sc = new StandardCoin({
                publicKey: TEST_PUB_KEY
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly sets puzzle if given synthetic public key", () => {
            const sc = new StandardCoin({
                publicKey: TEST_PUB_KEY,
                isSyntheticKey: true,
            });

            expect(sc.puzzleHash).to.equal(Util.sexp.sha256tree(TEST_PUZZLE_IS_SYNT));
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_IS_SYNT_STR);
        });

        it("Throws if puzzle is undefined and forceUsePuzzle is true", () => _expectToThrow(
            () => new StandardCoin({
                puzzle: undefined,
                forceUsePuzzle: true,
            }),
            "StandardCoin: 'forceUsePuzzle' is true, but no puzzle was given."
        ));

        it("Throws if puzzle is null and forceUsePuzzle is true", () => _expectToThrow(
            () => new StandardCoin({
                forceUsePuzzle: true,
            }),
            "StandardCoin: 'forceUsePuzzle' is true, but no puzzle was given."
        ));
    });

    describe("copyWith()", () => {
        it("Works", () => {
            const sc = new StandardCoin().copyWith({
                amount: TEST_COIN.amount,
                puzzleHash: TEST_COIN.puzzleHash,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
                publicKey: TEST_PUB_KEY,
            });

            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(sc.publicKey).to.equal(TEST_SYNTH_KEY);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly sets values if given no arguments", () => {
            const sc = new StandardCoin().copyWith({});

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.publicKey).to.be.null;
        });

        it("Correctly sets values if all arguments are undefined", () => {
            const sc = new StandardCoin().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                coin: undefined,
                puzzle: undefined,
                publicKey: undefined,
                isSyntheticKey: undefined,
                forceUsePuzzle: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.publicKey).to.be.null;
        });

        it("Ignores puzzle if forceUsePuzzle is not true", () => {
            const sc = new StandardCoin().copyWith({
                puzzle: TEST_PUZZLE
            });

            expect(sc.puzzleHash).to.be.null;
            expect(sc.puzzle).to.be.null;
        });

        it("Forces puzzle if forceUsePuzzle is true", () => {
            const sc = new StandardCoin().copyWith({
                puzzle: TEST_PUZZLE,
                forceUsePuzzle: true
            });

            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });

        it("Correctly copies publicKey if isSyntheticKey is not provided", () => {
            const sc = new StandardCoin({
                publicKey: TEST_PUB_KEY,
                isSyntheticKey: true
            });
            const sc2 = sc.copyWith({});

            expect(sc2.publicKey).to.equal(sc.publicKey);
        });

        it("Derives publicKey if isSyntheticKey is not provided", () => {
            const sc = new StandardCoin({
                publicKey: OTHER_PUB_KEY,
                isSyntheticKey: true
            });
            const sc2 = sc.copyWith({
                publicKey: TEST_PUB_KEY
            });

            expect(sc2.publicKey).to.equal(TEST_SYNTH_KEY);
        });

        it("Correctly derives publicKey if isSyntheticKey is false", () => {
            const sc = new StandardCoin({
                publicKey: OTHER_PUB_KEY,
                isSyntheticKey: true
            });
            const sc2 = sc.copyWith({
                publicKey: TEST_PUB_KEY,
                isSyntheticKey: false
            });

            expect(sc2.publicKey).to.equal(TEST_SYNTH_KEY);
        });

        it("Does not derive publicKey if isSyntheticKey is true", () => {
            const sc = new StandardCoin({
                publicKey: OTHER_PUB_KEY,
                isSyntheticKey: true
            });
            const sc2 = sc.copyWith({
                publicKey: TEST_PUB_KEY,
                isSyntheticKey: true
            });

            expect(sc2.publicKey).to.equal(TEST_PUB_KEY);
        });

        it("Correctly sets values if all arguments are 'undefined'", () => {
            const sc = new StandardCoin().copyWith({
                parentCoinInfo: undefined,
                puzzleHash: undefined,
                amount: undefined,
                puzzle: undefined,
                publicKey: undefined,
                isSyntheticKey: undefined,
                forceUsePuzzle: undefined,
            });

            expect(sc.parentCoinInfo).to.be.null;
            expect(sc.puzzleHash).to.be.null;
            expect(sc.amount).to.be.null;
            expect(sc.puzzle).to.be.null;
            expect(sc.publicKey).to.be.null;
        });

        it("Prefers coin to parentCoinInfo / puzzleHash / amount", () => {
            const sc = new StandardCoin().copyWith({
                coin: TEST_COIN,
                amount: 31337,
                parentCoinInfo: "02".repeat(32),
                puzzleHash: "00".repeat(32),
            });

            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                sc.amount?.eq(TEST_COIN.amount)
            ).to.be.true;
        });
    });

    describe("withPublicKey()", () => {
        for(const isSyntheticKey of [false, true]) {
            const ext = isSyntheticKey ? " (synthetic key)" : "";

            it("Correctly creates a new StandardCoin with modified public key" + ext, () => {
                const sc = new StandardCoin();
    
                expect(sc.publicKey).to.be.null;
                expect(sc.puzzle).to.be.null;
                const sc2 = sc.withPublicKey(
                    isSyntheticKey ? TEST_SYNTH_KEY : TEST_PUB_KEY,
                    isSyntheticKey
                );
                expect(sc2.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            });
    
            it("Does not modify the initial SmartCoin" + ext, () => {
                const sc = new StandardCoin();
    
                expect(sc.publicKey).to.be.null;
                expect(sc.puzzle).to.be.null;
                sc.withPublicKey(
                    isSyntheticKey ? TEST_SYNTH_KEY : TEST_PUB_KEY,
                    isSyntheticKey
                );
                expect(sc.publicKey).to.be.null;
                expect(sc.puzzle).to.be.null;
            });
        }
    });

    describe("withParentCoinInfo()", () => {
        it("Correctly creates a new SmartCoin with modified parentCoinInfo", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            const sc2 = sc.withParentCoinInfo(TEST_VAL);
            expect(sc2.parentCoinInfo).to.equal(TEST_VAL);
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.parentCoinInfo);
            sc.withParentCoinInfo(TEST_VAL);
            expect(sc.parentCoinInfo).to.equal(TEST_COIN.parentCoinInfo);
        });
    });

    describe("withPuzzleHash()", () => {
        it("Correctly creates a new SmartCoin with modified puzzleHash and no puzzle", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                puzzle: TEST_PUZZLE,
                forceUsePuzzle: true
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            const sc2 = sc.withPuzzleHash(TEST_VAL);
            expect(sc2.puzzleHash).to.equal(TEST_VAL);
            expect(sc2.puzzle).to.be.null;
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                puzzle: TEST_PUZZLE,
                forceUsePuzzle: true
            });
            const TEST_VAL = "42".repeat(32);

            expect(TEST_VAL).to.not.equal(TEST_COIN.puzzleHash);
            sc.withPuzzleHash(TEST_VAL);
            expect(sc.puzzleHash).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(TEST_PUZZLE_STR);
        });
    });

    describe("withAmount()", () => {
        it("Correctly creates a new SmartCoin with modified amount", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = BigNumber.from(1234);

            expect(TEST_VAL.eq(TEST_COIN.amount)).to.be.false;
            const sc2 = sc.withAmount(TEST_VAL);
            expect(sc2.amount?.eq(TEST_VAL)).to.be.true;
        });

        it("Does not modify the initial SmartCoin", () => {
            const sc = new StandardCoin({coin: TEST_COIN});
            const TEST_VAL = BigNumber.from(1234);

            expect(TEST_VAL.eq(TEST_COIN.amount)).to.be.false;
            sc.withAmount(TEST_VAL);
            expect(sc.amount?.eq(TEST_VAL)).to.be.false;
        });
    });

    describe("send()", () => {
        // https://www.chiaexplorer.com/blockchain/coin/0x90ae7f17e5b7d02a8178560643ce4134937ca35fcd3dcf69ebc8188dec670d9a
        // (tx chosen at random; it's not mine)
        // removed the coin announcement from the solution
        it("Real test", () => {
            // eslint-disable-next-line max-len
            const PUZZLE_STR = "ff02ffff01ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080ffff04ffff01b088e139287dc4d359ac66bf928458e91afd4a68905ec44e8fc71e86d06bc7470f44466c062e9247619906845b834b05adff018080";

            // eslint-disable-next-line max-len
            const SYNTHETIC_KEY = "88e139287dc4d359ac66bf928458e91afd4a68905ec44e8fc71e86d06bc7470f44466c062e9247619906845b834b05ad";

            // eslint-disable-next-line max-len
            const SOLUTION_STR = "ff80ffff01ffff33ffa0099fb6be4707dde8e4ca595d34fbe8fa99cb30ca756d99c63a4d3dac1fd899f0ff8502540be40080ffff33ffa054801b54fbae6bef63a77bd40222efe1fb1c78e8accf94f5271794be70d8b3b6ff840208d4cc80ffff34ff648080ff8080";

            const PUZZLE_HASH = "0e60706bf819526a5e2fada4a5dfc14c894f0dc91f03a2e0bcbe43a33ebf9aca";
            const PARENT_COIN_INFO = "eba93c93bd683c90b1863f7e9c4965d99d156607fcbe6b2c70501e5ff7860808";
            const AMOUNT = BigNumber.from(10034133296);
            const COIN_NAME = "506f0a739366f13eb85f972ad1fe7a014824f217897b155bab15c99bf928aed8";

            const RECIPIENT_PUZZLE_HASH = "099fb6be4707dde8e4ca595d34fbe8fa99cb30ca756d99c63a4d3dac1fd899f0";
            const RECIPIENT_AMOUNT = BigNumber.from("0x02540be400");
            const FEE = BigNumber.from(100);
            const CHANGE_ADDRESS = "54801b54fbae6bef63a77bd40222efe1fb1c78e8accf94f5271794be70d8b3b6";

            const sc = new StandardCoin({
                parentCoinInfo: PARENT_COIN_INFO,
                amount: AMOUNT,
                publicKey: SYNTHETIC_KEY,
                isSyntheticKey: true
            });

            expect(sc.puzzleHash).to.equal(PUZZLE_HASH);
            expect(
                Util.sexp.toHex(sc.puzzle)
            ).to.equal(PUZZLE_STR);
            expect(sc.getId()).to.equal(COIN_NAME);

            const cs = sc.send(
                RECIPIENT_PUZZLE_HASH,
                FEE,
                RECIPIENT_AMOUNT,
                CHANGE_ADDRESS
            );
            expect(
                Util.coin.getId(cs!.coin)
            ).to.equal(COIN_NAME);
            expect(
                Util.sexp.toHex(cs?.puzzleReveal)
            ).to.equal(PUZZLE_STR);
            expect(
                Util.sexp.toHex(cs?.solution)
            ).to.equal(SOLUTION_STR);
        });

        it("Works if only given an address", () => {
            const sc = new StandardCoin({ coin: TEST_COIN })
                .withPublicKey(TEST_PUB_KEY);

            const cs = sc.send(TEST_DESTINATION_ADDRESS);
            const conditionsDict: ConditionsDict = Util.sexp.conditionsDictForSolution(
                cs!.puzzleReveal,
                cs!.solution,
                Util.sexp.MAX_BLOCK_COST_CLVM
            )[1]!;
            const createFeeConditions = conditionsDict.get(ConditionOpcode.RESERVE_FEE);
            const createCoinConditions = conditionsDict.get(ConditionOpcode.CREATE_COIN);
            expect(createFeeConditions).to.be.undefined;
            expect(createCoinConditions).to.not.be.undefined;
            expect(createCoinConditions!.length).to.equal(1);
            
            const cond1 = createCoinConditions![0];
            expect(cond1.vars[0]).to.equal(TEST_DESTINATION_PUZZLE_HASH);
            expect(
                BigNumber.from("0x" + cond1.vars[1]).eq(TEST_COIN.amount)
            ).to.be.true;
        });

        it("Works if only given a puzzle hash", () => {
            const sc = new StandardCoin({ coin: TEST_COIN })
                .withPublicKey(TEST_PUB_KEY);

            const cs = sc.send(TEST_DESTINATION_PUZZLE_HASH);
            const conditionsDict: ConditionsDict = Util.sexp.conditionsDictForSolution(
                cs!.puzzleReveal,
                cs!.solution,
                Util.sexp.MAX_BLOCK_COST_CLVM
            )[1]!;
            const createFeeConditions = conditionsDict.get(ConditionOpcode.RESERVE_FEE);
            const createCoinConditions = conditionsDict.get(ConditionOpcode.CREATE_COIN);
            expect(createFeeConditions).to.be.undefined;
            expect(createCoinConditions).to.not.be.undefined;
            expect(createCoinConditions!.length).to.equal(1);
            
            const cond1 = createCoinConditions![0];
            expect(cond1.vars[0]).to.equal(TEST_DESTINATION_PUZZLE_HASH);
            expect(
                BigNumber.from("0x" + cond1.vars[1]).eq(TEST_COIN.amount)
            ).to.be.true;
        });

        it("Works if also given fee and amount", () => {
            const sc = new StandardCoin({ coin: TEST_COIN })
                .withPublicKey(TEST_PUB_KEY);

            const FEE = 42;
            const CHANGE = 100;
            const TRANSFER_AMOUNT = BigNumber.from(TEST_COIN.amount).sub(FEE).sub(CHANGE);
            const cs = sc.send(
                TEST_DESTINATION_PUZZLE_HASH, FEE, TRANSFER_AMOUNT
            );
            const conditionsDict: ConditionsDict = Util.sexp.conditionsDictForSolution(
                cs!.puzzleReveal,
                cs!.solution,
                Util.sexp.MAX_BLOCK_COST_CLVM
            )[1]!;
            const createFeeConditions = conditionsDict.get(ConditionOpcode.RESERVE_FEE);
            const createCoinConditions = conditionsDict.get(ConditionOpcode.CREATE_COIN);

            expect(createFeeConditions).to.not.be.undefined;
            expect(createFeeConditions?.length).to.equal(1);
            const cond1 = createFeeConditions![0];
            expect(
                BigNumber.from("0x" + cond1.vars[0]).eq(FEE)
            ).to.be.true;

            expect(createCoinConditions).to.not.be.undefined;
            expect(createCoinConditions!.length).to.equal(2);
            const cond2 = createCoinConditions![0];
            expect(cond2.vars[0]).to.equal(TEST_DESTINATION_PUZZLE_HASH);
            expect(
                BigNumber.from("0x" + cond2.vars[1]).eq(TRANSFER_AMOUNT)
            ).to.be.true;
            const cond3 = createCoinConditions![1];
            expect(cond3.vars[0]).to.equal(TEST_COIN.puzzleHash);
            expect(
                BigNumber.from("0x" + cond3.vars[1]).eq(CHANGE)
            ).to.be.true;
        });
    });

    describe("multisend()", () => {
        const RECIPIENT1 = "11".repeat(32);
        const RECIPIENT2 = Util.address.puzzleHashToAddress("22".repeat(32));
        const RECIPIENT1_AMOUNT = 100;
        const RECIPIENT2_AMOUNT = 200;
        const RECIPEINTS_AND_AMOUNTS: Array<[string, BigNumberish]> = [
            [RECIPIENT1, RECIPIENT1_AMOUNT],
            [RECIPIENT2, RECIPIENT2_AMOUNT]
        ];

        const FEE = 42;
        const CHANGE_ADDR = "41".repeat(32);

        it("Returns null if coin info is not available", () => {
            const sc = new StandardCoin();

            expect(sc.multisend(RECIPEINTS_AND_AMOUNTS)).to.be.null;
        });

        it("Throws error if a recipient is not valid", () => _expectToThrow(
            () => {
                const sc = new StandardCoin({
                    coin: TEST_COIN,
                    publicKey: TEST_PUB_KEY
                });

                sc.multisend(
                    [["yakuhito.xch", 1], ...RECIPEINTS_AND_AMOUNTS]
                )
            },
            "StandardCoin: Invalid recipient yakuhito.xch"
        ));

        it("Throws error if fee is too high", () => _expectToThrow(
            () => {
                const sc = new StandardCoin({
                    coin: TEST_COIN,
                    publicKey: TEST_PUB_KEY
                });

                sc.multisend(
                    RECIPEINTS_AND_AMOUNTS,
                    BigNumber.from(TEST_COIN.amount).sub(100)
                )
            },
            "StandardCoin: fee + totalSpent > currentCoinAmount"
        ));

        it("Throws error if totalSpent is too high", () => _expectToThrow(
            () => {
                const sc = new StandardCoin({
                    coin: TEST_COIN,
                    publicKey: TEST_PUB_KEY
                });

                sc.multisend(
                    [
                        [TEST_COIN.puzzleHash, BigNumber.from(TEST_COIN.amount).sub(100)],
                        ...RECIPEINTS_AND_AMOUNTS
                    ]
                )
            },
            "StandardCoin: fee + totalSpent > currentCoinAmount"
        ));

        it("Throws error if changeAddress is invalid", () => _expectToThrow(
            () => {
                const sc = new StandardCoin({
                    coin: TEST_COIN,
                    publicKey: TEST_PUB_KEY
                });

                sc.multisend(
                    RECIPEINTS_AND_AMOUNTS,
                    FEE,
                    "yakuhito.xch"
                )
            },
            "StandardCoin: changeAddressOrPuzzleHash is not a valid puzzle hash or address"
        ));

        it("Works", () => {
            const sc = new StandardCoin({
                coin: TEST_COIN,
                publicKey: TEST_PUB_KEY
            });

            const cs = sc.multisend(
                RECIPEINTS_AND_AMOUNTS, FEE, CHANGE_ADDR
            );
            const conditionsDict: ConditionsDict = Util.sexp.conditionsDictForSolution(
                cs!.puzzleReveal,
                cs!.solution,
                Util.sexp.MAX_BLOCK_COST_CLVM
            )[1]!;
            const createFeeConditions = conditionsDict.get(ConditionOpcode.RESERVE_FEE);
            const createCoinConditions = conditionsDict.get(ConditionOpcode.CREATE_COIN);

            expect(createFeeConditions).to.not.be.undefined;
            expect(createFeeConditions?.length).to.equal(1);
            const cond1 = createFeeConditions![0];
            expect(
                BigNumber.from("0x" + cond1.vars[0]).eq(FEE)
            ).to.be.true;

            expect(createCoinConditions).to.not.be.undefined;
            expect(createCoinConditions!.length).to.equal(3);
            const cond2 = createCoinConditions![0];
            expect(cond2.vars[0]).to.equal(RECIPIENT1);
            expect(
                BigNumber.from("0x" + cond2.vars[1]).eq(RECIPIENT1_AMOUNT)
            ).to.be.true;
            const cond3 = createCoinConditions![1];
            expect(cond3.vars[0]).to.equal(Util.address.addressToPuzzleHash(RECIPIENT2));
            expect(
                BigNumber.from("0x" + cond3.vars[1]).eq(RECIPIENT2_AMOUNT)
            ).to.be.true;
            const cond4 = createCoinConditions![2];
            expect(cond4.vars[0]).to.equal(CHANGE_ADDR);
            expect(
                BigNumber.from("0x" + cond4.vars[1]).eq(
                    BigNumber.from(TEST_COIN.amount).sub(RECIPIENT1_AMOUNT).sub(RECIPIENT2_AMOUNT).sub(FEE)
                )
            ).to.be.true;
        });
    });
});