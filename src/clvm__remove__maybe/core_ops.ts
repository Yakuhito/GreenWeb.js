// https://github.com/Chia-Mine/clvm-js/blob/main/src/core_ops.ts

import { bytes } from "../serializer/basic_types";
import {SExp} from "./SExp";
import {CONS_COST, EQ_BASE_COST, EQ_COST_PER_BYTE, FIRST_COST, IF_COST, LISTP_COST, REST_COST} from "./costs";

export function op_if(args: SExp){
  if(args.list_len() !== 3){
    throw new Error("i takes exactly 3 arguments");
  }
  const r = args.rest();
  if(args.first().nullp()){
    return [IF_COST, r.rest().first()];
  }
  return [IF_COST, r.first()];
}

export function op_cons(args: SExp){
  if(args.list_len() !== 2){
    throw new Error("c takes exactly 2 arguments");
  }
  return [CONS_COST, args.first().cons(args.rest().first())];
}

export function op_first(args: SExp){
  if(args.list_len() !== 1){
    throw new Error("f takes exactly 1 argument");
  }
  return [FIRST_COST, args.first().first()];
}

export function op_rest(args: SExp){
  if(args.list_len() !== 1){
    throw new Error("r takes exactly 1 argument");
  }
  return [REST_COST, args.first().rest()];
}

export function op_listp(args: SExp){
  if(args.list_len() !== 1){
    throw new Error("l takes exactly 1 argument");
  }
  return [LISTP_COST, args.first().listp() ? SExp.TRUE : SExp.FALSE];
}

export function op_raise(args: SExp){
  throw new Error("clvm raise");
}

export function op_eq(args: SExp){
  if(args.list_len() !== 2){
    throw new Error("= takes exactly 2 arguments");
  }
  const a0 = args.first();
  const a1 = args.rest().first();
  if(a0.pair || a1.pair){
    throw new Error("= on list");
  }
  
  const b0 = a0.atom as bytes;
  const b1 = a1.atom as bytes;
  let cost = EQ_BASE_COST;
  cost += (b0.length + b1.length) * EQ_COST_PER_BYTE;
  return [cost, b0.toString("hex") == b1.toString("hex") ? SExp.TRUE : SExp.FALSE];
}
