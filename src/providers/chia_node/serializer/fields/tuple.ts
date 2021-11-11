/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildField } from "../register";
import { FieldSerializer, ObjectWithSerializer } from "../interfaces";

export const TupleField = (fields: [...types: any]) => {
    const serializer: FieldSerializer<[...types: any]> = {
        serialize: (value, buf) => {
            let buf3: Buffer = Buffer.from([]);
            for(let i = 0; i < value.length; ++i) {
                const fieldTyped: ObjectWithSerializer = fields[i];
                buf3 = fieldTyped.__serializer__!.serialize(value[i], buf3);
            }
            return Buffer.concat([buf, buf3]);
        },
        deserialize: (buf) => {
            const arr: any[] = [];
            for(let i = 0; i < fields.length; ++i) {
                const fieldTyped: ObjectWithSerializer = fields[i];
                const deserializationResult: [any, Buffer] = fieldTyped.__serializer__!.deserialize(buf);
                const deserializedObj: any = deserializationResult[0];
                buf = deserializationResult[1];
                if(buf.length === 0 && i < fields.length - 1) throw new Error();

                arr.push(deserializedObj);
            }

            const resTyped: [...types: any] = arr;
            return [resTyped, buf];
        },
    };

    return buildField<any[]>(serializer)();
};