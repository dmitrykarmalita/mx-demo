const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer')
const cssEasyImport = require('postcss-easy-import')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, options) => {

  const isProduction = options.mode != 'production'
  const distFolder = './docs'

  return {

    target: 'web',

    entry: [
      // './src/index.js',
      './src/styles/index.scss',
    ],

    output: {
      path: path.resolve(__dirname, distFolder),
      publicPath: '',
      filename: '[name].js'
    },

    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            test: /\.css$/,
            name: 'styles',
            chunks: 'all',
            enforce: true
          }
        }
      }
    },

    module: {
      rules: [{
          test: /\.(js|jsx)$/,
          exclude: [/node_modules/],
          use: [{
            loader: 'babel-loader',
          }]
        },
        {
          test: /\.(css|scss)$/,
          exclude: /\.module\.(css|scss)$/,
          use: [
            // style-loader injects all the css styles inside the js code using element.style.
            // is it a requirement for HMR so there won't be any refresh of the page.
            // in production it is a bad idea because if the css are inside some JS bundles, then the main page can't be loaded until all the css files are downloaded by the browser.
            // most of the time the css files are small and should load seperatly by the browser for fast first loading.
            // MiniCssExtractPlugin.loader extract all the css to a different bundle.
            {
              loader: isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
              options: {
                // you can specify a publicPath here
                // by default it use publicPath in webpackOptions.output
                // publicPath: '../'
              }
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: false,
                localIdentName: '[name]_[local]_[hash:base64:5]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProduction,
                plugins: () => [
                  autoprefixer,
                  cssEasyImport,
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: !isProduction,
              },
            },
          ],
        },
        {
          test: /\.png$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'image/png'
            }
          }]
        },
        {
          test: /\.jpg$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'image/jpg',
              name: '[name].[hash:7].[ext]',
            }
          }]
        },
        {
          test: /\.gif$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'image/gif',
              name: '[name].[hash:7].[ext]',
            }
          }]
        },
        {
          test: /.(svg?)(\?[a-z0-9]+)?$/,
          loader: 'url-loader',
          query: {
            limit: 10000,
            mimetype: 'image/svg+xml',
            name: '[name].[hash:7].[ext]',
            outputPath: 'assets/',
          },
        },
        {
          test: [/\.eot$/, /\.ttf$/, /\.woff$/, /\.woff2$/],
          loader: 'file-loader',
          options: {
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
      ]
    },

    resolve: {
      extensions: ['.js', '.scss'],
    },

    plugins: [

      new CleanWebpackPlugin([distFolder], {
        root: __dirname, //  Useful when relative references are used in array
        verbose: true,
        dry: false,
      }),

      new HtmlWebpackPlugin({
        filename: 'index.html', // target name
        template: './src/index.html',
        publicPath: '/',
        inject: 'body',
        minify: false, // ref: https://github.com/kangax/html-minifier#options-quick-reference
      }),

      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: '[name].css',
      }),

      new CopyWebpackPlugin([
        { from: './static', to: '' },
      ], {
        ignore: [
          '.gitkeep',
        ],
        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: true,
      }),

    ],

    stats: {
      children: false,
      maxModules: 0,
    },

    devServer: {
      contentBase: './static',
      historyApiFallback: true,
      hot: true,
      compress: true,
      port: 3000,
      stats: {
        children: false,
        maxModules: 0,
      },
    }
  }
};
