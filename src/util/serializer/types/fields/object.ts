/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildField, propertySerializerName } from "../../register";
import { FieldSerializer, IPropsType } from "../../interfaces";

export const ObjectField = (objClass: any) => {
    const serializer: FieldSerializer<typeof objClass> = {
        serialize: (value, buf) => {
            const props: IPropsType = Object.getPrototypeOf(value)[propertySerializerName];

            for (const propName of Object.keys(props)) {
                buf = props[propName].serialize(value[propName as keyof typeof value], buf);
            }

            return buf;
        },
        deserialize: (buf) => {
            const props: IPropsType = objClass.prototype[propertySerializerName];
            const obj: typeof objClass = new objClass();

            for (const prop of Object.keys(props)) {
                const deserializationResult: [any, Buffer] = props[prop].deserialize(buf);
    
                obj[prop as keyof typeof obj] = deserializationResult[0];
                buf = deserializationResult[1];
            }

            return [obj, buf];
        },
    };

    return buildField<any>(serializer)();
};