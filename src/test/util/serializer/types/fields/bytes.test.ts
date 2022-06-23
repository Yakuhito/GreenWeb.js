import { expect } from "chai";
import { Serializer } from "../../../../../util/serializer/serializer";
import fields from "../../../../../util/serializer/types/fields";
import { bytes } from "../../../../../xch/providers/provider_types";

describe("BytesField", () => {
    class TestClass {
        @fields.Bytes(32) var: bytes;
    }

    it("Slices a sized field if the given string is too long", () => {
        const c: TestClass = new TestClass();
        c.var = "42".repeat(1337);

        const serialized = Serializer.serialize(c);
        expect(
            serialized.toString("hex")
        ).to.equal("42".repeat(32));
    });

    it("Fills up a sized field if the given string is too short", () => {
        const c: TestClass = new TestClass();
        c.var = "42".repeat(7);

        const serialized = Serializer.serialize(c);
        expect(
            serialized.toString("hex")
        ).to.equal("42".repeat(7) + "00".repeat(32 - 7));
    });
});