# GreenWeb.js
Chia JavaScript API

## About

GreenWeb.js is a JavaScript library that allows writing web-based apps that interact with the Chia blockchain. The source code can be found [on GitHub](https://github.com/Yakuhito/GreenWeb.js).

## General Structure

The main javascript files exports a single object, `greenweb`. It has the following sub-modules:

 - [`greenweb.xch`](xch/index.md): Used to interact with the Chia blockchain.
 - [`greenweb.clvm`](clvm/index.md): Export of [https://github.com/Chia-Mine/clvm-js](https://github.com/Chia-Mine/clvm-js)
 - [`greenweb.util`](util/index.md): Some util functions that might come in handy
 - [`greenweb.spend`](spend/index.md): Spend-related helper functions (`bundleCATs()`, `bundleStandardCoins()`, `merge()`, etc.)

The object also exports the following classes as properties:

 - [`SmartCoin`](smart-coin.md): GreenWeb.js's `SmartCoin` class - click on the link for more info!
 - [`StandardCoin`](standard-coin.md): Helper class used for making standard coins easier to use.
 - [`CAT`](CAT.md): Helper class used for making Chia Asset Tokens (CATs) easier to use.
 - [`BigNumber`](https://docs.ethers.io/v5/api/utils/bignumber/): Export of the class that GreenWeb.js uses to handle big numbers (thanks to the `ethers` project for publishing their solution as a package).
 - `Coin`: The `Coin` class, as used by the Chia blockchain.
 - `CoinSpend`: The `CoinSpend` class, as used by the Chia blockchain.

## Getting Started

### Browser - FireAcademy CDN

Use the following snippet to include GreenWeb.js on a page:

```html
<script src="https://assets.fireacademy.io/greenweb-1.1.8.js"></script>
```

Or just use the latest version (not recommended):

```html
<script src="https://assets.fireacademy.io/greenweb.js"></script>
```

**WARNING**: GreenWeb.js is still a very young project. Expect breaking changes with every release.

### Browser - Build it!
To generate the latest `greenweb.js` file, clone the repository and use `npm` to build:

```sh
git clone https://github.com/Yakuhito/GreenWeb.js
cd GreenWeb.js
npm install
npm run build
ls -lah dist/greenweb.js
```

Copy `dist/greenweb.js` to your web directory.
If you need to use `clvm.initialize()`, make sure to also include `blsjs.wasm` in the same directory - more about that [here](https://github.com/Chia-Mine/clvm-js#use-in-browser).

Use the following snippet to include GreenWeb.js on a page:

```html
<script src="greenweb.js"></script>
```

### Browser - npm

This package can be added via npm:

```
npm install --save greenwebjs
```

For browser-based clients, you also need to install the `buffer` package and define the global `Buffer` class. For Vue.js 3, just add the following lines to `App.vue`:

```js
<script setup lang="ts">
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
</script>
```
*OR*
```js
<script setup>
import { Buffer } from "buffer";
window.Buffer = Buffer;
</script>
```

Unfortunately, most setups have issues when GreenWeb.js is installed this way. If you're seeing an error that you cannot fix, just include the `greenweb.js` script from the FireAcademy CDN and use `window.greenweb`.

### Node.js

The package can be installed via `npm`:
```sh
npm install --save greenwebjs
```


## Examples

Please see each module's documentation for usage examples.