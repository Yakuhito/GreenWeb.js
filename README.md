## GreenWeb.js

[![GitHub license](https://badgen.net/github/license/yakuhito/GreenWeb.js.svg)](https://github.com/yakuhito/GreenWeb.js/blob/master/LICENSE) [![GitHub commits](https://badgen.net/github/commits/yakuhito/GreenWeb.js)](https://GitHub.com/yakuhito/GreenWeb.js/commit/) [![GitHub latest commit](https://badgen.net/github/last-commit/yakuhito/GreenWeb.js)](https://GitHub.com/yakuhito/GreenWeb.js/commit/) [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/yNVNvQyYXn) [![GitHub stars](https://badgen.net/github/stars/yakuhito/GreenWeb.js)](https://GitHub.com/yakuhito/GreenWeb.js/stargazers/) [![GitHub watchers](https://badgen.net/github/watchers/yakuhito/GreenWeb.js/)](https://GitHub.com/yakuhito/GreenWeb.js/watchers/)

This library allows developers to connect to a remote [Chia](https://www.chia.net/) node using the official wallet protocol.

**No SPV checks are performed when quering data. Only connect to trusted nodes.**

Please read the [documentation](https://greenwebjs.readthedocs.io) for more.

## Installation

Bbuild using the GreenWeb.js repository:

```
npm run build
```

Then include `dist/web3.min.js` in your html file

## Documentation

Documentation can be found at [ReadTheDocs](https://greenwebjs.readthedocs.io).

## Testing 

```
npm test
```

If you point `chianode.test` to a running Chia node, you can also run a few more tests:

```
npm run test-extensive
```

## Community

Join the [Discord server](https://discord.gg/yNVNvQyYXn)