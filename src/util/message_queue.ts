import { uint, bytes } from '../serializer/basic_types';
import { Queue } from './queue';
import { Message } from '../types/outbound_message';

export class MessageQueue {
    private readonly _messages: Map<uint, Queue<bytes>> = new Map();

    public push(msg: Message) {
        const msg_type: uint = msg.type;
        const msg_content: bytes = msg.data;

        if(!this._messages.has(msg_type)) {
            this._messages.set(msg_type, new Queue<bytes>());
        }
        if(this._messages.get(msg_type)!.size() > 10) {
            this._messages.get(msg_type)!.pop();
        }
        this._messages.get(msg_type)!.push(msg_content);
    }

    public pop(msg_type: uint): bytes | undefined {
        if(!this._messages.has(msg_type)) {
            return undefined;
        }
        return this._messages.get(msg_type)!.pop();
    }

    public clear(msg_type: uint) {
        this._messages.set(msg_type, new Queue<bytes>());
    }

    public async waitFor(msg_types: uint[]): Promise<Message> {
        while(true) {
            for(var i = 0; i < msg_types.length; ++i) {
                var res: bytes | undefined = this.pop(msg_types[i]);
                if(res != undefined) {
                    var a = new Message();
                    a.data = res;
                    a.id = null;
                    a.type = msg_types[i];

                    return a;
                }
            }
            await new Promise( resolve => setTimeout(resolve, 100));
        }
    }
}