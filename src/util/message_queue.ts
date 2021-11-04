/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { uint, bytes } from '../serializer/basic_types';
import { Queue } from './queue';
import { Message } from '../types/outbound_message';

export class MessageQueue {
    private readonly _messages: Map<uint, Queue<bytes>> = new Map();

    public push(msg: Message) {
        const msgType: uint = msg.type;
        const msgContent: bytes = msg.data;

        if(!this._messages.has(msgType)) {
            this._messages.set(msgType, new Queue<bytes>());
        }
        if(this._messages.get(msgType)!.size() > 10) {
            this._messages.get(msgType)!.pop();
        }
        this._messages.get(msgType)!.push(msgContent);
    }

    public pop(msgType: uint): bytes | undefined {
        if(!this._messages.has(msgType)) {
            return undefined;
        }
        return this._messages.get(msgType)!.pop();
    }

    public clear(msgType: uint) {
        this._messages.set(msgType, new Queue<bytes>());
    }

    public async waitFor(msgTypes: uint[]): Promise<Message> {
        // eslint-disable-next-line no-constant-condition
        while(true) {
            for(let i = 0; i < msgTypes.length; ++i) {
                const res: bytes | undefined = this.pop(msgTypes[i]);
                if(res != undefined) {
                    const a = new Message();
                    a.data = res;
                    a.id = null;
                    a.type = msgTypes[i];

                    return a;
                }
            }
            await new Promise( resolve => setTimeout(resolve, 100));
        }
    }
}