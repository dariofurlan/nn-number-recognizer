const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    target: 'web',
    entry: path.join(__dirname, "src/index.js"),
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        host: '0.0.0.0',
        port: 8000
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        new webpack.DefinePlugin({
            __EXAMPLE__: JSON.stringify("AAAA")
        }),
        new CleanWebpackPlugin(["dist/*.*"]),
    ],
    module: {
        rules: [{
            test: /\.scss/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }],
    },
});