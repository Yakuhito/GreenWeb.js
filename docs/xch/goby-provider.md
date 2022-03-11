# GobyProvider

`GobyProvider` connects to the browser's [Goby Wallet](https://www.goby.app/) extension. It only exposes methods related to transferring Chia and other assets.


Here's how to initialize the provider:
```js
const provider = new greenweb.xch.providers.GobyProvider();
```

Arguments:

 - `tryNonInteractiveConnect`: If set to `true`, `GobyProvider` will check if the user previously connected to a website and requests their account. Default value: `true`
 - `_chiaOverwrite`: If you want the provider to interact with Goby through something other than `window.chia`, pass an object that implements the functions of `window.chia` here. Currently only used for testing purposes