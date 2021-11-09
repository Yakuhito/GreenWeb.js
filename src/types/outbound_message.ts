// https://github.com/Chia-Network/chia-blockchain/blob/b7e8e9c9a67fd696cfa2c16747d64dc0c3224611/chia/server/outbound_message.py#L10

import { fields , Serializer } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";
import { ProtocolMessageTypes } from "./protocol_message_types";

export enum NodeType {
    FULL_NODE = 1,
    HARVESTER = 2,
    FARMER = 3,
    TIMELORD = 4,
    INTRODUCER = 5,
    WALLET = 6,
}

export enum Delivery {
    // A message is sent to the same peer that we received a message from
    RESPOND = 1,
    // A message is sent to all peers
    BROADCAST = 2,
    // A message is sent to all peers except the one from which we received the API call
    BROADCAST_TO_OTHERS = 3,
    // A message is sent to a random peer
    RANDOM = 4,
    // Pseudo-message to close the current connection
    CLOSE = 5,
    // A message is sent to a speicific peer
    SPECIFIC = 6
}


export class Message {
    @fields.Uint(8) type: uint;
    @fields.Optional(fields.Uint(16)) id: Optional<uint>;
    @fields.Bytes() data: bytes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeMsg(msgType: ProtocolMessageTypes, data: any): bytes {
    const msg: Message = new Message();
    msg.type = msgType;
    msg.id = null;
    msg.data = Serializer.serialize(data);

    return Serializer.serialize(msg);
}