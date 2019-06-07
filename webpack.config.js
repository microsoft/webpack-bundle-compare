const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { DefinePlugin } = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { BundleComparisonPlugin } = require('./');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: path.join(__dirname, 'src', 'client', 'index.tsx'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'plotly.js/dist/plotly': 'plotly.js-dist',
    },
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.component.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]__[hash:base64:5]',
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new BundleComparisonPlugin(),
    new HtmlWebpackPlugin({
      title: 'Webpack Bundle Compare',
    }),
    new CopyPlugin([{ from: path.join(__dirname, 'public'), to: 'public' }]),
    new DefinePlugin({
      INITIAL_FILES: process.env.WBC_FILES
        ? JSON.stringify(process.env.WBC_FILES.split(','))
        : JSON.stringify(['public/samples/spectrum1.msp.gz', 'public/samples/spectrum2.msp.gz']),
    }),
  ],
  devServer: {
    disableHostCheck: true,
  },
};
