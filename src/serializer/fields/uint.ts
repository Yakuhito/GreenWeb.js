import { buildField } from "../register";
import { FieldSerializer } from '../interfaces';
import { uint } from "../basic_types";

export const UintField = (size: number) => {
    const serializer: FieldSerializer<uint> = {
        serialize: (value, buf) => {
            var s: string = value.toString(16);
            if(s.length < size / 4) {
                var diff: number = size / 4 - s.length;
                s = "0".repeat(diff) + s;
            }
            const buf2 : Buffer = Buffer.from(s, "hex");
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