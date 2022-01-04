# Module Overview

## Description

The `greenweb.blockchain` sub-module allows *reading* blockchain-related data. This includes, but is not limited to:

 - fetching an account's XCH balance
 - getting block details
 - subscribing to puzzle hash updates

[`BlockchainProvider`](blockchain-provider.md) is the interface that exposes the methods. [`LeafletProvider`](leaflet-provider.md) implements [`BlockchainProvider`](blockchain-provider.md) and can be used to connect to [`leaflet`](https://github.com/FireAcademy/leaflet-docker) nodes.

## Available functions
Please see [this page](blockchain-provider.md)

## Wrapper
The sub-module is also provides a wrapper around [`BlockchainProvider`](blockchain-provider.md): simply call its `setProvider` function with the desired provider instance as an argument and you'll be able to call any function on `greenweb.blockchain` instead of the instance:

```
// works
let provider = new greenweb.blockchain.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
console.log(provider.getBlockNumber());
```

```
// also works
let provider = new greenweb.blockchain.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
greenweb.blockchain.setProvider(provider);
console.log(greenweb.blockchain.getBlockNumber());
```

```
// does not work, unless .setProvider() was called previously
let provider = new greenweb.blockchain.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
console.log(greenweb.blockchain.getBlockNumber());
```