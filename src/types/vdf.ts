// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/vdf.py#L49

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";

export class VDFInfo {
    @fields.Bytes(32) challenge: bytes;
    @fields.Uint(64) number_of_iterations: uint;
    @fields.Bytes(100) output: bytes; // ClassgroupElement
}


export class VDFProof {
    @fields.Uint(8) witness_type: uint;
    @fields.VariableSizeBytes() witness: bytes;
    @fields.Boolean() normalized_to_identity: boolean;
}