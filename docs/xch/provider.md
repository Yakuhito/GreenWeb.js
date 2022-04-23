# Provider

This page includes example usage for a provider. Note that methods that are not available throw errors, while those that are implemented signal failures via return values.

# Available Providers

| Function\Provider | [LeafletProvider](leaflet-provider.md) | [GobyProvider](goby-provider.md) | [MultiProvider](multi-provider.md) | [PrivateKeyProvider](private-key-provider) |
|---|:---:|:---:|:---:|:---:|
| [connect](#connect) | ✅ | ✅ | ✅ | ✅ |
| [close](#close) | ✅ | ✅ | ✅ | ✅ |
| [getNetworkId](#getnetworkid) | ✅ | ✅ | ✅ | ✅ |
| [isConnected](#isconnected) | ✅ | ✅ | ✅ | ✅ |
| [getBlockNumber](#getblocknumber) | ✅ | ❎ | ❔ | ❎ |
| [getBalance](#getbalance) | ✅ | ❎ | ❔ | ❎ |
| [subscribeToPuzzleHashUpdates](#subscribetopuzzlehashupdates) | ✅ | ❎ | ❔ | ❎ |
| [subscribeToCoinUpdates](#subscribetocoinupdates) | ✅ | ❎ | ❔ | ❎ |
| [getPuzzleSolution](#getpuzzlesolution) | ✅ | ❎ | ❔ | ❎ |
| [getCoinChildren](#getcoinchildren) | ✅ | ❎ | ❔ | ❎ |
| [getBlockHeader](#getblockheader) | ✅ | ❎ | ❔ | ❎ |
| [getBlocksHeaders](#getblocksheaders) | ✅ | ❎ | ❔ | ❎ |
| [getCoinRemovals](#getcoinremovals) | ✅ | ❎ | ❔ | ❎ |
| [getCoinAdditions](#getcoinadditions) | ✅ | ❎ | ❔ | ❎ |
| [getAddress](#getaddress) | ✅ | ❎ | ❔ | ❎ |
| [transfer](#transfer) | ❎ | ✅ | ❔ | ❎ |
| [transferCAT](#transfercat) | ❎ | ✅ | ❔ | ❎ |
| [acceptOffer](#acceptoffer) | ❎ | ✅ | ❔ | ❎ |
| [subscribeToAddressChanges](#subscribetoaddresschanges) | ❎ | ✅ | ❔ | ❎ |
| [signCoinSpends](#signcoinspends) | ❎ | ❎ | ❔ | ✅ |

# Custom Data Types

## Optional<T>

Either `T` or `null`.

```js
export type Optional<T> = T | null;
```

## bytes

`bytes` is just a hex string.

```js
export type bytes = string;
```

## uint

An unsigned integer.

```js
export type uint = BigNumberish;
```

## Coin

Used to represent a coin - to get its id/name, use `greenweb.utils.coin.getId(coin)` or `greenweb.utils.coin.getName(coin)`.

```js
export class Coin {
    @fields.Bytes(32) parentCoinInfo: bytes;
    @fields.Bytes(32) puzzleHash: bytes;
    @fields.Uint(64) amount: uint;
}
```

## CoinState

```js
export class CoinState {
    coin: Coin;
    spentHeight: Optional<uint>;
    createdHeight: Optional<uint>;
}
```

## BlockHeader

```js
export class BlockHeader {
    height: uint;
    headerHash: bytes;
    prevBlockHash: Optional<bytes>;
    isTransactionBlock: Optional<boolean>;
    fees: Optional<uint>;
    farmerPuzzleHash: Optional<bytes>;
    poolPuzzleHash: Optional<bytes>;
}
```

## PuzzleSolution

`SExp` is the object used by `clvm.js` and `greenweb.clvm`.

```js
export class PuzzleSolution {
    coinName: bytes;
    height: uint;
    puzzle: SExp;
    solution: SExp;
}
```

## CoinSpend

```js
export class CoinSpend {
    @fields.Object(Coin) coin: Coin;
    @fields.SExp() puzzleReveal: SExp;
    @fields.SExp() solution: SExp;
}
```

## SpendBundle

```js
export class SpendBundle {
    @fields.List(fields.Object(CoinSpend)) coinSpends: CoinSpend[];
    @fields.Bytes(96) aggregatedSignature: bytes;
}
```

# Methods

## Constructor

Does this need an explaination?

### Arguments

Depend on the type of the provider.

### Returns

A `Provider` instance - do not forget to also call `connect()`!

### Example

```js
let provider = new greenweb.xch.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');

greenweb.xch.setProvider(provider)
```

---

## connect

Initializes a provider.

### Arguments

None

### Returns

`Promise<void>`

### Example

```js
provider.connect().then(() => {
  // ...
});
```

---

## close

Tells a given provider to close the connection.

### Arguments

None

### Returns

`Promise<void>`

### Example

```js
provider.close().then(() => {
  // ...
});
```

---

## getNetworkId

Returns the current network id as a `Network` enum member, which is a string.

### Arguments

None

### Returns

`Network` / `string` - `'mainnet'`, `'testnet10'`, etc.

### Example

```js
greenweb.xch.getNetworkId()
// "mainnet"
```

---

## isConnected

Returns true if the provider is connected, either to a node or a wallet.

### Arguments

None

### Returns

`boolean`

### Example

```js
greenweb.xch.isConnected()
// trues
```

---

## getBlockNumber

Returns the latest block's number.

### Arguments

None

### Returns

`Promise<uint>`

### Example

```js
greenweb.xch.getBlockNumber().then(blockNumber => console.log(blockNumber));
// 1320204
```

---

## getBalance

Returns the spendable balance of an account (in mojo). For some providers (`LeafletProvider`), it's recommended to use `subscribeToPuzzleHashUpdates` and `subscribeToCoinUpdates` whenever possible.

### Arguments

```js
export type getBalanceArgs = {
    address?: string,
    puzzleHash?: string,
    minHeight?: number
};
```

### Returns

`Promise<Optional<BigNumber>>`

### Example

```js
greenweb.xch.getBalance({
  address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"
}).then(balance => console.log(balance.toNumber()))

// 1946917
```

---

## subscribeToPuzzleHashUpdates

Calls the `callback` argument each time a coin having the given `puzzleHash` changes its state.

### Arguments

```js
export type subscribeToPuzzleHashUpdatesArgs = {
    puzzleHash: string,
    callback: (coin_states: CoinState[]) => void,
    minHeight?: number
};
```

### Returns

None.

### Example

```js
greenweb.xch.subscribeToPuzzleHashUpdates({
  puzzleHash: "0xb6b6c8e3b2f47b6705e440417907ab53f7c8f6d88a74668f14edf00b127ff664",
  callback: arr => console.log(arr)
})

// Array(26) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
​
// 0: Object { coin: {…}, createdHeight: 724176, spentHeight: null }
```

---

## subscribeToCoinUpdates

Calls the `callback` argument each time a coin having the given name/id changes its state.

### Arguments

```js
export type subscribeToCoinUpdatesArgs = {
    coinId: string,
    callback: (coin_states: CoinState[]) => void,
    minHeight?: number
};
```

### Returns

None.

### Example

```js
greenweb.xch.subscribeToCoinUpdates({
  coinId: "7200b9a8a799717b2b54809b7ed6bd2bacfa113dcf9564569a8182bd7f588cf8",
  callback: arr => console.log(arr)
})

// Array [ {…} ]
​
// 0: Object { coin: {…}, createdHeight: 894633, spentHeight: null }
```

---

## getPuzzleSolution

Gets the puzzle and solution of a given coin using its id/name and the block height it was spent at.

### Arguments

```js
export type getPuzzleSolutionArgs = {
    coinId: string,
    height: number
};
```

### Returns

`Promise<Optional<PuzzleSolution>>`

### Example

```js
greenweb.xch.getPuzzleSolution({
  coinId: "0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01",
  height: 894633
}).then(puzzSol => console.log(puzzSol));

// Object { coinName: "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01", height: 894633, puzzle: {…}, solution: {…} }
```

---

## getCoinChildren

Returns the children of a coin using its id/name.

### Arguments

```js
export type getCoinChildrenArgs = {
    coinId: string
};
```

### Returns

`Promise<CoinState[]>`

### Example

```js
greenweb.xch.getCoinChildren({
  coinId: "0x8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01"
}).then(arr => console.log(arr));

// Array [ {…}, {…} ]
​
// 0: Object { coin: {…}, createdHeight: 894633, spentHeight: null }
```

---

## getBlockHeader

Returns the block header for a given `height`.

### Arguments

```js
export type getBlockHeaderArgs = {
    height: number
};
```

### Returns

`Promise<Optional<BlockHeader>>`

### Example

```js
greenweb.xch.getBlockHeader({
  height: 1000000
}).then(header => console.log(header));

// Object { height: 1000000, headerHash: "5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410", prevBlockHash: "f5d672dae94768f8cd119331490b2725d505355522bc81bb7ae314a2d0412b1d", isTransactionBlock: false, farmerPuzzleHash: "5b0505e3f90f5ba40a4eb50871b8a3c4f39af795389723286cdebd7706a4bcf5", poolPuzzleHash: "5b0505e3f90f5ba40a4eb50871b8a3c4f39af795389723286cdebd7706a4bcf5", fees: null }
```

---

## getBlocksHeaders

Functions like `getBlockHeader`, except that you can pass a range of heights to get multiple block headers.

### Arguments

```js
export type getBlocksHeadersArgs = {
    startHeight: number,
    endHeight: number
};
```

### Returns

`Promise<Optional<BlockHeader[]>>`

### Example

```js
greenweb.xch.getBlocksHeaders({
  startHeight: 999999,
  endHeight: 1000001
}).then(headers => console.log(headers));

// Array(3) [ {…}, {…}, {…} ]
​
// 0: Object { height: 999999, headerHash: "f5d672dae94768f8cd119331490b2725d505355522bc81bb7ae314a2d0412b1d", prevBlockHash: "84b7b4b65aab1987bb17a78f41a448eb8286e3c906388cb37df6a959e7bc8cb9", … }
​
// 1: Object { height: 1000000, headerHash: "5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410", prevBlockHash: "f5d672dae94768f8cd119331490b2725d505355522bc81bb7ae314a2d0412b1d", … }
​
// 2: Object { height: 1000001, headerHash: "6f15a6d088ce8d940c220f80d16d6743c8a9cf5e2544ad15a57b58a06dbd9284", prevBlockHash: "5a3c793a73aa5976eca2b3ee8843b7ed63513aa82fcd8d5e94248855ba7f4410", … }
```

---

## getCoinRemovals

Returns the coin removals at a given block `height` (`headerHash` is also required). Will return all removals if `coinIds` is not specified.

### Arguments

```js
export type getCoinRemovalsArgs = {
    height: number,
    headerHash: string,
    coinIds?: string[]
};
```

### Returns

`Promise<Optional<Coin[]>>`

### Example

```js
greenweb.xch.getCoinRemovals({
  height: 894633,
  headerHash: "fca56891047b75eab372e59c034ddc250102a64abac588a8f30c53e47bc99702"
}).then(arr => console.log(arr));

// Array(10) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
​
// 0: Object { id: "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01", parentCoinInfo: "d5d0c5f27f8ad7c98f9baa9c3bbcc8825751b67c04e67b6752d54142524050b6", puzzleHash: "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2", … }
```

---

## getCoinAdditions

Returns the coin additions at a given block `height` (`headerHash` is also required). Will return all additions if `puzzleHashes` is not specified.

### Arguments

```js
export type getCoinAdditionsArgs = {
    height: number,
    headerHash: string, // apparently not optional...
    puzzleHashes?: string[]
};
```

### Returns

`Promise<Optional<Coin[]>>`

### Example

```js
greenweb.xch.getCoinAdditions({
  height: 894597,
  headerHash: "a1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb"
}).then(arr => console.log(arr));

// Array(23) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
​
// 0: Object { id: "b0a49ecc87876aeac68fb9c2c1a80c884936e6d1928c9df8b3a4cc55542ac503", parentCoinInfo: "d5d0c5f27f8ad7c98f9baa9c3bbcc8825751b67c04e67b6752d54142524050b6", puzzleHash: "3afe8edf37a09dcfebba3eb83493e3e91deefe213097daf0083890dbc038a931", … }


// or


greenweb.xch.getCoinAdditions({
  height: 894597,
  headerHash: "a1559da62ec56609ca8c1239b7dfc8f8efcdc281be4ef1f968c4c19a034257fb",
  puzzleHashes: ["bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2"]
}).then(arr => console.log(arr));

// Array [ {…} ]
​
// 0: Object { id: "8c06c51728ab459be72267a21efa9f4b24ce76bcc53b9eee4a353a546cc2ce01", parentCoinInfo: "d5d0c5f27f8ad7c98f9baa9c3bbcc8825751b67c04e67b6752d54142524050b6", puzzleHash: "bef81a693292ae286b32700ddf8fc8dda095f274140b358673d9fbef1d1eb0e2", … }
```

---

## getAddress

Returns the address that the user is connected with. The value `""` means that the wallet is not currently connected.

### Arguments

None

### Returns

`Promise<string>`

### Example

```js
greenweb.xch.getAddress().then(console.log);

// xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3
```

---

## transfer

Send XCH to an address. Note that the user might be asked for confirmation.

### Arguments

```js
export type transferArgs = {
    to: string,
    value: BigNumberish,
    fee?: BigNumberish
};
```

### Returns

`Promise<boolean>` - `true` if the transaction was submitted to the network, `false` otherwise.

### Example

```js
greenweb.xch.transfer({
    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
    value: greenweb.util.parseChia("1")
}).then(console.log);

// true
```
---

## transferCAT

Send CATs (tokens) to an address. Note that the user might be asked for confirmation.

### Arguments

```js
export type transferCATArgs = {
    to: string,
    assetId: string,
    value: BigNumberish,
    fee?: BigNumberish
};
```

### Returns

`Promise<boolean>` - `true` if the transaction was submitted to the network, `false` otherwise.

### Example

```js
greenweb.xch.transferCAT({
    to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
    assetId: "6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589",
    value: greenweb.util.parseToken("1")
}).then(console.log);

// true
```

---

## acceptOffer

Accept an offer. Note that the user might be asked for confirmation.

### Arguments

```js
export type acceptOfferArgs = {
    offer: string,
    fee?: BigNumberish
};
```

### Returns

`Promise<boolean>` - `true` if the transaction was submitted to the network, `false` otherwise.

### Example

```js
greenweb.xch.acceptOffer({
    offer: "offer1[...]"
}).then(console.log);

// true
```

---

## subscribeToAddressChanges

Calls the `callback` argument each time the address of the user is changed.

### Arguments

```js
export type subscribeToAddressChangesArgs = {
    callback: (address: string) => void,
};
```

### Returns

None.

### Example

```js
greenweb.xch.subscribeToAddressChanges({
    callback: (address) => console.log(address);
});
```

## signCoinSpends

Signs a list of `CoinSpend`s wth a given private key and returns a `SpendBundle`.

### Arguments

```js
export type signCoinSpendsArgs = {
    coinSpends: CoinSpend[],
};
```

### Returns

`Promise<Optional<SpendBundle>>` - `null` if the signing failed, `SpendBundle` otherwise

### Example

```js
// please don't ask your users for their private keys - yaku
const spendBundle = await provider.signCoinSpends({
  coinSpends: myCoinSpends // variable set somewhere else in the code
});
```