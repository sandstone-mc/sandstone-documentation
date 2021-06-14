const fetch = require('node-fetch')
const SandstoneRootObject = require('sandstone')
const fs = require('fs/promises')
const path = require('path')

/**
 * @param {import("@docusaurus/types").LoadContext} context 
 */
module.exports = function (context) {
  return {
    name: 'get-sandstone-files',

    async loadContent() {
      const sandstoneFolder = path.resolve(path.join('node_modules', 'sandstone'))

      const buildInfo = JSON.parse(await fs.readFile(path.join(sandstoneFolder, 'tsconfig.tsbuildinfo')))

      const sandstoneFiles = (await Promise.all(Object.keys(buildInfo.program.fileInfos).map(async (file) => {
        const sourceFilePath = file.match(/^\.\.\/src\/([^]+)\.ts$/);

        if (sourceFilePath && sourceFilePath[1]) {
          const source = (await fs.readFile(path.join(sandstoneFolder, ...sourceFilePath.slice(1, -1), sourceFilePath[sourceFilePath.length - 1] + '.d.ts'))).toString()
          const name = sourceFilePath[1]

          return [
            source,
            `file:///node_modules/@types/sandstone/${name}.d.ts`,
          ]
        }
        return null
      }))).filter(x => x !== null)

      const sandstoneExports = Object.keys(SandstoneRootObject)
      sandstoneFiles.push([`
        import {${sandstoneExports.join(',')}} from 'sandstone'
        ${sandstoneExports.map(e => `type type__${e} = typeof ${e}`).join('\n')}
        
        declare global {
          ${sandstoneExports.map(e => `const ${e}: type__${e}`).join('\n  ')}
        }
      `, 'file:///node_modules/@types/sandstone/globalTypes.d.ts'])

      return {
        sandstoneFiles: Buffer.from(JSON.stringify(sandstoneFiles)),
      }
    },

    async contentLoaded({content, actions}) {
      const { sandstoneFiles } = content
      const { setGlobalData } = actions
      // Make sandstone files accessible everywhere
      setGlobalData({ sandstoneFiles })
    },
  }
}