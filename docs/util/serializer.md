# greenweb.util.serializers

## serialize

Serializes a given object.

```js
public serialize<T>(object: T): string {
    return Serializer.serialize(object).toString('hex');
}
```

## deserialize

Deserializes a given object.

```js
public deserialize<T>(classType: new (...args: any[]) => T, data: string): T {
    return Serializer.deserialize<T>(classType, data);
}
```

## fields

Contains a list of fields that can be used by serializable objects. See [this file](https://github.com/Yakuhito/GreenWeb.js/blob/master/src/util/serializer/types/fields/index.ts) for more info.

## types

Contains a list of serializable objects used by the wallet protocol. See [this file](https://github.com/Yakuhito/GreenWeb.js/blob/master/src/util/serializer/types/index.ts) for more info.