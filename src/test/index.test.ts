/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import * as GreenWeb from "..";

describe("Module", () => {
    it("Exports 'xch'", () => {
        expect(GreenWeb.xch).to.not.be.undefined;
    });

    it("Exports 'clvm'", () => {
        expect(GreenWeb.clvm).to.not.be.undefined;
    });

    it("Exports 'util'", () => {
        expect(GreenWeb.util).to.not.be.undefined;
    });

    it("Exports 'BigNumber'", () => {
        expect(GreenWeb.BigNumber).to.not.be.undefined;
    });
});