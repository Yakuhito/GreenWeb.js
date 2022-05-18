# StandardCoin

`StandardCoin` inherits [`SmartCoin`](smart-coin.md) and can be used to create standard transactions. It contains a standard `Coin`, plus its puzzle. The latter can be automatically determined using a wallet public key or a synthetic public key.

### Arguments

```js
export type StandardCoinConstructorArgs = {
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    puzzle?: SExp | null,
    coin?: Coin | null,
    publicKey?: bytes | null,
    isSyntheticKey?: boolean,
    forceUsePuzzle?: boolean,
};
```

`isSyntheticKey` should be set to `true` if the given `publicKey` has already been transformed to a synthetic key. If your public key comes from a function such as `masterSkToWallerSk`, leave this parameter unset or set it to `false`.
`forceUsePuzzle` should be set to `true` if you wish to overwrite a `StandardCoin`s puzzle and ignore the one computed frm the public key. Using this parameter is not recommended.

### Returns

A `StandardCoin` instance.

### Example

```js
let sc = new greenweb.StandardCoin({
  parentCoinInfo: "9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84",
});
console.log(sc);
// f {parentCoinInfo: '9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84', puzzleHash: null, amount: null, puzzle: null, publicKey: null}
```

---

## copyWith

Used to create a new `StandardCoin` object that inherits some of its properties from the instance that it was called on. Overwirte properties by giving them as arguments.

### Definition

```js
public copyWith({
    parentCoinInfo = null,
    puzzleHash = null,
    amount = null,
    coin = null,
    puzzle = null,
    publicKey = null,
    isSyntheticKey = false,
    forceUsePuzzle = false,
}: StandardCoinConstructorArgs): StandardCoin {
```

### Returns

A `StandardCoin` instance.

### Example

```js
const sc = new greenweb.StandardCoin({parentCoinInfo: "test", amount: 1});
const sc2 = sc.copyWith({amount: 2});
console.log(sc2);
// f {parentCoinInfo: 'test', puzzleHash: null, amount: B, puzzle: null, publicKey: null}
```

---

## withPublicKey

Creates a new `StandardCoin` instance with a new value for `publicKey`.

### Definition

```js
public withPublicKey(publicKey: bytes, isSyntheticKey: boolean = false) : StandardCoin {
```

---

## withParentCoinInfo

Creates a new `StandardCoin` instance with a new value for `parentCoinInfo`.

### Definition

```js
public withParentCoinInfo(newValue: string): StandardCoin {
```

---

## withPuzzleHash

Creates a new `StandardCoin` instance with a new value for `puzzleHash`. `puzzle` will get set to `null`.

### Definition

```js
public withPuzzleHash(newValue: string): StandardCoin {
```

---

## withAmount

Creates a new `StandardCoin` instance with a new value for `amount`.

### Definition

```js
public withAmount(newValue: uint): StandardCoin {
```

---

## send

Returns a `CoinSpend` that, when signed, will 'send' the given amount to the given address. The change will be transferred to the current puzzle hash if `changeAddressOrPuzzleHash` is not set. `fee` is 0 by default and `amount` is the current coin's amount unless overwritten via the 3rd parameter.

### Definition

```js
public send(
    addressOrPuzzleHash: string,
    fee?: BigNumberish,
    amount?: BigNumberish,
    changeAddressOrPuzzleHash?: string
): CoinSpend | null {
```

---

## multisend

Returns a `CoinSpend` that, when signed, will 'split send' the coin's amount to to given list of addresses. The change will be transferred to the current puzzle hash if `changeAddressOrPuzzleHash` is not set. `fee` is 0 by default. A recipient can either be given as a valid address or a puzzle hash.

### Definition

```js
public multisend(
    recipientsAndAmounts: Array<[string, BigNumberish]>,
    fee?: BigNumberish,
    changeAddressOrPuzzleHash?: string
): CoinSpend | null {
```