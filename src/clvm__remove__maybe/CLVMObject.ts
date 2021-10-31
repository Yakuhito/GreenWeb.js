// https://github.com/Chia-Mine/clvm-js
import { bytes, Optional } from "../serializer/basic_types";

export type CLVMType = {
    atom: Optional<bytes>;
    pair: Optional<[any, any]>;
};
export type Atom = {
    atom: bytes;
    pair: null;
  };
  export type Cons = {
    atom: null;
    pair: [any, any];
  };

export class CLVMObject {
    private readonly _atom: Optional<bytes>;
    private readonly _pair: Optional<[any, any]>;
    
    get atom() { return this._atom; };
    get pair() { return this._pair; };

    constructor(v: any) {
        if(v instanceof CLVMObject) {
            this._atom = v.atom;
            this._pair = v.pair;
        } else if(v instanceof Array) {
            if(v.length !== 2) {
                throw new Error("tuples must be of size 2, cannot create CLVMObject from: " + v.toString());
            }
            const typedV: [any, any] = [0, 0];
            typedV[0] = v[0];
            typedV[1] = v[1];
            this._pair = typedV;
            this._atom = null;
        } else {
            this._pair = null;
            this._atom = v;
        }
    }
}

export function isAtom(obj: CLVMType): obj is Atom {
    if((obj.atom && obj.pair) || (!obj.atom && !obj.pair)){
        throw new Error("Invalid clvm: " + obj.toString());
    }
    
    return Boolean(obj.atom && !obj.pair);
}
  
export function isCons(obj: CLVMType): obj is Cons {
    if((obj.atom && obj.pair) || (!obj.atom && !obj.pair)){
        throw new Error("Invalid clvm" + obj.toString());
    }
    
    return Boolean((!obj.atom && obj.pair));
}

export function isCLVMObject(v: any): v is CLVMType {
    return v && typeof v.atom !== "undefined" && typeof v.pair !== "undefined";
}