# StandardCoin

`StandardCoin` inherits [`SmartCoin`](smart-coin.md) and can be used to create 'standard' transactions (`p2_delegated_puzzle_or_hidden_puzzle`). The `puzzle` can be automatically determined using a wallet public key or a synthetic public key and new conditions can be added to the `solution` by using a helper function.


Attributes:

  - `parentCoinInfo` (inherited from `SmartCoin`)
  - `puzzleHash` (inherited from `SmartCoin`)
  - `amount` (inherited from `SmartCoin`)
  - `puzzle` (inherited from `SmartCoin`)
  - `solution` (inherited from `SmartCoin`)
  - `syntheticKey`

Methods inherited from `SmartCoin`:

  - `withPuzzle()`
  - `withSolution()`
  - `toCoin()`
  - `spend()`
  - `getId()`
  - `getName()`
  - `curry()`
  - `isSpendable()`

### Arguments

```js
export type StandardCoinConstructorArgs = {
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    solution?: SExp | null,
    publicKey?: bytes | null,
    syntheticKey?: bytes | null
};
```

If your public key comes from a function such as `masterSkToWallerSk`, pass it as `publicKey`.

### Returns

A `StandardCoin` instance.

### Example

```js
let sc = new greenweb.StandardCoin({
  parentCoinInfo: "9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84",
});
console.log(sc);
// f {parentCoinInfo: '9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84', puzzleHash: null, amount: null, puzzle: null, syntheticKey: null}
```

---

## copyWith

Used to create a new `StandardCoin` object that inherits some of its properties from the instance on which it was called. Overwrite properties by giving them as arguments.

### Definition

```js
public copyWith({
    parentCoinInfo = null,
    puzzleHash = null,
    amount = null,
    coin = null,
    solution = null,
    publicKey = null,
    syntheticKey = null,
}: StandardCoinConstructorArgs): StandardCoin {
```

### Returns

A `StandardCoin` instance.

### Example

```js
const sc = new greenweb.StandardCoin({parentCoinInfo: "test", amount: 1});
const sc2 = sc.copyWith({amount: 2});
console.log(sc2);
// f {parentCoinInfo: 'test', puzzleHash: null, amount: B, puzzle: null, syntheticKey: null}
```

---

## withPublicKey

Creates a `StandardCoin` instance with a new value for `syntheticKey`, which is computed from the given `publicKey`. `puzzle` and `puzzleHash` are automatically updated.

### Definition

```js
public withPublicKey(publicKey: bytes) : StandardCoin {
```

---

## withSyntheticKey

Creates a `StandardCoin` instance with a new value for `syntheticKey`. `puzzle` and `puzzleHash` are automatically updated.

### Definition

```js
public withSyntheticKey(syntheticKey: bytes) : StandardCoin {
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

## addConditionsToSolution

Recommended way of updating a `SmartCoin`'s `solution`. Returns a new instance that adds the given list of conditions to the one present in the current coin's `solution`.

### Definition

```js
public addConditionsToSolution(conditions: SExp[]): StandardCoin {
```