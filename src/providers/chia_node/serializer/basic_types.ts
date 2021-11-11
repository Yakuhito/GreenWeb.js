// boolean = boolean
export type bytes = string; // hex, does not incude 0x
// list = Array<any> / any[]
export type Optional<T> = T | null;
// string = string
// touple = [...types: any]
export type uint = number;
// PrivateKey = bytes32
// G1Element = bytes48
// G2Element = bytes96

/*
yakuhito@furry-battlestation:/tmp/test$ python3
Python 3.9.5 (default, May 11 2021, 08:20:37) 
[GCC 10.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 
>>> from blspy import G1Element, G2Element, PrivateKey
>>> PrivateKey.PRIVATE_KEY_SIZE
32
>>> G1Element.SIZE
48
>>> G2Element.SIZE
96
>>> exit()
yakuhito@furry-battlestation:/tmp/test$
*/