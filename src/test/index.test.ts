/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import * as GreenWeb from "..";

describe("GreenWeb.js module", () => {
    it("Exports 'xch'", () => {
        expect(GreenWeb.xch).to.not.be.undefined;
    });

    it("Exports 'clvm'", () => {
        expect(GreenWeb.clvm).to.not.be.undefined;
    });

    it("Exports 'util'", () => {
        expect(GreenWeb.util).to.not.be.undefined;
    });

    it("Exports 'spend'", () => {
        expect(GreenWeb.spend).to.not.be.undefined;
    });

    it("Exports 'BigNumber'", () => {
        expect(GreenWeb.BigNumber).to.not.be.undefined;
    });

    it("Exports 'Coin'", () => {
        expect(GreenWeb.Coin).to.not.be.undefined;
    });

    it("Exports 'CoinSpend'", () => {
        expect(GreenWeb.CoinSpend).to.not.be.undefined;
    });

    it("Exports 'SmartCoin'", () => {
        expect(GreenWeb.SmartCoin).to.not.be.undefined;
    });

    it("Exports 'StandardCoin'", () => {
        expect(GreenWeb.StandardCoin).to.not.be.undefined;
    });

    it("Exports 'CAT'", () => {
        expect(GreenWeb.CAT).to.not.be.undefined;
    });
});