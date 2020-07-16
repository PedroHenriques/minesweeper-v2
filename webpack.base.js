const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports.rules = {
  ts: {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/
  },

  scss: {
    test: /\.s?[ac]ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      { loader: 'css-loader', options: { url: false, sourceMap: true } },
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [require('autoprefixer')({
            'browsers': ['> 1%', 'last 2 versions']
          })],
        }
      },
      {
        loader: 'sass-loader',
        options: { sourceMap: true },
      },
    ],
  },
};

module.exports.baseConfig = {
  entry: ['whatwg-fetch', './src/ts/index.tsx'],
  module: {
    rules: [ module.exports.rules.ts ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/bundle.css',
    }),
    new webpack.WatchIgnorePlugin([
      /\.js$/,
      /\.d\.ts$/,
    ]),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: path.resolve(__dirname, 'src', 'index.template.html'),
      filename: 'index.html',
    }),
  ],
};