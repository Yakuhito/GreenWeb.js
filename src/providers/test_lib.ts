import { ChiaNodeProvider } from "./chia_node";
import { Provider } from "./provider";
import { assert } from "chai";
import { CoinState, PuzzleSolutionResponse } from "../types/wallet_protocol";

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

    it('getPuzzleSolution()', async () => {
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const puzzle: string = "ff02ffff01ff02ffff01ff02ffff03ffff09ffff0bff8202ff80ff0580ffff01ff04ffff04ff0effff04ff81bfffff04ffff10ffff05ffff14ffff12ffff0107ffff11ff0bff178080ffff018203e88080ffff010180ff80808080ffff04ffff04ff0effff04ff5fffff04ffff11ff0bff17ffff10ffff05ffff14ffff12ffff0107ffff11ff0bff178080ffff018203e88080ffff01018080ff80808080ffff04ffff04ff04ffff04ff17ff808080ff80808080ffff01ff04ffff04ff0effff04ff2fffff04ffff11ff0bff1780ff80808080ffff04ffff04ff04ffff04ff17ff808080ffff04ffff04ff0affff04ff82017fff808080ff8080808080ff0180ffff04ffff01ff34ff5233ff018080ffff04ffff01a0b5663aa248ca84934ddb2ad784ff1294c3f44832bc98b5c7fc164a91645482ceffff04ffff01823037ffff04ffff0102ffff04ffff01a05667858887e29d75a8fba955028e803c71e16bffbd0dc253a1777b979a4db622ffff04ffff01a01bce9345d2003617aeb77a35394c249d2be751107aea4a55d978669f71d29e6affff04ffff01a0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ffff04ffff018200c0ff018080808080808080";
        const solution: string = "ffaa5345435245542d354a6a4c477250632d734b473762785a712d706d42327868507a2d394b7153377a4b6f80";
        const coinId: string = "0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";
        const height: number = 894633; // spent height (that's when the solution is revealed
        
        const resp = await p.getPuzzleSolution({
            coinId: coinId,
            height: height
        });
    
        assert.isNotNull(resp);
        assert.instanceOf(resp, PuzzleSolutionResponse);
        assert.equal(
            coinId,
            "0x" + resp!.coin_name.toString("hex")
        );
        assert.equal(resp!.height, height);
        assert.equal(resp!.puzzle.toString(), puzzle);
        assert.equal(resp!.solution.toString(), solution);
    });

    it('close()', () => {
        assert.doesNotThrow(async () => await p.close());
    });
});