const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    entry: path.join(__dirname,"src"),
    plugins: [

    ]
});