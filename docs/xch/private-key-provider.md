# PrivateKeyProvider

`PrivateKeyProvider`'s main purpose is to be used for testing. It is the first GreenWeb.js `Provider` that exposes the `signCoinSpends` function.


Here's how to initialize the provider:
```js
const provider = new greenweb.xch.providers.PrivateKeyProvider(
    "9090909090909090909090909090909090909090909090909090909090909090" // private key here
);
```

Arguments:

 - `privateKey`: A 32-byte string representing the private key
 - `network`: Default `"mainnet"`; is used when signing `AGG_SIG_ME` messages
 