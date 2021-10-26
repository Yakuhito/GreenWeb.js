// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/server/outbound_message.py#L36

import { RawData } from "ws";
import { Message } from "../types/outbound_message";
import { ProtocolMessageTypes } from "../types/protocol_message_types";

export function serialize(data: any) : RawData {
    return Buffer.from([1, 2, 3]);
}

export function make_msg(msg_type: ProtocolMessageTypes, data: any) : Message {
    return { 
        type: msg_type,
        id: 0,
        data: serialize(data),
    };
}