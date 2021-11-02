import { buildField } from "../register";
import { FieldSerializer } from '../interfaces';
import { uint } from "../basic_types";

export const UintField = (size: number, byteorder: "big" | "little" = "big") => {
    const serializer: FieldSerializer<uint> = {
        serialize: (value, buf) => {
            var s: string = value.toString(16);
            if(s.length < size / 4) {
                var diff: number = size / 4 - s.length;
                s = "0".repeat(diff) + s;
            }
            if(byteorder === "little") {
                s = s.match(/../g)!.reverse().join('');
            }
            const buf2 : Buffer = Buffer.from(s, "hex");
            return Buffer.concat([buf, buf2]);
        },
        deserialize: (buf) => {
            const numOfBytes: number = size / 8;
            if(buf.length <  numOfBytes) throw new Error();
            
            const buf2 = buf.slice(0, numOfBytes);
            buf = buf.slice(numOfBytes);

            var num: number;
            if(byteorder === "little") {
                num = parseInt(buf2.toString('hex').match(/../g)!.reverse().join(''), 16);
            } else {
                num = parseInt(buf2.toString('hex'), 16);
            }
            return [num, buf];
        },
    };

    return buildField<uint>(serializer)();
};