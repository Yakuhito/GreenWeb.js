// special thanks to this StackOverflow thread
// https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b

import { propertySerializerName } from './register';
import { IPropsType } from './interfaces';

const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];

export class Serializer {
    
    static serialize<T>(object: T): Buffer {
        var buf: Buffer = Buffer.from([]);
        const props: IPropsType = Object.getPrototypeOf(object)[propertySerializerName];

        for (const prop in props) {
            buf = props[prop].serialize(object[prop as keyof T], buf);
        }

        return buf;
    }

    static deserialize<T>(classType: new (...args: any[]) => T, buffer: Buffer): T {
        var buf: Buffer = Buffer.from([])
        const props: IPropsType = classType.prototype[propertySerializerName];
        const result = new classType();

        for (const prop in props) {
            const deserializationResult: [any, Buffer] = props[prop].deserialize(buf);
            
            result[prop as keyof typeof result] = deserializationResult[0];
            buf = deserializationResult[1];
        }

        return result;
    }
}