# Module Overview

Currently, only `greenweb.util.address` and `greenweb.util.coin` are available.

# greenweb.util.address

## validateHashString

Removes the `0x` prefix of a hash. Returns an empty string is the given hash is not valid.

```js
greenweb.util.address.validateHashString("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664")
// "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664"

greenweb.util.address.validateHashString("0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664")
// "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664"

greenweb.util.address.validateHashString("1234")
// ""
```

## puzzleHashToAddress

Converts a puzzle hash into an address. Second argument is optional and represents the desired address prefix (default is `'xch'`).

```js
greenweb.util.address.puzzleHashToAddress("b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664")
// "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"

greenweb.util.address.puzzleHashToAddress("0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664")
// "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"

greenweb.util.address.puzzleHashToAddress("0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664", "yaku")
// "yaku1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejqrlyg4k"

greenweb.util.address.puzzleHashToAddress("0x1234")
// ""
```

## addressToPuzzleHash

Converts an address to a puzzle hash.

```js
greenweb.util.address.addressToPuzzleHash("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3")
// "b6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664"

greenweb.util.address.addressToPuzzleHash("test")
// ""
```

# greenweb.util.coin

## getId

Returns the id/name of a given `Coin`.

```js
provider.getCoinRemovals({
  height: 894633,
  headerHash: "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702",
  coinIds: ["8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01"]
}).then(coins => {
  console.log(coins[0]);
  // { parentCoinInfo: "d5d0c5f27f8ad7c98f9baa9c3bbcc8825751b67c04e67b6752d54142524050b6", puzzleHash: "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2", amount: 12343 }
  console.log(greenweb.util.coin.getId(coins[0]));
  // 8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
});
```

## getName

Returns the id/name of a given `Coin`. Internally calls `getId`.

```js
provider.getCoinRemovals({
  height: 894633,
  headerHash: "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702",
  coinIds: ["8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01"]
}).then(coins => {
  console.log(coins[0]);
  // { parentCoinInfo: "d5d0c5f27f8ad7c98f9baa9c3bbcc8825751b67c04e67b6752d54142524050b6", puzzleHash: "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2", amount: 12343 }
  console.log(greenweb.util.coin.getName(coins[0]));
  // 8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01
});
```