import { buildField } from "../register";
import { uint, bytes } from "../basic_types";

export const BytesField = buildField<bytes>({
    serialize: (value, buf) => {
        var buf2 : Buffer = Buffer.alloc(4);
        buf2.writeUInt32BE(value.length);
        return Buffer.concat([buf, buf2, value]);
    },
    deserialize: (buf) => {
        const size: uint = buf.readUInt32BE();
        buf = buf.slice(4);
        return [
            buf.slice(0, size),
            buf.slice(size),
        ];
    }
});