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
