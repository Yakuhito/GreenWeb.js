// https://github.com/Chia-Mine/clvm-js/blob/main/src/serialize.ts

/*
decoding:
read a byte
if it's 0xfe, it's nil (which might be same as 0)
if it's 0xff, it's a cons box. Read two items, build cons
otherwise, number of leading set bits is length in bytes to read size
0-0x7f are literal one byte values
leading bits is the count of bytes to read of size
0x80-0xbf is a size of one byte (perform logical and of first byte with 0x3f to get size)
0xc0-0xdf is a size of two bytes (perform logical and of first byte with 0x1f)
0xe0-0xef is 3 bytes ((perform logical and of first byte with 0xf))
0xf0-0xf7 is 4 bytes ((perform logical and of first byte with 0x7))
0xf7-0xfb is 5 bytes ((perform logical and of first byte with 0x3))
 */
import {SExp} from "./SExp";
import { bytes, Optional } from "../serializer/basic_types";
import {TToSexpF, TValStack} from "./as_javascript";
import {int_from_bytes} from "./casts";
import {CLVMObject, CLVMType} from "./CLVMObject";

const MAX_SINGLE_BYTE = 0x7F;
const CONS_BOX_MARKER = 0xFF;

type TOpStack = Array<(op_stack: TOpStack, val_stack: TValStack, f: Buffer, to_sexp_f: TToSexpF) => unknown>;

export function* sexp_to_byte_iterator(sexp: SExp){
  const todo_stack = [sexp];
  while(todo_stack.length){
    sexp = todo_stack.pop() as SExp;
    const pair = sexp.as_pair();
    if(pair){
      // yield Bytes.from([CONS_BOX_MARKER]);
      yield Buffer.from([CONS_BOX_MARKER]);
      todo_stack.push(pair[1]);
      todo_stack.push(pair[0]);
    }
    else{
      yield* atom_to_byte_iterator(sexp.atom);
    }
  }
}

export function* atom_to_byte_iterator(atom: Optional<bytes>){
  const size = atom ? atom.length : 0;
  if(size === 0 || !atom){
    // yield Bytes.from("0x80", "hex");
    yield Buffer.from([0x80]);
    return;
  }
  else if(size === 1){
    if(atom.at(0) ?? 0 <= MAX_SINGLE_BYTE){
      yield atom;
      return;
    }
  }
  
  let uint8array;
  if(size < 0x40){
    uint8array = Uint8Array.from([0x80 | size]);
  }
  else if(size < 0x2000){
    uint8array = Uint8Array.from([
      0xC0 | (size >> 8),
      (size >> 0) & 0xFF,
    ]);
  }
  else if(size < 0x100000){
    uint8array = Uint8Array.from([
      0xE0 | (size >> 16),
      (size >> 8) & 0xFF,
      (size >> 0) & 0xFF,
    ]);
  }
  else if(size < 0x8000000){
    uint8array = Uint8Array.from([
      0xF0 | (size >> 24),
      (size >> 16) & 0xFF,
      (size >> 8) & 0xFF,
      (size >> 0) & 0xFF,
    ]);
  }
  else if(size < 0x400000000){
    uint8array = Uint8Array.from([
      0xF8 | ((size / 2**32) | 0),// (size >> 32),
      ((size / 2**24) | 0) & 0xFF,
      ((size / 2**16) | 0) & 0xFF,
      ((size / 2**8) | 0) & 0xFF,
      ((size / 2**0) | 0) & 0xFF,
    ]);
  }
  else{
    throw new Error(`sexp too long ${atom}`);
  }
  const size_blob = Buffer.from(uint8array);
  
  yield size_blob;
  yield atom;
  return;
}

export function sexp_to_stream(sexp: SExp, f: Buffer): Buffer {
  var arr: Buffer[] = [];
  for(const b of sexp_to_byte_iterator(sexp)){
    arr.push(Buffer.from(b));
  }
  return Buffer.concat(arr);
}

function _op_read_sexp(op_stack: TOpStack, val_stack: TValStack, f: Buffer, to_sexp_f: TToSexpF){
    if(f.length === 0){
        throw new Error("bad encoding");
    }
  const blob = f.readUInt8();
  f = f.slice(1);

  const b = blob;
  if(b === CONS_BOX_MARKER){
    op_stack.push(_op_cons);
    op_stack.push(_op_read_sexp);
    op_stack.push(_op_read_sexp);
    return;
  }
  val_stack.push(_atom_from_stream(f, b, to_sexp_f));
}

function _op_cons(op_stack: TOpStack, val_stack: TValStack, f: Buffer, to_sexp_f: TToSexpF){
  const right = val_stack.pop() as SExp;
  const left = val_stack.pop() as SExp;
  val_stack.push(to_sexp_f([left, right]));
}

export function sexp_from_stream(f: Buffer, to_sexp_f: TToSexpF){
  const op_stack: TOpStack = [_op_read_sexp];
  const val_stack: TValStack = [];
  
  while(op_stack.length){
    const func = op_stack.pop();
    if(func){
      func(op_stack, val_stack, f, ((v: any) => new CLVMObject(v) as CLVMType) as TToSexpF);
    }
  }
  
  return to_sexp_f(val_stack.pop() as any);
}

function _op_consume_sexp(f: Buffer){
    if(f.length === 0){
        throw new Error("bad encoding");
    }
  const blob = f.readUInt8();
  f = f.slice(1);
  const b = blob;
  if(b === CONS_BOX_MARKER){
    return [blob, 2];
  }
  return [_consume_atom(f, b), 0];
}

function _consume_atom(f: Buffer, b: number){
  if(b === 0x80){
    return Buffer.from([b]);
  }
  else if(b <= MAX_SINGLE_BYTE){
    return Buffer.from([b]);
  }
  
  let bit_count = 0;
  let bit_mask = 0x80;
  let ll = b;
  
  while(ll & bit_mask){
    bit_count += 1;
    ll &= 0xFF ^ bit_mask;
    bit_mask >>= 1;
  }
  
  let size_blob = Buffer.from([ll]);
  if(bit_count > 1){
    const ll2 = f.read(bit_count-1);
    if(ll2.length !== bit_count-1){
      throw new Error("bad encoding");
    }
    size_blob = Buffer.concat([size_blob, ll2]);
  }
  
  const size = int_from_bytes(size_blob);
  if(size >= 0x400000000){
    throw new Error("blob too large");
  }
  const blob = f.read(size);
  if(blob.length !== size){
    throw new Error("bad encoding");
  }
  return Buffer.concat([b, size_blob.subarray(1), blob]);
}

/*
instead of parsing the input stream, this function pulls out all the bytes
that represent on S-expression tree, and returns them. This is more efficient
than parsing and returning a python S-expression tree.
 */
export function sexp_buffer_from_stream(f: Buffer): bytes {
  let buffer = Buffer.from([]);
  let depth = 1;
  while(depth > 0){
    depth -= 1;
    const [buf, d] = _op_consume_sexp(f) as [bytes, number];
    depth += d;
    buffer = Buffer.concat([buffer, buf]);
  }
  return buffer;
}

function _atom_from_stream(f: Buffer, b: number, to_sexp_f: TToSexpF): SExp {
  if(b === 0x80){
    return to_sexp_f(Buffer.from([]));
  }
  else if(b <= MAX_SINGLE_BYTE){
    return to_sexp_f(Buffer.from([b]));
  }
  let bit_count = 0;
  let bit_mask = 0x80;
  while(b & bit_mask){
    bit_count += 1;
    b &= 0xFF ^ bit_mask;
    bit_mask >>= 1;
  }
  let size_blob = Buffer.from([b]);
  if(bit_count > 1){
    const bin = f.read(bit_count - 1);
    if(bin.length !== bit_count - 1){
      throw new Error("bad encoding");
    }
    size_blob = Buffer.concat([size_blob, bin]);
  }
  const size = int_from_bytes(size_blob);
  if(size >= 0x400000000){
    throw new Error("blob too large");
  }
  const blob = f.read(size);
  if(blob.length !== size){
    throw new Error("bad encoding");
  }
  return to_sexp_f(blob);
}