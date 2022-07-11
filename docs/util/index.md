# Module Overview

See page for:

 - [`greenweb.util.address`](address.md): Utilities for encoding/decoding addresses or other bech32m-encoded data (such as offers).
 - [`greenweb.util.coin`](coin.md): Coin-related utilities (getId, getName).
 - [`greenweb.util.serializer`](serializer.md): Export of the internal `Serializer` object, which (de)serializes objects for the official wallet protocol.
 - [`greenweb.util.network`](network.md): Network-related utilities (`mainnet` and `testnet`s - ids, genesis challenges, and address prefixes).
 - [`greenweb.util.sexp`](sexp.md): CLVM-related utilities - run programs, convert hex to `SExp` and `SExp` to hex. This also includes ports of some puzzle drivers, such as `standardCoinPuzzle()`, a wrapper for `P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM`, which is also exported by this class.
 - [`greenweb.util.goby`](goby.md): Functions used for converting goby-returned data to GreenWeb.js objects.
 - [`greenweb.util.key`](key.md): Exports methods used to parse public and private keys, as well as functions for handling mnemonics and key derivation.

# Functions

Note: All integer inputs are [`BigNumberish`](https://docs.ethers.io/v5/api/utils/bignumber/).

## formatChia

Converts the given amount of mojos to Chia. Returns a `string` that can be displayed to end-users.

```js
greenweb.util.formatChia(1000000000000);
// "1.0"

greenweb.util.formatChia(1230000000000);
// "1.23"

greenweb.util.formatChia(1);
// "0.000000000001"
```

## parseChia
Takes an XCH amount as input (`string`) and returns `uint` representing the number of mojos in that amount.

```js
greenweb.util.parseChia("1");
// 1000000000000

greenweb.util.parseChia("1.23");
// 1230000000000

greenweb.util.parseChia("0.000000000001");
// 1
```

## formatToken

Converts the given amount of units to tokens. Returns a `string` that can be displayed to end-users. Second argument is optional and represents the default amount of units per token (default is 1000).

```js
greenweb.util.formatToken(1);
// "0.001"

greenweb.util.formatToken(100);
// "0.1"

greenweb.util.formatToken(12345, 100);
// "123.45"
```

## parseToken

Takes a token amount as input (`string`) and returns `uint` representing the number of units in that amount.
```js
greenweb.util.parseToken("0.001");
// 1

greenweb.util.parseToken("0.1");
// 100

greenweb.util.parseToken("123.45", 100);
// 12345

greenweb.util.parseToken("12", 100);
// 1200
```

## stdHash

Takes a `bytes` / hex string as input and returns the value of Chia's `std_hash` function as a hex-encoded stirng.
```js
greenweb.util.stdHash('31333337')
// "5db1fee4b5703808c48078a76768b155b421b210c0761cd6a5d223f4d99f1eaa" 
```
