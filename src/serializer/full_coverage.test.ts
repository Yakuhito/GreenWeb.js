import fields from './fields';
import { assert } from 'chai';
import { uint, bytes } from "./basic_types";
import { Serializer } from "./serializer";

// chia.test.ts does not cover a few lines of code
// they were bugging me in the test coverage table


describe('Serializer', () => {
    describe('Chia TestStreamable (extra)', () => {
        class TestClassBytes {
            @fields.Bytes() a: bytes;
        }
        
        class TestClassBytes32 {
            @fields.Bytes(32) a: bytes;
        }

        it("test_parse_bytes", () => {
            assert.throws(
                () => Serializer.deserialize(TestClassBytes, Buffer.from([]))
            );
        
            assert.throws(
                () => Serializer.deserialize(TestClassBytes32, Buffer.from("a".repeat(31)))
            );
        });

        class TestClassList {
            @fields.List(fields.Uint(8)) a: uint[];
        }

        it("test_parse_list", () => {
            assert.throws(
                () => Serializer.deserialize(TestClassList, Buffer.from([]))
            );
        });
    });
});