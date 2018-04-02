const path = require("path");
const webpack = require("webpack");

const BUILD_DIR = path.resolve(__dirname, "./build");
const APP_DIR = path.resolve(__dirname, "./src/server");

module.exports = {
    entry: {
        main: APP_DIR + "/index.ts"
    },
    externals: [
        /^[a-z\-0-9]+$/ // Exclude node_modules
    ],
    node: {
        __dirname: false
    },
    target: "node",
    output: {
        filename: "server.js",
        path: BUILD_DIR,
        libraryTarget: "commonjs"
    },
    module: {
        rules: [
            {
                test: /(\.ts)$/,
                use: [{
                    loader: "ts-loader"
                }]
            },
            {
                test: /\.(js)?$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        presets: ["env"]
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: "#! /usr/bin/env node",
            raw: true
        })
    ]
};
