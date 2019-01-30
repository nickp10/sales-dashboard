const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const BUILD_DIR = path.resolve(__dirname, "./build");
const APP_DIR = path.resolve(__dirname, "./src/client");

module.exports = {
    entry: {
        main: APP_DIR + "/index.tsx"
    },
    output: {
        filename: "client.js",
        path: BUILD_DIR,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: [{
                    loader: "ts-loader"
                }]
            },
            {
                test: /\.(js|jsx)$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        presets: ["@babel/preset-react", "@babel/preset-env"],
                        plugins: ["transform-class-properties"]
                    }
                }]
            },
            {
                test: /\.(css)$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }]
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: [{
                    loader: "url-loader",
                    options: {
                        limit: 10000
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: APP_DIR + "/index.ejs",
            inject: "body"
        })
    ]
};
