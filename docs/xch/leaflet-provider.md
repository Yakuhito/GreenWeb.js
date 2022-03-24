# LeafletProvider

`LeafletProvider` connects to a [leaflet node](https://github.com/FireAcademy/leaflet-docker) and fetches the requested data. Leaflet is a proxy between a client and a full node that takes raw socket data and handles the necessary certificate authentication process for the official wallet protocol.


Here's how to initialize the provider:
```js
const provider = new greenweb.blockchain.providers.LeafletProvider('leaflet.fireacademy.io', 'TEST-API-KEY');
```

Arguments:

 - `host`: leaflet host
 - `apiKey`: leaflet API key
 - `port`: default 18444; FireAcademy also works with 443
 - `webSocketCreateFunc`: a function that takes an URL and returns an `IWebSocket` instance. Mainly used for testing.

You can use `LeafletProvider` with [FireAcademy.io](https://fireacademy.io)