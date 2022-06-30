/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { Util as util } from "../../util";
import { AddressUtil } from "../../util/address";
import { CoinUtil } from "../../util/coin";
import { GobyUtil } from "../../util/goby";
import { KeyUtil } from "../../util/key";
import { NetworkUtil } from "../../util/network";
import { SerializerUtil } from "../../util/serializer";
import { SExpUtil } from "../../util/sexp";
import { SpendUtil } from "../../util/spend";

describe("Util", function() {
    describe("parseToken", () => {
        it("Works", () => {
            expect(util.parseToken("1.3").toString()).to.equal("1300");
            expect(util.parseToken("123456.789").toString()).to.equal("123456789");
            expect(util.parseToken("12345.").toString()).to.equal("12345000");
        });

        it("Works for values with no dot", () => {
            expect(util.parseToken("1").toString()).to.equal("1000");
            expect(util.parseToken("12345").toString()).to.equal("12345000");
        });

        it("Does not work if there are too many dots", () => {
            expect(() => util.parseToken("1..3")).to.throw("The given string is not valid.");
            expect(() => util.parseToken("12.345.")).to.throw("The given string is not valid.");
        });

        it("Does not work with invalid values", () => {
            expect(() => util.parseToken("13a")).to.throw("The given string is not valid.");
            expect(() => util.parseToken("12345.f")).to.throw("The given string is not valid.");
            expect(() => util.parseToken("0x8")).to.throw("The given string is not valid.");
            expect(() => util.parseToken("8.1234", 100)).to.throw("The given string is not valid.");
        });

        it("Works for custom 'amountPerUnit'", () => {
            expect(util.parseToken("1", 10).toString()).to.equal("10");
            expect(util.parseToken("1.5", 10).toString()).to.equal("15");
        });

        it("Works for very big numbers", () => {
            expect(
                util.parseToken("1000000000000000000000000000000000000000000", 1).toString()
            ).to.equal("1000000000000000000000000000000000000000000");
            expect(
                util.parseToken("1", "1000000000000000000000000000000000000000000").toString()
            ).to.equal("1000000000000000000000000000000000000000000");
            expect(
                util.parseToken("1000000000000000000000000000000000000000000.5", 10).toString()
            ).to.equal("10000000000000000000000000000000000000000005");
            expect(
                util.parseToken("1000000000000000000.123456789123456789", "1000000000000000000").toString()
            ).to.equal("1000000000000000000123456789123456789");
        });
    });

    describe("parseChia", () => {
        it("Works as expected", () => {
            expect(util.parseChia("1").toString()).to.equal(util.mojoPerXCH.toString());
            expect(util.parseChia("1234.000000000001").toString()).to.equal("1234000000000001");
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
            expect(util.formatToken(10, NaN)).to.equal("10.0");
        });

        it("Works correctly with amountPerUnit = 0", () => {
            expect(util.formatToken(10, 0)).to.equal("10.0");
        });

        it("Works for very big numbers", () => {
            expect(
                util.formatToken("1000000000000000000000000000000000000000000", 1).toString()
            ).to.equal("1000000000000000000000000000000000000000000.0");
            expect(
                util.formatToken("1000000000000000000000000000000000000000000", "1000000000000000000000000000000000000000000").toString()
            ).to.equal("1.0");
            expect(
                util.formatToken("10000000000000000000000000000000000000000005", 10).toString()
            ).to.equal("1000000000000000000000000000000000000000000.5");
            expect(
                util.formatToken("1000000000000000000123456789123456789", "1000000000000000000").toString()
            ).to.equal("1000000000000000000.123456789123456789");
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

    describe("*Util", () => {
        it("Exposes AddressUtil instance as .address", () => {
            expect(util.address instanceof AddressUtil).to.be.true;
        });

        it("Exposes CoinUtil instance as .coin", () => {
            expect(util.coin instanceof CoinUtil).to.be.true;
        });

        it("Exposes SerializerUtil instance as .serializer", () => {
            expect(util.serializer instanceof SerializerUtil).to.be.true;
        });

        it("Exposes NetworkUtil instance as .network", () => {
            expect(util.network instanceof NetworkUtil).to.be.true;
        });

        it("Exposes SExpUtil instance as .sexp", () => {
            expect(util.sexp instanceof SExpUtil).to.be.true;
        });

        it("Exposes GobyUtil instance as .goby", () => {
            expect(util.goby instanceof GobyUtil).to.be.true;
        });

        it("Exposes KeyUtil instance as .key", () => {
            expect(util.key instanceof KeyUtil).to.be.true;
        });

        it("Exposes SpendUtil instance as .spend", () => {
            expect(util.spend instanceof SpendUtil).to.be.true;
        });
    });

    describe("Other exposed variables", () => {
        it("mojoPerXCH", () => {
            expect(
                util.mojoPerXCH.eq(1000000000000)
            ).to.be.true;
        });
    });
});
