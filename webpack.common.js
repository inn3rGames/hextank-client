const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FontPreloadPlugin = require("webpack-font-preload-plugin");

module.exports = {
    entry: "./src/game.ts",
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|jpeg|gif|glb|woff|woff2)$/i,
                type: "asset/resource",
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist"),
        clean: true,
        publicPath: "",
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: "./public/index.html",
            favicon: "./public/favicon.ico",
        }),
        new MiniCssExtractPlugin(),
        new FontPreloadPlugin({
            crossorigin: true,
            extensions: ["woff", "woff2"],
            loadType: "preload",
        }),
    ],
};
