/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { expect } from "chai";
import { Util } from "../../../../util";
import { Network } from "../../../../util/network";
import { LeafletRPCProvider } from "../../../../xch/providers/leaflet_rpc";
import { Coin, CoinState } from "../../../../xch/providers/provider_types";

describe.only("LeafletRPCProvider", () => {
    const _testEndpoint = (
        func: (p: LeafletRPCProvider) => Promise<any>,
        endpoint: string,
        mockResponses: any[],
        expectedParams: any[],
        expectedAnswers: any[],
        expectedAnswerSuccessFalse: any,
        answerEqualityFunc: (a: any, b: any) => boolean = (a: any, b: any) => a === b,
    ) => {
        for(let i = 0; i < mockResponses.length; ++i) {
            const ext = mockResponses.length === 1 ? "" : ` #${i + 1}`;
            it("Correctly handles response" + ext, async () => {
                const acessedEndpoints: string[] = [];
                let givenParams: any;

                const p = new LeafletRPCProvider(
                    "leaflet.fireacademy.io",
                    "TEST-API-KEY",
                    18444,
                    Network.mainnet,
                    false,
                    async (endpoint: string, params: any) => {
                        acessedEndpoints.push(endpoint);
                        givenParams = params;

                        return mockResponses[i];
                    }
                );
                p.connect();
                const res = await func(p);

                expect(acessedEndpoints.length).to.equal(1);
                expect(acessedEndpoints[0]).to.equal(endpoint);
                expect(
                    JSON.stringify(givenParams)
                ).to.equal(
                    JSON.stringify(expectedParams[i])
                );
                expect(
                    answerEqualityFunc(res, expectedAnswers[i])
                ).to.be.true;
            });
        }

        it("Correctly handles error responses", async () => {
            const p = new LeafletRPCProvider(
                "leaflet.fireacademy.io",
                "TEST-API-KEY",
                18444,
                Network.mainnet,
                false,
                async <T>() => {
                    return { success: false } as unknown as T;
                }
            );
            p.connect();
            const res = await func(p);

            expect(
                answerEqualityFunc(res, expectedAnswerSuccessFalse)
            ).to.be.true;
        });

        it("Works if provider is not connected", async () => {
            const p = new LeafletRPCProvider(
                "leaflet.fireacademy.io",
                "TEST-API-KEY",
                18444,
                Network.mainnet,
                false,
                async <T>() => {
                    return { success: false } as unknown as T;
                }
            );
            const res = await func(p);

            expect(
                answerEqualityFunc(res, expectedAnswerSuccessFalse)
            ).to.be.true;
        });

        it("Correctly handles errors", async () => {
            const p = new LeafletRPCProvider(
                "leaflet.fireacademy.io",
                "TEST-API-KEY",
                18444,
                Network.mainnet,
                false,
                async () => { throw new Error("err"); }
            );
            p.connect();
            const res = await func(p);

            expect(
                answerEqualityFunc(res, expectedAnswerSuccessFalse)
            ).to.be.true;
        });
    };

    describe("getBlockNumber()", () => _testEndpoint(
        (p) => p.getBlockNumber(),
        "get_blockchain_state",
        [
            {"blockchain_state":{"difficulty":3008,"genesis_challenge_initialized":true,"mempool_size":0,"peak":{"challenge_block_info_hash":"0x436bd6f7db0de90db868594b862d9388a231402f3c601282773ccab8e54914f3","challenge_vdf_output":{"data":"0x01001ea29503859966e59024fb3a903e424a1652e724483b86928febca5e308d7039b7138847e436e5f1ba5f6c025f6c6ff275c070149079877463aa077f571d0706516723eaa51113c8ec624a005dc73704fcccefa26bb0eefbb9af15eb5c61b6090201"},"deficit":15,"farmer_puzzle_hash":"0xe2f70baf739bdaf59e360d3a3e2d4ff8cb89f150d9b60b8e91b870e41b58f2fa","fees":null,"finished_challenge_slot_hashes":null,"finished_infused_challenge_slot_hashes":null,"finished_reward_slot_hashes":null,"header_hash":"0xf42b4e77315d79ddfb3d64becb21e26ebff5408bda4d1b7c3782fd04f49ec0bb","height":914661,"infused_challenge_vdf_output":null,"overflow":false,"pool_puzzle_hash":"0x71afdce401a0f2a6f03de6287902eacfa38502d6667b04da36e32c3930171ce4","prev_hash":"0x902ca8dfdd08e79dec3c96837f4e99162508ffaeff730c68af1fde9b86cbf61b","prev_transaction_block_hash":null,"prev_transaction_block_height":914660,"required_iters":852774,"reward_claims_incorporated":null,"reward_infusion_new_challenge":"0x5566434842f375434f9a558a3de5907db44903036c3de1573852afffbd1991bd","signage_point_index":0,"sub_epoch_summary_included":null,"sub_slot_iters":136314880,"timestamp":null,"total_iters":3330271511334,"weight":1393823840},"space":40110198681182960000,"sub_slot_iters":136314880,"sync":{"sync_mode":false,"sync_progress_height":0,"sync_tip_height":0,"synced":false}},"success":true},
        ],
        [
            {}
        ],
        [
            914661
        ],
        null,
    ));

    const bigNumberishEqual = (e1: BigNumberish | null, e2: BigNumberish | null) => {
        if(e1 === null || e2 === null) return e1 === e2;

        return BigNumber.from(e1).eq(e2);
    };

    describe("getBalance()", () => _testEndpoint(
        (p) => p.getBalance({
            address: Util.address.puzzleHashToAddress("b1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0"),
            minHeight: 800000
        }),
        "get_coin_records_by_puzzle_hash",
        [
            {"coin_records":[{"coin":{"amount":921800500,"parent_coin_info":"0x055c0286a0eb881f2e950ce4ee30870868d1a951a0e0eb4dc52de5472a9c8b91","puzzle_hash":"0xb1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0"},"coinbase":false,"confirmed_block_index":922637,"spent":true,"spent_block_index":922641,"timestamp":1632832094}],"success":true}
        ],
        [
            {"puzzle_hash":"b1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0", "start_height":800000, "include_spent_coins": false}
        ],
        [
            921800500
        ],
        null,
        bigNumberishEqual
    ));

    const coinStateArrEqual = (arr1: CoinState[] | null, arr2: CoinState[] | null) => {
        if(arr1 === null || arr2 === null) return arr1 === arr2;

        let ok = arr1.length === arr2.length;
        
        for(let i = 0; i < arr1.length && ok; ++i) {
            if(
                arr1[i].spentHeight !== arr2[i].spentHeight ||
                arr1[i].createdHeight !== arr2[i].createdHeight ||
                Util.coin.getId(arr1[i].coin) !== Util.coin.getId(arr2[i].coin)
            ) {
                console.log({arr1, arr2})
                ok = false;
            }
        }
        return ok;
    };

    describe("getCoins()", () => _testEndpoint(
        (p) => p.getCoins({
            puzzleHash: "b1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0",
            startHeight: 800000,
            endHeight: 1000000,
            includeSpentCoins: true,
        }),
        "get_coin_records_by_puzzle_hash",
        [
            {"coin_records":[{"coin":{"amount":921800500,"parent_coin_info":"0x055c0286a0eb881f2e950ce4ee30870868d1a951a0e0eb4dc52de5472a9c8b91","puzzle_hash":"0xb1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0"},"coinbase":false,"confirmed_block_index":922637,"spent":true,"spent_block_index":922641,"timestamp":1632832094}],"success":true}
        ],
        [
            {"puzzle_hash":"b1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0", "start_height":800000, "end_height":1000000, "include_spent_coins": true}
        ],
        [
            [
                new CoinState(
                    new Coin({
                        amount: 921800500,
                        parentCoinInfo: "055c0286a0eb881f2e950ce4ee30870868d1a951a0e0eb4dc52de5472a9c8b91",
                        puzzleHash: "b1736654875b1c49b4077b89580c4447f12f1e86fb85d488d7efddd5c6e06be0"
                    }),
                    922637,
                    922641
                ),
            ],
        ],
        null,
        coinStateArrEqual
    ));
});