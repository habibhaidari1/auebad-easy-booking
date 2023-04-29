const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  experiments: {
    macArmChromiumEnabled: true,
  },
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
