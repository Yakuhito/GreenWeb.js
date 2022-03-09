/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { LeafletProvider } from "../../../../xch/providers/leaflet";
import { BlockHeader, Coin, CoinState, Provider, PuzzleSolution } from "../../../../xch/providers/provider";
import { assert } from "chai";
import { CoinUtil } from "../../../../util/coin";

const nodeHost = "leaflet.fireacademy.io";
const nodeAPIKey = "TEST-API-KEY";

const coinUtil = new CoinUtil();

describe("LeafletProvider with " + nodeHost, () => {
    let p: Provider;
    
    it("initialize()", async () => {
        p = new LeafletProvider(nodeHost, nodeAPIKey);
        await p.connect();
    });

    it("getBlockNumber()", async () => {
        const blockNumber = await p.getBlockNumber();
        assert.isTrue(blockNumber != null && blockNumber > 1000000);
    });
    
    
    it("getBalance()", async () => {
        const balance = await p.getBalance({
            address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
        });
        assert.isTrue(balance != null && balance.gte(1946917));
    });

    it("getNetworkId()", () => {
        const networkId: string = p.getNetworkId();
        assert.equal(networkId, "mainnet");
    });
    
    it("subscribeToCoinUpdates()", async () => {
        const coinId = "7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8";
        let coinStates: CoinState[] | boolean = true;
    
        p.subscribeToCoinUpdates({
            coinId: coinId,
            callback: (arg) => coinStates = arg,
        });
    
        while(coinStates === true) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    
        assert.isArray(coinStates);
        
        const cs: CoinState[] = coinStates;
        assert.isTrue(cs.length === 1);

        const coinState: CoinState = cs[0];
        assert.equal(
            coinId,
            coinUtil.getId(coinState.coin),
        );
    });

    it("subscribeToPuzzleHashUpdates()", async () => {
        const puzzleHash = "0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664";
        let coinStates: CoinState[] | boolean = true;
    
        p.subscribeToPuzzleHashUpdates({
            puzzleHash: puzzleHash,
            callback: (arg) => coinStates = arg,
        });
    
        while(coinStates === true) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    
        assert.isArray(coinStates);
        
        const cs: CoinState[] = coinStates;
        assert.isTrue(cs.length >= 26);

        const coinState: CoinState = cs[0];
        assert.equal(
            puzzleHash,
            "0x" + coinState.coin.puzzleHash
        );
    });

    it("getPuzzleSolution()", async () => {
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        // eslint-disable-next-line max-len
        const puzzle = "ff02ffff01ff02ffff01ff02ffff03ffff09ffff0bff8202ff80ff0580ffff01ff04ffff04ff0effff04ff81bfffff04ffff10ffff05ffff14ffff12ffff0107ffff11ff0bff178080ffff018203e88080ffff010180ff80808080ffff04ffff04ff0effff04ff5fffff04ffff11ff0bff17ffff10ffff05ffff14ffff12ffff0107ffff11ff0bff178080ffff018203e88080ffff01018080ff80808080ffff04ffff04ff04ffff04ff17ff808080ff80808080ffff01ff04ffff04ff0effff04ff2fffff04ffff11ff0bff1780ff80808080ffff04ffff04ff04ffff04ff17ff808080ffff04ffff04ff0affff04ff82017fff808080ff8080808080ff0180ffff04ffff01ff34ff5233ff018080ffff04ffff01a0b5663aa248ca84934ddb2ad784ff1294c3f44832bc98b5c7fc164a91645482ceffff04ffff01823037ffff04ffff0102ffff04ffff01a05667858887e29d75a8fba955028e803c71e16bffbd0dc253a1777b979a4db622ffff04ffff01a01bce9345d2003617aeb77a35394c249d2be751107aea4a55d978669f71d29e6affff04ffff01a0b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664ffff04ffff018200c0ff018080808080808080";
        const solution = "ffaa5345435245542d354a6a4c477250632d734b473762785a712d706d42327868507a2d394b7153377a4b6f80";
        const coinId = "0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";
        const height = 894633; // spent height (that's when the solution is revealed
        
        const resp = await p.getPuzzleSolution({
            coinId: coinId,
            height: height
        });
    
        assert.isNotNull(resp);
        assert.instanceOf(resp, PuzzleSolution);
        assert.equal(
            coinId,
            "0x" + resp!.coinName
        );
        assert.equal(resp!.height, height);
        assert.equal(resp!.puzzle.toString(), puzzle);
        assert.equal(resp!.solution.toString(), solution);
    });

    it("getCoinChildren()", async () => {
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const coinId = "0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";
        
        const resp = await p.getCoinChildren({
            coinId: coinId
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const arr: CoinState[] = resp;
        assert.equal(arr.length, 2);

        const coinIds: string[] = [
            coinUtil.getId(arr[0].coin),
            coinUtil.getId(arr[1].coin)
        ];
        assert.isTrue(coinIds.includes("7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8"));
        assert.isTrue(coinIds.includes("6aba6282e60ea52367596c258b5a54b7263dd42d8040c06c94b13d8eca682e45"));
    });

    it("getBlockHeader()", async () => {
        // https://www.chiaexplorer.com/blockchain/block/0x5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410
        const blockHeight = 1000000;
        const headerHash = "5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410";
        
        const resp = await p.getBlockHeader({
            height: blockHeight
        });
    
        assert.isNotNull(resp);
        assert.instanceOf(resp, BlockHeader);
        
        const hb: BlockHeader = resp!;
        assert.equal(hb.headerHash, headerHash);
    });

    it("getBlocksHeaders()", async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xf5d672dae94768f8cd119331490b2725d505355522bc81bb7ae314a2d0412b1d
        // https://www.chiaexplorer.com/blockchain/block/0x5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410
        // https://www.chiaexplorer.com/blockchain/block/0x6f15a6d088ce8d940c220f80d16d6743c8a9cf5e2544ad15a57b58a06dbd9284
        const startHeight = 999999;
        const endHeight = 1000001;
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

        const hbs: BlockHeader[] = resp!;
        assert.equal(hbs.length, headerHashes.length);
        for(let i = 0; i < hbs.length; ++i) {
            assert.equal(
                hbs[i].headerHash,
                headerHashes[i]
            );
        }
    });

    it("getCoinRemovals()", async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xfca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702
        const blockHeight = 894633;
        const headerHash = "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702";
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const coinId = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

        const resp = await p.getCoinRemovals({
            height: blockHeight,
            headerHash: headerHash
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const coins: Coin[] = resp!;
        assert.isTrue(
            coins.map(e => coinUtil.getId(e)).includes(coinId)
        );
    });

    it("getCoinRemovals() - only one coin", async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xfca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702
        const blockHeight = 894633;
        const headerHash = "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702";
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const coinId = "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01";

        const resp = await p.getCoinRemovals({
            height: blockHeight,
            headerHash: headerHash,
            coinIds: [coinId],
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const coins: Coin[] = resp!;
        assert.equal(coins.length, 1);
        assert.isTrue(coinUtil.getId(coins[0]) === coinId);
    });

    it("getCoinAdditions()", async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xa1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb
        const blockHeight = 894597;
        const headerHash = "a1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb";
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const puzHash = "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2";

        const resp = await p.getCoinAdditions({
            height: blockHeight,
            headerHash: headerHash
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const coins: Coin[] = resp!;
        assert.isTrue(
            coins.map((e) => e.puzzleHash).includes(puzHash)
        );
    });

    it("getCoinAdditions() - two puzzle hashes", async () => {
        // https://www.chiaexplorer.com/blockchain/block/0xa1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb
        const blockHeight = 894597;
        // https://www.chiaexplorer.com/blockchain/coin/0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
        const puzzHash = "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2";
        const nonExistentPuzzHash = "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e3";

        const resp = await p.getCoinAdditions({
            height: blockHeight,
            headerHash: "a1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb",
            puzzleHashes: [puzzHash, nonExistentPuzzHash]
        });
    
        assert.isNotNull(resp);
        assert.isArray(resp);
        
        const coins: Coin[] = resp!;
        assert.equal(coins.length, 1);
        assert.isTrue(
            coins.map((e) => e.puzzleHash).includes(puzzHash)
        );
    });

    it("close()", () => {
        assert.doesNotThrow(async () => p.close());
    });
});