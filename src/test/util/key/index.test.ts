/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { initialize } from "clvm";
import { KeyUtil } from "../../../util/key";

const keyUtil = new KeyUtil();
const SK_HEX = "42".repeat(32);

describe("KeyUtil", () => {
    beforeEach(initialize);

    describe("hexToPrivateKey()", () => {
        it("Works", () => {
            const res = keyUtil.hexToPrivateKey(SK_HEX);

            expect(
                Buffer.from(res.serialize()).toString("hex")
            ).to.equal(SK_HEX);
        });

        it("Returns 'null' if given an invalid private key", () => {
            expect(
                keyUtil.hexToPrivateKey("42".repeat(31))
            ).to.be.null;

            expect(
                keyUtil.hexToPrivateKey("42".repeat(31) + "4y")
            ).to.be.null;
        });
    });

    describe("privateKeyToHex()", () => {
        it("Works", () => {
            const pk = keyUtil.hexToPrivateKey(SK_HEX);

            expect(
                keyUtil.privateKeyToHex(pk)
            ).to.equal(SK_HEX);
        });
    });

    describe("masterSkToWalletSk()", () => {
        it("Works wken sk is a string", () => {
            const res = keyUtil.masterSkToWalletSk(
                SK_HEX,
                7
            );

            /*
            >>> print(master_sk_to_wallet_sk(pk, 7))
            <PrivateKey 1d2ae2f8acb3911f6faeedbfe1e9193ef58c3d945e2b1a43049ed8f8fe37bed5>
            */
            expect(
                keyUtil.privateKeyToHex(res)
            ).to.equal("1d2ae2f8acb3911f6faeedbfe1e9193ef58c3d945e2b1a43049ed8f8fe37bed5");
        });

        it("Works wken sk is a PrivateKey object", () => {
            const res = keyUtil.masterSkToWalletSk(
                keyUtil.hexToPrivateKey(SK_HEX),
                7
            );

            /*
            >>> print(master_sk_to_wallet_sk(pk, 7))
            <PrivateKey 1d2ae2f8acb3911f6faeedbfe1e9193ef58c3d945e2b1a43049ed8f8fe37bed5>
            */
            expect(
                keyUtil.privateKeyToHex(res)
            ).to.equal("1d2ae2f8acb3911f6faeedbfe1e9193ef58c3d945e2b1a43049ed8f8fe37bed5");
        });

        it("Returns 'null' when sk is neither a string nor a PrivateKey object", () => {
            expect(
                keyUtil.masterSkToWalletSk([1, 2, 3], 7)
            ).to.be.null;

            expect(
                keyUtil.masterSkToWalletSk(42, 7)
            ).to.be.null;
        });
    });

    describe("masterSkToWalletSkUnhardened()", () => {
        it("Works wken sk is a string", () => {
            const res = keyUtil.masterSkToWalletSkUnhardened(
                SK_HEX,
                7
            );

            /*
            >>> print(master_sk_to_wallet_sk_unhardened(pk, 7))
            <PrivateKey 0c1ffdf6f5169f33731450c6ce1b17c28484c1460ac0afa96f601b91c3392588>
            */
            expect(
                keyUtil.privateKeyToHex(res)
            ).to.equal("0c1ffdf6f5169f33731450c6ce1b17c28484c1460ac0afa96f601b91c3392588");
        });

        it("Works wken sk is a PrivateKey object", () => {
            const res = keyUtil.masterSkToWalletSkUnhardened(
                keyUtil.hexToPrivateKey(SK_HEX),
                7
            );

            /*
            >>> print(master_sk_to_wallet_sk_unhardened(pk, 7))
            <PrivateKey 0c1ffdf6f5169f33731450c6ce1b17c28484c1460ac0afa96f601b91c3392588>
            */
            expect(
                keyUtil.privateKeyToHex(res)
            ).to.equal("0c1ffdf6f5169f33731450c6ce1b17c28484c1460ac0afa96f601b91c3392588");
        });

        it("Returns 'null' when sk is neither a string nor a PrivateKey object", () => {
            expect(
                keyUtil.masterSkToWalletSkUnhardened([1, 2, 3], 7)
            ).to.be.null;

            expect(
                keyUtil.masterSkToWalletSkUnhardened(42, 7)
            ).to.be.null;
        });
    });
});