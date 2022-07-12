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
 

## signCoinSpends

The `signCoinSpends` method accepts a second parameter, `customGenesisChallenge` - it overwrite the genesis challenge used to sign the given list of coin spends. If used correctly, the last argument allows developers to sign spends for other Chia forks.

```js
public async signCoinSpends(
    { coinSpends }: signCoinSpendsArgs,
    customGenesisChallenge: bytes | null = null
): Promise<Optional<SpendBundle>> {
```