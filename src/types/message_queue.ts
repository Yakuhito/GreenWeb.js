import { uint, bytes } from '../serializer/basic_types';
import { Queue } from './queue';

export class MessageQueue {
    private readonly _messages: Map<uint, Queue<bytes>> = new Map();

    public push(msg_type: uint, msg_content: bytes) {
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
}