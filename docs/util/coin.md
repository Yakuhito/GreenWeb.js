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