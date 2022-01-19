// special thanks to https://github.com/bernatvadell/ts-buffer-serializer

import fields from "./types/fields";
import types from "./types";
import { Serializer } from "./serializer";

export class SerializerUtil {
    public fields = fields;
    public types = types;
    public serialize<T>(object: T): Buffer {
        return Serializer.serialize(object);
    }
    public deserialize<T>(classType: new (...args: any[]) => T, data: string | Buffer): T {
        return Serializer.deserialize<T>(classType, data);
    }
}