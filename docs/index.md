# GreenWeb.js
Chia JavaScript API

## About

GreenWeb.js is a JavaScript library that allows writing web-based apps that interact with the Chia blockchain. The source code can be found [on GitHub](https://github.com/Yakuhito/GreenWeb.js).

## General Structure

The main javascript files exports a single object, `greenweb`. It has the following sub-modules:

 - [`greenweb.blockchain`](blockchain/index.md): Used for **reading** blockchain data.
 - [`greenweb.wallet`](wallet/index.md): Used for **writing** blockchain data (a.k.a. 'sending transactions')
 - [`greenweb.clvm`](clvm/index.md): Export of [https://github.com/Chia-Mine/clvm-js](https://github.com/Chia-Mine/clvm-js)
 - [`greenweb.clvmTools`](clvmTools/index.md): Export of [https://github.com/Chia-Mine/clvm_tools-js](https://github.com/Chia-Mine/clvm_tools-js)
 - [`greenweb.util`](util/index.md): Some util functions that might come in handy later

## Getting Started

### Browser
To generate the latest `greenweb.js` file, clone the repository and use `npm` to build:

```bash
git clone https://github.com/Yakuhito/GreenWeb.js
cd GreenWeb.js
npm install
npm run build
ls -lah dist/greenweb.js
```

Copy `dist/greenweb.js` to your web directory.
If you need to use `clvm.initialize()`, make sure to also include `blsjs.wasm` in the same directory - more about that [here](https://github.com/Chia-Mine/clvm-js#use-in-browser).

Use the following snippet to include GreenWeb.js on a page:

```js
<script type="module" src="greenweb.js"></script>
```

### Node.js

The package can be installed via `npm`:
```bash
npm install greenwebjs
```