# greenweb.util.network

## Network

An `enum` that contains all Chia networks.

```js
greenweb.util.network.Network
// Object { 0: "mainnet", 1: "testnet0", 2: "testnet2", 3: "testnet3", 4: "testnet4", 5: "testnet5", 6: "testnet7", 7: "testnet10", mainnet: 0, testnet0: 1, … }
```

## networks

A list of all possible values for `Network`.

```js
greenweb.util.network.networks
// Array(8) [ 0, 1, 2, 3, 4, 5, 6, 7 ]
```

## getGenesisChallenge

Returns the genesis challenge of the given network. Used by `PrivateKeyProvider` for signing `AGG_SIG_ME` data.

```js
greenweb.util.network.getGenesisChallenge(0);
// "ccd5bb71183532bff220ba46c268991a3ff07eb358e8255a65c30a2dce0e5fbb"

greenweb.util.network.getGenesisChallenge(
    greenweb.util.network.Network.mainnet
);
// "ccd5bb71183532bff220ba46c268991a3ff07eb358e8255a65c30a2dce0e5fbb"
```

## getAddressPrefix

Returns the address prefix for a given network id.

```js
greenweb.util.network.getAddressPrefix(0);
// "xch"
greenweb.util.network.getAddressPrefix(1);
// "txch"

greenweb.util.network.getAddressPrefix(greenweb.util.network.Network.mainnet);
// "xch"
greenweb.util.network.getAddressPrefix(greenweb.util.network.Network.testnet10);
// "txch"
```

## getNetworkName

Returns the network name for a given network id. Used by `LeafletProvider` to craft handshake messages.

```js
greenweb.util.network.getNetworkName(0);
// "mainnet"

greenweb.util.network.getNetworkName(greenweb.util.network.Network.mainnet);
// "mainnet"
```