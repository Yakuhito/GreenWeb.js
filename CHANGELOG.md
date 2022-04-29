# Changelog

## 1.1.6
 - Modify return types of the `Provider.tranfer()`, `Provider.transferCAT()`, and `Provider.acceptOffer()` methods from `Promise<boolean>` to `Promise<Optional<SpendBundle>>`
 - Add `XCHModule.createProvider()` helper method
 - Add `greenweb.util.sexp.curry()`
 - Improve `MultiProvider` method/provider resolution
 - Add `SmartCoin.curry()`
 - Create `greenweb.util.goby`