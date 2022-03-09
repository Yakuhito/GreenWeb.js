// Chia test code:
// https://github.com/Chia-Network/chia-blockchain/blob/main/tests/core/util/test_streamable.py

import fields from "./types/fields";
import { assert } from "chai";
import { uint, bytes, Optional } from "./basic_types";
import { Serializer } from "./serializer";
import { SExp } from "clvm";
import { BigNumber } from "@ethersproject/bignumber";

describe("Serializer", () => {
    describe("Chia TestStreamable", () => {
        class TestClass {
            @fields.Uint(32) a: uint;
            @fields.Uint(32) b: uint;
            @fields.List(fields.Uint(32)) c: uint[];
            @fields.List(fields.List(fields.Uint(32))) d: uint[][];
            @fields.Optional(fields.Uint(32)) e: Optional<uint>;
            @fields.Optional(fields.Uint(32)) f: Optional<uint>;
            @fields.Tuple([fields.Uint(32), fields.String(), fields.Bytes()]) g: [uint, string, bytes];
        }
        
        it("test_basic", () => {
            const a = new TestClass();
            a.a = 24;
            a.b = 352;
            a.c = [1, 2, 4];
            a.d = [[1, 2, 3], [3, 4]];
            a.e = 728;
            a.f = null;
            a.g = [383, "hello", Buffer.from("goodbye").toString("hex")];
        
            const serialized: Buffer = Serializer.serialize(a);
            const d: TestClass = Serializer.deserialize(TestClass, serialized);
        
            assert.isDefined(d);
            assert.instanceOf(d, TestClass);
            assert.equal(a.a, d.a);
            assert.equal(a.b, d.b);
            assert.equal(a.c.toString(), d.c.toString());
            assert.equal(a.d[0].toString(), d.d[0].toString());
            assert.equal(a.d[1].toString(), d.d[1].toString());
            assert.equal(a.e, d.e);
            assert.equal(a.f, d.f);
            assert.equal(a.g[0], d.g[0]);
            assert.equal(a.g[1], d.g[1]);
            assert.equal(a.g[2].toString(), d.g[2].toString());
        });
        
        class TestClass2 {
            @fields.Uint(32) a: uint;
            @fields.Uint(32) b: uint;
            @fields.Bytes() c: bytes;
        }
        
        it("test_variablesize", () => {
            const a = new TestClass2();
            a.a = 1;
            a.b = 2;
            a.c = Buffer.from("3").toString("hex");
        
            const serialized: Buffer = Serializer.serialize(a);
            
            assert.equal(serialized.toString("hex").length / 2, 4 + 4 + 4 + 1); // a - 4 bytes, b - 4 bytes, c - 4 (size) + 1 (data) bytes
        });
        
        class TestClassOptional {
            @fields.Optional(fields.Uint(8)) a: Optional<uint>;
        }
        
        it("test_ambiguous_deserialization_optionals", () => {
            const s1: Buffer = Buffer.from("");
            assert.throws(() => Serializer.deserialize(TestClassOptional, s1));
        
            const s2: Buffer = Buffer.from("00", "hex");
            const d2: TestClassOptional = Serializer.deserialize(TestClassOptional, s2);
            assert.isNull(d2.a);
        
            const s3: Buffer = Buffer.from("0102", "hex");
            const d3: TestClassOptional = Serializer.deserialize(TestClassOptional, s3);
            assert.equal(d3.a, 0x2);
        });
        
        class TestClassUint {
            @fields.Uint(32) a: uint;
        }
        
        it("test_ambiguous_deserialization_int", () => {
            const s1: Buffer = Buffer.from([0, 0]);
            assert.throws(() => Serializer.deserialize(TestClassUint, s1));
        });
        
        class TestClassList {
            @fields.List(fields.Uint(8)) a: uint[];
        }
        
        it("test_ambiguous_deserialization_list", () => {
            const s1: Buffer = Buffer.from([0, 0, 100, 24]);
            assert.throws(() => Serializer.deserialize(TestClassList, s1));
        });
        
        class TestClassTuple {
            @fields.Tuple([fields.Uint(8), fields.String()]) a: [uint, string];
        }
        
        it("test_ambiguous_deserialization_tuple", () => {
            const s1: Buffer = Buffer.from([0, 0, 100, 24]);
            assert.throws(() => Serializer.deserialize(TestClassTuple, s1));
        });
        
        class TestClassStr {
            @fields.String() a: string;
        }
        
        it("test_ambiguous_deserialization_str", () => {
            const s1: Buffer = Buffer.from([0, 0, 100, 24, 52]);
            assert.throws(() => Serializer.deserialize(TestClassStr, s1));
        
            const s2: Buffer = Buffer.from([0, 0, 0, 1]);
            assert.throws(() => Serializer.deserialize(TestClassStr, s2));
        
            const s3: Buffer = Buffer.from([0, 0, 0, 1, 52]);
            const d3: TestClassStr = Serializer.deserialize(TestClassStr, s3);
            assert.equal(d3.a, "4");
        
            const s4: Buffer = Buffer.from([0, 0, 0, 2, 52, 21]);
            const d4: TestClassStr = Serializer.deserialize(TestClassStr, s4);
            assert.equal(d4.a, "4\x15");
        });
        
        class TestClassBytes {
            @fields.Bytes() a: bytes;
        }
        
        it("test_ambiguous_deserialization_bytes", () => {
            const s1: Buffer = Buffer.from([0, 0, 100, 24, 52]);
            assert.throws(() => Serializer.deserialize(TestClassBytes, s1));
        
            const s2: Buffer = Buffer.from([0, 0, 0, 1]);
            assert.throws(() => Serializer.deserialize(TestClassBytes, s2));
        
            const s3: Buffer = Buffer.from([0, 0, 0, 1, 52]);
            const d3: TestClassBytes = Serializer.deserialize(TestClassBytes, s3);
            assert.equal(d3.a, Buffer.from([52]).toString("hex"));
        
            const s4: Buffer = Buffer.from([0, 0, 0, 2, 52, 21]);
            const d4: TestClassBytes = Serializer.deserialize(TestClassBytes, s4);
            assert.equal(d4.a, Buffer.from([52, 21]).toString("hex"));
        });
        
        class TestClassBool {
            @fields.Boolean() a: boolean;
        }
        
        it("test_ambiguous_deserialization_bool", () => {
            const s1: Buffer = Buffer.from([]);
            assert.throws(() => Serializer.deserialize(TestClassBool, s1));
        
            const s2: Buffer = Buffer.from([0]);
            const d2: TestClassBool = Serializer.deserialize(TestClassBool, s2);
            assert.equal(d2.a, false);
        
            const s3: Buffer = Buffer.from([1]);
            const d3: TestClassBool = Serializer.deserialize(TestClassBool, s3);
            assert.equal(d3.a, true);
        });
        
        class TestClassProgram {
            @fields.SExp() a: SExp;
        }
        
        it("test_ambiguous_deserialization_program", () => {
            const s1: Buffer = Buffer.from(SExp.to([]).toString(), "hex");
            const d1: TestClassProgram = Serializer.deserialize(TestClassProgram, s1);
            assert.equal(d1.a.toString(), SExp.to([]).toString());
        
            const s2: Buffer = Buffer.concat([s1, Buffer.from("9")]);
            // this test case doesn't make any sense...
            // assert.throw(() => Serializer.deserialize(TestClassProgram, s2));
            const d2: TestClassProgram = Serializer.deserialize(TestClassProgram, s2);
            assert.equal(d2.a.toString(), SExp.to([]).toString());
        });
        
        it("test_parse_bool", () => {
            assert.isTrue(
                Serializer.deserialize(TestClassBool, Buffer.from([1])).a
            );
        
            assert.isFalse(
                Serializer.deserialize(TestClassBool, Buffer.from([0])).a
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassBool, Buffer.from([]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassBool, Buffer.from([0xff]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassBool, Buffer.from([0x02]))
            );
        });
        
        class TestClassUintLittle {
            @fields.Uint(32, "little") a: uint;
        }
        
        it("test_uint32", () => {
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(TestClassUint, Buffer.from([0, 0, 0, 0])).a
                ).eq(0)
            );
        
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(TestClassUint, Buffer.from([0, 0, 0, 1])).a
                ).eq(1)
            );
        
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(TestClassUintLittle, Buffer.from([0, 0, 0, 1])).a
                ).eq(16777216)
            );
        
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(TestClassUint, Buffer.from([1, 0, 0, 0])).a
                ).eq(16777216)
            );

            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(TestClassUintLittle, Buffer.from([1, 0, 0, 0])).a
                ).eq(1)
            );
        
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(TestClassUintLittle, Buffer.from([0xff, 0xff, 0xff, 0xff])).a
                ).eq(4294967295)
            );
        
            
            const dBig: TestClassUint = new TestClassUint();
            const dLittle: TestClassUintLittle = new TestClassUintLittle();
        
            dBig.a = 1;
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(
                        TestClassUint, Serializer.serialize(dBig)
                    ).a,
                ).eq(1)
            );
        
            dLittle.a = 1;
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(
                        TestClassUintLittle, Serializer.serialize(dLittle)
                    ).a,
                ).eq(1)
            );
        
            dBig.a = 4294967295;
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(
                        TestClassUint, Serializer.serialize(dBig)
                    ).a,
                ).eq(4294967295)
            );
        
            dLittle.a = 4294967295;
            assert.isTrue(
                BigNumber.from(
                    Serializer.deserialize(
                        TestClassUintLittle, Serializer.serialize(dLittle)
                    ).a,
                ).eq(4294967295)
            );
        
        
            assert.throw(
                () => Serializer.deserialize(TestClassUint, Buffer.from([]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassUint, Buffer.from([0x0]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassUint, Buffer.from([0x0, 0x0]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassUint, Buffer.from([0x0, 0x0, 0x0]))
            );
        });
        
        class TestClassOptionalBool {
            @fields.Optional(fields.Boolean()) a: Optional<boolean>;
        }
        
        it("test_parse_optional", () => {
            assert.isNull(
                Serializer.deserialize(TestClassOptionalBool, Buffer.from([0])).a
            );
        
            assert.isTrue(
                Serializer.deserialize(TestClassOptionalBool, Buffer.from([1, 1])).a
            );
        
            assert.isFalse(
                Serializer.deserialize(TestClassOptionalBool, Buffer.from([1, 0])).a
            );
        
            
            assert.throw(
                () => Serializer.deserialize(TestClassOptionalBool, Buffer.from([1]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassOptionalBool, Buffer.from([2, 0]))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassOptionalBool, Buffer.from([0xff, 0xff]))
            );
        });
        
        it("test_parse_bytes", () => {
            assert.equal(
                Serializer.deserialize(TestClassBytes, Buffer.from([0, 0, 0, 0])).a,
                ""
            );
        
            assert.equal(
                Serializer.deserialize(TestClassBytes, Buffer.from([0, 0, 0, 1, 0xff])).a,
                "ff"
            );
        
            assert.equal(
                Serializer.deserialize(TestClassBytes, Buffer.concat([
                    Buffer.from([0, 0, 2, 0]),
                    Buffer.from("a".repeat(0x200))
                ])).a,
                Buffer.from("a".repeat(0x200)).toString("hex")
            );
        
            assert.equal(
                Serializer.deserialize(TestClassBytes, Buffer.concat([
                    Buffer.from([0, 0, 0, 0xff]),
                    Buffer.from("a".repeat(0xff))
                ])).a,
                Buffer.from("a".repeat(255)).toString("hex")
            );
        
        
            assert.throw(
                () => Serializer.deserialize(TestClassBytes, Buffer.from("000000ff010203", "hex"))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassBytes, Buffer.from("ffffffff", "hex"))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassBytes, Buffer.from("ffffffff" + "41".repeat(512), "hex"))
            );
        
            assert.throw(
                () => Serializer.deserialize(TestClassBytes, Buffer.from("00000201" + "42".repeat(512), "hex"))
            );
        });
        
        class TestClassListBool {
            @fields.List(fields.Boolean()) a: boolean[];
        }
        
        it("test_parse_list", () => {
            assert.equal(
                Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 0])).a.length,
                0
            );
        
            assert.equal(
                Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 1, 1])).a.toString(),
                "true"
            );
        
            assert.equal(
                Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 3, 1, 0, 1])).a.toString(),
                "true,false,true"
            );
        
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 1]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 0xff, 0, 0]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0xff, 0xff, 0xff, 0xff, 0x00, 0x00]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 1, 2]))
            );
        });
        
        it("test_parse_list", () => {
            assert.equal(
                Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 0])).a.length,
                0
            );
        
            assert.equal(
                Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 1, 1])).a.toString(),
                "true"
            );
        
            assert.equal(
                Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 3, 1, 0, 1])).a.toString(),
                "true,false,true"
            );
        
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 1]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 0xff, 0, 0]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0xff, 0xff, 0xff, 0xff, 0x00, 0x00]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassListBool, Buffer.from([0, 0, 0, 1, 2]))
            );
        });
        
        class TestClassTupleBool {
            @fields.Tuple([fields.Boolean(), fields.Boolean()]) a: [boolean, boolean];
        }
        
        class TestClassTupleEmpty {
            @fields.Tuple([]) a: [];
        }
        
        it("test_parse_tuple", () => {
            assert.equal(
                Serializer.deserialize(TestClassTupleEmpty, Buffer.from([])).a.length,
                0
            );
        
            assert.equal(
                Serializer.deserialize(TestClassTupleBool, Buffer.from([0, 0])).a.toString(),
                "false,false"
            );
        
            assert.equal(
                Serializer.deserialize(TestClassTupleBool, Buffer.from([0, 1])).a.toString(),
                "false,true"
            );
        
        
            assert.throws(
                () => Serializer.deserialize(TestClassTupleBool, Buffer.from([0, 2]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassTupleBool, Buffer.from([0]))
            );
        });
        
        it("est_parse_str", () => {
            assert.equal(
                Serializer.deserialize(TestClassStr, Buffer.from([0, 0, 0, 0])).a,
                ""
            );
        
            assert.equal(
                Serializer.deserialize(TestClassStr, Buffer.from([0, 0, 0, 1, 0x61])).a,
                "a"
            );
        
            assert.equal(
                Serializer.deserialize(TestClassStr, Buffer.concat([
                    Buffer.from([0, 0, 2, 0]),
                    Buffer.from("a".repeat(512))
                ])).a,
                "a".repeat(512)
            );
        
            assert.equal(
                Serializer.deserialize(TestClassStr, Buffer.concat([
                    Buffer.from([0, 0, 0, 0xff]),
                    Buffer.from("a".repeat(255))
                ])).a,
                "a".repeat(255)
            );
        
        
            assert.throws(
                () => Serializer.deserialize(TestClassStr, Buffer.from([0, 0, 0, 0xff, 1, 2, 3]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassStr, Buffer.from([0xff, 0xff, 0xff, 0xff]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassStr, Buffer.concat([
                    Buffer.from([0xff, 0xff, 0xff, 0xff]),
                    Buffer.from("a".repeat(512))
                ]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassStr, Buffer.concat([
                    Buffer.from([0, 0, 2, 1]),
                    Buffer.from("a".repeat(512))
                ]))
            );
        });
    });
});