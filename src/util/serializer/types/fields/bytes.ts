import { buildField } from "../../register";
import { FieldSerializer } from "../../interfaces";
import { bytes, uint } from "../../basic_types";

export const BytesField = (size: number | null = null) => {
    const serializer: FieldSerializer<bytes> = {
        serialize: (value, buf) => {
            const val: Buffer = Buffer.from(value, "hex");
            if(size == null) {
                const buf2 : Buffer = Buffer.alloc(4);
                buf2.writeUInt32BE(val.length);
                return Buffer.concat([buf, buf2, val]);
            }
            return Buffer.concat([buf, val]);
        },
        deserialize: (buf) => {
            if(size == null) {
                if(buf.length < 4) throw new Error();
                const size: uint = buf.readUInt32BE();
                buf = buf.slice(4);

                if(buf.length < size) throw new Error();
                return [
                    buf.slice(0, size).toString("hex"),
                    buf.slice(size),
                ];
            }

            if(buf.length < size) throw new Error();
            return [
                buf.slice(0, size).toString("hex"),
                buf.slice(size),
            ];
        },
    };

    return buildField<bytes>(serializer)();
};