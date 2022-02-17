import { Provider, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs } from "../provider";
import * as providerTypes from "../provider_types";
import { ChiaMessageChannel } from "./chia_message_channel";
import { MessageQueue } from "./message_queue";
import { makeMsg, Message } from "../../../util/serializer/types/outbound_message";
import { Serializer } from "../../../util/serializer/serializer";
import { ProtocolMessageTypes } from "../../../util/serializer/types/protocol_message_types";
import { CoinState, NewPeakWallet, PuzzleSolutionResponse, RegisterForCoinUpdates, RegisterForPhUpdates, RequestAdditions, RequestBlockHeader, RequestChildren, RequestHeaderBlocks, RequestPuzzleSolution, RequestRemovals, RespondAdditions, RespondBlockHeader, RespondChildren, RespondHeaderBlocks, RespondPuzzleSolution, RespondRemovals, RespondToCoinUpdates, RespondToPhUpdates } from "../../../util/serializer/types/wallet_protocol";
import { CoinStateStorage } from "./coin_state_storage";
import { HeaderBlock } from "../../../util/serializer/types/header_block";
import { Coin } from "../../../util/serializer/types/coin";
import { ProviderUtil } from "./provider_util";
import { AddressUtil } from "../../../util/address";
import { transferArgs, transferCATArgs, acceptOfferArgs } from "../provider_args";

const ADDRESS_PREFIX = "xch";
const NETWORK_ID = "mainnet";

const addressUtil = new AddressUtil();

export class LeafletProvider implements Provider {
    private messageChannel: ChiaMessageChannel;
    private messageQueue: MessageQueue = new MessageQueue();
    private blockNumber: providerTypes.Optional<number> = null;
    private coinStateStorage: CoinStateStorage = new CoinStateStorage();

    constructor(host: string, apiKey: string, port = 18444) {
        this.messageChannel = new ChiaMessageChannel({
            host: host,
            port: port,
            apiKey: apiKey,
            onMessage: (message: Buffer) => this._onMessage(message),
            networkId: NETWORK_ID
        });
    }

    private _onMessage(rawMsg: Buffer) {
        const msg: Message = Serializer.deserialize(Message, rawMsg);
        if(msg.type === ProtocolMessageTypes.new_peak_wallet) {
            const pckt: NewPeakWallet = Serializer.deserialize(
                NewPeakWallet,
                Buffer.from(msg.data, "hex")
            );
            this.blockNumber = pckt.height;
        } else if(msg.type === ProtocolMessageTypes.respond_to_ph_update) {
            const pckt: RespondToPhUpdates = Serializer.deserialize(
                RespondToPhUpdates,
                Buffer.from(msg.data, "hex")
            );
            this.coinStateStorage.processPhPacket(pckt);
        } else if(msg.type === ProtocolMessageTypes.respond_to_coin_update) {
            const pckt: RespondToCoinUpdates = Serializer.deserialize(
                RespondToCoinUpdates,
                Buffer.from(msg.data, "hex")
            );
            this.coinStateStorage.processCoinPacket(pckt);
        } else {
            this.messageQueue.push(msg);
        }
    }

    public async initialize() {
        await this.messageChannel.connect();
        await this.messageQueue.waitFor([ProtocolMessageTypes.handshake]);
    }

    public async close(): Promise<void> {
        await this.messageChannel.close();
    }

    public getNetworkId(): string {
        return NETWORK_ID;
    }

    public isConnected(): boolean {
        return this.messageChannel.isConnected();
    }

    public async getBlockNumber(): Promise<providerTypes.Optional<number>> {
        return this.blockNumber;
    }

    public async getBalance({
        address,
        puzzleHash,
        minHeight = 0
    }: getBalanceArgs): Promise<providerTypes.Optional<number>> {
        let puzHash: string;

        // get puzHash: Buffer from address / puzzle hash
        if(address !== undefined && address.startsWith(ADDRESS_PREFIX)) {
            puzHash = addressUtil.addressToPuzzleHash(address);
            if(puzHash.length === 0) {
                return null;
            }
        }
        else if(puzzleHash !== undefined) {
            puzHash = addressUtil.validateHashString(puzzleHash);
        }
        else return null;

        // accept packets containing that puzzle hash
        this.coinStateStorage.willExpectUpdate(puzHash);

        // Register for updates
        const pckt: RegisterForPhUpdates = new RegisterForPhUpdates();
        pckt.minHeight = minHeight;
        pckt.puzzleHashes = [puzHash];

        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.register_interest_in_puzzle_hash,
                pckt,
            )
        );

        // wait for coin states
        const coinStates: CoinState[] = await this.coinStateStorage.waitFor(puzHash);

        // filter received list of puzzle hashes and compute balance
        const unspentCoins: CoinState[] = coinStates.filter(
            (coinState) => coinState.spentHeight == null
        );

        let balance = 0;
        for(let i = 0; i < unspentCoins.length; ++i) {
            balance += unspentCoins[i].coin.amount;
        }

        return balance;
    }

    public subscribeToPuzzleHashUpdates({ puzzleHash, callback, minHeight = 0 }: subscribeToPuzzleHashUpdatesArgs): void {
        puzzleHash = addressUtil.validateHashString(puzzleHash);
        if(puzzleHash.length === 0) return;

        this.coinStateStorage.willExpectUpdate(puzzleHash);

        // Register for updates
        const pckt: RegisterForPhUpdates = new RegisterForPhUpdates();
        pckt.minHeight = minHeight;
        pckt.puzzleHashes = [
            puzzleHash,
        ];

        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.register_interest_in_puzzle_hash,
                pckt,
            )
        );

        this.coinStateStorage.addCallback(puzzleHash, callback);
    }

    public subscribeToCoinUpdates({ coinId, callback, minHeight = 0 }: subscribeToCoinUpdatesArgs): void {
        coinId = addressUtil.validateHashString(coinId);
        if(coinId.length === 0) return;

        this.coinStateStorage.willExpectUpdate(coinId);

        // Register for updates
        const pckt: RegisterForCoinUpdates = new RegisterForCoinUpdates();
        pckt.minHeight = minHeight;
        pckt.coinIds = [
            coinId,
        ];

        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.register_interest_in_coin,
                pckt,
            )
        );

        this.coinStateStorage.addCallback(coinId, callback);
    }

    public async getPuzzleSolution({coinId, height}: getPuzzleSolutionArgs): Promise<providerTypes.Optional<providerTypes.PuzzleSolution>> {
        coinId = addressUtil.validateHashString(coinId);
        if(coinId.length === 0) return null;

        const pckt: RequestPuzzleSolution = new RequestPuzzleSolution();
        pckt.coinName = coinId;
        pckt.height = height;

        this.messageQueue.clear(ProtocolMessageTypes.respond_puzzle_solution);
        this.messageQueue.clear(ProtocolMessageTypes.reject_puzzle_solution);
        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.request_puzzle_solution,
                pckt,
            )
        );

        const respMsg: Message = await this.messageQueue.waitFor([
            ProtocolMessageTypes.respond_puzzle_solution,
            ProtocolMessageTypes.reject_puzzle_solution
        ]);
        if(respMsg.type === ProtocolMessageTypes.reject_puzzle_solution) return null;

        const respPckt: PuzzleSolutionResponse = Serializer.deserialize(
            RespondPuzzleSolution,
            respMsg.data
        ).response;

        return ProviderUtil.serializerPuzzleSolutionResponseToProviderPuzzleSolution(
            respPckt
        );
    }

    public async getCoinChildren({ coinId }: getCoinChildrenArgs): Promise<providerTypes.CoinState[]> {
        coinId = addressUtil.validateHashString(coinId);
        if(coinId.length === 0) return [];

        const pckt: RequestChildren = new RequestChildren();
        pckt.coinName = coinId;

        this.messageQueue.clear(ProtocolMessageTypes.respond_children);
        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.request_children,
                pckt,
            )
        );

        const respMsg: Message = await this.messageQueue.waitFor([
            ProtocolMessageTypes.respond_children
        ]);
        const respPckt = Serializer.deserialize(RespondChildren, respMsg.data);
        const coinStates: providerTypes.CoinState[] = [];

        for(let i = 0;i < respPckt.coinStates.length; ++i) {
            coinStates.push(
                ProviderUtil.serializerCoinStateToProviderCoinState(
                    respPckt.coinStates[i]
                )
            )
        }

        return coinStates;
    }

    public async getBlockHeader({ height }: getBlockHeaderArgs): Promise<providerTypes.Optional<providerTypes.BlockHeader>> {
        const pckt: RequestBlockHeader = new RequestBlockHeader();
        pckt.height = height;

        this.messageQueue.clear(ProtocolMessageTypes.respond_block_header);
        this.messageQueue.clear(ProtocolMessageTypes.reject_header_request);
        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.request_block_header,
                pckt,
            )
        );

        const respMsg: Message = await this.messageQueue.waitFor([
            ProtocolMessageTypes.respond_block_header,
            ProtocolMessageTypes.reject_header_request
        ]);
        if(respMsg.type === ProtocolMessageTypes.reject_header_request)
            return null;

        const respPckt: RespondBlockHeader = Serializer.deserialize(RespondBlockHeader, respMsg.data);
        const headerBlock: HeaderBlock = respPckt.headerBlock;

        return ProviderUtil.serializerHeaderBlockToProviderBlockHeader(headerBlock, height);
    }

    public async getBlocksHeaders(
        { startHeight, endHeight }: getBlocksHeadersArgs
    ): Promise<providerTypes.Optional<providerTypes.BlockHeader[]>> {
        const pckt: RequestHeaderBlocks = new RequestHeaderBlocks();
        pckt.startHeight = startHeight;
        pckt.endHeight = endHeight;

        this.messageQueue.clear(ProtocolMessageTypes.respond_header_blocks);
        this.messageQueue.clear(ProtocolMessageTypes.reject_header_blocks);
        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.request_header_blocks,
                pckt,
            )
        );

        const respMsg: Message = await this.messageQueue.waitFor([
            ProtocolMessageTypes.respond_header_blocks,
            ProtocolMessageTypes.reject_header_blocks
        ]);
        if(respMsg.type === ProtocolMessageTypes.reject_header_blocks)
            return null;

        const respPckt: RespondHeaderBlocks = Serializer.deserialize(RespondHeaderBlocks, respMsg.data);
        const headers: providerTypes.BlockHeader[] = [];

        for(let i = 0; i < respPckt.headerBlocks.length; ++i) {
            const header: providerTypes.BlockHeader =
                ProviderUtil.serializerHeaderBlockToProviderBlockHeader(
                    respPckt.headerBlocks[i],
                    respPckt.startHeight + i
                );

            headers.push(header);
        }

        return headers;
    }

    public async getCoinRemovals({
        height,
        headerHash,
        coinIds = undefined
    }: getCoinRemovalsArgs): Promise<providerTypes.Optional<providerTypes.Coin[]>> {
        headerHash = addressUtil.validateHashString(headerHash);
        if(headerHash.length === 0) return null;

        const parsedCoinIds: string[] = [];
        if(coinIds !== undefined) {
            for(let i = 0;i < coinIds.length; ++i) {
                const parsed: string = addressUtil.validateHashString(coinIds[i]);

                if(parsed.length === 0) return null;
                parsedCoinIds.push(parsed);
            }
        }

        const pckt: RequestRemovals = new RequestRemovals();
        pckt.height = height;
        pckt.headerHash = headerHash;
        pckt.coinNames = coinIds !== undefined ? parsedCoinIds : null;

        this.messageQueue.clear(ProtocolMessageTypes.respond_removals);
        this.messageQueue.clear(ProtocolMessageTypes.reject_removals_request);
        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.request_removals,
                pckt,
            )
        );

        const respMsg: Message = await this.messageQueue.waitFor([
            ProtocolMessageTypes.respond_removals,
            ProtocolMessageTypes.reject_removals_request
        ]);
        if(respMsg.type === ProtocolMessageTypes.reject_removals_request)
            return null;

        const respPckt: RespondRemovals = Serializer.deserialize(RespondRemovals, respMsg.data);
        const coins: providerTypes.Coin[] = [];

        for(const key of respPckt.coins.keys()) {
            const thing: [string, providerTypes.Optional<Coin>] = respPckt.coins[key];
            if(thing[1] !== null) {
                coins.push(
                    ProviderUtil.serializerCoinToProviderCoin(thing[1])
                );
            }
        }

        return coins;
    }

    public async getCoinAdditions({
        height,
        headerHash,
        puzzleHashes = undefined
    }: getCoinAdditionsArgs): Promise<providerTypes.Optional<providerTypes.Coin[]>> {
        headerHash = addressUtil.validateHashString(headerHash);
        if(headerHash.length === 0) return null;

        const parsedpuzzleHashes: string[] = [];
        if(puzzleHashes !== undefined) {
            for(let i = 0;i < puzzleHashes.length; ++i) {
                const parsed: string = addressUtil.validateHashString(puzzleHashes[i]);

                if(parsed.length === 0) return null;
                parsedpuzzleHashes.push(parsed);
            }
        }

        const pckt: RequestAdditions = new RequestAdditions();
        pckt.height = height;
        pckt.headerHash = headerHash;
        pckt.puzzleHashes = puzzleHashes !== undefined ? parsedpuzzleHashes : null;

        this.messageQueue.clear(ProtocolMessageTypes.respond_additions);
        this.messageQueue.clear(ProtocolMessageTypes.reject_additions_request);
        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.request_additions,
                pckt,
            )
        );
        
        const respMsg: Message = await this.messageQueue.waitFor([
            ProtocolMessageTypes.respond_additions,
            ProtocolMessageTypes.reject_additions_request
        ]);
        if(respMsg.type === ProtocolMessageTypes.reject_additions_request)
            return null;

        const respPckt: RespondAdditions = Serializer.deserialize(RespondAdditions, respMsg.data);
        const coins: providerTypes.Coin[] = [];

        for(const key of respPckt.coins.keys()) {
            const thing: [string, Coin[]] = respPckt.coins[key];
            const coinArr: Coin[] = thing[1];

            for(let j = 0; j < coinArr.length; ++j) {
                const coin: Coin = coinArr[j];
                coins.push(
                    ProviderUtil.serializerCoinToProviderCoin(coin)
                );
            }
        }

        return coins;
    }

    public getAddress(): Promise<string> {
        throw new Error("LeafletProvider does not implement this method.");
    }

    public transfer(args: transferArgs): Promise<boolean> {
        throw new Error("LeafletProvider does not implement this method.");
    }

    public transferCAT(args: transferCATArgs): Promise<boolean> {
        throw new Error("LeafletProvider does not implement this method.");
    }

    public acceptOffer(args: acceptOfferArgs): Promise<boolean> {
        throw new Error("LeafletProvider does not implement this method.");
    }
}