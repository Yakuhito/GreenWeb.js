import { AddressUtil } from "./address";
import { CoinUtil } from "./coin";
import { SerializerUtil } from "./serializer";

export class Util {
    public static address: AddressUtil = new AddressUtil();
    public static coin: CoinUtil = new CoinUtil();
    public static serializer: SerializerUtil = new SerializerUtil();
}