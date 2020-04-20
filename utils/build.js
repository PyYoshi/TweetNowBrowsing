const webpack = require('webpack');
const config = require('../webpack.config');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const archiver = require('archiver');

delete config.chromeExtensionBoilerplate;

webpack(config, (err) => {
  if (err) {
    throw err;
  }

  if (process.env.NODE_ENV === 'production') {
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
      zip.on('error', (zipErr) => {
        throw zipErr;
      });

      zip.directory(path.join(__dirname, '../', 'build'), false).finalize();
    });
  }
});
