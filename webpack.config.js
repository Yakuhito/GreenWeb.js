const fs = require("fs");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  context: __dirname, // to automatically find tsconfig.json
  plugins: [],
  devtool: false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {loader: "ts-loader", options: {transpileOnly: true, configFile: "tsconfig.json"}},
        ],
        exclude: /node_modules|src\/providers\/chia_node/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false,
      "ws": false
    }
  },
  target: ["es5"],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_.+/,
            }
          },
        }
      }),
    ]
  },
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "greenweb.js",
    library: ["greenweb"],
    libraryTarget: "umd",
    globalObject: "this",
    chunkFormat: "commonjs"
  },
};