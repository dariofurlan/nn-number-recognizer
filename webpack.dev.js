const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
        target: 'web',
        name: 'frontend',
        mode: 'development',
        entry: path.join(__dirname, "src/index.js"),
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 8000
        },
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "src/index.html"
            }),
            new webpack.DefinePlugin({
                __EXAMPLE__: JSON.stringify("AAAA")
            }),
        ]
    });