# Module Overview

The `greenweb.spend` module contains methods that are intended to help build `CoinSpend`s more easily.

# Helper Class - Announcement

Can be accessed as `greenweb.spend.Announcement`.

```js
export class Announcement {
    public originInfo?: bytes;
    public message?: bytes;
    public morphBytes?: bytes;

    constructor(
        originInfo?: bytes,
        message?: bytes,
        morphBytes?: bytes
    ) {
        this.originInfo = originInfo;
        this.message = message;
        this.morphBytes = morphBytes;
    }

    public name(): bytes {
        const toHash = (this.originInfo ?? "") + (this.morphBytes ?? "") + this.message;

        return Util.stdHash(toHash);
    }
}
```

# Functions

Note: All integer inputs (`uint`s) are [`BigNumberish`](https://docs.ethers.io/v5/api/utils/bignumber/).

## createCoinCondition

Helper for creating a `CREATE_COIN` condition.

```js
public static createCoinCondition(puzzleHash: bytes, amount: uint, memos: bytes[] = []): SExp {
```

## reserveFeeCondition

Helper for creating a `RESERVE_FEE` / `ASSERT_FEE` condition.

```js
public static reserveFeeCondition(fee: uint): SExp {
```

## createCoinAnnouncementCondition

Helper for creating a `CREATE_COIN_ANNOUNCEMENT` condition.

```js
public static createCoinAnnouncementCondition(message: bytes): SExp {
```

## assertCoinAnnouncementCondition

Helper for creating a `ASSERT_COIN_ANNOUNCEMENT` condition.

```js
public static assertCoinAnnouncementCondition(announcementId: bytes): SExp {
```

## createPuzzleAnnouncementCondition

Helper for creating a `CREATE_PUZZLE_ANNOUNCEMENT` condition.

```js
public static createPuzzleAnnouncementCondition(message: bytes): SExp {
```

## assertPuzzleAnnouncementCondition

Helper for creating a `ASSERT_PUZZLE_ANNOUNCEMENT` condition.

```js
public static assertPuzzleAnnouncementCondition(announcementId: bytes): SExp {
```

## bundleStandardCoins

Bundles `StandardCoin`s together. Using this method is not recommended, since coins won't be linked using announcements unless `firstCoinConditions` and `otherCoinsConditions` are specially crafted to do so. Use `bundle()` instead.

```js
public static bundleStandardCoins(
    standardCoins: StandardCoin[],
    firstCoinConditions: SExp[],
    otherCoinsConditions: SExp[],
): CoinSpend[] {
```

## bundleCATs

Bundles `CATs`s together. CATs are linked in a ring when spent, so this method should be safe to use outside the laboratory. Automatically calculates `prevCoinId`, `nextCoin`, and `prevSubtotal` for all `CAT`s.

```js
public static bundleCATs(
    CATs: CAT[],
    firstCoinConditions: SExp[],
    otherCoinsConditions: SExp[],
): CoinSpend[] {
```

## bundle

Recommended way of bundling multiple `StandardCoin`s and or `CAT`s with the same TAIL Program into a single transaction. The list of `CoinSpend`s can be included in a `SpendBundle`. Automatically calculates `prevCoinId`, `nextCoin`, and `prevSubtotal` for all `CAT`s. Links `StandardCoin`s and/or `CAT`s together using announcements. Output conditions are only asserted by one `StandardCoin` and/or `CAT`; the others just 'burn' so their amounts can be used.

```js
export type BundleArgs = {
    standardCoinOutputConditions?: SExp[],
    CATOutputConditions?: SExp[],
    fee?: uint,
};

public static bundle(
    things: Array<CAT | StandardCoin>,
    {
        standardCoinOutputConditions = [],
        CATOutputConditions = [],
        fee = 0
    }: BundleArgs = {},
): CoinSpend[] {
```

## merge

Merges multiple `SpendBundle`s, `CoinSpend`s, and lists of `CoinSpend`s into a single `SpendBundle`.

```js
public static merge(things: Array<SpendBundle | CoinSpend | CoinSpend[]>): SpendBundle {
```
