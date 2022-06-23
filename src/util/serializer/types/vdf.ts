// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/vdf.py#L49

import fields from "./fields";
import { uint, bytes } from "../basic_types";

export class VDFInfo {
    @fields.Bytes(32) challenge: bytes;
    @fields.Uint(64) numberOfIterations: uint;
    @fields.Bytes(100) output: bytes; // ClassgroupElement
}


export class VDFProof {
    @fields.Uint(8) witnessType: uint;
    @fields.Bytes() witness: bytes;
    @fields.Boolean() normalizedToIdentity: boolean;
}