#!/bin/bash

sed -i 's/"main": ".\/lib\/index.js"/"main": ".\/index.js"/g' lib/package.json
sed -i 's/"typings": ".\/lib\/index.d.ts"/"typings": ".\/index.d.ts"/g' lib/package.json