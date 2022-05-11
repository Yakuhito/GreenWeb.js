/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { initialize } from "clvm";
import { Util } from "../../../util";
import { MnemonicUtils } from "../../../util/key/mnemonic";
/* eslint-disable max-len */

/*
>>> from chia.util.keychain import *
>>> for i in [16, 20, 24, 28, 32]:
...  print(bytes_to_mnemonic(bytes.fromhex("42" * i)))
... 
drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain lunch
drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel apart
drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark drastic birth
drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal change
drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark
>>>
*/

const SKS = [16, 20, 24, 28, 32].map(e => "42".repeat(e));
const MNEMONICS = [
    "drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain lunch",
    "drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel apart",
    "drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark drastic birth",
    "drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal change",
    "drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain loyal category cancel animal embark",
];

describe("MnemonicUtils", () => {
    beforeEach(initialize);

    const _expectToThrow = async (func: any, err: string) => {
        let errOk: boolean = false;
        try {
            await func();
        } catch(e: any) {
            errOk = e.message === err;
        }

        expect(errOk).to.be.true;
    };

    describe("bytesToMnemonic()", () => {
        it("Works", () => {
            for(let i = 0; i < SKS.length; ++i) {
                expect(
                    MnemonicUtils.bytesToMnemonic(SKS[i])
                ).to.equal(MNEMONICS[i]);
            }
        });

        it("Throws an errror if input data has an invalid length", () => {
            _expectToThrow(
                () => MnemonicUtils.bytesToMnemonic("42".repeat(42)),
                "Data length should be one of the following: [16, 20, 24, 28, 32], but it is 42."
            );
        });
    });

    describe("bytesFromMnemonic()", () => {
        it("Works", () => {
            for(let i = 0; i < SKS.length; ++i) {
                expect(
                    MnemonicUtils.bytesFromMnemonic(MNEMONICS[i])
                ).to.equal(SKS[i]);
            }
        });

        it("Throws an errror if mnemonic has an invalid number of words", () => {
            _expectToThrow(
                () => MnemonicUtils.bytesFromMnemonic(" mountain".repeat(7).slice(1)),
                "Invalid mnemonic length",
            );
        });

        it("Throws an errror if mnemonic contains an invalid word", () => {
            _expectToThrow(
                () => MnemonicUtils.bytesFromMnemonic(" mountain".repeat(11).slice(1) + " yakuhito"),
                "'yakuhito' is not in the mnemonic dictionary; may be misspelled",
            );
        });

        it("Throws an errror if the decoded checksum is invalid", () => {
            const toAdd = "drastic";
            let mm = MNEMONICS[0].split(" ");
            mm = mm.splice(0, mm.length - 1);
            mm.push(toAdd);

            expect(MNEMONICS[0].endsWith(toAdd)).to.be.false;
            _expectToThrow(
                () => MnemonicUtils.bytesFromMnemonic(mm.join(" ")),
                "Invalid order of mnemonic words",
            );
        });
    });

    describe("mnemonicToSeed()", () => {
        /*
        >>> mnemonic_to_seed("drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain lunch", "").hex()
        '11bcc5993e9f3be47884542b17e7e6bd698edbb36a02c5a3bf521a0eb5d5afb2c71d0b7d3d0e5eb738128ae355e4da9c05ed8683735b99e768cc828b54dd32af'
        */
        it("Works", () => {
            expect(
                MnemonicUtils.mnemonicToSeed("drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain lunch", "")
            ).to.equal("11bcc5993e9f3be47884542b17e7e6bd698edbb36a02c5a3bf521a0eb5d5afb2c71d0b7d3d0e5eb738128ae355e4da9c05ed8683735b99e768cc828b54dd32af");
        });
    });

    describe("privateKeyFromMnemonic()", () => {
        /*
        Mnemonic created using the official wallet
        */
        it("Works", () => {
            const TEST_MNEMNONIC = "teach umbrella enrich trend dish syrup stand act river need appear correct pave find elephant razor coast twice year portion wolf million sleep expose";
            const EXPECTED_PK = "3a7a6077fa27676f5d1d965f357f653f344abe58ee6dc45668191ad27c565b93";
            expect(
                Util.key.privateKeyToHex(MnemonicUtils.privateKeyFromMnemonic(TEST_MNEMNONIC))
            ).to.equal(EXPECTED_PK)
        });

        /*
        >>> AugSchemeMPL.key_gen(mnemonic_to_seed("drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain lunch", "yakuhito"))
        <PrivateKey 6c426d1a4da7ea5b5cf9dc72621d84ddf5e3904c2955480519ea1f95cdfc8a58>
        */
        it("Works (given a custom passphrase)", () => {
            const TEST_MNEMNONIC = "drastic bamboo mountain loyal category cancel animal embark drastic bamboo mountain lunch";
            const TEST_PASSPHRASE = "yakuhito";
            const EXPECTED_PK = "6c426d1a4da7ea5b5cf9dc72621d84ddf5e3904c2955480519ea1f95cdfc8a58";

            expect(
                Util.key.privateKeyToHex(MnemonicUtils.privateKeyFromMnemonic(TEST_MNEMNONIC, TEST_PASSPHRASE))
            ).to.equal(EXPECTED_PK)
        });
    });
});