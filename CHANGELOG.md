# Changelog

## 1.1.7
 - Add the `CAT` class (CAT1 support)
 - Create `greenweb.util.spend`
    - New method: `spendCATs()`
    - TODO: New method: `spendStandardCoins()`
    - TODO: New method: `mergeSpendBundles()`
 - Add the `greenweb.util.sexp.uncurry()` method
 - Add tests for the `CAT` class (full coverage)
 - TODO: Update `StandardCoin` (**BREAKING CHANGES**)
 - TODO: Add `greenweb.util.hexlify` and `greenweb.util.unhexlify`
 - TODO: bug fix
 - TODO: update docs to reflect changes

## 1.1.6
 - Add a changelog (`CHANGELOG.md`)
 - Add `StandardCoin`, which can be used to create standard transactions more easily.
 - Make the `SmartCoin` class 'immutable'. `setParentCoinInfo` & co. are now `withParentCoinInfo` & co. and return a new class instance. Also added the `copyWith` method.
 - Add `greenweb.util.key` - a collection of methods to help with key generation and derivation. Most important functions include , `masterSkToWalletSk()`, `masterSkToWalletSkUnhardened()`, `masterPkToWalletPk()`, as well as `hexToPrivateKey()`, `hexToPublicKey()`, `privateKeyToHex()`, and `publicKeyToHex()`.
 - Add `greenweb.util.key.mnemonic`, which can be used to convert bytes from and to mnemonic strings, as well as mnemonic strings to seeds and private keys. New functions: `bytesToMnemonic()`, `bytesFromMnemonic()`, `mnemonicToSeed()`, `privateKeyFromMnemonic()`.
 - `XCHModule`: add the `createProvider()` method, which can be used to easily create a `MultiProvider`
 - Add `greenweb.util.key.impl`, which exposes more key derivation functions such as `masterSkToFarmerSk()` and `masterSkToPoolingAuthenticationSk()`
 - `SExpUtil`: Use Chia's `sha256tree_module` clvm program.
 - `SExpUtil`: Add the `curry()` function
 - `SmartCoin`: Add the `curry()` function, which returns a new class instance
 - `SExpUtil`: Expose more Chia wallet puzzles (`P2_DELEGATED_PUZZLE_OR_HIDDEN_PUZZLE_PROGRAM`, `DEFAULT_HIDDEN_PUZZLE_PROGRAM`, `DEFAULT_HIDDEN_PUZZLE_HASH`, `CALCULATE_SYNTHETIC_PUBLIC_KEY_PROGRAM`) and expose `calculateSyntheticPublicKey()` and `standardCoinPuzzle()`, which are used by `StandardCoin`
 - `Provider`: Modify return types of the `tranfer()`, `transferCAT()`, and `acceptOffer()` methods from `Promise<boolean>` to `Promise<Optional<SpendBundle>>`
 - Create `greenweb.util.goby`, which can be used to parse Goby's `SpendBundle`, `CoinSpend`, and `Coin` objects
 - Expose `SyntheticKeyUtil` via `greenweb.util.key.synthetic`; functions: `calculateSyntheticOffset()` and `calculateSyntheticSecretKey()`.
 - Tests: 100% coverage
 