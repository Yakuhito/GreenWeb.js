/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { getBLSModule, initialize } from "clvm";
import { Util } from "../../../../util";
import { Network } from "../../../../util/network";
import { Serializer } from "../../../../util/serializer/serializer";
import { CoinSpend } from "../../../../util/serializer/types/coin_spend";
import { PrivateKeyProvider } from "../../../../xch/providers/private_key";
import { SmartCoin } from "../../../../xch/smart_coin";
import { _SExpFromSerialized } from "./sign_utils.test";

const NOT_IMPL_ERROR: string = "PrivateKeyProvider does not implement this method.";

describe.only("PrivateKeyProvider", () => {
    describe("constructor", () => {
        it("Works", () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            
            expect(provider.isConnected()).to.be.false;
        });

        it("Throws error if given invalid private key", () => {
            expect(
                () => new PrivateKeyProvider("00".repeat(31))
            ).to.throw("Invalid private key.");
        });

        it("Throws error if given invalid private key (#2)", () => {
            expect(
                () => new PrivateKeyProvider("00".repeat(31) + "0q")
            ).to.throw("Invalid private key.");
        });
    });

    describe("connect()", () => {
        it("Sets 'connected' to true", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            
            expect(provider.isConnected()).to.be.false;
            await provider.connect();
            expect(provider.isConnected()).to.be.true;
        });
    });

    describe("close()", () => {
        it("Sets 'connected' to false", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            
            expect(provider.isConnected()).to.be.false;
            await provider.connect();
            expect(provider.isConnected()).to.be.true;
            await provider.close();
            expect(provider.isConnected()).to.be.false;
        });
    });

    describe("getNetworkId()", () => {
        it("Correctly reports network id when none is provided", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));

            expect(provider.getNetworkId()).to.equal("mainnet");
        });

        it("Correctly reports network id when one is provided", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32), Network.testnet10);

            expect(provider.getNetworkId()).to.equal("testnet10");
        });
    });

    describe("isConnected()", () => {
        it("Works before connect() is called", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));

            expect(provider.isConnected()).to.be.false;
        });
    });

    const _expectNotImplementedError = async (func: any) => {
        let errorOk = false;
        try {
            await func();
        } catch(e: any) {
            errorOk = e.message === NOT_IMPL_ERROR;
        }

        expect(errorOk).to.be.true;
    };

    describe("getBlockNumber()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));

            _expectNotImplementedError(
                () => provider.getBlockNumber()
            );
        });
    });

    describe("getBalance()", () => {
        it("Throws 'not implemented' error.", () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getBalance({
                    address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    minHeight: 7
                })
            );
        });
    });

    describe("subscribeToPuzzleHashUpdates()", () => {
        it("Throws 'not implemented' error.", async () => {
            let callbackCalled: boolean = false;

            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.subscribeToPuzzleHashUpdates({
                    puzzleHash: "testtest",
                    callback: () => callbackCalled = true,
                })
            );
            expect(callbackCalled).to.be.false;
        });
    });

    describe("subscribeToCoinUpdates()", () => {
        it("Throws 'not implemented' error.", async () => {
            let callbackCalled: boolean = false;

            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.subscribeToCoinUpdates({
                    coinId: "testtest",
                    callback: () => callbackCalled = true,
                })
            );
            expect(callbackCalled).to.be.false;
        });
    });

    describe("getPuzzleSolution()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getPuzzleSolution({
                    coinId: "testtest",
                    height: 5,
                })
            );
        });
    });

    describe("getCoinChildren()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getCoinChildren({
                    coinId: "testtest"
                })
            );
        });
    });

    describe("getBlockHeader()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getBlockHeader({
                    height: 42
                })
            );
        });
    });

    describe("getBlocksHeaders()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getBlocksHeaders({
                    startHeight: 7,
                    endHeight: 42
                })
            );
        });
    });

    describe("getCoinRemovals()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getCoinRemovals({
                    height: 5,
                    headerHash: "testtest"
                })
            );
        });
    });

    describe("getCoinAdditions()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.getCoinAdditions({
                    height: 5,
                    headerHash: "testtest"
                })
            );
        });
    });

    describe("getAddress()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                provider.getAddress
            );
        });
    });

    describe("transfer()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.transfer({
                    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    value: 5
                })
            );
        });
    });

    describe("transferCAT()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.transferCAT({
                    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                    assetId: "Kitty",
                    value: 5
                })
            );
        });
    });

    describe("acceptOffer()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.acceptOffer({
                    offer: "offer",
                })
            );
        });
    });

    describe("acceptOffer()", () => {
        it("Throws 'not implemented' error.", async () => {
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.acceptOffer({
                    offer: "offer",
                })
            );
        });
    });

    describe("subscribeToAddressChanges()", () => {
        it("Throws 'not implemented' error.", async () => {
            let callbackCalled: boolean = false;
            const provider = new PrivateKeyProvider("00".repeat(32));
            _expectNotImplementedError(
                () => provider.subscribeToAddressChanges({
                    callback: (addr) => callbackCalled = true
                })
            );
            expect(callbackCalled).to.be.false;
        });
    });

    describe("signCoinSpends()", () => {
        it("Correctly signs AGG_SIG_ME data (mainnet)", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { PrivateKey, AugSchemeMPL } = getBLSModule();
            const sk = PrivateKey.from_bytes(
                Buffer.from(privKey, "hex"),
                false
            );
            const pubKey = Buffer.from(sk.get_g1().serialize()).toString("hex");
            
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (list (list 50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 313337)))'
            (q (50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q (50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))'
            ff01ffff32ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080
            */
            let puzz: string = "ff01ffff32ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080";
            puzz = puzz.replace("a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37", pubKey);
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });
            const messageToSign: Buffer = Buffer.concat([
                Buffer.from("yakuhito"),
                Buffer.from(c.getId() ?? "", "hex"),
                Buffer.from(Util.network.getGenesisChallenge(Network.mainnet), "hex") // mainnet additional data
            ]);
            const signedMessage = AugSchemeMPL.sign(
                sk,
                messageToSign
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(signedMessage.serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });

        it("Correctly signs AGG_SIG_ME data (testnet10)", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { PrivateKey, AugSchemeMPL } = getBLSModule();
            const sk = PrivateKey.from_bytes(
                Buffer.from(privKey, "hex"),
                false
            );
            const pubKey = Buffer.from(sk.get_g1().serialize()).toString("hex");
            
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (list (list 50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 313337)))'
            (q (50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q (50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))'
            ff01ffff32ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080
            */
            let puzz: string = "ff01ffff32ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080";
            puzz = puzz.replace("a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37", pubKey);
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });
            const messageToSign: Buffer = Buffer.concat([
                Buffer.from("yakuhito"),
                Buffer.from(c.getId() ?? "", "hex"),
                Buffer.from(Util.network.getGenesisChallenge(Network.testnet10), "hex") // testnet10 additional data
            ]);
            const signedMessage = AugSchemeMPL.sign(
                sk,
                messageToSign
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey, Network.testnet10);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(signedMessage.serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });

        it("Doesn't sign AGG_SIG_MEs that require a different public key", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { AugSchemeMPL } = getBLSModule();
            
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (list (list 50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 313337)))'
            (q (50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q (50 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))'
            ff01ffff32ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080
            */
            const puzz: string = "ff01ffff32ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080";
            // no replace <-> keys won't match
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(AugSchemeMPL.aggregate([]).serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });

        it("Correctly signs AGG_SIG_UNSAFE data", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { PrivateKey, AugSchemeMPL } = getBLSModule();
            const sk = PrivateKey.from_bytes(
                Buffer.from(privKey, "hex"),
                false
            );
            const pubKey = Buffer.from(sk.get_g1().serialize()).toString("hex");
            
            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (list (list 49 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 313337)))'
            (q (49 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q (49 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))'
            ff01ffff31ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080
            */
            let puzz: string = "ff01ffff31ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080";
            puzz = puzz.replace("a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37", pubKey);
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });
            const messageToSign: Buffer = Buffer.from("yakuhito");
            const signedMessage = AugSchemeMPL.sign(
                sk,
                messageToSign
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(signedMessage.serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });

        it("Doesn't sign AGG_SIG_UNSAFEs that require a different public key", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { AugSchemeMPL } = getBLSModule();

            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (list (list 49 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 313337)))'
            (q (49 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q (49 0xa37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37 "yakuhito") (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))'
            ff01ffff31ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080
            */
            const puzz: string = "ff01ffff31ffb0a37901780f3d6a13990bb17881d68673c64e36e5f0ae02922afe9b3743c1935765074d237507020c3177bd9476384a37ff8879616b756869746f80ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080";
            // no replace <-> keys won't match
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(AugSchemeMPL.aggregate([]).serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });

        it("Correctly handles puzzles that don't require any signing", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { AugSchemeMPL } = getBLSModule();

            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (list (list 51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 313337)))'
            (q (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(q (51 0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664 0x04c7f9))'
            ff01ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080
            */
            const puzz: string = "ff01ffff33ffa0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ff8304c7f98080";
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(AugSchemeMPL.aggregate([]).serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });

        it("Correctly handles puzzles that throw errors", async () => {
            const privKey = "01".repeat(32);
            await initialize();
            const { AugSchemeMPL } = getBLSModule();

            /*
            (venv) yakuhito@catstation:~/projects/clvm_tools$ run '(mod () (x "error"))'
            (x (q . "error"))
            (venv) yakuhito@catstation:~/projects/clvm_tools$ opc '(x (q . "error"))'
            ff08ffff01856572726f7280
            (venv) yakuhito@catstation:~/projects/clvm_tools$
            */
            const puzz: string = "ff08ffff01856572726f7280";
            const puzzle = _SExpFromSerialized(puzz);
            const solution = _SExpFromSerialized("80"); // ()  

            const c = new SmartCoin({
                parentCoinInfo: "00".repeat(32),
                puzzleHash: "00".repeat(32), // will be computed automagically
                amount: 1337,
                puzzle
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs: CoinSpend = c.spend(solution)!;
            const provider = new PrivateKeyProvider(privKey);
            await provider.connect();

            const spendBundle = await provider.signCoinSpends({
                coinSpends: [cs]
            });

            expect(spendBundle?.coinSpends.length).to.equal(1);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cs2 = spendBundle!.coinSpends[0];
            expect(
                Serializer.serialize(cs2).toString("hex")
            ).to.equal(Serializer.serialize(cs).toString("hex")); // big brain damage (thanks tabnine pro for the 3rd word)
            expect(
                Buffer.from(AugSchemeMPL.aggregate([]).serialize()).toString("hex")
            ).to.equal(spendBundle?.aggregatedSignature);
        });
    });
});