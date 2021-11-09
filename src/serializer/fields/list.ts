/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildField } from "../register";
import { FieldSerializer, ObjectWithSerializer } from "../interfaces";
import { uint } from "../basic_types";

export const ListField = (field: any) => {
    const fieldTyped: ObjectWithSerializer = field;
    
    const serializer: FieldSerializer<any[]> = {
        serialize: (value, buf) => {
            const buf2 : Buffer = Buffer.alloc(4);
            buf2.writeUInt32BE(value.length);

            let buf3: Buffer = Buffer.from([]);
            for(let i = 0; i < value.length; ++i) {
                const item: any = value[i];
                buf3 = fieldTyped.__serializer__!.serialize(item, buf3);
            }
            return Buffer.concat([buf, buf2, buf3]);
        },
        deserialize: (buf) => {
            if(buf.length < 4) throw new Error();
            const size: uint = buf.readUInt32BE();
            buf = buf.slice(4);
            
            const arr: any[] = [];
            for(let i = 0; i < size; ++i) {
                const deserializationResult: [any, Buffer] = fieldTyped.__serializer__!.deserialize(buf);
                const deserializedObj: any = deserializationResult[0];
                buf = deserializationResult[1];
                if(buf.length === 0 && i !== size - 1) throw new Error();

                arr.push(deserializedObj);
            }
            return [arr, buf];
        },
    };

    return buildField<any[]>(serializer)();
};