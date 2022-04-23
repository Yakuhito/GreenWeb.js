import { bytes } from "./serializer/basic_types";

export enum Network {
    mainnet,
    testnet0,
    testnet2,
    testnet3,
    testnet4,
    testnet5,
    // why no testnet6 :(
    testnet7,
    testnet10
}

export class NetworkUtil {
    public getGenesisChallenge(networkId: Network): bytes {
        switch(networkId) {
            case Network.mainnet:
                return "ccd5bb71183532bff220ba46c268991a3ff07eb358e8255a65c30a2dce0e5fbb";
            case Network.testnet0:
                return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
            case Network.testnet2:
                return "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
            case Network.testnet3:
                return "ca7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af";
            case Network.testnet4:
                return "dd7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af";
            case Network.testnet5:
                return "ee7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af";
            case Network.testnet7:
                return "117816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af";
            case Network.testnet10:
                return "ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2";
            default:
                throw new Error("Unknown network id.");
        }
    }
    
    public getAddressPrefix(networkId: Network): string {
        if(networkId === Network.mainnet) {
            return "xch";
        }

        return "txch";
    }
    
    public getNetworkName(networkId: Network): string {
        switch(networkId) {
            case Network.mainnet:
                return "mainnet";
            case Network.testnet0:
                return "testnet0";
            case Network.testnet2:
                return "testnet2";
            case Network.testnet3:
                return "testnet3";
            case Network.testnet4:
                return "testnet4";
            case Network.testnet5:
                return "testnet5";
            case Network.testnet7:
                return "testnet7";
            case Network.testnet10:
                return "testnet10";
            default:
                throw new Error("Unknown network id.");
        }
    }
}