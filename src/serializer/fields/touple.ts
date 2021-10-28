import { buildField } from "../register";
import { FieldSerializer, ObjectWithSerializer } from '../interfaces';
import { uint32 } from "../basic_types";

export const ToupleField = (fields: [...types: any]) => {
    const serializer: FieldSerializer<[...types: any]> = {
        serialize: (value, buf) => {
            if(fields.length !== value.length)
                return buf;

            const buf2 : Buffer = Buffer.alloc(4);
            buf2.writeUInt32BE(value.length);

            let buf3: Buffer = Buffer.from([]);
            for(let i = 0; i < value.length; ++i) {
                const fieldTyped: ObjectWithSerializer = fields[i];
                buf3 = fieldTyped.__serializer__!.serialize(value[i], buf3);
            }
            return Buffer.concat([buf, buf2, buf3]);
        },
        deserialize: (buf) => {
            const size: uint32 = buf.readUInt32BE();
            buf = buf.slice(4);
            if(size !== fields.length) {
                return [[], buf];
            }

            const arr: any[] = [];
            for(let i = 0; i < size; ++i) {
                const fieldTyped: ObjectWithSerializer = fields[i];
                const deserializationResult: [any, Buffer] = fieldTyped.__serializer__!.deserialize(buf);
                const deserializedObj: any = deserializationResult[0];
                buf = deserializationResult[1];

                arr.push(deserializedObj);
            }

            const resTyped: [...types: any] = arr;
            return [resTyped, buf];
        },
    };

    return buildField<any[]>(serializer)();
};