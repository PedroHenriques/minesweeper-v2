const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');

const baseUrl = '/';
const scssRule = baseConfig.rules.scss;
scssRule.use[3].options.additionalData = `$baseUrl: "${baseUrl}";`;

module.exports = merge(baseConfig.baseConfig, {
  mode: 'development',
  module: {
    rules: [ scssRule ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      BASE_URL: JSON.stringify(baseUrl),
    })
  ],
  devtool: 'inline-source-map',
});