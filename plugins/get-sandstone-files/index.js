/**
 * @param {import("@docusaurus/types").LoadContext} context
 */
module.exports = function (context) {
  return {
    name: "get-sandstone-files",

    async loadContent() {
      const buildInfoRequest = await fetch(
        "https://unpkg.com/sandstone@latest/tsconfig.tsbuildinfo"
      );
      const buildInfo = await buildInfoRequest.json();
      const sandstoneFiles = (
        await Promise.all(
          buildInfo.program.fileNames.map(async (file) => {
            const sourceFilePath = file.match(/^\.\/src\/([^\x00]+?)\.ts$/);
            if (sourceFilePath && sourceFilePath[1]) {
              const url = `https://unpkg.com/${
                buildInfoRequest.url.match(/\/(sandstone@(.+?))\//)?.[1]
              }/dist/${sourceFilePath[1]}.d.ts`;
              const source = await (await fetch(url)).text();
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

      const sandstoneExports = JSON.parse((await (await fetch('https://unpkg.com/@sandstone-mc/playground@0.1.3/dist/exports.js')).text()).split(' = ')[1].replace(';', ''))
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
        sandstoneFiles: sandstoneFiles,
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
