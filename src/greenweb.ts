import { Provider } from "./providers/provider";
import { Util } from "./util/util";

export type GreenWebOptions = {
    provider: null | Provider;
    host: string | null;
    port: number | null;
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
        } else {
            // todo
        }
    }
}