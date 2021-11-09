import { ChiaNodeProvider } from "./providers/chia_node";
import { Provider } from "./providers/provider";
import { Util } from "./util/util";

export type GreenWebOptions = {
    provider: null | Provider;
    host?: string;
    port?: number;
};

export class GreenWeb {
    private readonly provider: Provider;
    public static util: Util = Util;

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