import { buildField } from "../register";
import { FieldSerializer } from '../interfaces';
import { bytes } from "../basic_types";

export const BytesField = (size: number) => {
    const serializer: FieldSerializer<bytes> = {
        serialize: (value, buf) => {
            return Buffer.concat([buf, value]);
        },
        deserialize: (buf) => {
            return [
                buf.slice(0, size),
                buf.slice(size),
            ];
        },
    };

    return buildField<bytes>(serializer)();
};