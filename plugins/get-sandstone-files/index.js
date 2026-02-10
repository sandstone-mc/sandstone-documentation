const isDev = process.env.NODE_ENV === "development";
console.log('[get-sandstone-files] Plugin loaded, isDev:', isDev);

// Recursively find all .d.ts files in a directory
function findDtsFiles(fs, path, dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findDtsFiles(fs, path, fullPath, files);
    } else if (entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * @param {import("@docusaurus/types").LoadContext} context
 */
module.exports = function (context) {
  return {
    name: "get-sandstone-files",

    async loadContent() {
      try {
      console.log('[get-sandstone-files] loadContent() called');
      let sandstoneExports;
      let sandstoneFiles = [];
      let usedLocalTypes = false;

      // In dev mode, try to read from local linked packages
      if (isDev) {
        try {
          // Dynamic require to avoid webpack bundling
          const fs = eval('require')('fs');
          const path = eval('require')('path');

          console.log('[get-sandstone-files] Checking local packages...');

          // Try local playground exports
          const localExportsPath = path.resolve(__dirname, '../../node_modules/@sandstone-mc/playground/dist/exports.js');
          console.log('[get-sandstone-files] Checking exports at:', localExportsPath, 'exists:', fs.existsSync(localExportsPath));
          if (fs.existsSync(localExportsPath)) {
            const content = fs.readFileSync(localExportsPath, 'utf-8');
            sandstoneExports = JSON.parse(content.split(' = ')[1].replace(';', ''));
            console.log(`[get-sandstone-files] Using local playground exports (${sandstoneExports.length} exports)`);
          }

          // Try local sandstone types - use local workspace build directly (hackfix until docs migrates to bun)
          const localSandstoneDist = path.resolve(__dirname, '../../../sandstone/dist');
          console.log('[get-sandstone-files] Checking sandstone at:', localSandstoneDist, 'exists:', fs.existsSync(localSandstoneDist));
          if (fs.existsSync(localSandstoneDist)) {
            const dtsFiles = findDtsFiles(fs, path, localSandstoneDist);
            console.log(`[get-sandstone-files] Found ${dtsFiles.length} local .d.ts files`);

            for (const fullPath of dtsFiles) {
              let source = fs.readFileSync(fullPath, 'utf-8');
              // Transform .js imports to .d.ts for Monaco resolution
              source = source.replace(/from ["']([^"']+)\.js["']/g, 'from "$1.d.ts"');
              source = source.replace(/import\(["']([^"']+)\.js["']\)/g, 'import("$1.d.ts")');
              // Transform import(".") to import("./index.d.ts") for Monaco
              source = source.replace(/import\(["']\.["']\)/g, 'import("./index.d.ts")');
              // Get relative path from dist folder (normalize to forward slashes for URLs)
              const relativePath = path.relative(localSandstoneDist, fullPath).replace(/\\/g, '/');
              const name = relativePath.replace(/\.d\.ts$/, '');
              // Register at node_modules/sandstone for proper module resolution
              const fileName = `file:///node_modules/sandstone/${name}.d.ts`;
              if (name === 'index' || name === 'commands/index') {
                console.log(`[get-sandstone-files] Registering ${name} at ${fileName}`);
              }
              sandstoneFiles.push([
                source,
                fileName,
              ]);
            }

            if (sandstoneFiles.length > 0) {
              usedLocalTypes = true;
              console.log(`[get-sandstone-files] Using local sandstone types (${sandstoneFiles.length} files)`);
            }
          }
        } catch (e) {
          console.warn('[get-sandstone-files] Failed to load local files:', e.message);
        }
      }

      // Fallback to unpkg for exports
      if (!sandstoneExports) {
        sandstoneExports = JSON.parse(
          (await (await fetch('https://unpkg.com/@sandstone-mc/playground@latest/dist/exports.js')).text())
            .split(' = ')[1]
            .replace(';', '')
        );
        console.log(`[get-sandstone-files] Using unpkg playground exports (${sandstoneExports.length} exports)`);
      }

      // Fallback to unpkg for types
      if (!usedLocalTypes) {
        const buildInfoRequest = await fetch(
          "https://unpkg.com/sandstone@latest/tsconfig.tsbuildinfo"
        );
        const buildInfo = await buildInfoRequest.json();
        sandstoneFiles = (
          await Promise.all(
            buildInfo.program.fileNames.map(async (file) => {
              const sourceFilePath = file.match(/^\.\/src\/([^\x00]+?)\.ts$/);
              if (sourceFilePath && sourceFilePath[1]) {
                const url = `https://unpkg.com/${
                  buildInfoRequest.url.match(/\/(sandstone@(.+?))\//)?.[1]
                }/dist/${sourceFilePath[1]}.d.ts`;
                let source = await (await fetch(url)).text();
                // Transform .js imports to .d.ts for Monaco resolution
                source = source.replace(/from ["']([^"']+)\.js["']/g, 'from "$1.d.ts"');
                source = source.replace(/import\(["']([^"']+)\.js["']\)/g, 'import("$1.d.ts")');
                // Transform import(".") to import("./index.d.ts") for Monaco
                source = source.replace(/import\(["']\.["']\)/g, 'import("./index.d.ts")');
                const name = sourceFilePath[1];

                return [
                  source,
                  `file:///node_modules/sandstone/${name}.d.ts`,
                ];
              }
              return null;
            })
          )
        ).filter((x) => x !== null);
        console.log(`[get-sandstone-files] Using unpkg sandstone types (${sandstoneFiles.length} files)`);
      }

      // Create global declarations by re-exporting from sandstone module
      const globalTypesContent = `
import type * as Sandstone from './index.d.ts'

declare global {
  ${sandstoneExports.map((e) => `const ${e}: typeof Sandstone.${e}`).join("\n  ")}
}
      `;
      console.log('[get-sandstone-files] globalTypes.d.ts content preview:', globalTypesContent.slice(0, 500));
      sandstoneFiles.push([
        globalTypesContent,
        "file:///node_modules/sandstone/globalTypes.d.ts",
      ]);

      console.log('[get-sandstone-files] loadContent() completed, files:', sandstoneFiles.length, 'exports:', sandstoneExports?.length);
      return {
        sandstoneFiles: sandstoneFiles,
        sandstoneExports: sandstoneExports,
      };
      } catch (e) {
        console.error('[get-sandstone-files] loadContent() FAILED:', e);
        throw e;
      }
    },

    async contentLoaded({ content, actions }) {
      const { sandstoneFiles, sandstoneExports } = content;
      const { setGlobalData } = actions;
      setGlobalData({ sandstoneFiles, sandstoneExports });
    },
  };
};
