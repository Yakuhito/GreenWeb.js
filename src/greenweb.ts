import { ChiaNodeProvider } from "./providers/chia_node";
import { Provider } from "./providers/provider";
import { Util } from "./util/util";
import * as CLVMLib from "clvm";

export type GreenWebOptions = {
    provider: null | Provider;
    host?: string;
    port?: number;
};

export class GreenWeb {
    private readonly provider: Provider;
    public util: Util = Util;
    public clvm = CLVMLib;

    constructor({
        provider = null,
        host,
        port
    } : GreenWebOptions) {
        if(provider != null) {
            this.provider =  provider;
        } else if(host !== undefined) {
            if(port !== undefined)
                this.provider = new ChiaNodeProvider(host, port);
            else
                this.provider = new ChiaNodeProvider(host);
        }
    }
}