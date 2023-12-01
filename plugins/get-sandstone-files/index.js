const fs = require("fs");
const path = require("path");
const SandstoneRootObject = require("sandstone");

/**
 * @param {import("@docusaurus/types").LoadContext} context
 */
module.exports = function (context) {
  return {
    name: "get-sandstone-files",

    async loadContent() {
      const buildInfoRequest = await fetch(
        "https://unpkg.com/sandstone@0.12.11/tsconfig.tsbuildinfo"
      );
      const buildInfo = await buildInfoRequest.json();

      const sandstoneFiles = (
        await Promise.all(
          Object.keys(buildInfo.program.fileInfos).map(async (file) => {
            const sourceFilePath = file.match(/^\.\.\/src\/([^]+)\.ts$/);

            if (sourceFilePath && sourceFilePath[1]) {
              const source = await (
                await fetch(
                  `https://unpkg.com/${
                    buildInfoRequest.url.match(/(sandstone@(\d{1,2}\.?)+)/)?.[0]
                  }/${sourceFilePath[1]}.d.ts`
                )
              ).text();
              const name = sourceFilePath[1];

              return [
                source,
                `file:///node_modules/@types/sandstone/${name}.d.ts`,
              ];
            }
            return null;
          })
        )
      ).filter((x) => x !== null);

      const sandstoneExports = Object.keys(SandstoneRootObject);
      sandstoneFiles.push([
        `
        import {${sandstoneExports.join(",")}} from 'sandstone'
        ${sandstoneExports
          .map((e) => `type type__${e} = typeof ${e}`)
          .join("\n")}
        
        declare global {
          ${sandstoneExports.map((e) => `const ${e}: type__${e}`).join("\n  ")}
        }
      `,
        "file:///node_modules/@types/sandstone/globalTypes.d.ts",
      ]);

      return {
        sandstoneFiles,
      };
    },

    async contentLoaded({ content, actions }) {
      const { sandstoneFiles } = content;
      const { setGlobalData } = actions;
      // Make sandstone files accessible everywhere
      setGlobalData({ sandstoneFiles });
    },
  };
};
