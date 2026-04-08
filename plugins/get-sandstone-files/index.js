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

              // Keep files at their original paths under dist/
              const relativePath = path.relative(localSandstoneDist, fullPath).replace(/\\/g, '/');
              const name = relativePath.replace(/\.d\.ts$/, '');
              const fileName = `file:///node_modules/sandstone/${name}.d.ts`;

              if (name === 'exports/index' || name === 'exports/commands/index') {
                console.log(`[get-sandstone-files] Registering ${name} at ${fileName}`);
              }
              sandstoneFiles.push([source, fileName]);
            }

            // Also include package.json files for module boundaries
            const internalPkgJson = path.join(localSandstoneDist, '_internal/package.json');
            if (fs.existsSync(internalPkgJson)) {
              sandstoneFiles.push([
                fs.readFileSync(internalPkgJson, 'utf-8'),
                'file:///node_modules/sandstone/_internal/package.json'
              ]);
            }

            // Create root package.json with exports field
            const localPkgJson = path.resolve(__dirname, '../../../sandstone/package.json');
            if (fs.existsSync(localPkgJson)) {
              const pkg = JSON.parse(fs.readFileSync(localPkgJson, 'utf-8'));
              // Rewrite exports to point to .d.ts files
              const exportsForMonaco = {};
              for (const [key, value] of Object.entries(pkg.exports || {})) {
                if (typeof value === 'object' && value.types) {
                  // Rewrite ./dist/exports/... to ./exports/...
                  exportsForMonaco[key] = { types: value.types.replace('./dist/', './') };
                }
              }
              const monacoRootPkg = JSON.stringify({
                name: 'sandstone',
                version: pkg.version,
                exports: exportsForMonaco,
              }, null, 2);
              sandstoneFiles.push([monacoRootPkg, 'file:///node_modules/sandstone/package.json']);
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
        // Use unpkg's ?meta endpoint to list all files in dist/
        const metaRequest = await fetch("https://unpkg.com/sandstone@beta/dist/?meta");
        const meta = await metaRequest.json();

        // Extract package version from the response
        const packageVersion = `sandstone@${meta.version}`;
        console.log(`[get-sandstone-files] Fetching types from unpkg (${packageVersion})`);

        // Filter for .d.ts files and package.json files
        const dtsFiles = meta.files.filter(f => f.path.endsWith('.d.ts'));
        const packageJsonFiles = meta.files.filter(f => f.path.endsWith('package.json'));

        // Fetch all .d.ts files
        sandstoneFiles = await Promise.all(
          dtsFiles.map(async (file) => {
            // file.path is like "/dist/foo/bar.d.ts"
            const url = `https://unpkg.com/${packageVersion}${file.path}`;
            let source = await (await fetch(url)).text();
            // Transform .js imports to .d.ts for Monaco resolution
            source = source.replace(/from ["']([^"']+)\.js["']/g, 'from "$1.d.ts"');
            source = source.replace(/import\(["']([^"']+)\.js["']\)/g, 'import("$1.d.ts")');
            // Transform import(".") to import("./index.d.ts") for Monaco
            source = source.replace(/import\(["']\.["']\)/g, 'import("./index.d.ts")');

            // Keep files at their original paths under dist/
            const name = file.path.replace(/^\/dist\//, '').replace(/\.d\.ts$/, '');

            return [
              source,
              `file:///node_modules/sandstone/${name}.d.ts`,
            ];
          })
        );

        // Fetch package.json files (like _internal/package.json) for proper module boundaries
        const packageJsonEntries = await Promise.all(
          packageJsonFiles.map(async (file) => {
            const url = `https://unpkg.com/${packageVersion}${file.path}`;
            const source = await (await fetch(url)).text();
            const name = file.path.replace(/^\/dist\//, '');
            return [source, `file:///node_modules/sandstone/${name}`];
          })
        );
        sandstoneFiles.push(...packageJsonEntries);

        // Create root package.json with exports field for Monaco module resolution
        const rootPackageJson = JSON.stringify({
          name: 'sandstone',
          version: meta.version,
          exports: {
            '.': { types: './exports/index.d.ts' },
            './arguments': { types: './exports/arguments/index.d.ts' },
            './commands': { types: './exports/commands/index.d.ts' },
            './core': { types: './exports/core/index.d.ts' },
            './flow': { types: './exports/flow/index.d.ts' },
            './pack': { types: './exports/pack/index.d.ts' },
            './variables': { types: './exports/variables/index.d.ts' },
          },
        }, null, 2);
        sandstoneFiles.push([rootPackageJson, 'file:///node_modules/sandstone/package.json']);

        console.log(`[get-sandstone-files] Using unpkg sandstone types (${sandstoneFiles.length} files, including package.json)`);
      }

      // Create global declarations by re-exporting from sandstone module
      // Use the package name so it resolves via exports field
      const globalTypesContent = `
import type * as Sandstone from 'sandstone'

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
