import { Provider, Optional, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs } from "../provider";
import { ChiaMessageChannel } from "./chia_message_channel";
import { MessageQueue } from "../../util/message_queue";
import { makeMsg, Message } from "../../types/outbound_message";
import { Serializer } from "../../serializer";
import { ProtocolMessageTypes } from "../../types/protocol_message_types";
import { CoinState, NewPeakWallet, PuzzleSolutionResponse, RegisterForCoinUpdates, RegisterForPhUpdates, RequestAdditions, RequestBlockHeader, RequestChildren, RequestHeaderBlocks, RequestPuzzleSolution, RequestRemovals, RespondAdditions, RespondBlockHeader, RespondChildren, RespondHeaderBlocks, RespondPuzzleSolution, RespondRemovals, RespondToCoinUpdates, RespondToPhUpdates } from "../../types/wallet_protocol";
import { AddressUtil } from "../../util/address";
import { CoinStateStorage } from "../../util/coin_state_storage";
import { HeaderBlock } from "../../types/header_block";
import { Coin } from "../../types/coin";
import { bytes } from "../../serializer/basic_types";

const ADDRESS_PREFIX = "xch";
const NETWORK_ID = "mainnet";

export class ChiaNodeProvider implements Provider {
    private messageChannel: ChiaMessageChannel;
    private messageQueue: MessageQueue = new MessageQueue();
    private blockNumber: Optional<number> = null;
    private coinStateStorage: CoinStateStorage = new CoinStateStorage();

    constructor(host: string, port = 8444) {
        this.messageChannel = new ChiaMessageChannel({
            host: host,
            port: port,
            onMessage: (message: Buffer) => this._onMessage(message),
            networkId: NETWORK_ID
        });
    }

    private _onMessage(rawMsg: Buffer) {
        const msg: Message = Serializer.deserialize(Message, rawMsg);
        if(msg.type === ProtocolMessageTypes.new_peak_wallet) {
            const pckt: NewPeakWallet = Serializer.deserialize(NewPeakWallet, msg.data);
            this.blockNumber = pckt.height;
        } else if(msg.type === ProtocolMessageTypes.respond_to_ph_update) {
            const pckt: RespondToPhUpdates = Serializer.deserialize(RespondToPhUpdates, msg.data);
            this.coinStateStorage.processPhPacket(pckt);
        } else if(msg.type === ProtocolMessageTypes.respond_to_coin_update) {
            const pckt: RespondToCoinUpdates = Serializer.deserialize(RespondToCoinUpdates, msg.data);
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

    public async getBlockNumber(): Promise<Optional<number>> {
        return this.blockNumber;
    }

    public async getBalance({
        address,
        puzzleHash,
        minHeight = 0
    }: getBalanceArgs): Promise<Optional<number>> {
        let puzHash: Buffer;

        // get puzHash: Buffer from address / puzzle hash
        if(address !== undefined && address.startsWith(ADDRESS_PREFIX)) {
            puzHash = AddressUtil.addressToPuzzleHash(address);
            if(puzHash.toString("hex").length === 0) {
                return null;
            }
        }
        else if(puzzleHash !== undefined) {
            puzHash = Buffer.from(AddressUtil.validateHashString(puzzleHash), "hex");
        }
        else return null;

        const puzHashStr = puzHash.toString("hex");

        // accept packets containing that puzzle hash
        this.coinStateStorage.willExpectUpdate(puzHashStr);

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
        const coinStates: CoinState[] = await this.coinStateStorage.waitFor(puzHashStr);

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
        puzzleHash = AddressUtil.validateHashString(puzzleHash);
        if(puzzleHash.length === 0) return;

        this.coinStateStorage.willExpectUpdate(puzzleHash);

        // Register for updates
        const pckt: RegisterForPhUpdates = new RegisterForPhUpdates();
        pckt.minHeight = minHeight;
        pckt.puzzleHashes = [
            Buffer.from(puzzleHash, "hex"),
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
        coinId = AddressUtil.validateHashString(coinId);
        if(coinId.length === 0) return;

        this.coinStateStorage.willExpectUpdate(coinId);

        // Register for updates
        const pckt: RegisterForCoinUpdates = new RegisterForCoinUpdates();
        pckt.minHeight = minHeight;
        pckt.coinIds = [
            Buffer.from(coinId, "hex"),
        ];

        this.messageChannel.sendMessage(
            makeMsg(
                ProtocolMessageTypes.register_interest_in_coin,
                pckt,
            )
        );

        this.coinStateStorage.addCallback(coinId, callback);
    }

    public async getPuzzleSolution({coinId, height}: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolutionResponse>> {
        coinId = AddressUtil.validateHashString(coinId);
        if(coinId.length === 0) return null;

        const pckt: RequestPuzzleSolution = new RequestPuzzleSolution();
        pckt.coinName = Buffer.from(coinId, "hex");
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

        const respPckt: PuzzleSolutionResponse = Serializer.deserialize(RespondPuzzleSolution, respMsg.data).response;

        return respPckt;
    }

    public async getCoinChildren({ coinId }: getCoinChildrenArgs): Promise<CoinState[]> {
        coinId = AddressUtil.validateHashString(coinId);
        if(coinId.length === 0) return [];

        const pckt: RequestChildren = new RequestChildren();
        pckt.coinName = Buffer.from(coinId, "hex");

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

        return respPckt.coinStates;
    }

    public async getBlockHeader({ height }: getBlockHeaderArgs): Promise<Optional<HeaderBlock>> {
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
        return respPckt.headerBlock;
    }

    public async getBlocksHeaders({ startHeight, endHeight }: getBlocksHeadersArgs): Promise<Optional<HeaderBlock[]>> {
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
        return respPckt.headerBlocks;
    }

    public async getCoinRemovals({
        height,
        headerHash,
        coinIds = undefined
    }: getCoinRemovalsArgs): Promise<Optional<Array<[bytes, Optional<Coin>]>>> {
        headerHash = AddressUtil.validateHashString(headerHash);
        if(headerHash.length === 0) return null;

        const parsedCoinIds: Buffer[] = [];
        if(coinIds !== undefined) {
            for(let i = 0;i < coinIds.length; ++i) {
                const parsed: string = AddressUtil.validateHashString(coinIds[i]);

                if(parsed.length === 0) return null;
                parsedCoinIds.push(Buffer.from(parsed, "hex"));
            }
        }

        const pckt: RequestRemovals = new RequestRemovals();
        pckt.height = height;
        pckt.headerHash = Buffer.from(headerHash, "hex");
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
        return respPckt.coins;
    }

    public async getCoinAdditions({
        height,
        headerHash,
        puzzleHashes = undefined
    }: getCoinAdditionsArgs): Promise<Optional<Array<[bytes, Coin[]]>>> {
        headerHash = AddressUtil.validateHashString(headerHash);
        if(headerHash.length === 0) return null;

        const parsedpuzzleHashes: Buffer[] = [];
        if(puzzleHashes !== undefined) {
            for(let i = 0;i < puzzleHashes.length; ++i) {
                const parsed: string = AddressUtil.validateHashString(puzzleHashes[i]);

                if(parsed.length === 0) return null;
                parsedpuzzleHashes.push(Buffer.from(parsed, "hex"));
            }
        }

        const pckt: RequestAdditions = new RequestAdditions();
        pckt.height = height;
        pckt.headerHash = Buffer.from(headerHash, "hex");
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
        return respPckt.coins;
    }
}