import fields from "../../../util/serializer/types/fields";
import { assert } from "chai";
import { uint, Optional } from "../../../util/serializer/basic_types";
import { Serializer } from "../../../util/serializer/serializer";

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
	someOtherBytes: bytes4
	uint32Array: List[uint32]
	totallyOptionalString: Optional[str]
	tupleThinf: Tuple[uint32, str]
	someUint32: uint32

a = TestClass(True, bytes.fromhex('13333337'), bytes.fromhex('24444448'), [1, 2, 3, 4], "message", (1, "Hello World!"), 1337)
print(bytes(a).hex())

b = TestClass(False, bytes.fromhex('133337'), bytes.fromhex('24444448'), [], None, (1, "Hello World!"), 0)
print(bytes(b).hex())
*/

describe("Serializer", () => {
    describe("TestClass", () => {
        class TestClass {
            @fields.Boolean() someBool = true;
            @fields.Bytes() someBytes: Buffer = Buffer.from([0x13, 0x33, 0x33, 0x37]);
            @fields.Bytes(4) someOtherBytes = Buffer.from([0x24, 0x44, 0x44, 0x48]);
            @fields.List(fields.Uint(32)) uint32Array: uint[] = [1, 2, 3, 4];
            @fields.Optional(fields.String()) totallyOptionalString: Optional<string> = "message";
            @fields.Tuple([fields.Uint(32), fields.String()]) tupleThing: [uint, string] = [1, "Hello World!"];
            @fields.Uint(32) someUint32: uint = 1337;
        }
    
        describe("Test 1", () => {
            it("serialize()", () => {
                // eslint-disable-next-line max-len
                const expectedOutput = "01000000041333333724444448000000040000000100000002000000030000000401000000076d657373616765000000010000000c48656c6c6f20576f726c642100000539";
                const testObj = new TestClass();
                const buff = Serializer.serialize(testObj);
            
                assert.equal(buff.toString("hex"), expectedOutput);
            });

            it("deserialize()", () => {
                // eslint-disable-next-line max-len
                const input = "01000000041333333724444448000000040000000100000002000000030000000401000000076d657373616765000000010000000c48656c6c6f20576f726c642100000539";
                const testObj = Serializer.deserialize(
                    TestClass,
                    Buffer.from(input, "hex")
                );
            
                assert.isDefined(testObj);
                assert.instanceOf(testObj, TestClass);
                assert.equal(testObj.someBool, true);
                assert.equal(testObj.someBytes.toString("hex"), "13333337");
                assert.equal(testObj.someOtherBytes.toString("hex"), "24444448");
                assert.equal(testObj.uint32Array.toString(), "1,2,3,4");
                assert.equal(testObj.totallyOptionalString, "message");
                assert.equal(testObj.tupleThing[0], 1);
                assert.equal(testObj.tupleThing[1], "Hello World!");
                assert.equal(testObj.someUint32, 1337);
            });
        });

        describe("Test 2", () => {
            it("serialize()", () => {
                const expectedOutput = "0000000003133337244444480000000000000000010000000c48656c6c6f20576f726c642100000000";
                const testObj = new TestClass();
                testObj.someBool = false;
                testObj.someBytes = Buffer.from([0x13, 0x33, 0x37]);
                testObj.uint32Array = [];
                testObj.totallyOptionalString = null;
                testObj.someUint32 = 0;
            
                const buff = Serializer.serialize(testObj);
            
                assert.equal(buff.toString("hex"), expectedOutput);
            });

            it("deserialize()", () => {
                const input = "0000000003133337244444480000000000000000010000000c48656c6c6f20576f726c642100000000";
                const testObj = Serializer.deserialize(
                    TestClass,
                    Buffer.from(input, "hex")
                );
            
                assert.isDefined(testObj);
                assert.instanceOf(testObj, TestClass);
                assert.equal(testObj.someBool, false);
                assert.equal(testObj.someBytes.toString("hex"), "133337");
                assert.equal(testObj.someOtherBytes.toString("hex"), "24444448");
                assert.equal(testObj.uint32Array.length, 0);
                assert.equal(testObj.totallyOptionalString, null);
                assert.equal(testObj.tupleThing[0], 1);
                assert.equal(testObj.tupleThing[1], "Hello World!");
                assert.equal(testObj.someUint32, 0);
            });
        });
    });
});