const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
                test: /\.(png|jpg|jpeg|gif|glb)$/i,
                type: "asset/resource",
            }
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist"),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: "./public/index.html",
            favicon: "./src/assets/images/favicon.ico",
        })
    ],
};
