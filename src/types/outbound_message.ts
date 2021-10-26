// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/server/outbound_message.py#L36

import { RawData } from "ws";
import { uint8, uint16 } from "./uints";
import { Optional } from "./optional";

export enum NodeType {
    FULL_NODE = 1,
    HARVESTER = 2,
    FARMER = 3,
    TIMELORD = 4,
    INTRODUCER = 5,
    WALLET = 6
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

export type Message = {
    type: uint8,
    id: Optional<uint16>,
    data: RawData,
}