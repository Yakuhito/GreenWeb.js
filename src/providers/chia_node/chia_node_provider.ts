import { Provider, Optional, getBalanceArgs, subscribeToPuzzleHashUpdatesArgs, subscribeToCoinUpdatesArgs, getPuzzleSolutionArgs, getCoinChildrenArgs } from "../provider";
import { ChiaMessageChannel } from './chia_message_channel';
import { MessageQueue } from "../../util/message_queue";
import { make_msg, Message } from "../../types/outbound_message";
import { Serializer } from "../../serializer";
import { ProtocolMessageTypes } from "../../types/protocol_message_types";
import { CoinState, NewPeakWallet, PuzzleSolutionResponse, RegisterForCoinUpdates, RegisterForPhUpdates, RequestChildren, RequestPuzzleSolution, RespondChildren, RespondPuzzleSolution, RespondToCoinUpdates, RespondToPhUpdates } from "../../types/wallet_protocol";
import { AddressUtil } from "../../util/address";
import { CoinStateStorage } from "../../util/coin_state_storage";

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
}