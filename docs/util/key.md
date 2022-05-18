# greenweb.util.key

## hexToPrivateKey

Converts a `bytes` / hex string to a private key object (`PrivateKey`).

```js
public hexToPrivateKey(hex: bytes): any {
```

## privateKeyToHex

Converts a private key (`PrivateKey`) to its `bytes` / hex string representation by serializing it.

```js
public privateKeyToHex(pk: any): bytes {
```

## masterSkToWalletSk

Derives a private key represented as a `PrivateKey` object or a `bytes`/ hex string to a wallet private key using the given index. Uses hardened key derivation ('non-observable keys').

```js
public masterSkToWalletSk(sk: any | string, index: number): any {
```

## masterSkToWalletSkUnhardened

Derives a private key represented as a `PrivateKey` object or a `bytes`/ hex string to a wallet private key using the given index. Uses non-hardened key derivation ('observable keys').

```js
public masterSkToWalletSkUnhardened(sk: any | string, index: number): any {
```

## hexToPublicKey

Converts a `bytes` / hex string to a public key object (`G1Element`).

```js
public hexToPublicKey(hex: bytes): any {
```

## publicKeyToHex

Converts a public key (`G1Element`) to its `bytes` / hex string representation by serializing it.

```js
public publicKeyToHex(pk: any): bytes {
```

## masterPkToWalletPk

Converts a public key (`G1Element`) to the wallet public key using the given index and unhardened derivation. The function name does not contain 'unhardened' since hardened derivation does not work for public keys.

```js
public masterPkToWalletPk(pk: any | string, index: number): any {
```

# greenweb.util.key.mnemonic

## bytesToMnemonic

Converts a `bytes` / hex string of length 16, 20, 24, 28 or 32 to a mnemonic. 

```js
public static bytesToMnemonic(mnemonicBytes: bytes): string {
```

## bytesFromMnemonic

Converts a mnemonic to a `bytes` / hex string of length 16, 20, 24, 28 or 32.

```js
public static bytesFromMnemonic(mnemonicStr: string): bytes {
```

## mnemonicToSeed

Converts a mnemonic and a passphrase to a seed that can be used to generate private keys. Follows the BIP39 standard.

```js
public static mnemonicToSeed(mnemonic: string, passphrase: string) {
```

## privateKeyFromMnemonic

Calculates the master private key from a mnemonic and an optional passphrase.

```js
public static privateKeyFromMnemonic(mnemonic: string, passphrase?: string): any {
```

# greenweb.util.key.impl

Exposes the following functions:

```js
public static masterSkToFarmerSk(master: any): any {
```

```js
public static masterSkToPoolSk(master: any): any {
```

```js
public static masterSkToWalletSk(master: any, index: number): any {
```

```js
public static masterSkToWalletSkUnhardened(master: any, index: number): any {
```

```js
public static masterSkToLocalSk(master: any): any {
```

```js
public static masterSkToBackupSk(master: any): any {
```

```js
public static masterSkToSingletonOwnerSk(master: any, poolWalletIndex: number): any {
```

```js
public static masterSkToPoolingAuthenticationSk(master: any, poolWalletIndex: number, index: number): any {
```

```js
public static masterPkToWalletPkUnhardened(master: any, index: number): any {
```
