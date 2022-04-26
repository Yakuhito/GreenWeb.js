# SmartCoin

`SmartCoin` is a class that can be used to create `CoinSpend`s more easily. It represents a standard `Coin`, plus its puzzle (the solution is only required to spend it). In the future, this class might expose more helper methods, such as `curry` and `uncurry`.

## constructor

One of the two ways of creating a new class instance.

### Arguments

```js
export type SmartCoinConstructorArgs = {
    parentCoinInfo?: string | null,
    puzzleHash?: string | null,
    amount?: uint | null,
    puzzle?: SExp | null
};
```

### Returns

A `SmartCoin` instance.

### Example

```js
let sc = new greenweb.SmartCoin({
  parentCoinInfo: "9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84",
});
console.log(sc);
// Object { parentCoinInfo: "9a92bb8da325f91f5ba7e3a02cfe6a6793aae1e02cc806ab15abaa31e834ba84", puzzleHash: null, amount: null, puzzle: null }
```

---

## fromCoin

The other way of creating a new class instance.

### Definition

```js
public static fromCoin(coin: Coin | null, puzzle?: SExp | null): SmartCoin {
```

### Returns

A `SmartCoin` instance.

### Example

```js
const smartcoin = greenweb.SmartCoin.fromCoin(null);
console.log(smartcoin);
// Object { parentCoinInfo: null, puzzleHash: null, amount: null, puzzle: null }
```

---

## setParentCoinInfo

Sets a `SmartCoin`'s `parentCoinInfo` property.

### Definition

```js
public setParentCoinInfo(newValue: string): void {
```

---

## setPuzzleHash

Sets a `SmartCoin`'s `puzzleHash` property. Will do nothing if the coin's `puzzle` property is not null.

### Definition

```js
public setPuzzleHash(newValue: string): void {
```

---

## setAmount

Sets a `SmartCoin`'s `amount` property.

### Definition

```js
public setAmount(newValue: uint): void {
```

---

## setPuzzle

Sets a `SmartCoin`'s `puzzle` property. Each time the `puzzle` is set,`puzzleHash` will be automatically updated.

### Definition

```js
public setPuzzle(newValue: SExp): void {
```

---

## toCoin

Converts a `SmartCoin`'s coin information to a `Coin` class instance. Returns null if `parentCoinInfo`, `puzzleHash` or `amount` are not set (`null`).

### Definition

```js
public toCoin(): Coin | null {
```

---

## spend

Builds a `CoinSpend` based on the coin's info and the given solution. Returns null if `parentCoinInfo`, `puzzleHash`, `puzzle` or `amount` are not set (`null`).

### Definition

```js
public spend(solution: SExp): CoinSpend | null {
```

---

## getId

Returns the coin's id/name. Returns null if `parentCoinInfo`, `puzzleHash` or `amount` are not set (`null`).

### Definition

```js
public getId(): bytes | null {
```

---

## getName

Returns the coin's id/name. Returns null if `parentCoinInfo`, `puzzleHash` or `amount` are not set (`null`). Internally calls `getId()`.

### Definition

```js
public getName(): bytes | null {
```