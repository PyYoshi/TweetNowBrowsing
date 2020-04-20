const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('../webpack.config');
const path = require('path');

const options = config.chromeExtensionBoilerplate || {};
const excludeEntriesToHotReload = options.notHotReload || [];

const devServerConfig = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000
};

// eslint-disable-next-line no-restricted-syntax
for (const entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      `webpack-dev-server/client?http://${devServerConfig.HOST}:${devServerConfig.PORT}`,
      'webpack/hot/dev-server'
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || []);

delete config.chromeExtensionBoilerplate;

const compiler = webpack(config);

const server = new WebpackDevServer(compiler, {
  hot: true,
  contentBase: path.join(__dirname, '../build'),
  headers: { 'Access-Control-Allow-Origin': '*' }
});

server.listen(devServerConfig.PORT);
