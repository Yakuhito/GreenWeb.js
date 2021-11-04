import { ChiaNodeProvider } from "./chia_node";
import { Optional, Provider } from "./provider";
import { assert } from "chai";
import { CoinState, PuzzleSolutionResponse } from "../types/wallet_protocol";
import { HeaderBlock } from "../types/header_block";
import { Serializer } from "../serializer";
import { bytes } from "../serializer/basic_types";
import { Coin } from "../types/coin";

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

    it('getCoinChildren()', async () => {
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const coinId: string = "0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";
        
        const resp = await p.getCoinChildren({
            coinId: coinId
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const arr: CoinState[] = resp;
        assert.equal(arr.length, 2);
        assert.equal(arr[0].coin.getId().toString("hex"), "7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8");
        assert.equal(arr[1].coin.getId().toString("hex"), "6aba6282e60ea52367596c258b5a54b7263dd42d8040c06c94b13d8eca682e45");
    });

    it('getBlockHeader()', async () => {
        // https://www.chiaexplorer.com/blockchain/block/0x5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410
        const blockHeight: number = 1000000;
        const headerHash: string = "5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410";
        
        const resp = await p.getBlockHeader({
            height: blockHeight
        });
    
        assert.isNotNull(resp);
        assert.instanceOf(resp, HeaderBlock);
        
        const hb: HeaderBlock = resp!;
        assert.equal(hb.headerHash(), headerHash);
    });

    it('getBlocksHeaders()', async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xf5d672dae94768f8cd119331490b2725d505355522bc81bb7ae314a2d0412b1d
        // https://www.chiaexplorer.com/blockchain/block/0x5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410
        // https://www.chiaexplorer.com/blockchain/block/0x6f15a6d088ce8d940c220f80d16d6743c8a9cf5e2544ad15a57b58a06dbd9284
        const startHeight: number = 999999;
        const endHeight: number = 1000001;
        const headerHashes: string[] = [
            "f5d672dae94768f8cd119331490b2725d505355522bc81bb7ae314a2d0412b1d",
            "5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410",
            "6f15a6d088ce8d940c220f80d16d6743c8a9cf5e2544ad15a57b58a06dbd9284"
        ];
        
        const resp = await p.getBlocksHeaders({
            startHeight: startHeight,
            endHeight: endHeight
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);

        const hbs: HeaderBlock[] = resp!;
        assert.equal(hbs.length, headerHashes.length);
        for(var i = 0; i < hbs.length; ++i) {
            assert.equal(
                hbs[i].headerHash(),
                headerHashes[i]
            );
        }
    });

    it('getCoinRemovals()', async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xfca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702
        const blockHeight: number = 894633;
        const headerHash: string = "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702";
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const coinId: string = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

        const resp = await p.getCoinRemovals({
            height: blockHeight,
            headerHash: headerHash
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const arr: [bytes, Optional<Coin>][] = resp!;
        var ok: boolean = false;
        for(var i = 0; i < arr.length; i++) {
            if(arr[i][0].toString('hex') == coinId && arr[i][1]!.getId().toString('hex') === coinId) {
                ok = true;
                break;
            }
        }

        assert.isTrue(ok);
    });

    it('getCoinRemovals() - only one coin', async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xfca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702
        const blockHeight: number = 894633;
        const headerHash: string = "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702";
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const coinId: string = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

        const resp = await p.getCoinRemovals({
            height: blockHeight,
            headerHash: headerHash,
            coinIds: [coinId],
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const arr: [bytes, Optional<Coin>][] = resp!;
        assert.equal(arr.length, 1);
        assert.isTrue(arr[0][0].toString('hex') == coinId);
        assert.isTrue(arr[0][1]!.getId().toString('hex') === coinId);
    });

    it('getCoinAdditions()', async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xa1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb
        const blockHeight: number = 894597;
        const headerHash: string = "a1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb";
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const puzHash: string = "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2";

        const resp = await p.getCoinAdditions({
            height: blockHeight,
            headerHash: headerHash
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const arr: [bytes, Coin[]][] = resp!;
        var ok: boolean = false;
        for(var i = 0; i < arr.length; i++) {
            if(arr[i][1][0].puzzle_hash.toString('hex') === puzHash && arr[i][0].toString('hex') == puzHash) {
                ok = true;
                break;
            }
        }

        assert.isTrue(ok);
    });

    it('getCoinAdditions() - two puzzle hashes', async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xa1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb
        const blockHeight: number = 894597;
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const puzzHash: string = "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2";
        const nonExistentPuzzHash: string = "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e3";

        const resp = await p.getCoinAdditions({
            height: blockHeight,
            headerHash: "a1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb",
            puzzleHashes: [puzzHash, nonExistentPuzzHash]
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const arr: [bytes, Coin[]][] = resp!;
        assert.equal(arr.length, 2);
        assert.equal(arr[0][0].toString('hex'), puzzHash);
        assert.equal(arr[0][1].length, 1);
        assert.equal(arr[0][1][0].puzzle_hash.toString('hex'), puzzHash);
        assert.equal(arr[1][0].toString('hex'), nonExistentPuzzHash);
        assert.equal(arr[1][1].length, 0);
    });

    it('close()', () => {
        assert.doesNotThrow(async () => await p.close());
    });
});