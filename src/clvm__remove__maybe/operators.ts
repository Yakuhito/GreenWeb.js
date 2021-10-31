import {int_from_bytes} from "./casts";
import {SExp} from "./SExp";
import { bytes } from "../serializer/basic_types";
import type {CLVMType} from "./CLVMObject";
import {
  ARITH_BASE_COST,
  ARITH_COST_PER_ARG,
  ARITH_COST_PER_BYTE,
  CONCAT_BASE_COST,
  CONCAT_COST_PER_ARG,
  CONCAT_COST_PER_BYTE,
  MUL_BASE_COST,
  MUL_COST_PER_OP,
  MUL_LINEAR_COST_PER_BYTE,
  MUL_SQUARE_COST_PER_BYTE_DIVIDER,
} from "./costs";
import {operators_for_module} from "./op_utils";
import * as core_ops from "./core_ops";
import * as more_ops from "./more_ops";

/*
export const KEYWORDS = [
  // core opcodes 0x01-x08
  ". q a i c f r l x ",
  
  // opcodes on atoms as strings 0x09-0x0f
  "= >s sha256 substr strlen concat . ",
  
  // opcodes on atoms as ints 0x10-0x17
  "+ - * / divmod > ash lsh ",
  
  // opcodes on atoms as vectors of bools 0x18-0x1c
  "logand logior logxor lognot . ",
  
  // opcodes for bls 1381 0x1d-0x1f
  "point_add pubkey_for_exp . ",
  
  // bool opcodes 0x20-0x23
  "not any all . ",
  
  // misc 0x24
  "softfork ",
].join("").trim().split(/\s/);
export const KEYWORD_FROM_ATOM = Object
  .entries(KEYWORDS)
  .reduce<Record<string, string>>((acc, v) => {
    acc[int_to_bytes(+v[0]).toString()] = v[1];
    return acc;
  }, {});
export const KEYWORD_TO_ATOM = Object
  .entries(KEYWORD_FROM_ATOM)
  .reduce<Record<string, string>>((acc, v) => {
    acc[v[1]] = v[0];
    return acc;
  }, {});
 */
export const KEYWORD_FROM_ATOM = {
  "00": ".",
  // core opcodes 0x01-x08
  "01": "q",
  "02": "a",
  "03": "i",
  "04": "c",
  "05": "f",
  "06": "r",
  "07": "l",
  "08": "x",
  // opcodes on atoms as strings 0x09-0x0f
  "09": "=",
  "0a": ">s",
  "0b": "sha256",
  "0c": "substr",
  "0d": "strlen",
  "0e": "concat",
  "0f": ".",
  // opcodes on atoms as ints 0x10-0x17
  "10": "+",
  "11": "-",
  "12": "*",
  "13": "/",
  "14": "divmod",
  "15": ">",
  "16": "ash",
  "17": "lsh",
  // opcodes on atoms as vectors of bools 0x18-0x1c
  "18": "logand",
  "19": "logior",
  "1a": "logxor",
  "1b": "lognot",
  "1c": ".",
  // opcodes for bls 1381 0x1d-0x1f
  "1d": "point_add",
  "1e": "pubkey_for_exp",
  "1f": ".",
  // bool opcodes 0x20-0x23
  "20": "not",
  "21": "any",
  "22": "all",
  "23": ".",
  // misc 0x24
  "24": "softfork",
};
export const KEYWORD_TO_ATOM = {
  // ".": "00",
  // core opcodes 0x01-x08
  "q": "01",
  "a": "02",
  "i": "03",
  "c": "04",
  "f": "05",
  "r": "06",
  "l": "07",
  "x": "08",
  // opcodes on atoms as strings 0x09-0x0f
  "=": "09",
  ">s": "0a",
  "sha256": "0b",
  "substr": "0c",
  "strlen": "0d",
  "concat": "0e",
  // ".": "0f",
  // opcodes on atoms as ints 0x10-0x17
  "+": "10",
  "-": "11",
  "*": "12",
  "/": "13",
  "divmod": "14",
  ">": "15",
  "ash": "16",
  "lsh": "17",
  // opcodes on atoms as vectors of bools 0x18-0x1c
  "logand": "18",
  "logior": "19",
  "logxor": "1a",
  "lognot": "1b",
  // ".": "1c",
  // opcodes for bls 1381 0x1d-0x1f
  "point_add": "1d",
  "pubkey_for_exp": "1e",
  // ".": "1f",
  // bool opcodes 0x20-0x23
  "not": "20",
  "any": "21",
  "all": "22",
  ".": "23",
  // misc 0x24
  "softfork": "24",
};
export const OP_REWRITE = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "div",
  "i": "if",
  "c": "cons",
  "f": "first",
  "r": "rest",
  "l": "listp",
  "x": "raise",
  "=": "eq",
  ">": "gr",
  ">s": "gr_bytes",
};

export type ATOMS = keyof typeof KEYWORD_FROM_ATOM;
export type KEYWORDS = keyof typeof KEYWORD_TO_ATOM;

export function* args_len(op_name: string, args: SExp){
  for(const arg of args.as_iter()){
    if(arg.pair){
      throw new Error(`${op_name} requires int args`);
    }
    yield (arg.atom??Buffer.from([])).length;
  }
}

/*
unknown ops are reserved if they start with 0xffff
otherwise, unknown ops are no-ops, but they have costs. The cost is computed
like this:

byte index (reverse):
| 4 | 3 | 2 | 1 | 0          |
+---+---+---+---+------------+
| multiplier    |XX | XXXXXX |
+---+---+---+---+---+--------+
 ^               ^    ^
 |               |    + 6 bits ignored when computing cost
cost_multiplier  |
                 + 2 bits
                   cost_function

1 is always added to the multiplier before using it to multiply the cost, this
is since cost may not be 0.

cost_function is 2 bits and defines how cost is computed based on arguments:
0: constant, cost is 1 * (multiplier + 1)
1: computed like operator add, multiplied by (multiplier + 1)
2: computed like operator mul, multiplied by (multiplier + 1)
3: computed like operator concat, multiplied by (multiplier + 1)

this means that unknown ops where cost_function is 1, 2, or 3, may still be
fatal errors if the arguments passed are not atoms.
*/
export function default_unknown_op(op: bytes, args: SExp): [number, CLVMType] {
  // any opcode starting with ffff is reserved (i.e. fatal error)
  // opcodes are not allowed to be empty
  if(op.length === 0 || op.subarray(0, 2).toString("hex") == "ffff"){
    throw new Error("reserved operator");
  }
  
  /*
   all other unknown opcodes are no-ops
   the cost of the no-ops is determined by the opcode number, except the
   6 least significant bits.
   */
  const cost_function = ((op.at(op.length-1) ?? 0) & 0b11000000) >> 6;
  // the multiplier cannot be 0. it starts at 1
  
  if(op.length > 5){
    throw new Error("invalid operator");
  }
  
  // The bytes here is 4bytes or smaller. So `int_from_bytes` is enough. (No bigint_from_bytes required)
  const cost_multiplier = int_from_bytes(op.subarray(0, op.length-1), {signed: false}) + 1;
  /*
    0 = constant
    1 = like op_add/op_sub
    2 = like op_multiply
    3 = like op_concat
   */
  let cost;
  if(cost_function === 0){
    cost = 1;
  }
  else if(cost_function === 1){
    cost = ARITH_BASE_COST;
    let arg_size = 0;
    for(const length of args_len("unknown op", args)){
      arg_size += length;
      cost += ARITH_COST_PER_ARG;
    }
    cost += arg_size * ARITH_COST_PER_BYTE;
  }
  else if(cost_function === 2){
    // like op_multiply
    cost = MUL_BASE_COST;
    const operands = args_len("unknown op", args);
    const res = operands.next();
    if(!res.done){
      let vs = res.value;
      for(const rs of operands){
        cost += MUL_COST_PER_OP;
        cost += (rs + vs) * MUL_LINEAR_COST_PER_BYTE;
        cost += ((rs * vs) / MUL_SQUARE_COST_PER_BYTE_DIVIDER) | 0;
        vs += rs;
      }
    }
  }
  else if(cost_function === 3){
    // like concat
    cost = CONCAT_BASE_COST;
    let length = 0;
    for(const arg of args.as_iter()){
      if(arg.pair){
        throw new Error("unknown op on list");
      }
      cost += CONCAT_COST_PER_ARG;
      length += (arg.atom as bytes).length;
    }
    cost += length * CONCAT_COST_PER_BYTE;
  }
  else{
    throw new Error(`Invalid cost_function: ${cost_function}`);
  }
  
  cost *= cost_multiplier;
  if(cost >= 2**32){
    throw new Error("invalid operator");
  }
  
  return [cost, SExp.null()];
}

export const QUOTE_ATOM = Buffer.from(KEYWORD_TO_ATOM["q"], "hex");
export const APPLY_ATOM = Buffer.from(KEYWORD_TO_ATOM["a"], "hex");

type TOpFunc<R = unknown> = (args: SExp) => R;
type TBasicAtom = "quote_atom"|"apply_atom";
type TAtomOpFunctionMap<A extends string = ATOMS> = Record<A, TOpFunc> & Partial<Record<TBasicAtom, bytes>>;

function merge(obj1: Record<string, unknown>, obj2: Record<string, unknown>){
  Object.keys(obj2).forEach(key => {
    obj1[key] = obj2[key];
  });
}

export type TOperatorDict<A extends string = ATOMS> = {
  unknown_op_handler: typeof default_unknown_op;
}
& ((op: bytes|string|number, args: SExp) => [number, CLVMType])
& TAtomOpFunctionMap<A>
& Record<TBasicAtom, bytes>
;

export type TOperatorDictOption = {
  quote_atom: bytes;
  apply_atom: bytes;
  unknown_op_handler: typeof default_unknown_op;
};

export function OperatorDict<A extends string = ATOMS>(
  atom_op_function_map: TAtomOpFunctionMap<A>|TOperatorDict,
  option: Partial<TOperatorDictOption> = {},
): TOperatorDict<A> {
  const dict = {
    ...atom_op_function_map,
    quote_atom: option.quote_atom || (atom_op_function_map as Record<TBasicAtom, bytes>).quote_atom,
    apply_atom: option.apply_atom || (atom_op_function_map as Record<TBasicAtom, bytes>).apply_atom,
    unknown_op_handler: option.unknown_op_handler || default_unknown_op,
  };
  
  if(!dict.quote_atom){
    throw new Error("object has not attribute 'quote_atom'");
  }
  else if(!dict.apply_atom){
    throw new Error("object has not attribute 'apply_atom'");
  }
  
  const OperatorDict = function(op: bytes|string|number, args: SExp){
    if(typeof op === "string"){
      op = Buffer.from(op, "hex");
    }
    else if(typeof op === "number"){
      op = Buffer.from([(op as unknown) as number]);
    }
    else if(!(op instanceof Buffer)){
      throw new Error(`Invalid op: ${JSON.stringify(op)}`);
    }
    
    merge(dict, OperatorDict as any);
    
    const f = (dict as Record<string, unknown>)[op.toString("hex")];
    if(typeof f !== "function"){
      return dict.unknown_op_handler(op, args);
    }
    else{
      return f(args);
    }
  };
  
  merge(OperatorDict as any, dict);
  
  return OperatorDict as TOperatorDict<A>;
}

const _OPERATOR_LOOKUP = OperatorDict(
  operators_for_module(KEYWORD_TO_ATOM, core_ops, OP_REWRITE),
  {
    quote_atom: QUOTE_ATOM,
    apply_atom: APPLY_ATOM,
  },
);

merge(_OPERATOR_LOOKUP as any, operators_for_module(KEYWORD_TO_ATOM, more_ops, OP_REWRITE));

export const OPERATOR_LOOKUP = _OPERATOR_LOOKUP as TOperatorDict<ATOMS>;
