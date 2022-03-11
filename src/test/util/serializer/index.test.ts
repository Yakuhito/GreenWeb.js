import { assert } from "chai";
import { SerializerUtil } from "../../../util/serializer";
import { Optional, uint } from "../../../util/serializer/basic_types";
import fields from "../../../util/serializer/types/fields";

const SERIALIZED_YAK = "01000000050000000d000000070000002a00000045000001a40100000018546f20636f6c6c6563742031204d61726d6f7420436f696e";

/* Sanity check for SerializerUtil */
describe("SerializerUtil", () => {
    class Yak {
        @fields.Boolean() developer = true;
        @fields.List(fields.Uint(32)) favouriteNumbers: uint[] = [13, 7, 42, 69, 420];
        // some peple haven't found their true purpose yet
        // so sad
        @fields.Optional(fields.String()) goalInLife: Optional<string> = "To collect 1 Marmot Coin";
    }

    it("serialize()", () => {
        // eslint-disable-next-line max-len
        const testYak: Yak = new Yak();
        const res: string = new SerializerUtil().serialize(testYak);

        assert.equal(res, SERIALIZED_YAK);
    });
    
    it("deserialize()", () => {
        // eslint-disable-next-line max-len
        const testYak = new SerializerUtil().deserialize(
            Yak,
            SERIALIZED_YAK
        );

        assert.isDefined(testYak);
        assert.instanceOf(testYak, Yak);
        assert.equal(testYak.developer, true);
        assert.equal(testYak.favouriteNumbers.length, 5);
        assert.equal(testYak.favouriteNumbers.toString(), "13,7,42,69,420");
        assert.equal(testYak.goalInLife, "To collect 1 Marmot Coin");
    });
});