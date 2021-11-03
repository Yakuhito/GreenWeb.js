import { ChiaNodeProvider } from "./chia_node";
import { Provider } from "./provider";
import { assert } from "chai";

const nodeHost: string = "chianode.test";

it('Test provider - ' + nodeHost, async () => {
    const p: Provider = new ChiaNodeProvider(nodeHost);
    await p.initialize();

    const blockNumber = await p.getBlockNumber();
    assert.isTrue(blockNumber != null && blockNumber > 1000000);
    console.log("Block number: " + blockNumber!.toString());

    const balance = await p.getBalance({
        address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
    });
    assert.isTrue(balance != null && balance >= 1946917);

    const network_id: string = p.getNetworkId();
    assert.equal(network_id, "mainnet");

    await p.close();
});