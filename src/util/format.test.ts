import { expect } from "chai";
import { Util as util } from ".";

describe("Util", function() {
    describe("parseToken", () => {
        it("Works", () => {
            expect(util.parseToken("1.3")).to.equal(1300);
            expect(util.parseToken("123456.789")).to.equal(123456789);
            expect(util.parseToken("12345.")).to.equal(12345000);
        });

        it("Works for values with no dot", () => {
            expect(util.parseToken("1")).to.equal(1000);
            expect(util.parseToken("12345")).to.equal(12345000);
        });

        it("Does not work if there are too many dots", () => {
            expect(util.parseToken("1..3")).to.equal(0);
            expect(util.parseToken("12.345.")).to.equal(0);
        });

        it("Does not work with invalid values", () => {
            expect(util.parseToken("13a")).to.equal(0);
            expect(util.parseToken("12345.f")).to.equal(0);
            expect(util.parseToken("0x8")).to.equal(0);
        });

        it("Works for custom 'amountPerUnit'", () => {
            expect(util.parseToken("1", 10)).to.equal(10);
            expect(util.parseToken("1.5", 10)).to.equal(15);
        });
    });

    describe("parseChia", () => {
        it("Works as expected", () => {
            expect(util.parseChia("1")).to.equal(util.mojoPerXCH);
            expect(util.parseChia("1234.000000000001")).to.equal(1234000000000001);
        });
    });

    describe("formatToken", () => {
        it("Works as expected", () => {
            expect(util.formatToken(1000)).to.equal("1.0");
            expect(util.formatToken(123001)).to.equal("123.001");
            expect(util.formatToken(123)).to.equal("0.123");
            expect(util.formatToken(1)).to.equal("0.001");
            expect(util.formatToken(10)).to.equal("0.01");
        });

        it("Works for custom 'amountPerUnit'", () => {
            expect(util.formatToken(1000, 10)).to.equal("100.0");
            expect(util.formatToken(123001, 100)).to.equal("1230.01");
            expect(util.formatToken(123, 10000)).to.equal("0.0123");
            expect(util.formatToken(1, 100000)).to.equal("0.00001");
            expect(util.formatToken(10, 100)).to.equal("0.1");
        });

        it("Works correctly with NaN", () => {
            expect(util.formatToken(NaN)).to.equal("0.0");
            expect(util.formatToken(NaN, 10)).to.equal("0.0");
        });
    });

    describe("formatChia", () => {
        it("Works as expected", () => {
            expect(util.formatChia(1)).to.equal("0.000000000001");
            expect(util.formatChia(10)).to.equal("0.00000000001");
            expect(util.formatChia(1234123456789012)).to.equal("1234.123456789012");
        });

        it("Works correctly with NaN", () => {
            expect(util.formatChia(NaN)).to.equal("0.0");
        });
    });
});