import { buildField } from "../register";
import { FieldSerializer } from '../interfaces';
import { uint } from "../basic_types";

export const UintField = (size: number) => {
    const serializer: FieldSerializer<uint> = {
        serialize: (value, buf) => {
            var buf2 : Buffer = Buffer.alloc(size / 8);
            buf2.writeUInt32BE(value);
            return Buffer.concat([buf, buf2]);
        },
        deserialize: (buf) => {
            const numOfBytes: number = size / 8;
            const buf2 = buf.slice(0, numOfBytes);
            buf = buf.slice(numOfBytes);

            const num: number = parseInt(buf2.toString('hex'), 16);
            return [num, buf];
        },
    };

    return buildField<uint>(serializer)();
};