import { buildField } from "../register";
import { FieldSerializer, ObjectWithSerializer } from '../interfaces';
import { Optional } from "../basic_types";

export const OptionalField = (field: Optional<any>) => {
    const fieldTyped: ObjectWithSerializer = field;

    const serializer: FieldSerializer<Optional<any>> = {
        serialize: (value, buf) => {
            let buf2: Buffer = Buffer.from([0]);
            if(value == null || fieldTyped.__serializer__ == undefined) {
                return Buffer.concat([buf, buf2]);
            }

            buf2.writeUInt8(1);
            buf2 = fieldTyped.__serializer__.serialize(value, buf2);
            return Buffer.concat([buf, buf2]);
        },
        deserialize: (buf) => {
            const containsAnything: boolean = buf.readUInt8() > 0;
            buf = buf.slice(1);
            if(!containsAnything || fieldTyped.__serializer__ == undefined) {
                return [null, buf];
            }

            const deserializationResult: [any, Buffer] = fieldTyped.__serializer__.deserialize(buf);
            const deserializedObj: any = deserializationResult[0];
            buf = deserializationResult[1];
            return [deserializedObj, buf];
        },
    };

    return buildField<Optional<any>>(serializer)();
};