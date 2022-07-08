# Changelog

## 1.1.7
 - add the `CAT` class (CAT1 support)
 - add tests for the `CAT` class (full coverage)
 - create `greenweb.spend`
    - new method: `bundleCATs()`
    - TODO: new method: `bundleStandardCoins()`
    - TODO: new method: `bundle()`
    - TODO: new method: `mergeSpendBundles()`
 - `greenweb.sexp`
     - add the `uncurry()` method
     - add the `standardCoinSolution()` method
     - TODO: add the `CATSolution()` method
     - TODO: update tests
 - `SmartCoin`: **BREAKING CHANGES**
      - add `solution` property and the `withSolution()` & `isSpendable()` methods
      - spend no longer requires the solution parameter
      - update tests
 - `StandardCoin`: **BREAKING CHANGES**
      - rename `publicKey` to `syntheticKey`
      - use `syntheticKey` and `publicKey` parameters instead of `publicKey` and `isSyntheticKey`
      - remove the `forceUsePuzzle` parameter
      - add the `withSyntheticKey()` method
      - add the `addConditionsToInnerSolution()` method
      - update tests
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
 