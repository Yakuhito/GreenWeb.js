import { Serializer } from "../../../util/serializer/serializer";
import { Message } from "../../../util/serializer/types/outbound_message";
import { ProtocolMessageTypes } from "../../../util/serializer/types/protocol_message_types";
import { IChiaMessageChannel } from "./chia_message_channel";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export type MessageFilter = {
    messageToSend: Buffer | null,
    consumeMessage: (msg: Message) => boolean,
    deleteAfterFirstMessageConsumed?: boolean,
    expectedMaxRensponseWait?: number // in ms (1 second = 1000ms)
};

type _MessageFilterInternalStruct = {
    filter: {
        messageToSend: Buffer | null,
        consumeMessage: (msg: Message) => boolean,
        deleteAfterFirstMessageConsumed: boolean,
        expectedMaxRensponseWait: number
    },
    lastMessageReceived: number,
    resolvePromise: (value: unknown) => void,
}

export class MessageManager {
    public open: boolean = false;
    private _createMessageChannel: (handleMessage: (rawMsg: Buffer) => void) => Promise<IChiaMessageChannel>;
    private _msgChannel: IChiaMessageChannel;
    private _canSendMessage: boolean = false;
    private _controller: Promise<void>;
    private _filters: _MessageFilterInternalStruct[] = [];

    constructor(
        createMessageChannel: (handleMessage: (rawMsg: Buffer) => void) => Promise<IChiaMessageChannel>
    ) {
        this._createMessageChannel = createMessageChannel;
    }

    public async initialize() {
        // push a filter that listens for 'new peak wallet' packets
        const filter = {
            messageToSend: null,
            consumeMessage: (msg: Message) =>
                msg.type === ProtocolMessageTypes.new_peak_wallet ||
                msg.type === ProtocolMessageTypes.handshake,
            deleteAfterFirstMessageConsumed: false,
            expectedMaxRensponseWait: 120 * 1000,
        };

        this._filters.push({
            filter: filter,
            lastMessageReceived: 0, // setting this to 0 will initialize the messageChannel
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            resolvePromise: () => {},
        });
        // initialize other things
        this.open = true;
        this._canSendMessage = false;
        this._controller = this._controllerFunction();
    }

    public async close() {
        this.open = false;
        await this._controller;
    }

    public async registerFilter({
        messageToSend,
        consumeMessage,
        deleteAfterFirstMessageConsumed = true,
        expectedMaxRensponseWait = 4200
    }: MessageFilter) {
        return new Promise(resolve => {
            const timestamp: number = new Date().getTime();
            const filterToPush: _MessageFilterInternalStruct = {
                filter: {messageToSend, consumeMessage, deleteAfterFirstMessageConsumed, expectedMaxRensponseWait},
                lastMessageReceived: timestamp,
                resolvePromise: resolve
            };
            this._filters.push(filterToPush);

            if(messageToSend != null && this._canSendMessage) {
                this._msgChannel.sendMessage(messageToSend);
            }
        });
    }

    private _handleMessage(rawMsg: Buffer) {
        const msg: Message = Serializer.deserialize(Message, rawMsg);

        for(let i = 0; i < this._filters.length; ++i) {
            const filter = this._filters[i].filter;
            try {
                if(filter.consumeMessage(msg)) {
                    const timestamp: number = new Date().getTime();
                    this._filters[i].lastMessageReceived = timestamp;
                    this._filters[i].resolvePromise(msg);
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    this._filters[i].resolvePromise = () => { };

                    if(filter.deleteAfterFirstMessageConsumed) {
                        this._filters.splice(i, 1);
                        i--;
                    }
                }
            } catch(_) {
                // do nothing
            }
        }
    }

    private async _controllerFunction(): Promise<void> {
        while(this.open) {
            const timestamp: number = new Date().getTime();
            let restart: boolean = !this._msgChannel?.isConnected() ?? true;

            for(let i = 0; i < this._filters.length && !restart; ++i) {
                const filter = this._filters[i].filter;
                if(
                    filter.expectedMaxRensponseWait !== 0 &&
                    this._filters[i].lastMessageReceived + filter.expectedMaxRensponseWait < timestamp
                ) {
                    restart = true;
                }
            }

            if(restart) {
                this._canSendMessage = false;
                this._msgChannel = await this._createMessageChannel(this._handleMessage);
                await this._msgChannel.connect();

                await sleep(4200);
                this._canSendMessage = this._msgChannel.isConnected();

                for(let i = 0; i < this._filters.length && this._canSendMessage; ++i) {
                    const filter: MessageFilter = this._filters[i].filter;
                    if(filter.messageToSend !== null) {
                        this._msgChannel.sendMessage(filter.messageToSend);
                    }
                }
            }
            await sleep(1000);
        }

        this._msgChannel.close();
    }
}