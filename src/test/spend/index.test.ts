/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-len */
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Bytes, getBLSModule, initializeBLS, SExp } from "clvm";
import { CAT } from "../../cat";
import { SpendModule, Announcement } from "../../spend";
import { StandardCoin } from "../../standard_coin";
import { Util } from "../../util";
import { CoinSpend } from "../../util/serializer/types/coin_spend";
import { SpendBundle } from "../../util/serializer/types/spend_bundle";
import { bytes, Coin } from "../../xch/providers/provider_types";

describe("SpendModule", function () {
    this.timeout(5000);

    const TEST_PRIV_KEY_STR = "42".repeat(32);
    let TEST_PRIV_KEY: any;
    let TEST_PUB_KEY: bytes;
    let TEST_COIN: Coin;
    let TEST_COIN2: Coin;
    let TEST_COIN3: Coin;
    let TEST_PUZZ: SExp;

    beforeEach(async () => {
        await initializeBLS();
        TEST_PRIV_KEY = Util.key.hexToPrivateKey(TEST_PRIV_KEY_STR);
        const g1Elem = TEST_PRIV_KEY.get_g1();
        TEST_PUB_KEY = Util.key.publicKeyToHex(g1Elem);

        TEST_PUZZ = Util.sexp.standardCoinPuzzle(g1Elem);

        TEST_COIN = new Coin();
        TEST_COIN.amount = 13;
        TEST_COIN.parentCoinInfo = "01".repeat(32);
        TEST_COIN.puzzleHash = Util.sexp.sha256tree(TEST_PUZZ);

        TEST_COIN2 = new Coin();
        TEST_COIN2.amount = 17;
        TEST_COIN2.parentCoinInfo = "02".repeat(32);
        TEST_COIN2.puzzleHash = Util.sexp.sha256tree(TEST_PUZZ);

        TEST_COIN3 = new Coin();
        TEST_COIN3.amount = 7;
        TEST_COIN3.parentCoinInfo = "03".repeat(32);
        TEST_COIN3.puzzleHash = Util.sexp.sha256tree(TEST_PUZZ);
    });

    describe("Announcement", () => {
        it("Works (constructor correctly sets attributes & name() returns expected value)", () => {
            const a = new Announcement("01", "02", "03");

            expect(a.originInfo).to.equal("01");
            expect(a.message).to.equal("02");
            expect(a.morphBytes).to.equal("03");

            expect(a.name()).to.equal(
                Util.stdHash("010302")
            );
        });

        it("Works (no morphBytes)", () => {
            const a = new Announcement("01", "02");

            expect(a.originInfo).to.equal("01");
            expect(a.message).to.equal("02");
            expect(a.morphBytes).to.be.undefined;

            expect(a.name()).to.equal(
                Util.stdHash("0102")
            );
        });

        it("Works (no originInfo)", () => {
            const a = new Announcement(undefined, "02", "03");

            expect(a.originInfo).to.be.undefined;
            expect(a.message).to.equal("02");
            expect(a.morphBytes).to.equal("03");

            expect(a.name()).to.equal(
                Util.stdHash("0302")
            );
        });

        it("Works (no originInfo/morphBytes)", () => {
            const a = new Announcement(undefined, "02", undefined);

            expect(a.originInfo).to.be.undefined;
            expect(a.message).to.equal("02");
            expect(a.morphBytes).to.be.undefined;

            expect(a.name()).to.equal(
                Util.stdHash("02")
            );
        });
    });
    
    describe("createCoinCondition()", () => {
        it("Works", () => {
            const r = SpendModule.createCoinCondition(
                "42".repeat(32),
                1
            );

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // opc '(51 0x4242424242424242424242424242424242424242424242424242424242424242 1)'
                "ff33ffa04242424242424242424242424242424242424242424242424242424242424242ff0180"
            );
        });

        it("Works (with memo)", () => {
            const r = SpendModule.createCoinCondition(
                "42".repeat(32),
                1,
                [ "13".repeat(32) ]
            );

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // opc '(51 "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" 1 (0x1313131313131313131313131313131313131313131313131313131313131313))'
                "ff33ffa04242424242424242424242424242424242424242424242424242424242424242ff01ffffa013131313131313131313131313131313131313131313131313131313131313138080"
            );
        });

        it("Works (with memos)", () => {
            const r = SpendModule.createCoinCondition(
                "42".repeat(32),
                1,
                [
                    "31".repeat(32),
                    "33".repeat(32),
                    "37".repeat(32),
                ]
            );

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // trust me on this one
                "ff33ffa04242424242424242424242424242424242424242424242424242424242424242ff01ffffa03131313131313131313131313131313131313131313131313131313131313131ffa03333333333333333333333333333333333333333333333333333333333333333ffa037373737373737373737373737373737373737373737373737373737373737378080"
            );
        });
    });

    describe("reserveFeeCondition()", () => {
        it("Works", () => {
            const r = SpendModule.reserveFeeCondition(1337);

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // opc '(52 1337)'
                "ff34ff82053980"
            );
        });
    });

    describe("createCoinAnnouncementCondition()", () => {
        it("Works", () => {
            const r = SpendModule.createCoinAnnouncementCondition("31333337");

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // brun '(q 60 0x31333337)'
                "ff3cff843133333780"
            );
        });
    });

    describe("assertCoinAnnouncementCondition()", () => {
        it("Works", () => {
            const r = SpendModule.assertCoinAnnouncementCondition("31333337");

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // brun '(q 61 0x31333337)'
                "ff3dff843133333780"
            );
        });
    });

    describe("createPuzzleAnnouncementCondition()", () => {
        it("Works", () => {
            const r = SpendModule.createPuzzleAnnouncementCondition("31333337");

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // brun '(q 62 "1337")'
                "ff3eff843133333780"
            );
        });
    });

    describe("assertPuzzleAnnouncementCondition()", () => {
        it("Works", () => {
            const r = SpendModule.assertPuzzleAnnouncementCondition("31333337");

            expect(
                Util.sexp.toHex(r)
            ).to.equal(
                // brun '(q 63 "1337")'
                "ff3fff843133333780"
            );
        });
    });

    const _expectToThrow = (func: any, message: string) => {
        let ok: boolean = false;
        try {
            func();
        } catch(e: any) {
            ok = e.message === message;
        }

        expect(ok).to.be.true;
    }

    describe("bundleStandardCoins()", () => {
        it("Throws correct error if one coin is not spendable", () => {
            const c = new StandardCoin({
                publicKey: TEST_PUB_KEY
            });

            _expectToThrow(
                () => SpendModule.bundleStandardCoins(
                    [c, ], [], []
                ),
                "StandardCoin not spendable"
            );
        });

        it("Works", () => {
            const c1 = new StandardCoin({
                publicKey: TEST_PUB_KEY,
                coin: TEST_COIN,
            });
            const c2 = new StandardCoin({
                publicKey: TEST_PUB_KEY,
                coin: TEST_COIN2,
            });
            const cond1 = [
                SExp.to(Bytes.from("4242", "hex")),
                SExp.FALSE
            ];
            const cond2 = [
                SExp.to(Bytes.from("31333337", "hex")),
                SExp.TRUE
            ];

            const res = SpendModule.bundleStandardCoins(
                [c1, c2], cond1, cond2
            );

            expect(res.length).to.equal(2);
            expect(
                Util.coin.getId(res[0].coin)
            ).to.equal(
                Util.coin.getId(TEST_COIN)
            );
            expect(
                Util.sexp.sha256tree(res[0].puzzleReveal)
            ).to.equal(TEST_COIN.puzzleHash);
            expect(
                Util.sexp.toHex(res[0].solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.standardCoinSolution(cond1)
                )
            );

            expect(
                Util.coin.getId(res[1].coin)
            ).to.equal(
                Util.coin.getId(TEST_COIN2)
            );
            expect(
                Util.sexp.sha256tree(res[1].puzzleReveal)
            ).to.equal(TEST_COIN2.puzzleHash);
            expect(
                Util.sexp.toHex(res[1].solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.standardCoinSolution(cond2)
                )
            );
        });
    });

    describe("bundleCATs()", () => {
        it("Throws correct error if one CAT is not spendable", () => {
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                coin: TEST_COIN,
            });
            const firstCond = [
                SpendModule.createCoinCondition("77".repeat(32), TEST_COIN.amount),
            ];

            _expectToThrow(
                () => SpendModule.bundleCATs(
                    [c, ], firstCond, []
                ),
                "CAT not spendable"
            );
        });

        it("Throws correct error if one CAT is not spendable (#2)", () => {
            const c1 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TEST_COIN.puzzleHash,
                coin: TEST_COIN
            });
            const c2 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TEST_COIN.puzzleHash,
                parentCoinInfo: TEST_COIN.parentCoinInfo,
            });
            const firstCond = [
                SpendModule.createCoinCondition("77".repeat(32), TEST_COIN.amount),
            ];

            _expectToThrow(
                () => SpendModule.bundleCATs(
                    [c1, c2, ], firstCond, []
                ),
                "CAT not spendable"
            );
        });

        it("Throws correct error if input and output amounts do not match", () => {
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TEST_COIN.puzzleHash,
                coin: TEST_COIN,
            });
            const firstCond = [
                SpendModule.createCoinCondition("77".repeat(32), BigNumber.from(TEST_COIN.amount).add(1)),
            ];

            _expectToThrow(
                () => SpendModule.bundleCATs(
                    [c, ], firstCond, []
                ),
                "input and output amounts don't match"
            );
        });

        it("Throws correct error if innerPuzzle returns an error", () => {
            const c = new CAT({
                publicKey: TEST_PUB_KEY,
                coin: TEST_COIN,
                TAILProgramHash: TEST_COIN.puzzleHash,
                innerSolution: SExp.FALSE
            });
            const firstCond = [
                SpendModule.createCoinCondition("77".repeat(32), BigNumber.from(TEST_COIN.amount)),
            ];

            _expectToThrow(
                () => SpendModule.bundleCATs(
                    [c, ], firstCond, []
                ),
                "innerPuzzle returned an error"
            );
        });

        it("Works", () => {
            const TAILHash = TEST_COIN.puzzleHash;

            TEST_COIN.puzzleHash = Util.sexp.sha256tree(
                Util.sexp.CATPuzzle(
                    TAILHash,
                    Util.sexp.standardCoinPuzzle(Util.key.hexToPublicKey(TEST_PUB_KEY))
                )
            );
            TEST_COIN2.puzzleHash = TEST_COIN.puzzleHash;
            TEST_COIN3.puzzleHash = TEST_COIN.puzzleHash;
            const c1 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TAILHash,
                coin: TEST_COIN,
            });
            const c2 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TAILHash,
                coin: TEST_COIN2,
            });
            const c3 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TAILHash,
                coin: TEST_COIN3,
            }).withExtraDelta(6).withTAILProgram(TEST_PUZZ).withTAILSolution(
                Util.sexp.standardCoinSolution([])
            );

            const cond1 = [
                SpendModule.createCoinCondition(
                    "77".repeat(32),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    BigNumber.from(c1.amount).add(c2.amount!).add(c3.amount!).add(6)
                ),
            ];
            const cond2 = [
                SpendModule.assertCoinAnnouncementCondition("4242")
            ];

            const res = SpendModule.bundleCATs(
                [c1, c2, c3], cond1, cond2
            );

            expect(res.length).to.equal(3);
            expect(
                res[0].coin.parentCoinInfo
            ).to.equal(TEST_COIN.parentCoinInfo);
            expect(
                Util.sexp.toHex(res[0].puzzleReveal)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.CATPuzzle(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c1.TAILProgramHash!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c1.innerPuzzle!
                    )
                )
            );
            expect(
                Util.sexp.toHex(res[0].solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.CATSolution(
                        Util.sexp.standardCoinSolution(cond1),
                        null,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c3.getId()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c1.toCoin()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c2.toCoin()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        0x1e,
                        0
                    ),
                )
            );
            expect(
                res[1].coin.parentCoinInfo
            ).to.equal(TEST_COIN2.parentCoinInfo);
            expect(
                Util.sexp.toHex(res[1].puzzleReveal)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.CATPuzzle(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c2.TAILProgramHash!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c2.innerPuzzle!
                    )
                )
            );
            expect(
                Util.sexp.toHex(res[1].solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.CATSolution(
                        Util.sexp.standardCoinSolution(cond2),
                        null,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c1.getId()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c2.toCoin()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c3.toCoin()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        0,
                        0
                    ),
                )
            );
            expect(
                res[2].coin.parentCoinInfo
            ).to.equal(TEST_COIN3.parentCoinInfo);
            expect(
                Util.sexp.toHex(res[2].puzzleReveal)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.CATPuzzle(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c3.TAILProgramHash!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c3.innerPuzzle!
                    )
                )
            );
            expect(
                Util.sexp.toHex(res[2].solution)
            ).to.equal(
                Util.sexp.toHex(
                    Util.sexp.CATSolution(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c3.addConditionsToInnerSolution(cond2).innerSolution!,
                        null,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c2.getId()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c3.toCoin()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c1.toCoin()!,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        0x11,
                        6
                    ),
                )
            );
        });

        it("Throws error when trying to bundle CATs with different TAILs", () => {
            const TAILHash1 = TEST_COIN.puzzleHash;
            const TAILHash2 = "aa".repeat(32);

            expect(TAILHash1).to.not.equal(TAILHash2);
            TEST_COIN.puzzleHash = Util.sexp.sha256tree(
                Util.sexp.CATPuzzle(
                    TAILHash1,
                    Util.sexp.standardCoinPuzzle(Util.key.hexToPublicKey(TEST_PUB_KEY))
                )
            );
            TEST_COIN2.puzzleHash = Util.sexp.sha256tree(
                Util.sexp.CATPuzzle(
                    TAILHash2,
                    Util.sexp.standardCoinPuzzle(Util.key.hexToPublicKey(TEST_PUB_KEY))
                )
            );
            const c1 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TAILHash1,
                coin: TEST_COIN,
            });
            const c2 = new CAT({
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TAILHash2,
                coin: TEST_COIN2,
            });
            const cond1 = [
                SpendModule.createCoinCondition(
                    "77".repeat(32),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    BigNumber.from(c1.amount).add(c2.amount!)
                ),
            ];
            const cond2 = [
                SpendModule.assertCoinAnnouncementCondition("4242")
            ];

            _expectToThrow(
                () => SpendModule.bundleCATs(
                    [c1, c2],
                    cond1,
                    cond2
                ),
                "CATs with different TAILs cannot be bundled together"
            );
        });
    });

    describe("bundle()", () => {
        it("Returns [] if no CATs/StandardCoins are provided", () => {
            const r = SpendModule.bundle([]);

            expect(r.length).to.equal(0);
        });

        it("Correctly bundles CATs", () => {
            const c1 = new CAT({
                coin: TEST_COIN,
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TEST_COIN.puzzleHash
            });

            const c2 = new CAT({
                coin: TEST_COIN2,
                publicKey: TEST_PUB_KEY,
                TAILProgramHash: TEST_COIN.puzzleHash
            });

            const outputCond = SpendModule.createCoinCondition("77".repeat(42), BigNumber.from(TEST_COIN.amount).add(TEST_COIN2.amount));

            const res = SpendModule.bundle([c1, c2], {
                CATOutputConditions: [outputCond],
                fee: 7
            });

            const expected = SpendModule.bundleCATs(
                [c1, c2],
                [
                    outputCond,
                    SpendModule.reserveFeeCondition(7)
                ],
                []
            );
            expect(res.length).to.equal(2);

            for(let i = 0;i < 2; ++i) {
                expect(
                    Util.sexp.toHex(res[i].puzzleReveal)
                ).to.equal(
                    Util.sexp.toHex(expected[i].puzzleReveal)
                );
                expect(
                    Util.sexp.toHex(res[i].solution)
                ).to.equal(
                    Util.sexp.toHex(expected[i].solution)
                );
                expect(
                    Util.coin.getId(res[i].coin)
                ).to.equal(
                    Util.coin.getId(expected[i].coin)
                );
            }
        });

        it("Correctly bundles StandardCoins", () => {
            const c1 = new StandardCoin({
                coin: TEST_COIN,
                publicKey: TEST_PUB_KEY
            });

            const c2 = new StandardCoin({
                coin: TEST_COIN2,
                publicKey: TEST_PUB_KEY
            });

            const outputConds = [
                SpendModule.createCoinCondition("77".repeat(42), BigNumber.from(TEST_COIN.amount).add(TEST_COIN2.amount))
            ];

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const msg = Util.stdHash(c1.getName()! + c2.getName()!);
            const ann = new Announcement(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                c1.getName()!,
                msg,
                ""
            );
            const bundleFirstConds = [
                ...outputConds,
                SpendModule.createCoinAnnouncementCondition(msg),
                SpendModule.reserveFeeCondition(5)
            ];
            const bundleOtherConds = [
                SpendModule.assertCoinAnnouncementCondition(ann.name())
            ]
            
            const res = SpendModule.bundle([c1, c2], {
                standardCoinOutputConditions: outputConds,
                fee: 5
            });

            const expected = SpendModule.bundleStandardCoins([c1, c2], bundleFirstConds, bundleOtherConds);
            expect(res.length).to.equal(2);

            for(let i = 0;i < 2; ++i) {
                expect(
                    Util.sexp.toHex(res[i].puzzleReveal)
                ).to.equal(
                    Util.sexp.toHex(expected[i].puzzleReveal)
                );
                expect(
                    Util.sexp.toHex(res[i].solution)
                ).to.equal(
                    Util.sexp.toHex(expected[i].solution)
                );
                expect(
                    Util.coin.getId(res[i].coin)
                ).to.equal(
                    Util.coin.getId(expected[i].coin)
                );
            }
        });

        for(const withFee of [false, true]) {
            it("Correctly merges StandardCoins and CATs together" + (withFee ? "(with fee)" : "(no fee)"), () => {
                const sc = new StandardCoin({
                    coin: TEST_COIN,
                    publicKey: TEST_PUB_KEY,
                });
                const scOutputCond = SpendModule.createCoinCondition("07".repeat(32), TEST_COIN.amount);
    
                const TAILHash = TEST_COIN.puzzleHash;
                const cat = new CAT({
                    coin: TEST_COIN2,
                    TAILProgramHash: TAILHash,
                    publicKey: TEST_PUB_KEY
                });
                const CATOutputCond = SpendModule.createCoinCondition("88".repeat(32), TEST_COIN2.amount);
    
                const res = SpendModule.bundle(
                    [sc, cat], {
                        standardCoinOutputConditions: [ scOutputCond ],
                        CATOutputConditions: [ CATOutputCond ],
                        fee: withFee ? 5000000 : 0
                    }
                );
    
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const msg = Util.stdHash(sc.getId()! + cat.getId()!);
                const ann = new Announcement(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    cat.getId()!,
                    msg,
                    "ca"
                );
    
                expect(res.length).to.equal(2);
                expect(
                    Util.coin.getId(res[0].coin)
                ).to.equal(cat.getId());
                expect(
                    Util.sexp.toHex(res[0].puzzleReveal)
                ).to.equal(
                    Util.sexp.toHex(cat.puzzle)
                );
    
                const expectedCATSolution = SpendModule.bundleCATs(
                    [cat],
                    [
                        CATOutputCond,
                        SpendModule.createCoinAnnouncementCondition(msg),
                        ...(withFee ? [SpendModule.reserveFeeCondition(5000000)] : [])
                    ],
                    []
                )[0].solution;
                expect(
                    Util.sexp.toHex(res[0].solution)
                ).to.equal(
                    Util.sexp.toHex(expectedCATSolution),
                );
    
                expect(
                    Util.coin.getId(res[1].coin)
                ).to.equal(sc.getId());
                expect(
                    Util.sexp.toHex(res[1].puzzleReveal)
                ).to.equal(
                    Util.sexp.toHex(sc.puzzle)
                );
    
                const expectedStandardCoinSolution = SpendModule.bundleStandardCoins(
                    [sc],
                    [
                        scOutputCond,
                        SpendModule.assertCoinAnnouncementCondition(ann.name()),
                    ],
                    []
                )[0].solution;
                expect(
                    Util.sexp.toHex(res[1].solution)
                ).to.equal(
                    Util.sexp.toHex(expectedStandardCoinSolution),
                );
            });
        }
    });

    describe("merge()", () => {
        const _getCoinSpend = (n: number) => {
            const cs = new CoinSpend();
            cs.coin = TEST_COIN;
            cs.puzzleReveal = SExp.to([n, ]);
            cs.solution = SExp.FALSE;

            return cs;
        };

        it("Works", () => {
            const { AugSchemeMPL } = getBLSModule();
            
            const cs1 = _getCoinSpend(1);
            const cs2 = _getCoinSpend(2);
            const cs3 = _getCoinSpend(3);
            const cs4 = _getCoinSpend(4);
            const cs5 = _getCoinSpend(5);

            const sb = new SpendBundle();
            sb.coinSpends = [cs4, cs5];
            sb.aggregatedSignature = Buffer.from(AugSchemeMPL.aggregate([]).serialize()).toString("hex");

            const r = SpendModule.merge([
                cs1,
                [cs2, cs3],
                sb
            ]);

            expect(r.coinSpends.length).to.equal(5);
            for(let i = 0; i < 5; ++i) {
                expect(
                    Util.sexp.toHex(r.coinSpends[i].puzzleReveal)
                ).to.equal(
                    Util.sexp.toHex(SExp.to([i + 1, ]))
                );
            }
            expect(r.aggregatedSignature).to.equal(sb.aggregatedSignature); // empty agg sig
        });
    });
});