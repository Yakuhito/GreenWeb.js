const fs = require("fs");
const path = require("path");
// const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  mode: "production",
  context: __dirname, // to automatically find tsconfig.json
  plugins: [/*new CleanWebpackPlugin()*/],
  devtool: false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {loader: "ts-loader", options: {transpileOnly: true, configFile: "tsconfig.json"}},
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false,
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
    path: path.resolve(__dirname, "dist", "npm", "browser"),
    filename: "index.js",
    library: ["greenweb"],
    libraryTarget: "umd",
    globalObject: "this",
  },
};