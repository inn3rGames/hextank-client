const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./public/draco", to: "./draco" },
                { from: "./public/ktx2", to: "./ktx2" },
                { from: "./public/smallLogo.png", to: "./" },
            ],
        }),
    ],
});
