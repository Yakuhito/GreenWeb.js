// https://github.com/Chia-Network/chia-blockchain/blob/b7e8e9c9a67fd696cfa2c16747d64dc0c3224611/chia/protocols/shared_protocol.py#L24

import { fields } from "../serializer";
import { uint } from "../serializer/basic_types";

export const protocol_version = "0.0.33";

export enum Capability {
    BASE = 1,
}


export class Handshake {
    @fields.String() network_id: string;
    @fields.String() protocol_version: string;
    @fields.String() software_version: string;
    @fields.Uint(16) server_port: uint;
    @fields.Uint(8) node_type: uint;
    @fields.List(fields.Tuple([fields.Uint(16), fields.String()])) capabilities: [uint, string][];
}