// https://github.com/Chia-Network/chia-blockchain/blob/b7e8e9c9a67fd696cfa2c16747d64dc0c3224611/chia/protocols/shared_protocol.py#L24

import fields from "./fields";
import { uint } from "../basic_types";

export const PROTOCOL_VERSION = "0.0.33";

export enum Capability {
    BASE = 1,
}


export class Handshake {
    @fields.String() networkId: string;
    @fields.String() protocolVersion: string;
    @fields.String() softwareVersion: string;
    @fields.Uint(16) serverPort: uint;
    @fields.Uint(8) nodeType: uint;
    @fields.List(fields.Tuple([fields.Uint(16), fields.String()])) capabilities: Array<[uint, string]>;
}