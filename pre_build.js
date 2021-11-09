// https://github.com/Chia-Mine/clvm-js/blob/main/pre_build.js

const path = require("path");
const fs = require("fs");

// clean and create output dir
const distDir = path.join(__dirname, "dist");
if(fs.existsSync(distDir)){
  fs.rmdirSync(distDir, {recursive: true});
}
fs.mkdirSync(distDir);
const distNpmDir = path.join(distDir, "npm");
fs.mkdirSync(distNpmDir);

// Copy wasm file
const browserDir = path.join(distNpmDir, "browser");
// if(fs.existsSync(browserDir)){
//   fs.rmdirSync(browserDir, {recursive: true});
// }
// fs.mkdirSync(browserDir);
// const blsWasmSrcPath = path.join(__dirname, "node_modules", "@chiamine", "bls-signatures", "blsjs.wasm");
// const blsWasmDestPath = path.join(browserDir, "blsjs.wasm");
// if(!fs.existsSync(blsWasmSrcPath)){
//   console.error("blsjs.wasm not found at:");
//   console.error(blsWasmSrcPath);
//   console.error("Probably you haven't execute npm install yet");
//   return;
// }
// fs.copyFileSync(blsWasmSrcPath, blsWasmDestPath);
const browserDtsPath = path.join(browserDir, "index.d.ts");
fs.writeFileSync(browserDtsPath, 'export * from "..";\n');


const packageJson = require("./package.json");
fs.writeFileSync(path.join(distNpmDir, "package.json"), JSON.stringify(packageJson, null, 2));

function copyFileToPublish(fileName){
  const srcPath = path.join(__dirname, fileName);
  const distPath = path.join(distNpmDir, fileName);
  if(fs.existsSync(srcPath)){
    fs.copyFileSync(srcPath, distPath);
  }
}

copyFileToPublish("CHANGELOG.md");
copyFileToPublish("LICENSE");
copyFileToPublish("README.md");