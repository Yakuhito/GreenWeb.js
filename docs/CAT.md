# CAT

`CAT` inherits [`SmartCoin`](smart-coin.md) and can be used to work with CATs more easily. The `puzzle` is automatically determined when `TAILProgramHash` and `innerPuzzle`/`syntheticKey` are available. The `solution` is also constructed when the required attributes are set.

Attributes:

  - `parentCoinInfo` (inherited from `SmartCoin`)
  - `puzzleHash` (inherited from `SmartCoin`)
  - `amount` (inherited from `SmartCoin`)
  - `puzzle` (inherited from `SmartCoin`)
  - `solution` (inherited from `SmartCoin`)
  - `TAILProgramHash`
  - `innerPuzzle`
  - `innerPuzzleHash`
  - `syntheticKey`
  - `innerSolution`
  - `prevCoinId`
  - `nextCoin`
  - `prevSubtotal`
  - `extraDelta`
  - `TAILProgram`
  - `TAILSolution`
  - `lineageProof`


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

export type CATConstructorArgs = {
    // SmartCoin
    parentCoinInfo?: bytes | null,
    puzzleHash?: bytes | null,
    amount?: uint | null,
    coin?: Coin | null,
    // CAT-specific
    TAILProgramHash?: bytes | null,
    // inner puzzle
    publicKey?: bytes | null,
    syntheticKey?: bytes | null,
    // spend
    innerSolution?: SExp | null,
    prevCoinId?: bytes | null,
    nextCoin?: Coin | null,
    prevSubtotal?: BigNumberish | null,
    // spend extra
    extraDelta?: uint | null,
    TAILProgram?: SExp | null,
    TAILSolution?: SExp | null,
    lineageProof?: LineageProof | null,
};

```

If your public key comes from a function such as `masterSkToWallerSk`, pass it as `publicKey`.

### Returns

A `CAT` instance.

---

## copyWith

Used to create a new `CAT` object that inherits some of its properties from the instance on which it was called. Overwrite properties by giving them as arguments.

### Definition

```js
public copyWith({
    parentCoinInfo = null,
    puzzleHash = null,
    amount = null,
    coin = null,

    TAILProgramHash = null,

    innerSolution = null,
    prevCoinId = null,
    nextCoin = null,
    prevSubtotal = null,

    publicKey = null,
    syntheticKey = null,

    extraDelta = null,
    TAILProgram = null,
    TAILSolution = null,
    lineageProof = null,
}: CATConstructorArgs): CAT {
```

### Returns

A `CAT` instance.

---

## withParentCoinInfo

Returns a new `CAT` instance with a new value for `parentCoinInfo`.

### Definition

```js
public withParentCoinInfo(parentCoinInfo: bytes): CAT {
```

---

## withPuzzleHash

Returns a new `CAT` instance with a new value for `puzzleHash`.

### Definition

```js
public withPuzzleHash(puzzleHash: bytes): CAT {
```

---

## withAmount

Returns a new `CAT` instance with a new value for `amount`.

### Definition

```js
public withAmount(amount: uint): CAT {
```

---

## withTAILProgramHash

Returns a new `CAT` instance with a new value for `TAILProgramHash`.

### Definition

```js
public withTAILProgramHash(TAILProgramHash: bytes): CAT {
```

---

## withPublicKey

Returns a new `CAT` instance with a new value for `syntheticKey`, which is caluclated from `publicKey`.

### Definition

```js
public withPublicKey(publicKey: bytes): CAT {
```

---

## withSyntheticKey

Returns a new `CAT` instance with a new value for `syntheticKey`.

### Definition

```js
public withSyntheticKey(syntheticKey: bytes): CAT {
```

---

## withInnerSolution

Returns a new `CAT` instance with a new value for `inenrSolution`. Using this function is not recommended - see `addConditionsToInnerSolution()` at the bottom of this page instead.

### Definition

```js
public withInnerSolution(innerSolution: SExp): CAT {
```

---

## withExtraDelta

Returns a new `CAT` instance with a new value for `extraDelta`.

### Definition

```js
public withExtraDelta(extraDelta: uint): CAT {
```

---

## withTAILProgram

Returns a new `CAT` instance with a new value for `TAILProgram`.

### Definition

```js
public withTAILProgram(TAILProgram: SExp): CAT {
```

---

## withTAILSolution

Returns a new `CAT` instance with a new value for `TAILSolution`.

### Definition

```js
public withTAILSolution(TAILSolution: SExp): CAT {
```

---

## withLineageProof

Returns a new `CAT` instance with a new value for `lineageProof`.

### Definition

```js
public withLineageProof(lineageProof: LineageProof): CAT {
```

---

## addConditionsToInnerSolution

The recommended way of adding conditions to a `CAT`'s `innerSolution`. It will append the given list of the conditions to the one that is already present in `innerSolution`. If `innerSolution` is not set, it will build one from the given `conditions`.

### Definition

```js
public addConditionsToInnerSolution(conditions: SExp[]): CAT {
```

