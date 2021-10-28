import { buildField } from "../register";
import { FieldSerializer, ObjectWithSerializer } from '../interfaces';
import { uint32 } from "../basic_types";

export const ListField = (field: any) => {
    const fieldTyped: ObjectWithSerializer = field;
    
    const serializer: FieldSerializer<Array<any>> = {
        serialize: (value, buf) => {
            const buf2 : Buffer = Buffer.alloc(4);
            buf2.writeUInt32BE(value.length);

            var buf3: Buffer = Buffer.from([]);
            for(let item in value) {
                buf3 = fieldTyped.__serializer__!.serialize(item, buf3);
            }
            return Buffer.concat([buf, buf2, buf3]);
        },
        deserialize: (buf) => {
            const size: uint32 = buf.readUInt32BE();
            buf = buf.slice(4);
            if(size == 0 || fieldTyped.__serializer__ == undefined) {
                return [[], buf];
            }

            var arr: Array<any> = [];
            for(var i = 0; i < size; ++i) {
                const deserializationResult: [any, Buffer] = fieldTyped.__serializer__.deserialize(buf);
                const deserializedObj: any = deserializationResult[0];
                buf = deserializationResult[1];

                arr.push(deserializedObj);
            }
            return [arr, buf];
        },
    };

    return buildField<Array<any>>(serializer)();
};