const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

module.exports = {
  optimization: {
    minimize: process.env.NODE_ENV === 'production' ? true : false,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        terserOptions: {
          mangle: false,
          sourceMap: process.env.NODE_ENV !== 'production' ? true : false
        }
      })
    ],
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  entry: {
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
        test: new RegExp(`.(${fileExtensions.join('|')})$`),
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
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['build']
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/manifest.json',
        transform(content) {
          const manifestJSON = JSON.parse(content.toString());

          if (process.env.NODE_ENV === 'production') {
            delete manifestJSON.key;
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
    new WriteFilePlugin()
  ]
};
