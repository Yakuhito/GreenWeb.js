# SmartCoin

`SmartCoin` is a class that can be used to create `CoinSpend`s more easily. It represents a standard `Coin`, plus its puzzle (the solution is only required to spend it). This class also exposes helper methods, such as `curry()` and `getId()`.

## constructor

Used to initialize a new class instance. All parameters are optional.

### Arguments

```js
export type SmartCoinConstructorArgs = {
    parentCoinInfo?: string | null,
    puzzleHash?: string | null,
    amount?: uint | null,
    coin?: Coin | null,
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

## copyWith

Used to create a new `SmartCoin` object that inherits some of its properties from the instance that it was called on. Overwirte properties by giving them as arguments.

### Definition

```js
public copyWith({
    parentCoinInfo = null,
    puzzleHash = null,
    amount = null,
    coin = null,
    puzzle = null,
}: SmartCoinConstructorArgs): SmartCoin {
```

### Returns

A `SmartCoin` instance.

### Example

```js
const sc = new greenweb.SmartCoin({parentCoinInfo: "test", amount: 1});
const sc2 = sc.copyWith({amount: 2});
console.log(sc2);
// u {parentCoinInfo: 'test', puzzleHash: null, amount: B {cn: '0x02', hn: true}, puzzle: null}
```

---

## withParentCoinInfo

Creates a new `SmartCoin` instance with a new value for `parentCoinInfo`.

### Definition

```js
public withParentCoinInfo(newValue: string): SmartCoin {
```

---

## withPuzzleHash

Creates a new `SmartCoin` instance with a new value for `puzzleHash`. `puzzle` will get set to `null`.

### Definition

```js
public withPuzzleHash(newValue: string): SmartCoin {
```

---

## withAmount

Creates a new `SmartCoin` instance with a new value for `amount`.

### Definition

```js
public withAmount(newValue: uint): SmartCoin {
```

---

## withPuzzle

Creates a new `SmartCoin` instance with a new value for `puzzle`. `puzzleHash` is automatically updated.

### Definition

```js
public withPuzzle(newValue: SExp): SmartCoin {
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

---

## curry

Curries the given list of arguments into the coin's puzzle and returns a new `SmartCoin`. Returns null if puzzle is not set.

### Definition

```js
public curry(args: SExp[]): SmartCoin | null {
```
