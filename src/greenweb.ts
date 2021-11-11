import { Provider } from "./providers/provider";
import { Util } from "./util/util";
import * as CLVMLib from "clvm";

export type GreenWebOptions = {
    provider: Provider
};

export class GreenWeb {
    private readonly provider: Provider;
    public util: Util = Util;
    public clvm = CLVMLib;

    constructor({
        provider
    } : GreenWebOptions) {
        this.provider = provider;
    }
}