# GreenWeb.js
Chia JavaScript API

## About

GreenWeb.js is a JavaScript library that allows writing web-based apps that interact with the Chia blockchain. The source code can be found [on GitHub](https://github.com/Yakuhito/GreenWeb.js).

## General Structure

The main javascript files exports a single object, `greenweb`. It has the following sub-modules:

 - [`greenweb.xch`](xch/index.md): Used to interact with the Chia blockchain.
 - [`greenweb.clvm`](clvm/index.md): Export of [https://github.com/Chia-Mine/clvm-js](https://github.com/Chia-Mine/clvm-js)
 - [`greenweb.util`](util/index.md): Some util functions that might come in handy

## Getting Started

### Browser - FireAcademy CDN

Use the following snippet to include GreenWeb.js on a page:

```html
<script src="https://assets.fireacademy.io/greenweb-1.0.8.js"></script>
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

### Node.js

The package can be installed via `npm`:
```sh
npm install greenwebjs
```


## Examples

Please see each module's documentation for usage examples.