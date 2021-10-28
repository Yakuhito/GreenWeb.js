import { buildField } from "../register";
import { uint32 } from "../basic_types";

export const BytesField = buildField<string>({
    serialize: (value, buf) => {
        const buf2 : Buffer = Buffer.alloc(4);
        const buf3 : Buffer = Buffer.from(value);
        buf2.writeUInt32BE(value.length);
        return Buffer.concat([buf, buf2, buf3]);
    },
    deserialize: (buf) => {
        const size: uint32 = buf.readUInt32BE();
        buf = buf.slice(4);
        return [
            buf.slice(0, size).toString(),
            buf.slice(size),
        ];
    }
});