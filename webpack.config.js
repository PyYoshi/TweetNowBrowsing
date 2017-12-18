var webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs'),
  env = require('./utils/env'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  WriteFilePlugin = require('write-file-webpack-plugin');

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

var vendor = ['lodash.isnumber', 'lodash.isstring', 'lodash.template', 'superagent', 'jquery', 'twitter-text'];

var options = {
  entry: {
    vendor: vendor,
    popup: path.join(__dirname, 'src', 'js', 'popup', 'index.js'),
    options: path.join(__dirname, 'src', 'js', 'options', 'index.js'),
    background: path.join(__dirname, 'src', 'js', 'background', 'index.js'),
    collect_tiwp: path.join(__dirname, 'src', 'js', 'content_scripts', 'collect_tiwp', 'index.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {}
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json',
        transform: function(content, path) {
          var manifestJSON = JSON.parse(content.toString());

          if (env.NODE_ENV === 'production') {
            delete manifestJSON['key'];
          }

          return Buffer.from(JSON.stringify(manifestJSON, null, '  '));
        }
      },
      {
        from: 'src/_locales',
        to: '_locales'
      },
      {
        from: 'LICENSE'
      },

      // Fonts: Material Icons
      {
        from: 'src/css/MaterialIcons-Regular.woff2'
      },

      // Fonts: Roboto
      // {
      //   from: "src/css/roboto-v18-latin-100.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-100italic.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-300.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-300italic.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-500.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-500italic.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-700.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-700italic.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-900.woff2"
      // },
      // {
      //   from: "src/css/roboto-v18-latin-900italic.woff2"
      // },
      {
        from: 'src/css/roboto-v18-latin-italic.woff2'
      },
      {
        from: 'src/css/roboto-v18-latin-regular.woff2'
      },

      // muicss
      {
        from: 'src/thirdparty/mui-0.9.35/css/mui.min.css',
        to: 'muicss'
      },
      {
        from: 'src/thirdparty/mui-0.9.35/js/mui.min.js',
        to: 'muicss'
      },
      {
        from: 'src/thirdparty/mui-0.9.35/LICENSE.txt',
        to: 'muicss'
      }
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['vendor', 'popup']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      chunks: ['vendor', 'options']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background.html'),
      filename: 'background.html',
      chunks: ['vendor', 'background']
    }),
    new WriteFilePlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor'],
      minChunks: Infinity
    })
  ]
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map';
}

module.exports = options;
