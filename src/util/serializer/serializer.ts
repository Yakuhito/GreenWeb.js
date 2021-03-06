// special thanks to this StackOverflow thread
// https://stackoverflow.com/questions/57086672/element-implicitly-has-an-any-type-because-expression-of-type-string-cant-b

import { propertySerializerName } from "./register";
import { IPropsType } from "./interfaces";
import { RespondBlockHeader } from "./types/wallet_protocol";

// This class is a port of the 'Streamable' class from
// https://github.com/Chia-Network/chia-blockchain/blob/main/chia/util/streamable.py#L260
export class Serializer {
    // for some reason, serializing objects for hashing != serializing objects for the comm protocol
    static serialize<T>(object: T): Buffer {
        let buf: Buffer = Buffer.from([]);
        const props: IPropsType = Object.getPrototypeOf(object)[propertySerializerName];

        for (const prop of Object.keys(props)) {
            buf = props[prop].serialize(object[prop as keyof T], buf);
        }

        return buf;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static deserialize<T>(classType: new (...args: any[]) => T, data: string | Buffer): T {
        let buf: Buffer = data instanceof Buffer ? data : Buffer.from(data, "hex");
        const props: IPropsType = classType.prototype[propertySerializerName];
        const result = new classType();

        for (const prop of Object.keys(props)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const deserializationResult: [any, Buffer] = props[prop].deserialize(buf);
            
            result[prop as keyof typeof result] = deserializationResult[0];
            buf = deserializationResult[1];
        }

        return result;
    }
}