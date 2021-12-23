import { Coin } from "./serializer/types/coin";
import * as providerTypes from "../blockchain_provider_types";
import { CoinState, PuzzleSolutionResponse } from "./serializer/types/wallet_protocol";
import { HeaderBlock } from "./serializer/types/header_block";

export class ProviderUtil {
    static serializerCoinToProviderCoin(coin: Coin): providerTypes.Coin {
        const c: providerTypes.Coin = new providerTypes.Coin();
        c.id = coin.getId();
        c.parentCoinInfo = coin.parentCoinInfo;
        c.puzzleHash = coin.puzzleHash;
        c.amount = coin.amount;

        return c;
    }

    static serializerCoinStateToProviderCoinState(state: CoinState): providerTypes.CoinState {
        const cs: providerTypes.CoinState = new providerTypes.CoinState();
        cs.coin = ProviderUtil.serializerCoinToProviderCoin(state.coin);
        cs.createdHeight = state.createdHeight;
        cs.spentHeight = state.spentHeight;

        return cs;
    }

    static serializerHeaderBlockToProviderBlockHeader(headerBlock: HeaderBlock, height: providerTypes.uint): providerTypes.BlockHeader {
        const header = new providerTypes.BlockHeader();
        header.height = height;
        header.headerHash = headerBlock.headerHash();
        header.prevBlockHash = headerBlock.foliage.prevBlockHash;
        header.isTransactionBlock = headerBlock.rewardChainBlock.isTransactionBlock;
        header.farmerPuzzleHash = headerBlock.foliage.foliageBlockData.farmerRewardPuzzleHash;
        header.poolPuzzleHash = headerBlock.foliage.foliageBlockData.poolTarget.puzzleHash;
        header.fees = headerBlock.transactionsInfo?.fees ?? null;
        
        return header;
    }

    static serializerPuzzleSolutionResponseToProviderPuzzleSolution(respPckt: PuzzleSolutionResponse): providerTypes.PuzzleSolution {
        const ps: providerTypes.PuzzleSolution = new providerTypes.PuzzleSolution();
        ps.coinName = respPckt.coinName;
        ps.height = respPckt.height;
        ps.puzzle = respPckt.puzzle;
        ps.solution = respPckt.solution;

        return ps;
    }
}