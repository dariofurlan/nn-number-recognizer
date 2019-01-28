const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: 'web',
    entry: path.join(__dirname, "src/index.js"),
    plugins: [
        new CleanWebpackPlugin(["dist/*.*"]),
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        new CopyWebpackPlugin([{from: "src/dataset/dataset.json", to:"dataset.json"}])
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.scss/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }],
    },
};