/* eslint-disable @typescript-eslint/no-unused-expressions */
import { G1Element } from "@chiamine/bls-signatures";
import { expect } from "chai";
import { initialize } from "clvm";
import { Util } from "../../../util";
import { DeriveKeysUtils } from "../../../util/key/derive_keys";

describe("DeriveKeysUtils", () => {
    let MASTER_SK: any;

    beforeEach(async () => {
        await initialize();

        MASTER_SK = Util.key.hexToPrivateKey("4242424242424242424242424242424242424242424242424242424242424242");
    });

    /*
    >>> from blspy import PrivateKey
    >>> from chia.wallet.derive_keys import *
    >>> pk = PrivateKey.from_bytes(bytes.fromhex("4242424242424242424242424242424242424242424242424242424242424242"))
    */

    const _testKeyDerivationFunction = (
        func: (pk: any) => any,
        expectedResult: string
    ) => {
        expect(
            Util.key.privateKeyToHex(
                func(MASTER_SK)
            )
        ).to.equal(expectedResult);
    }

    describe("masterSkToFarmerSk()", () => {
        it("Works", () => {
            /*
            >>> print(master_sk_to_farmer_sk(pk))
            <PrivateKey 630dd68e88d79c93c9cb99f1e72804236ae887de8c0cfe809e9dde742e2147b7>
            */

            _testKeyDerivationFunction(
                (sk) => DeriveKeysUtils.masterSkToFarmerSk(sk),
                "630dd68e88d79c93c9cb99f1e72804236ae887de8c0cfe809e9dde742e2147b7"
            );
        });
    });
    
    describe("masterSkToPoolSk()", () => {
        it("Works", () => {
            /*
            >>> print(master_sk_to_pool_sk(pk))
            <PrivateKey 6fa9d7fa7666b7ddcbda6aee036650a190cc7e854fbe8ceb0cfc5ce1d9d88200>
            */

            _testKeyDerivationFunction(
                (sk) => DeriveKeysUtils.masterSkToPoolSk(sk),
                "6fa9d7fa7666b7ddcbda6aee036650a190cc7e854fbe8ceb0cfc5ce1d9d88200"
            );
        });
    });

    describe("masterSkToWalletSk()", () => {
        it("Works", () => {
            /*
            >>> for index in range(7):
            ...  print(index, master_sk_to_wallet_sk(pk, index))
            ... 
            0 <PrivateKey 16c278070f3790a951104d72545469fa528dc8a2e31b94b51094b74fbeb06259>
            1 <PrivateKey 32c70a133365e1381c05b6f6c5a5f015c0725d1d7418b806195aa93d7ce1c3b5>
            2 <PrivateKey 1e7274f7fd22b0994e29eb16d9d1fdfa3f4a5a52574bec67595d9a191fbf496e>
            3 <PrivateKey 0965d61d4e3bab1755faefa85ee1fb1e3e33c92b62bb4d69b1c9d622ed681889>
            4 <PrivateKey 69b90f1862c7a2533279b83c8478cd3957e24f576e0326e19d0d5c482d380202>
            5 <PrivateKey 6fda41bebcd5f09f490719c77eef0b6c5f7f2e51d398f4fb5b8a6d2144273753>
            6 <PrivateKey 03f4b1a9362070ad549030319115cb2e36fe7ab1fc736b74031be2eb4876d95a>
            >>> 
            */

            const expected = [
                "16c278070f3790a951104d72545469fa528dc8a2e31b94b51094b74fbeb06259",
                "32c70a133365e1381c05b6f6c5a5f015c0725d1d7418b806195aa93d7ce1c3b5",
                "1e7274f7fd22b0994e29eb16d9d1fdfa3f4a5a52574bec67595d9a191fbf496e",
                "0965d61d4e3bab1755faefa85ee1fb1e3e33c92b62bb4d69b1c9d622ed681889",
                "69b90f1862c7a2533279b83c8478cd3957e24f576e0326e19d0d5c482d380202",
                "6fda41bebcd5f09f490719c77eef0b6c5f7f2e51d398f4fb5b8a6d2144273753",
                "03f4b1a9362070ad549030319115cb2e36fe7ab1fc736b74031be2eb4876d95a"
            ];

            for(let index = 0; index < 7; ++index) {
                _testKeyDerivationFunction(
                    (sk) => DeriveKeysUtils.masterSkToWalletSk(sk, index),
                    expected[index],
                );
            }
        });
    });

    describe("masterSkToWalletSkUnhardened()", () => {
        it("Works", () => {
            /*
            >>> for index in range(7):
            ...  print(master_sk_to_wallet_sk_unhardened(pk, index))
            ... 
            <PrivateKey 50126807ac3adf527f9808342a2fca2694b47e3c258b02e37ab67a58372083e4>
            <PrivateKey 0fc441651f863899ef812378729ed40d30b2db59f342dcddf34341eabffb50b7>
            <PrivateKey 123658e18405c16e1efae8831c4a37cff59983a5ed064de6526c6a379e91c93d>
            <PrivateKey 63c2a2daf991d73f592df7fba2d175238762613bd58eae608bf0391ddeb869f6>
            <PrivateKey 2992dc804049f0c8b560e909b4dc509fdd555ee0aca1015b45fef589a8fc0a5f>
            <PrivateKey 6f1c305137e09911b5e3ce69481b46ec1968ee4696198c9c047684b5de906f7e>
            <PrivateKey 4fe8d3459fff4c9debb2233b4354cc5c202a4a49991525e603d06e9ab487dacb>
            */

            const expected = [
                "50126807ac3adf527f9808342a2fca2694b47e3c258b02e37ab67a58372083e4",
                "0fc441651f863899ef812378729ed40d30b2db59f342dcddf34341eabffb50b7",
                "123658e18405c16e1efae8831c4a37cff59983a5ed064de6526c6a379e91c93d",
                "63c2a2daf991d73f592df7fba2d175238762613bd58eae608bf0391ddeb869f6",
                "2992dc804049f0c8b560e909b4dc509fdd555ee0aca1015b45fef589a8fc0a5f",
                "6f1c305137e09911b5e3ce69481b46ec1968ee4696198c9c047684b5de906f7e",
                "4fe8d3459fff4c9debb2233b4354cc5c202a4a49991525e603d06e9ab487dacb"
            ];

            for(let index = 0; index < 7; ++index) {
                _testKeyDerivationFunction(
                    (sk) => DeriveKeysUtils.masterSkToWalletSkUnhardened(sk, index),
                    expected[index],
                );
            }
        });
    });

    describe("masterSkToLocalSk()", () => {
        it("Works", () => {
            /*
            >>> print(master_sk_to_local_sk(pk))
            <PrivateKey 3803bf7879e8b0fa38912b466bee7d487c9fe39d7c6a601ca5dcd37301d0c605>
            */

            _testKeyDerivationFunction(
                (sk) => DeriveKeysUtils.masterSkToLocalSk(sk),
                "3803bf7879e8b0fa38912b466bee7d487c9fe39d7c6a601ca5dcd37301d0c605"
            );
        });
    });

    describe("masterSkToBackupSk()", () => {
        it("Works", () => {
            /*
            >>> print(master_sk_to_backup_sk(pk))
            <PrivateKey 15175b28a99c07b0c40a69892207631bdeecc1a58a4c925b9dfb3cbbaa3495c2>
            */

            _testKeyDerivationFunction(
                (sk) => DeriveKeysUtils.masterSkToBackupSk(sk),
                "15175b28a99c07b0c40a69892207631bdeecc1a58a4c925b9dfb3cbbaa3495c2"
            );
        });
    });

    describe("masterSkToSingletonOwnerSk()", () => {
        it("Works", () => {
            /*
            >>> for index in range(7):
            ...  print(master_sk_to_singleton_owner_sk(pk, index))
            ... 
            <PrivateKey 5fce229d381bf927a454e5332167bb0c55fd33459e1615d3ed59e062e4298546>
            <PrivateKey 5f1fc64d64f309b39072ff431bf7be2558ac7a7b3b4fc6da2e490ad85bec80a2>
            <PrivateKey 176932caf871526e8b28b4c7016ab82c98499f06ba4f4cc9e9ef3506d989d093>
            <PrivateKey 03d21d05dff04cf79596cb357546cba0aa78d5393b92985c3c456c895bf5a416>
            <PrivateKey 586d057fef36cdb59634e4592af5a93cb452de43ebe0a91197e04867efc08ad4>
            <PrivateKey 5d905a8825a5ba407682310b2283afe1a89066a3380587172b67ee4b95342e28>
            <PrivateKey 249eab0f72d64349a4f5cc3badded00e542de483206d5406133c844fad1093c5>
            >>>
            */

            const expected = [
                "5fce229d381bf927a454e5332167bb0c55fd33459e1615d3ed59e062e4298546",
                "5f1fc64d64f309b39072ff431bf7be2558ac7a7b3b4fc6da2e490ad85bec80a2",
                "176932caf871526e8b28b4c7016ab82c98499f06ba4f4cc9e9ef3506d989d093",
                "03d21d05dff04cf79596cb357546cba0aa78d5393b92985c3c456c895bf5a416",
                "586d057fef36cdb59634e4592af5a93cb452de43ebe0a91197e04867efc08ad4",
                "5d905a8825a5ba407682310b2283afe1a89066a3380587172b67ee4b95342e28",
                "249eab0f72d64349a4f5cc3badded00e542de483206d5406133c844fad1093c5"
            ];

            for(let index = 0; index < 7; ++index) {
                _testKeyDerivationFunction(
                    (sk) => DeriveKeysUtils.masterSkToSingletonOwnerSk(sk, index),
                    expected[index],
                );
            }
        });
    });

    const expectToThrow = async (func: any, errorMsg: string) => {
        let errorOk: boolean = false;
        try {
            await func();
        } catch(e: any) {
            errorOk = e.message === errorMsg;
        }

        expect(errorOk).to.be.true;
    };

    describe("masterSkToPoolingAuthenticationSk()", () => {
        it("Works", () => {
            /*
            >>> for pool_wallet_index in range(7):
            ...  for index in [1, 7, 42]:
            ...   print(pool_wallet_index, index, master_sk_to_pooling_authentication_sk(pk, pool_wallet_index, index))
            ... 
            0 1 <PrivateKey 385b1ab45488f7ee9d14d4897654e87f16f4397373b40d8b06dfcdcadb9ffb2e>
            0 7 <PrivateKey 52504aed8dfaae4f0ae88dea67d96049b859e8ad271fd1fc8023e60cdbdadb84>
            0 42 <PrivateKey 12d79ad4f4477ac4ea8e6cc7655bb0d6acbc5ac43e03cbd44efdbde189b9bbca>
            1 1 <PrivateKey 027154f8e5738bf9cdc7735ae4cc287ec74e14ca92b81d4b6207dc756cdadbb2>
            1 7 <PrivateKey 38c0e940d75b33450916783533d456918358211a98b5f3f5092ede3cd693515c>
            1 42 <PrivateKey 0b8de053a2692c780d4e374b9d36fca0e3e692281527c2db6d466144d0ca1890>
            2 1 <PrivateKey 5f1f63ae351809144eb48c591723c99b2674fbdda2674d03cfcad3245eaa703c>
            2 7 <PrivateKey 496b3fcba161f572b16b52741491769a7b7c714c1bcf2a8498562bdf8384b384>
            2 42 <PrivateKey 143132506520c78dcff578f3c4cad81e80a40732a6161d22d5a3888c28e847a8>
            3 1 <PrivateKey 210010a19c66be011b482d330282ed6eecb42f1c8a81b77c78f47801791a32e6>
            3 7 <PrivateKey 67cd090910545cbf1e8f1f62b25b1576d916bb683b79530574d3296fa72248fd>
            3 42 <PrivateKey 4ac415323b4cff5d7b35062507825b45a02dbfc7b6822da97905dd515bdf96e8>
            4 1 <PrivateKey 72003670012a1e21290d823774653d8733d40793d9f7c18985106e0acb0ee2a4>
            4 7 <PrivateKey 320a7e81633505195b7976f5b0837299803291f654c2669ddbc3d2c94daea1bd>
            4 42 <PrivateKey 3bb4edeaba7a8c99617de47ba62be57302d16b47d33c4dc0ce3e335068bd6f85>
            5 1 <PrivateKey 10aadc5f9145a6709b3f9930feddb514ef8fcd3b2ccc9459ef1d43b38b4f13c3>
            5 7 <PrivateKey 0dcee8f69ffd10fa22a7a7882d53c885d25e22d70ecb195ee6d97fc0ecde455d>
            5 42 <PrivateKey 09954118ea772f46a46152e4b6de60f6500891964d531083245537217ebf2991>
            6 1 <PrivateKey 00478c1e08541bcb64dc6466031550c20c5a27987676fc91a5aeb9f918b0fd02>
            6 7 <PrivateKey 181b7e3567a2431a08f90cfaa7e4a7244c1f49ba1e1b5b4693ca7c6574445df6>
            6 42 <PrivateKey 51b6bb0fbac707d2491f7f794f2f6753415d93eef256618cb29ebdf83a44181c>
            >>>
            */

            const expected = [
                "385b1ab45488f7ee9d14d4897654e87f16f4397373b40d8b06dfcdcadb9ffb2e",
                "52504aed8dfaae4f0ae88dea67d96049b859e8ad271fd1fc8023e60cdbdadb84",
                "12d79ad4f4477ac4ea8e6cc7655bb0d6acbc5ac43e03cbd44efdbde189b9bbca",
                "027154f8e5738bf9cdc7735ae4cc287ec74e14ca92b81d4b6207dc756cdadbb2",
                "38c0e940d75b33450916783533d456918358211a98b5f3f5092ede3cd693515c",
                "0b8de053a2692c780d4e374b9d36fca0e3e692281527c2db6d466144d0ca1890",
                "5f1f63ae351809144eb48c591723c99b2674fbdda2674d03cfcad3245eaa703c",
                "496b3fcba161f572b16b52741491769a7b7c714c1bcf2a8498562bdf8384b384",
                "143132506520c78dcff578f3c4cad81e80a40732a6161d22d5a3888c28e847a8",
                "210010a19c66be011b482d330282ed6eecb42f1c8a81b77c78f47801791a32e6",
                "67cd090910545cbf1e8f1f62b25b1576d916bb683b79530574d3296fa72248fd",
                "4ac415323b4cff5d7b35062507825b45a02dbfc7b6822da97905dd515bdf96e8",
                "72003670012a1e21290d823774653d8733d40793d9f7c18985106e0acb0ee2a4",
                "320a7e81633505195b7976f5b0837299803291f654c2669ddbc3d2c94daea1bd",
                "3bb4edeaba7a8c99617de47ba62be57302d16b47d33c4dc0ce3e335068bd6f85",
                "10aadc5f9145a6709b3f9930feddb514ef8fcd3b2ccc9459ef1d43b38b4f13c3",
                "0dcee8f69ffd10fa22a7a7882d53c885d25e22d70ecb195ee6d97fc0ecde455d",
                "09954118ea772f46a46152e4b6de60f6500891964d531083245537217ebf2991",
                "00478c1e08541bcb64dc6466031550c20c5a27987676fc91a5aeb9f918b0fd02",
                "181b7e3567a2431a08f90cfaa7e4a7244c1f49ba1e1b5b4693ca7c6574445df6",
                "51b6bb0fbac707d2491f7f794f2f6753415d93eef256618cb29ebdf83a44181c"
            ];

            for(let poolWalletIndex = 0; poolWalletIndex < 7; ++poolWalletIndex) {
                for(const index of [1, 7, 42]) {
                    const offset = [1, 7, 42].findIndex(e => e === index) ?? 0;
                    _testKeyDerivationFunction(
                        (sk) => DeriveKeysUtils.masterSkToPoolingAuthenticationSk(sk, poolWalletIndex, index),
                        expected[poolWalletIndex * 3 + offset],
                    );
                }
            }
        });

        it("Throws 'assert index < 10000' if index is 10000", () => expectToThrow(
            () => DeriveKeysUtils.masterSkToPoolingAuthenticationSk(MASTER_SK, 7, 10000),
            "assert index < 10000"
        ));

        it("Throws 'assert index < 10000' if index is greater than 10000", () => expectToThrow(
            () => DeriveKeysUtils.masterSkToPoolingAuthenticationSk(MASTER_SK, 7, 10001),
            "assert index < 10000"
        ));

        it("Throws 'assert pool_wallet_index < 10000' if poolWalletIndex is 10000", () => expectToThrow(
            () => DeriveKeysUtils.masterSkToPoolingAuthenticationSk(MASTER_SK, 10000, 7),
            "assert pool_wallet_index < 10000"
        ));

        it("Throws 'assert pool_wallet_index < 10000' if poolWalletIndex is greater than 10000", () => expectToThrow(
            () => DeriveKeysUtils.masterSkToPoolingAuthenticationSk(MASTER_SK, 10001, 7),
            "assert pool_wallet_index < 10000"
        ));
    });

    describe("masterPkToWalletPkUnhardened()", () => {
        /*
        >>> from blspy import PrivateKey, AugSchemeMPL
        >>> pk = PrivateKey.from_bytes(bytes.fromhex("4242424242424242424242424242424242424242424242424242424242424242"))
        >>> pubkey = pk.get_g1()
        >>> derivation_path = [12381, 8444, 2, 7]
        >>> key = pubkey
        >>> for i in derivation_path:
        ...  key = AugSchemeMPL.derive_child_pk_unhardened(key, i)
        ... 
        >>> key
        <G1Element ad19a8fa73a3266e827a5a3211570648a2e12c1a0ffb36ee4b48d02082ba47be6f1f5389cfd9b8184e21bf1f4c2b7c58>
        >>>
        */
        it("Works", () => {
            const pubKey: G1Element = MASTER_SK.get_g1();

            expect(
                Util.key.publicKeyToHex(
                    DeriveKeysUtils.masterPkToWalletPkUnhardened(pubKey, 7)
                )
            ).to.equal("ad19a8fa73a3266e827a5a3211570648a2e12c1a0ffb36ee4b48d02082ba47be6f1f5389cfd9b8184e21bf1f4c2b7c58");
        });
    });

    describe("Real case", () => {
        /*
        root@cae4577fa6cf:/chia-blockchain# chia keys show --show-mnemonic-seed
        [...]
        Master private key (m): 3a7a6077fa27676f5d1d965f357f653f344abe58ee6dc45668191ad27c565b93
        First wallet secret key (m/12381/8444/2/0): <PrivateKey 5625f4c8086cdb022e5e2e399f06ebe1da45c095928ea3a91d0fc4bbfd635e16>
        [...]
        */

        it("master_sk_to_wallet_sk()", () => {
            const pk = Util.key.hexToPrivateKey("3a7a6077fa27676f5d1d965f357f653f344abe58ee6dc45668191ad27c565b93");
            const walletSk = DeriveKeysUtils.masterSkToWalletSk(pk, 0);

            expect(
                Util.key.privateKeyToHex(walletSk)
            ).to.equal("5625f4c8086cdb022e5e2e399f06ebe1da45c095928ea3a91d0fc4bbfd635e16");
        });
    });
});