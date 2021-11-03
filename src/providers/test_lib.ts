import { ChiaNodeProvider } from "./chia_node";
import { Provider } from "./provider";
import { assert } from "chai";
import { CoinState } from "../types/wallet_protocol";

const nodeHost: string = "chianode.test";

describe('ChiaNodeProvider with ' + nodeHost, () => {
    var p: Provider;
    
    it('initialize()', async () => {
        p = new ChiaNodeProvider(nodeHost);
        await p.initialize();
    });

    it('getBlockNumber()', async () => {
        const blockNumber = await p.getBlockNumber();
        assert.isTrue(blockNumber != null && blockNumber > 1000000);
    });
    
    
    it('getBlockNumber()', async () => {
        const balance = await p.getBalance({
            address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
        });
        assert.isTrue(balance != null && balance >= 1946917);
    });

    it('getNetworkId()', () => {
        const network_id: string = p.getNetworkId();
        assert.equal(network_id, "mainnet");
    });
    
    it('subscribeToCoinUpdates()', async () => {
        const coinId: string = "7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8";
        var coin_states: CoinState[] | boolean = true;
    
        p.subscribeToCoinUpdates({
            coinId: coinId,
            callback: (arg) => coin_states = arg,
        });
    
        while(coin_states === true) {
            await new Promise( resolve => setTimeout(resolve, 100));
        }
    
        assert.isArray(coin_states);
        
        const cs: CoinState[] = coin_states;
        assert.isTrue(cs.length === 1);

        const coin_state: CoinState = cs[0];
        assert.equal(
            coinId,
            coin_state.coin.getId().toString("hex")
        );
    });

    it('subscribeToPuzzleHashUpdates()', async () => {
        const puzzleHash: string = "0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664";
        var coin_states: CoinState[] | boolean = true;
    
        p.subscribeToPuzzleHashUpdates({
            puzzleHash: puzzleHash,
            callback: (arg) => coin_states = arg,
        });
    
        while(coin_states === true) {
            await new Promise( resolve => setTimeout(resolve, 100));
        }
    
        assert.isArray(coin_states);
        
        const cs: CoinState[] = coin_states;
        assert.isTrue(cs.length >= 26);

        const coin_state: CoinState = cs[0];
        assert.equal(
            puzzleHash,
            "0x" + coin_state.coin.puzzle_hash.toString("hex")
        );
    });

    it('close()', () => {
        assert.doesNotThrow(async () => await p.close());
    });
});