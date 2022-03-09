import { assert } from "chai";
import { AddressUtil } from "../../util/address";
import * as greenweb from "../..";

/*
These tests use the original yakuSwap fee wallet address:
*/

const ADDRESS = "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3";
const PUZZLE_HASH = "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664"
const PUZZLE_HASH_0X: string = "0x" + PUZZLE_HASH;
const YAKU_ADDRESS = "yaku1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejqrlyg4k";

const addressUtil = greenweb.util.address;

describe("AddressUtil", () => {
    describe("puzzleHashToAddress", () => {
        it("Decodes puzzle hash correctly", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH),
                ADDRESS
            );
        });

        it("Decodes 0x puzzle hash correctly", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH_0X),
                ADDRESS
            );
        });

        it("Decodes Buffer puzzle hash correctly", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH),
                ADDRESS
            );
        });

        it("Works with other prefix", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH, "yaku"),
                YAKU_ADDRESS
            );
        });

        it("Recognzes invalid puzzle hash", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH.slice(0, 14)),
                ""
            );
        });

        it("Recognzes invalid 0x puzzle hash", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH_0X.slice(0, PUZZLE_HASH_0X.length - 1) + "y"),
                ""
            );
        });

        it("Recognzes invalid buf puzzle hash", () => {
            assert.equal(
                addressUtil.puzzleHashToAddress(PUZZLE_HASH.slice(20)),
                ""
            );
        });
    });

    describe("addressToPuzzleHash", () => {
        it("Works", () => {
            assert.equal(
                addressUtil.addressToPuzzleHash(ADDRESS),
                PUZZLE_HASH
            );
        });

        it("Recognizes invalid address", () => {
            assert.equal(
                addressUtil.addressToPuzzleHash(ADDRESS.slice(0, 21)),
                ""
            );
        });
    });
});