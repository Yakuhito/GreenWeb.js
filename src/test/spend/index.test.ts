/* eslint-disable max-len */
import { expect } from "chai";
import { SpendModule } from "../../spend";
import { Util } from "../../util";

describe.only("SpendModule", () => {
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
});