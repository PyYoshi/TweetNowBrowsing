var webpack = require('webpack'),
  env = require('./env'),
  config = require('../webpack.config'),
  fs = require('fs'),
  path = require('path'),
  rimraf = require('rimraf'),
  archiver = require('archiver');

delete config.chromeExtensionBoilerplate;

webpack(config, function(err) {
  if (err) {
    throw err;
  }

  if (env.NODE_ENV === 'production') {
    const zipPath = path.join(__dirname, '../', 'release.zip');

    rimraf(zipPath, (rimrafErr) => {
      if (rimrafErr) {
        throw rimrafErr;
      }

      const output = fs.createWriteStream(zipPath);
      const zip = archiver('zip', {
        zlib: { level: 9 }
      });
      zip.pipe(output);
      zip.on('error', function(zipErr) {
        throw zipErr;
      });

      zip.directory(path.join(__dirname, '../', 'build'), false).finalize();
    });
  }
});
