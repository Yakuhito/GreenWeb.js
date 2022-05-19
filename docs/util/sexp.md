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