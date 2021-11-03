import { assert } from "chai";
import { AddressUtil } from "./address";

/*
These tests use the original yakuSwap fee wallet address:
*/

const ADDRESS: string = "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3";
const PUZZLE_HASH: string = "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664"
const PUZZLE_HASH_0x: string = "0x" + PUZZLE_HASH;
const PUZZLE_HASH_buf: Buffer = Buffer.from(PUZZLE_HASH, "hex");
const YAKU_ADDRESS: string = "yaku1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejqrlyg4k";

describe('AddressUtil', () => {
    describe('puzzleHashToAddress', () => {
        it('Decodes puzzle hash correctly', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH),
                ADDRESS
            );
        });

        it('Decodes 0x puzzle hash correctly', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH_0x),
                ADDRESS
            );
        });

        it('Decodes Buffer puzzle hash correctly', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH_buf),
                ADDRESS
            );
        });

        it('Works with other prefix', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH_buf, "yaku"),
                YAKU_ADDRESS
            );
        });

        it('Recognzes invalid puzzle hash', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH.slice(0, 14)),
                ""
            );
        });

        it('Recognzes invalid 0x puzzle hash', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH_0x.slice(0, PUZZLE_HASH_0x.length - 1) + "y"),
                ""
            );
        });

        it('Recognzes invalid buf puzzle hash', () => {
            assert.equal(
                AddressUtil.puzzleHashToAddress(PUZZLE_HASH_buf.slice(20)),
                ""
            );
        });
    });

    describe('addressToPuzzleHash', () => {
        it('Works', () => {
            assert.equal(
                AddressUtil.addressToPuzzleHash(ADDRESS).toString("hex"),
                PUZZLE_HASH
            );
        });

        it('Recognizes invalid address', () => {
            assert.equal(
                AddressUtil.addressToPuzzleHash(ADDRESS.slice(0, 21)).toString("hex"),
                ""
            );
        });
    });
});