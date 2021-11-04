import { Provider, Optional, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs, getBlockHeaderArgs, getBlocksHeadersArgs, getCoinRemovalsArgs, getCoinAdditionsArgs } from "../provider";
import { ChiaMessageChannel } from './chia_message_channel';
import { MessageQueue } from "../../util/message_queue";
import { make_msg, Message } from "../../types/outbound_message";
import { Serializer } from "../../serializer";
import { ProtocolMessageTypes } from "../../types/protocol_message_types";
import { CoinState, NewPeakWallet, PuzzleSolutionResponse, RegisterForCoinUpdates, RegisterForPhUpdates, RequestAdditions, RequestBlockHeader, RequestChildren, RequestHeaderBlocks, RequestPuzzleSolution, RequestRemovals, RespondAdditions, RespondBlockHeader, RespondChildren, RespondHeaderBlocks, RespondPuzzleSolution, RespondRemovals, RespondToCoinUpdates, RespondToPhUpdates } from "../../types/wallet_protocol";
import { AddressUtil } from "../../util/address";
import { CoinStateStorage } from "../../util/coin_state_storage";
import { HeaderBlock } from "../../types/header_block";
import { Coin } from "../../types/coin";
import { bytes } from "../../serializer/basic_types";

const ADDRESS_PREFIX: string = "xch";
const NETWORK_ID: string = "mainnet";

export class ChiaNodeProvider implements Provider {
    private message_channel: ChiaMessageChannel;
    private message_queue: MessageQueue = new MessageQueue();
    private blockNumber: Optional<number> = null;
    private coin_state_storage: CoinStateStorage = new CoinStateStorage();

    constructor(host: string, port: number = 8444) {
        this.message_channel = new ChiaMessageChannel({
            host: host,
            port: port,
            onMessage: (message: Buffer) => this._onMessage(message),
            network_id: NETWORK_ID
        });
    };

    private _onMessage(raw_msg: Buffer) {
        const msg: Message = Serializer.deserialize(Message, raw_msg);
        if(msg.type == ProtocolMessageTypes.new_peak_wallet) {
            const pckt: NewPeakWallet = Serializer.deserialize(NewPeakWallet, msg.data);
            this.blockNumber = pckt.height;
        } else if(msg.type == ProtocolMessageTypes.respond_to_ph_update) {
            const pckt: RespondToPhUpdates = Serializer.deserialize(RespondToPhUpdates, msg.data);
            this.coin_state_storage.processPhPacket(pckt);
        } else if(msg.type == ProtocolMessageTypes.respond_to_coin_update) {
            const pckt: RespondToCoinUpdates = Serializer.deserialize(RespondToCoinUpdates, msg.data);
            this.coin_state_storage.processCoinPacket(pckt);
        } else {
            this.message_queue.push(msg);
        }
    }

    public async initialize() {
        await this.message_channel.connect();
        await this.message_queue.waitFor([ProtocolMessageTypes.handshake]);
    }

    public async close(): Promise<void> {
        await this.message_channel.close();
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
        var puzHash: Buffer;

        // get puzHash: Buffer from address / puzzle hash
        if(address != undefined && address.startsWith(ADDRESS_PREFIX)) {
            puzHash = AddressUtil.addressToPuzzleHash(address);
            if(puzHash.toString("hex").length == 0) {
                return null;
            }
        }
        else if(puzzleHash != undefined) {
            puzHash = Buffer.from(AddressUtil.validateHashString(puzzleHash), "hex");
        }
        else return null;

        const puzHash_str = puzHash.toString("hex");

        // accept packets containing that puzzle hash
        this.coin_state_storage.willExpectUpdate(puzHash_str);

        // Register for updates
        const pckt: RegisterForPhUpdates = new RegisterForPhUpdates();
        pckt.min_height = minHeight;
        pckt.puzzle_hashes = [puzHash];

        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.register_interest_in_puzzle_hash,
                pckt,
            )
        );

        // wait for coin states
        const coin_states: CoinState[] = await this.coin_state_storage.waitFor(puzHash_str);

        // filter received list of puzzle hashes and compute balance
        const unspent_coins: CoinState[] = coin_states.filter(
            (coin_state) => coin_state.spent_height == null
        );

        var balance: number = 0;
        for(var i = 0; i < unspent_coins.length; ++i) {
            balance += unspent_coins[i].coin.amount;
        }

        return balance;
    }

    public subscribeToPuzzleHashUpdates({ puzzleHash, callback, minHeight = 0 }: subscribeToPuzzleHashUpdatesArgs): void {
        puzzleHash = AddressUtil.validateHashString(puzzleHash);
        if(puzzleHash.length == 0) return;

        this.coin_state_storage.willExpectUpdate(puzzleHash);

        // Register for updates
        const pckt: RegisterForPhUpdates = new RegisterForPhUpdates();
        pckt.min_height = minHeight;
        pckt.puzzle_hashes = [
            Buffer.from(puzzleHash, "hex"),
        ];

        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.register_interest_in_puzzle_hash,
                pckt,
            )
        );

        this.coin_state_storage.addCallback(puzzleHash, callback);
    }

    public subscribeToCoinUpdates({ coinId, callback, minHeight = 0 }: subscribeToCoinUpdatesArgs): void {
        coinId = AddressUtil.validateHashString(coinId);
        if(coinId.length == 0) return;

        this.coin_state_storage.willExpectUpdate(coinId);

        // Register for updates
        const pckt: RegisterForCoinUpdates = new RegisterForCoinUpdates();
        pckt.min_height = minHeight;
        pckt.coin_ids = [
            Buffer.from(coinId, "hex"),
        ];

        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.register_interest_in_coin,
                pckt,
            )
        );

        this.coin_state_storage.addCallback(coinId, callback);
    }

    public async getPuzzleSolution({coinId, height}: getPuzzleSolutionArgs): Promise<Optional<PuzzleSolutionResponse>> {
        coinId = AddressUtil.validateHashString(coinId);
        if(coinId.length == 0) return null;

        const pckt: RequestPuzzleSolution = new RequestPuzzleSolution();
        pckt.coin_name = Buffer.from(coinId, "hex");
        pckt.height = height;

        this.message_queue.clear(ProtocolMessageTypes.respond_puzzle_solution);
        this.message_queue.clear(ProtocolMessageTypes.reject_puzzle_solution);
        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.request_puzzle_solution,
                pckt,
            )
        );

        var resp_msg: Message = await this.message_queue.waitFor([
            ProtocolMessageTypes.respond_puzzle_solution,
            ProtocolMessageTypes.reject_puzzle_solution
        ]);
        if(resp_msg.type == ProtocolMessageTypes.reject_puzzle_solution) return null;

        var resp_pckt: PuzzleSolutionResponse = Serializer.deserialize(RespondPuzzleSolution, resp_msg.data).response;

        return resp_pckt;
    }

    public async getCoinChildren({ coinId }: getCoinChildrenArgs): Promise<CoinState[]> {
        coinId = AddressUtil.validateHashString(coinId);
        if(coinId.length === 0) return [];

        const pckt: RequestChildren = new RequestChildren();
        pckt.coin_name = Buffer.from(coinId, "hex");

        this.message_queue.clear(ProtocolMessageTypes.respond_children);
        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.request_children,
                pckt,
            )
        );

        var resp_msg: Message = await this.message_queue.waitFor([
            ProtocolMessageTypes.respond_children
        ]);
        var resp_pckt = Serializer.deserialize(RespondChildren, resp_msg.data);

        return resp_pckt.coin_states;
    }

    public async getBlockHeader({ height }: getBlockHeaderArgs): Promise<Optional<HeaderBlock>> {
        const pckt: RequestBlockHeader = new RequestBlockHeader();
        pckt.height = height;

        this.message_queue.clear(ProtocolMessageTypes.respond_block_header);
        this.message_queue.clear(ProtocolMessageTypes.reject_header_request);
        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.request_block_header,
                pckt,
            )
        );

        var resp_msg: Message = await this.message_queue.waitFor([
            ProtocolMessageTypes.respond_block_header,
            ProtocolMessageTypes.reject_header_request
        ]);
        if(resp_msg.type == ProtocolMessageTypes.reject_header_request)
            return null;

        var resp_pckt: RespondBlockHeader = Serializer.deserialize(RespondBlockHeader, resp_msg.data);
        return resp_pckt.header_block;
    }

    public async getBlocksHeaders({ startHeight, endHeight }: getBlocksHeadersArgs): Promise<Optional<HeaderBlock[]>> {
        const pckt: RequestHeaderBlocks = new RequestHeaderBlocks();
        pckt.start_height = startHeight;
        pckt.end_height = endHeight;

        this.message_queue.clear(ProtocolMessageTypes.respond_header_blocks);
        this.message_queue.clear(ProtocolMessageTypes.reject_header_blocks);
        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.request_header_blocks,
                pckt,
            )
        );

        var resp_msg: Message = await this.message_queue.waitFor([
            ProtocolMessageTypes.respond_header_blocks,
            ProtocolMessageTypes.reject_header_blocks
        ]);
        if(resp_msg.type == ProtocolMessageTypes.reject_header_blocks)
            return null;

        var resp_pckt: RespondHeaderBlocks = Serializer.deserialize(RespondHeaderBlocks, resp_msg.data);
        return resp_pckt.header_blocks;
    }

    public async getCoinRemovals({ height, headerHash, coinIds = undefined }: getCoinRemovalsArgs): Promise<Optional<[bytes, Optional<Coin>][]>> {
        headerHash = AddressUtil.validateHashString(headerHash);
        if(headerHash.length == 0) return null;

        var parsedCoinIds: Buffer[] = [];
        if(coinIds != undefined) {
            for(var i = 0;i < coinIds.length; ++i) {
                const parsed: string = AddressUtil.validateHashString(coinIds[i]);

                if(parsed.length == 0) return null;
                parsedCoinIds.push(Buffer.from(parsed, "hex"));
            }
        }

        const pckt: RequestRemovals = new RequestRemovals();
        pckt.height = height;
        pckt.header_hash = Buffer.from(headerHash, "hex");
        pckt.coin_names = coinIds != undefined ? parsedCoinIds : null;

        this.message_queue.clear(ProtocolMessageTypes.respond_removals);
        this.message_queue.clear(ProtocolMessageTypes.reject_removals_request);
        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.request_removals,
                pckt,
            )
        );

        var resp_msg: Message = await this.message_queue.waitFor([
            ProtocolMessageTypes.respond_removals,
            ProtocolMessageTypes.reject_removals_request
        ]);
        if(resp_msg.type == ProtocolMessageTypes.reject_removals_request)
            return null;

        const resp_pckt: RespondRemovals = Serializer.deserialize(RespondRemovals, resp_msg.data);
        return resp_pckt.coins;
    }

    public async getCoinAdditions({ height, headerHash, puzzleHashes = undefined }: getCoinAdditionsArgs): Promise<Optional<[bytes, Coin[]][]>> {
        headerHash = AddressUtil.validateHashString(headerHash);
        if(headerHash.length == 0) return null;

        var parsedpuzzleHashes: Buffer[] = [];
        if(puzzleHashes != undefined) {
            for(var i = 0;i < puzzleHashes.length; ++i) {
                const parsed: string = AddressUtil.validateHashString(puzzleHashes[i]);

                if(parsed.length == 0) return null;
                parsedpuzzleHashes.push(Buffer.from(parsed, "hex"));
            }
        }

        const pckt: RequestAdditions = new RequestAdditions();
        pckt.height = height;
        pckt.header_hash = Buffer.from(headerHash, "hex");
        pckt.puzzle_hashes = puzzleHashes != undefined ? parsedpuzzleHashes : null;

        this.message_queue.clear(ProtocolMessageTypes.respond_additions);
        this.message_queue.clear(ProtocolMessageTypes.reject_additions_request);
        this.message_channel.sendMessage(
            make_msg(
                ProtocolMessageTypes.request_additions,
                pckt,
            )
        );
        
        var resp_msg: Message = await this.message_queue.waitFor([
            ProtocolMessageTypes.respond_additions,
            ProtocolMessageTypes.reject_additions_request
        ]);
        if(resp_msg.type == ProtocolMessageTypes.reject_additions_request)
            return null;

        const resp_pckt: RespondAdditions = Serializer.deserialize(RespondAdditions, resp_msg.data);
        return resp_pckt.coins;
    }
}