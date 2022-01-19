// special thanks to https://github.com/bernatvadell/ts-buffer-serializer

import fields from "./types/fields";
import types from "./types";
import { Serializer } from "./serializer";

export class SerializerUtil {
    public fields = fields;
    public types = types;
    public serialize<T>(object: T): string {
        return Serializer.serialize(object).toString('hex');
    }
    public deserialize<T>(classType: new (...args: any[]) => T, data: string): T {
        return Serializer.deserialize<T>(classType, data);
    }
}