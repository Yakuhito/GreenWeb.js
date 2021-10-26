// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/protocols/shared_protocol.py

import { uint8, uint16 } from "./uints";

export const protocol_version: string = "0.0.33"

export enum Capability {
    BASE = 1
}

export type Handshake = {
    network_id: string,
    protocol_version: string,
    software_version: string,
    server_port: uint16,
    node_type: uint8,
    capabilities: [uint16, string][]
}