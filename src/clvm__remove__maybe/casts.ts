// https://github.com/Chia-Mine/clvm-js/blob/main/src/casts.ts

import { bytes, Optional } from "../serializer/basic_types";

export type TConvertOption = {
  signed: boolean;
};

export function int_from_bytes(b: Optional<bytes>, option?: Partial<TConvertOption>): number {
  if(!b || b.length === 0){
    return 0;
  }
  else if(b.length*8 > 52){
    throw new Error("Cannot convert Bytes to Integer larger than 52bit. Use bigint_from_bytes instead.");
  }
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  let unsigned32 = 0;
  const ui8array = b; // Buffer = UInt8Array
  const dv = new DataView(ui8array.buffer, ui8array.byteOffset, ui8array.byteLength);
  const bytes4Remain = dv.byteLength % 4;
  const bytes4Length = (dv.byteLength - bytes4Remain) / 4;
  
  let order = 1;
  for(let i=bytes4Length-1;i>=0;i--){
    const byte32 = dv.getUint32(i*4 + bytes4Remain);
    unsigned32 += byte32 * order;
    order = Number(BigInt(order) << BigInt(32));
  }
  
  if(bytes4Remain > 0){
    if(bytes4Length === 0){
      order = 1;
    }
    for(let i=bytes4Remain-1;i>=0;i--){
      const byte = ui8array[i];
      unsigned32 += byte * order;
      order = Number(BigInt(order) << BigInt(8));
    }
  }
  
  // If the first bit is 1, it is recognized as a negative number.
  if(signed && (ui8array[0] & 0x80)){
    return unsigned32 - Number(BigInt(1) << BigInt(b.length*8));
  }
  return unsigned32;
}

export function bigint_from_bytes(b: Optional<bytes>, option?: Partial<TConvertOption>): bigint {
  if(!b || b.length === 0){
    return BigInt(0);
  }
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  let unsigned32 = BigInt(0);
  const ui8array = b; // Buffer = UInt8Array
  const dv = new DataView(ui8array.buffer, ui8array.byteOffset, ui8array.byteLength);
  const bytes4Remain = dv.byteLength % 4;
  const bytes4Length = (dv.byteLength - bytes4Remain) / 4;
  
  let order = BigInt(1);
  for(let i=bytes4Length-1;i>=0;i--){
    const byte32 = dv.getUint32(i*4 + bytes4Remain);
    unsigned32 += BigInt(byte32) * order;
    order <<= BigInt(32);
  }
  
  if(bytes4Remain > 0){
    if(bytes4Length === 0){
      order = BigInt(1);
    }
    for(let i=bytes4Remain-1;i>=0;i--){
      const byte = ui8array[i];
      unsigned32 += BigInt(byte) * order;
      order <<= BigInt(8);
    }
  }
  
  // If the first bit is 1, it is recognized as a negative number.
  if(signed && (ui8array[0] & 0x80)){
    return unsigned32 - (BigInt(1) << BigInt(b.length*8));
  }
  return unsigned32;
}

export function int_to_bytes(v: number, option?: Partial<TConvertOption>): bytes {
  if(v > Number.MAX_SAFE_INTEGER || v < Number.MIN_SAFE_INTEGER){
    throw new Error(`The int value is beyond ${v > 0 ? "MAX_SAFE_INTEGER" : "MIN_SAFE_INTEGER"}: ${v}`);
  }
  if(v === 0){
    return Buffer.from([]);
  }
  
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  if(!signed && v < 0){
    throw new Error("OverflowError: can't convert negative int to unsigned");
  }
  
  let byte_count = 1;
  const div = signed ? 1 : 0;
  const b16 = 65536;
  if(v > 0){
    let right_hand = (v + 1) * (div + 1);
    while((b16 ** ((byte_count-1)/2 + 1)) < right_hand){
      byte_count += 2;
    }
    right_hand = (v + 1) * (div + 1);
    while (2 ** (8 * byte_count) < right_hand) {
      byte_count++;
    }
  }
  else if(v < 0){
    let right_hand = (-v + 1) * (div + 1);
    while((b16 ** ((byte_count-1)/2 + 1)) < right_hand){
      byte_count += 2;
    }
    right_hand = -v * 2;
    while (2 ** (8 * byte_count) < right_hand) {
      byte_count++;
    }
  }
  
  const extraByte = signed && v > 0 && ((v >> ((byte_count-1)*8)) & 0x80) > 0 ? 1 : 0;
  const u8 = new Uint8Array(byte_count + extraByte);
  for(let i=0;i<byte_count;i++){
    const j = extraByte ? i+1 : i;
    u8[j] = (v >> (byte_count-i-1)*8) & 0xff;
  }
  
  return Buffer.from(u8);
}

// The reason to use `pow` instead of `**` is that some transpiler automatically converts `**` into `Math.pow`
// which cannot be used against bigint.
export function pow(base: bigint, exp: bigint): bigint {
  //return base ** exp;
  // The code below was once tested, but it is 100x slower than '**' operator.
  // So I gave up to use it.
  if(exp === BigInt(0)){
    return BigInt(1);
  }
  else if(exp === BigInt(1)){
    return base;
  }
  else if(exp < BigInt(0)){
    throw new RangeError("BigInt negative exponent");
  }
  
  const stack: Array<[bigint, bigint]> = [];
  stack.push([base, exp]);
  let retVal: bigint = BigInt(1);
  while(stack.length){
    [base, exp] = stack.pop() as [bigint, bigint];
    if(exp === BigInt(0)){
      continue;
    }
    else if(exp === BigInt(1)){
      retVal *= base;
      continue;
    }
    
    if(exp % BigInt(2)){
      stack.push([base*base, exp/BigInt(2)]);
      stack.push([base, BigInt(1)]);
    }
    else{
      stack.push([base*base, exp/BigInt(2)]);
    }
  }
  
  return retVal;
}

export function bigint_to_bytes(v: bigint, option?: Partial<TConvertOption>): bytes {
  if(v === BigInt(0)){
    return Buffer.from([]);
  }
  
  const signed = (option && typeof option.signed === "boolean") ? option.signed : false;
  if(!signed && v < BigInt(0)){
    throw new Error("OverflowError: can't convert negative int to unsigned");
  }
  let byte_count = 1;
  const div = BigInt(signed ? 1 : 0);
  const b32 = BigInt(4294967296);
  if(v > 0){
    let right_hand = (v + BigInt(1)) * (div + BigInt(1));
    while(pow(b32, BigInt((byte_count-1)/4 + 1)) < right_hand){
      byte_count += 4;
    }
    right_hand = (v + BigInt(1)) * (div + BigInt(1));
    while(pow(BigInt(2), (BigInt(8) * BigInt(byte_count))) < right_hand) {
      byte_count++;
    }
  }
  else if(v < 0){
    let right_hand = (-v + BigInt(1)) * (div + BigInt(1));
    while(pow(b32, BigInt((byte_count-1)/4 + 1)) < right_hand){
      byte_count += 4;
    }
    right_hand = -v * BigInt(2);
    while(pow(BigInt(2), (BigInt(8) * BigInt(byte_count))) < right_hand) {
      byte_count++;
    }
  }
  
  const extraByte = (signed && v > 0 && ((v >> (BigInt(byte_count-1)*BigInt(8))) & BigInt(0x80)) > BigInt(0)) ? 1 : 0;
  const total_bytes = byte_count + extraByte;
  const u8 = new Uint8Array(total_bytes);
  const dv = new DataView(u8.buffer);
  const byte4Remain = byte_count % 4;
  const byte4Length = (byte_count - byte4Remain) / 4;
  
  let bitmask = BigInt(0xffffffff);
  for(let i=0;i<byte4Length;i++){
    const num = Number((v >> BigInt(32)*BigInt(i)) & bitmask);
    const pointer = extraByte + byte4Remain + (byte4Length-1 - i)*4;
    dv.setUint32(pointer, num);
  }
  v >>= BigInt(32) * BigInt(byte4Length);
  bitmask = BigInt(0xff);
  for(let i=0;i<byte4Remain;i++){
    const num = Number((v >> BigInt(8)*BigInt(i)) & bitmask);
    const pointer = extraByte + byte4Remain-1-i;
    dv.setUint8(pointer, num);
  }
  
  return Buffer.from(u8);
}

/**
 * Return the number of bytes required to represent this integer.
 * @param {number} v
 */
export function limbs_for_int(v: number|bigint): number {
  if(v === 0 || v === BigInt(0)){
    return 0;
  }
  return ((v >= 0 ? v : -v).toString(2).length + 7) >> 3;
}
