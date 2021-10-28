import fields from './fields';
import { assert } from 'chai';
import { uint32, bytes, Optional } from "./basic_types";
import { Serializer } from "./serializer";

class TestClass {
    @fields.Boolean() someBool: boolean = true;
    @fields.Bytes() someBytes: bytes = Buffer.from([0x13, 0x33, 0x33, 0x37]);
    @fields.List(fields.Uint32()) unit32Array: uint32[] = [1, 2, 3, 4];
    @fields.Optional(fields.String()) totallyOptionalString: Optional<string> = "message";
    @fields.Tuple([fields.Uint32(), fields.String()]) tupleThing: [uint32, string] = [1, "Hello World!"];
    @fields.Uint32() someUint32: uint32 = 1337;
}

/*
from chia.util.streamable import Streamable, streamable
from chia.util.ints import uint8, uint32, uint128
from chia.types.blockchain_format.sized_bytes import bytes4
from typing import List, Optional, Tuple
from dataclasses import dataclass

@dataclass(frozen=True)
@streamable
class TestClass(Streamable):
	someBool: bool
	someBytes: bytes
	uint32Array: List[uint32]
	totallyOptionalString: Optional[str]
	tupleThinf: Tuple[uint32, str]
	someUint32: uint32

a = TestClass(True, bytes.fromhex('13333337'), [1, 2, 3, 4], "message", (1, "Hello World!"), 1337)
print(bytes(a).hex())
*/

it("Serializer.serialize() - test 1", () => {
    const expectedOutput: string = "010000000413333337000000040000000100000002000000030000000401000000076d657373616765000000010000000c48656c6c6f20576f726c642100000539";
    const testObj = new TestClass();
    const buff = Serializer.serialize(testObj);

    assert.equal(buff.toString('hex'), expectedOutput);
});