# Module Overview

## Description

The `greenweb.xch` sub-module allows interacting with the Chia blockchain. This includes, but is not limited to:

 - fetching an account's XCH balance
 - getting block details
 - subscribing to puzzle hash updates
 - sending Chia to an address
 - accepting an offer

[`Provider`](provider.md) is the interface that exposes the methods.

[`LeafletProvider`](leaflet-provider.md) implements [`Provider`](provider.md) and can be used to connect to [`leaflet`](https://github.com/FireAcademy/leaflet-docker) nodes.
[`GobyProvider`](goby-provider.md) tries to connect to a user's [Goby Wallet](https://www.goby.app/) extension.
To use multiple providers, one can use [`MultiProvider`](multi-provider.md).
[`PrivateKeyProvider`](private-key-provider.md) requires a private key to function and is mainly used for testing.

To see the functions implemented by each provider, please see [this page](provider.md).

## Available functions
Please see [this page](provider.md).

## Wrapper
The sub-module is also provides a wrapper around [`Provider`](provider.md): simply call its `setProvider` function with the desired provider instance as an argument and you'll be able to call any function on `greenweb.xch` instead of the instance:

```js
// works
const provider = new greenweb.xch.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
provider.connect().then(() => {
  provider.getBalance({
    address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"
  }).then(balance => console.log(balance.toNumber()));
});
```

```js
// also works
const provider = new greenweb.xch.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
greenweb.xch.setProvider(provider);
greenweb.xch.connect().then(() => {
  greenweb.xch.getBalance({
    address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"
  }).then(balance => console.log(balance.toNumber()));
});
```

```js
// does not work, unless .setProvider() was called previously
const provider = new greenweb.xch.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
greenweb.xch.connect().then(() => {
  greenweb.xch.getBalance({
    address: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"
  }).then(balance => console.log(balance.toNumber()));
});
```