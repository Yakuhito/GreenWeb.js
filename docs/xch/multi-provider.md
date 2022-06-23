# MultiProvider

`MultiProvider` is a wrapper for those who wish to use multiple poviders. It iterates over all given providers until one that implements the wanted method if found.


Here's how to initialize the provider:
```js
const provider = new greenweb.xch.providers.MultiProvider([
     new greenweb.xch.providers.GobyProvider(),
    new greenweb.blockchain.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY')
]);
```

In the example above, methods will first try to be resolved using [`GobyProvider`](goby-provider.md).

Arguments:

 - `providers`: A list of providers