// https://github.com/Chia-Network/chia-blockchain/blob/6205d954e8ac2ea40ee7386b1ee3124da21f4c4a/chia/types/blockchain_format/proof_of_space.py#L20

import { fields } from "../serializer";
import { uint, bytes, Optional } from "../serializer/basic_types";

export class ProofOfSpace {
    @fields.Bytes(32) challenge: bytes;
    @fields.Optional(fields.Bytes(48)) pool_public_key: Optional<bytes>;
    @fields.Optional(fields.Bytes(32)) pool_contract_puzzle_hash: Optional<bytes>;
    @fields.Bytes(48) plot_public_key: bytes;
    @fields.Uint(8) size: uint;
    @fields.VariableSizeBytes() proof: bytes;
}