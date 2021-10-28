import { buildField } from "../register";
import { FieldSerializer } from '../interfaces';
import { bytes } from "../basic_types";

export const FixedSizeBytesField = (size: number) => {
    const serializer: FieldSerializer<bytes> = {
        serialize: (value, buf) => {
            return Buffer.concat([buf, value]);
        },
        deserialize: (buf) => {
            const numOfBytes: number = size / 8;
            
            return [
                buf.slice(0, numOfBytes),
                buf.slice(numOfBytes),
            ];
        },
    };

    return buildField<bytes>(serializer)();
};