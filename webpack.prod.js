const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const baseConfig = require('./webpack.base.js');

const baseUrl = '/games/minesweeper-v2/';
const scssRule = baseConfig.rules.scss;
scssRule.use[3].options.additionalData = `$baseUrl: "${baseUrl}";`;

module.exports = merge(baseConfig.baseConfig, {
  mode: 'production',
  module: {
    rules: [ scssRule ],
  },
  plugins: [
    new UglifyJSPlugin({
      cache: true,
      parallel: true,
      sourceMap: true,
    }),
    new OptimizeCSSAssetsPlugin({}),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      BASE_URL: JSON.stringify(baseUrl),
    })
  ],
  devtool: 'source-map',
});