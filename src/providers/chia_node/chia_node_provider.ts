import { Provider, Optional, AddressOrPuzzleHash } from "../provider";
import { ChiaMessageChannel } from './chia_message_channel';
import { MessageQueue } from "../../types/message_queue";
import { Message } from "../../types/outbound_message";
import { Serializer } from "../../serializer";
import { ProtocolMessageTypes } from "../../types/protocol_message_types";
import { NewPeakWallet } from "../../types/wallet_protocol";

const ADDRESS_PREFIX: string = "xch";

export class ChiaNodeProvider implements Provider {
    private message_channel: ChiaMessageChannel;
    private message_queue: MessageQueue = new MessageQueue();
    private blockNumber: Optional<number> = null;

    constructor(host: string, port: number = 8444) {
        this.message_channel = new ChiaMessageChannel({
            host: host,
            port: port,
            onMessage: (message: Buffer) => this._onMessage(message)
        });
    };

    private _onMessage(raw_msg: Buffer) {
        const msg: Message = Serializer.deserialize(Message, raw_msg);
        if(msg.type == ProtocolMessageTypes.new_peak_wallet) {
            const pckt: NewPeakWallet = Serializer.deserialize(NewPeakWallet, msg.data);
            this.blockNumber = pckt.height;
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

    public async getBlockNumber(): Promise<Optional<number>> {
        return this.blockNumber;
    }

    public async getBalance(address: AddressOrPuzzleHash): Promise<Optional<number>> {
        var puzzleHash: Buffer;

        if(address instanceof Buffer) {
            puzzleHash = address;
        } else {
            var addr: string = address;
            if(addr.startsWith(ADDRESS_PREFIX)) {

            } else {
                if(addr.startsWith("0x"))
                    addr = addr.slice(2);
                if(addr.length != 64 || !(new RegExp( /^[0-9A-Fa-f]+$/ )).test(addr))
                    return null;
                puzzleHash = Buffer.from(addr, "hex");
            }
        }
        //const pckt;
        return 0;
    }
}