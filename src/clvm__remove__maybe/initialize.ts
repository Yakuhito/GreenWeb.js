// https://github.com/Chia-Mine/clvm-js/blob/a74dccc16140f777cf42e102be961ee04496b9df/src/initialize.ts
import {initializeBLS} from "./__bls_signatures__";

/**
 * Always call and wait this async function to be finished to initialize async bls module loading.
 */
export async function initialize(){
  await initializeBLS();
}