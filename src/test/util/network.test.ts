/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { Network, NetworkUtil } from "../../util/network";

const networkUtil = new NetworkUtil();
const networks = [
    Network.mainnet,
    Network.testnet0,
    Network.testnet2,
    Network.testnet3,
    Network.testnet4,
    Network.testnet5,
    Network.testnet7,
    Network.testnet10
];
const genesisChallenges = [
    "ccd5bb71183532bff220ba46c268991a3ff07eb358e8255a65c30a2dce0e5fbb",
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    "ca7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af",
    "dd7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af",
    "ee7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af",
    "117816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015af",
    "ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2",
];
const networkNames = [
    "mainnet",
    "testnet0",
    "testnet2",
    "testnet3",
    "testnet4",
    "testnet5",
    "testnet7",
    "testnet10",
];

describe("NetworkUtil", () => {
    describe("networks", () => {
        it("Exposes all networks in the right order", () => {
            expect(networkUtil.networks.length).to.equal(networks.length);

            for(let i = 0; i < networks.length; ++i) {
                expect(
                    networkUtil.networks[i]
                ).to.equal(networks[i])
            }
        });
    });

    describe("getGenesisChallenge()", () => {
        it("Returns the correct value for all networks", () => {
            expect(networks.length).to.equal(genesisChallenges.length);
            expect(networkUtil.networks.length).to.equal(networks.length);

            for(let i = 0; i < networks.length; i++) {
                expect(
                    networkUtil.getGenesisChallenge(networks[i])
                ).to.equal(genesisChallenges[i]);
            }
        });

        it("Throws error if supplied network id does not exist", () => {
            let errorOk: boolean = false;
            try {
                networkUtil.getGenesisChallenge(100);
            } catch(e: any) {
                errorOk = e.message === "Unknown network id.";
            }
            
            expect(errorOk).to.be.true;
        });
    });

    describe("getAddressPrefix()", () => {
        it("Returns 'xch' for mainnet", () => {
            expect(
                networkUtil.getAddressPrefix(Network.mainnet)
            ).to.equal("xch");
        });

        it("Returns 'txch' for testnets", () => {
            for(let i = 1; i < networks.length; ++i) {
                expect(
                    networkUtil.getAddressPrefix(networks[i])
                ).to.equal("txch");
            }
        });
    });

    describe("getNetworkName()", () => {
        it("Returns the correct value for all networks", () => {
            for(let i = 0; i < networks.length; ++i) {
                expect(
                    networkUtil.getNetworkName(networks[i])
                ).to.equal(networkNames[i]);
            }
        });

        it("Throws error if supplied network id does not exist", () => {
            let errorOk: boolean = false;
            try {
                networkUtil.getNetworkName(100);
            } catch(e: any) {
                errorOk = e.message === "Unknown network id.";
            }
            
            expect(errorOk).to.be.true;
        });
    });
});