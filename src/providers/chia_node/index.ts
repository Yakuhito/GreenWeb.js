import { Serializer } from "../../serializer";
import { uint } from "../../serializer/basic_types";
import { MessageQueue } from "../../types/message_queue";
import { Message } from "../../types/outbound_message";
import { Provider } from "../provider";
import { ChiaMessageChannel } from "./chia_message_channel";

export class ChiaNodeProvider implements Provider {
    private readonly messageChannel: ChiaMessageChannel;
    private readonly incoming_messages: MessageQueue = new MessageQueue();

    constructor(host: string, port: uint = 8444) {
        this.messageChannel = new ChiaMessageChannel({
            host: host,
            port: port,
            onMessage: (buf) => {
                const message: Message = Serializer.deserialize(Message, buf);
                this.incoming_messages.push(message.type, message.data);
            }
        });
    }

    public async initialize() {
        return this.messageChannel.connect();
    }
}