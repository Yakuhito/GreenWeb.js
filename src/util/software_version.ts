export function getSoftwareVersion(): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pj = require("../../package.json");

    return "GreenWeb v" + pj.version;
}