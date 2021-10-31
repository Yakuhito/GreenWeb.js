// https://github.com/Chia-Mine/clvm-js/blob/main/src/__bls_signatures__/index.ts

import type {G1Element as G1ElementType, ModuleInstance} from "@chiamine/bls-signatures";
import * as blsLoader from "./loader";

type TCreateModule = () => Promise<ModuleInstance>;
export let BLS: ModuleInstance | undefined;
export let loadPromise: Promise<ModuleInstance> | undefined;

/**
 * Load BLS Module instance.
 * This function must be called an awaited on program start up.
 */
export async function initializeBLS(): Promise<ModuleInstance> {
  if (BLS) {
    return BLS;
  } else if (loadPromise) {
    return loadPromise;
  }
  
  return loadPromise = new Promise<ModuleInstance>((resolve, reject) => {
    if (BLS) {
      loadPromise = undefined;
      return resolve(BLS);
    }
    
    ((blsLoader as unknown) as TCreateModule)().then((instance) => {
      if(!instance){
        return reject();
      }
      loadPromise = undefined;
      return resolve(BLS = instance);
    }).catch(e => {
      console.error("Error while loading BLS module");
      return reject(e);
    });
  });
}

/**
 * This function must be called after `initializeBLS()` is done.
 * Calling `await initializeBLS()` on program startup is library user's responsibility.
 *
 * This is used for synchronous code execution.
 * Within this library, this is always called to get BLS module to keep code synchronous.
 */
export function getBLSModule() {
  if (!BLS) {
    throw new Error("BLS module has not been loaded. Please call `await initializeBLS()` on start up");
  }
  
  return BLS;
}

export function G1Element_from_bytes(bytes: Uint8Array) {
  assert_G1Element_valid(bytes);
  const BLSModule = getBLSModule();
  try {
    return BLSModule.G1Element.from_bytes(bytes);
  } catch (e) {
    // Print exception message if debug module is enabled and loaded.
    const message = "Exception in G1Element operation";
    /*
    const get_exception_message = BLS.Util.get_exception_message;
    if (typeof get_exception_message === "function") {
      message = get_exception_message(e as number);
    }
    */
    throw new Error(message);
  }
}

export function assert_G1Element_valid(bytes: Uint8Array){
  const BLSModule = getBLSModule();
  const {G1Element} = BLSModule;
  if(bytes.length !== G1Element.SIZE){
    throw new Error("Length of bytes object not equal to G1Element::SIZE");
  }
  
  if((bytes[0] & 0xc0) === 0xc0){ // representing infinity
    if(bytes[0] !== 0xc0){
      throw new Error("G1Element: Given G1 infinity element must be canonical");
    }
    for(let i=1;i<G1Element.SIZE;++i){
      if(bytes[i] !== 0x00){
        throw new Error("G1Element: Given G1 infinity element must be canonical");
      }
    }
  }
  else{
    if((bytes[0] & 0xc0) !== 0x80){
      throw new Error("Given G1 non-infinity element must start with 0b10");
    }
  }
}

export function G1Element_add(g1Element1: G1ElementType, g1Element2: G1ElementType){
  try {
    return g1Element1.add(g1Element2);
  } catch (e) {
    // Print exception message if debug module is enabled and loaded.
    const message = "Exception in G1Element operation";
    /*
    const get_exception_message = BLS.Util.get_exception_message;
    if (typeof get_exception_message === "function") {
      message = get_exception_message(e as number);
    }
    */
    throw new Error(message);
  }
}
