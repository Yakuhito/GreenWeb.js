import { Provider } from "./providers/provider";

export type GreenWebOptions = {
    provider: null | Provider;
    host: string | null;
    port: number | null;
};

export class GreenWeb {
    private readonly provider: Provider;

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