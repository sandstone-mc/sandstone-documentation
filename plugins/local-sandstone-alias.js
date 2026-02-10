/**
 * Plugin to resolve sandstone imports to local workspace build.
 * Paths must be pre-resolved and passed as options.
 *
 * @param {import("@docusaurus/types").LoadContext} context
 * @param {{ alias: Record<string, string> }} options
 */
module.exports = function (context, options) {
  return {
    name: "local-sandstone-alias",

    configureWebpack() {
      return {
        resolve: {
          alias: options.alias,
        },
      };
    },
  };
};
