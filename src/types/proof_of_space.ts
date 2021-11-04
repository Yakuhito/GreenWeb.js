// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/proof_of_space.py#L20

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";

export class ProofOfSpace {
    @fields.Bytes(32) challenge: bytes;
    @fields.Optional(fields.Bytes(48)) poolPublicKey: Optional<bytes>;
    @fields.Optional(fields.Bytes(32)) poolContractPuzzleHash: Optional<bytes>;
    @fields.Bytes(48) plotPublicKey: bytes;
    @fields.Uint(8) size: uint;
    @fields.Bytes() proof: bytes;
}