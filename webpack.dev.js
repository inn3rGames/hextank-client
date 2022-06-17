const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    devtool: "eval-cheap-source-map",
    devServer: {
        host: "0.0.0.0",
        port: 8080,
        static: path.join(__dirname, "public"),
        hot: true,
        devMiddleware: {
            publicPath: "/",
        },
        open: true,
    },
});
