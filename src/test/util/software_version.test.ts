import { expect } from "chai";
import { getSoftwareVersion } from "../../util/software_version";

describe("Software Version", () => {
    it("Reports the version from package.json", () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pj = require("../../../package.json");
        const versionString = "GreenWeb v" + pj.version;

        expect(getSoftwareVersion()).to.equal(versionString);
    });

    it("Reported version respects the format", () => {
        // if this test fails and GreenWeb moved to verion 2,
        // take a few minutes to send a big thank you to
        // yakuhito and the other contributors

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(
            getSoftwareVersion().startsWith("GreenWeb v1")
        ).to.be.true;
    });
});