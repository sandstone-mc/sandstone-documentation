/**
 * @param {import("@docusaurus/types").LoadContext} context 
 */
module.exports = function (context) {
  return {
      name: 'custom-webpack-plugin',

      /**
       * 
       * @param {import("webpack").Configuration} _config 
       * @param {boolean} isServer 
       * @param {Object} utils 
       * @returns 
       */
      configureWebpack(_config, isServer, utils) {
        return {
          resolve: {
            fallback: {
              path: require.resolve('path-browserify'),
              os: require.resolve('os-browserify/browser'),
              constants: require.resolve('constants-browserify'),
              stream: require.resolve('stream-browserify'),
              util: require.resolve("util/"),
              buffer: require.resolve("buffer/"),
              fs: false,
              assert: false,
            }
          },

          module: {
            // Prevent errors / warnings from Webpack
            noParse: [require.resolve('typescript/lib/typescript.js')],
          }
        };
      },
    };
};