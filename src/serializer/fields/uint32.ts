import { buildField } from "../register";
import { uint32 } from "../basic_types";

export const Uint32Field = buildField<uint32>({
    serialize: (value, buf) => {
        var buf2 : Buffer = Buffer.alloc(4);
        buf2.writeUInt32BE(value);
        return Buffer.concat([buf, buf2]);
    },
    deserialize: (buf) => {
        return [
            buf.readUInt32BE(),
            buf.slice(4),
        ];
    }
});