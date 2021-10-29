export function getSoftwareVersion(): string {
    const pj = require('../../package.json');

    return "GreenWeb " + pj.version;
}