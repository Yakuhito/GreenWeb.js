# Singleton

`Singleton` inherits [`SmartCoin`](smart-coin.md) and can be used to work with Singletons more easily. The `puzzle` is automatically determined when `launcherId` and `innerPuzzle` are available. The `solution` is also constructed when the required attributes (`innerSolution` and `lineageProof`) are set.

Attributes:

  - `parentCoinInfo` (inherited from `SmartCoin`)
  - `puzzleHash` (inherited from `SmartCoin`)
  - `amount` (inherited from `SmartCoin`)
  - `puzzle` (inherited from `SmartCoin`)
  - `solution` (inherited from `SmartCoin`)
  - `launcherId`
  - `innerPuzzle`
  - `innerPuzzleHash`
  - `lineageProof`
  - `innerSolution`


Methods inherited from `SmartCoin`:

  - `withPuzzle()`
  - `withSolution()`
  - `toCoin()`
  - `spend()`
  - `getId()`
  - `getName()`
  - `curry()`
  - `isSpendable()`

## constructor

Used to initialize a new class instance. All parameters are optional.

### Arguments

```js
export type LineageProof = {
    parentName?: bytes | null,
    innerPuzzleHash?: bytes | null,
    amount?: uint | null,
};

export type SingletonConstructorArgs = {
    // SmartCoin
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    // singleton-specific
    launcherId?: bytes | null,
    innerPuzzle?: SExp | null,
    // spend
    lineageProof?: LineageProof | null,
    innerSolution?: SExp | null,
};
```

### Returns

A `Singleton` instance.

---

## copyWith

Used to create a new `Singleton` object that inherits some of its properties from the instance on which it was called. Overwrite properties by giving them as arguments.

### Definition

```js
public copyWith({
    parentCoinInfo = null,
    puzzleHash = null,
    amount = null,
    coin = null,

    launcherId = null,
    innerPuzzle = null,

    lineageProof = null,
    innerSolution = null,
}: SingletonConstructorArgs): Singleton {
```

### Returns

A `Singleton` instance.

---

## withParentCoinInfo

Returns a new `Singleton` instance with a new value for `parentCoinInfo`.

### Definition

```js
public withParentCoinInfo(parentCoinInfo: bytes): Singleton {
```

---

## withPuzzleHash

Returns a new `Singleton` instance with a new value for `puzzleHash`.

### Definition

```js
public withPuzzleHash(puzzleHash: bytes): Singleton {
```

---

## withAmount

Returns a new `Singleton` instance with a new value for `amount`.

### Definition

```js
public withAmount(amount: uint): Singleton {
```

---

## withLauncherId

Returns a new `CAT` instance with a new value for `launcherId`.

### Definition

```js
public withLauncherId(launcherId: bytes): Singleton {
```

---

## withInnerPuzzle

Returns a new `Singleton` instance with a new value for `innerPuzzle`.

### Definition

```js
public withInnerPuzzle(innerPuzzle: SExp): Singleton {
```

---

## withLineageProof

Returns a new `Singleton` instance with a new value for `lineageProof`.

### Definition

```js
public withLineageProof(lineageProof: LineageProof): Singleton {
```

---

## withInnerSolution

Returns a new `Singleton` instance with a new value for `innerSolution`.

### Definition

```js
public withInnerSolution(innerSolution: SExp): Singleton {
```

---

## getPayToPuzzleHash

If `launcherId` is available, this method will return the hash of a puzzle that locks coins in such a way that only the singleton is able to claim them (full puzzle: `p2_singleton.clvm`). If `launcherId` is not available, this method will simply return `null`.

### Definition

```js
public getPayToPuzzleHash(): bytes | null {
```

---

## getPayToAddress

If `launcherId` is available, this method will return an address - if any coins are sent to the address, only this singleton will be able to claim them. Uses `getPayToPuzzleHash()`. Returns `null` if `launcherId` is not available.

### Definition

```js
public getPayToAddress(): string | null {
```
