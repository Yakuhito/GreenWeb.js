# greenweb.util.sexp

## fromHex

Converts a hex string (`bytes`) to a `SExp` object.

```js
console.log(greenweb.util.sexp.fromHex('ff8080'));
// Object { Dt: null, "$t": (2) […] }
```

## toHex

Converts a `SExp` object to a hex string.

```js
const {SExp, OPERATOR_LOOKUP, KEYWORD_TO_ATOM, h, t, run_program} = greenweb.clvm;
const plus = h(KEYWORD_TO_ATOM["+"]);
const q = h(KEYWORD_TO_ATOM["q"]);
const program = SExp.to([plus, 1, t(q, 175)]);
console.log(greenweb.util.sexp.toHex(program));
// ff10ff01ffff018200af80
```

## run

Runs a program (puzzle) with the given solution. Third argument is optional and represents the maximum cost - if this cost is exceeded, the function will throw an error. Returns the output (`SExp`).

```js
const {SExp, OPERATOR_LOOKUP, KEYWORD_TO_ATOM, h, t, run_program} = greenweb.clvm;
const plus = h(KEYWORD_TO_ATOM["+"]);
const q = h(KEYWORD_TO_ATOM["q"]);
const program = SExp.to([plus, 1, t(q, 175)]);
const solution = SExp.to(25);

console.log(greenweb.util.sexp.run(program, solution).as_int());
// 200
```

## runWithCost

Runs a program (puzzle) with the given solution. Third argument is optional and represents the maximum cost - if this cost is exceeded, the function will throw an error. Returns a tuple that contains the output (`SExp`) and the cost of running the program (number).

```js
const {SExp, OPERATOR_LOOKUP, KEYWORD_TO_ATOM, h, t, run_program} = greenweb.clvm;
const plus = h(KEYWORD_TO_ATOM["+"]);
const q = h(KEYWORD_TO_ATOM["q"]);
const program = SExp.to([plus, 1, t(q, 175)]);
const solution = SExp.to(25);

const [output, cost] = greenweb.util.sexp.runWithCost(program, solution);
console.log(output.as_int());
// 200
console.log(cost);
// 833
```

## sha256tree

Returns the SHA256 treehash of a given puzzle.

```js
const {SExp, OPERATOR_LOOKUP, KEYWORD_TO_ATOM, h, t, run_program} = greenweb.clvm;
const plus = h(KEYWORD_TO_ATOM["+"]);
const q = h(KEYWORD_TO_ATOM["q"]);
const program = SExp.to([plus, 1, t(q, 175)]);

console.log(greenweb.util.sexp.sha256tree(program));
```

## conditionsDictForSolution

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L114).

## conditionsForSolution

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L125).

## parseSExpToConditions

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L33).

## parseSExpToCondition

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L18).

## asAtomList

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/types/blockchain_format/program.py#L104).

## conditionsByOpcode

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L52).

## pkmPairsForConditionsDict

TypeScript/JavaScript port of [this function](https://github.com/Chia-Network/chia-blockchain/blob/fe77c690182e97f7ef13d1fb383481f32efe2e87/chia/util/condition_tools.py#L81).

## curry

Curries a list of parameters into a given program.

```js
public curry(program: SExp, args: SExp[]): SExp {
```

## uncurry

Given a curried program, returns the original module and the arguments that were curried in. If the input is invalid, returns null.

```js
public uncurry(program: SExp): [SExp, SExp[]] | null {
```

## calculateSyntheticPublicKey

A wrapper for `CALCULATE_SYNTHETIC_PUBLIC_KEY_PROGRAM`.

```js
public calculateSyntheticPublicKey(publicKey: any, hiddenPuzzleHash = this.DEFAULT_HIDDEN_PUZZLE_HASH): any {
```

## standardCoinPuzzle

A wrapper for `P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM_MOD`.

```js
public standardCoinPuzzle(key: any, isSyntheticKey: boolean = false): SExp {
```

## standardCoinSolution

Returns a valid standard coin solution (`SExp`) derived from the given list of conditions.

```js
public standardCoinSolution(conditions: SExp[]): SExp {
```

## CATPuzzle

A wrapper for `CAT_PROGRAM_MOD`.

```js
public CATPuzzle(TAILProgramHash: bytes, innerPuzzle: SExp): SExp {
```

## CATSolution

Returns a valid solution (`SExp`) for the `CAT` puzzle.

```js
public CATSolution(
    innerPuzzleSolution: SExp,
    lineageProof: SExp | null,
    prevCoinId: bytes,
    thisCoinInfo: Coin,
    nextCoinProof: Coin,
    prevSubtotal: BigNumberish,
    extraDelta: BigNumberish
): SExp {
```

## genesisByCoinIdTAIL

A wrapper for `GENESIS_BY_COIN_ID_TAIL_MOD`.

```js
public genesisByCoinIdTAIL(genesisId: bytes): SExp {
```

## genesisByPuzzleHashTAIL

A wrapper for `GENESIS_BY_PUZZLE_HASH_TAIL_MOD`.

```js
public genesisByPuzzleHashTAIL(puzzleHash: bytes): SExp {
```

## everythingWithSignatureTAIL

A wrapper for `EVERYTHING_WITH_SIGNATURE_TAIL_MOD`.

```js
public everythingWithSignatureTAIL(pubKey: bytes): SExp {
```

## delegatedTAIL

A wrapper for `DELEGATED_TAIL_MOD`.

```js
public delegatedTAIL(pubKey: bytes): SExp {
```

# Programs
This class also exposes the following 'standard' programs as `SExp` objects:

 - `SHA256TREE_MODULE_PROGRAM`
 - `CURRY_PROGRAM`
 - `P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM_MOD`
 - `P2_CONDITIONS_PROGRAM`
 - `DEFAULT_HIDDEN_PUZZLE_PROGRAM`
 - `CALCULATE_SYNTHETIC_PUBLIC_KEY_PROGRAM`
 - `CAT_PROGRAM_MOD`
 - `CAT_PROGRAM_MOD_HASH`
 - `GENESIS_BY_COIN_ID_TAIL_MOD`
 - `GENESIS_BY_PUZZLE_HASH_TAIL_MOD`
 - `EVERYTHING_WITH_SIGNATURE_TAIL_MOD`
 - `DELEGATED_TAIL_MOD`
 