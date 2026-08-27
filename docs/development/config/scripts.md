---
id: scripts
title: Lifecycle scripts
description: Hooks that run before, during, and after a build.
---

# Lifecycle scripts

`scripts` lets you run arbitrary code at three points in the build. Use them for things the rest of `SandstoneConfig` can't express: writing dynamic config files, side-loading asset bundles, rerouting exports, posting build artifacts to a server, etc.

View current source here: [async function _buildProject()](https://github.com/search?q=repo%3Asandstone-mc%2Fsandstone-cli+symbol%3A_buildProject&type=code)

```ts
import type { BeforeAllLocal, BeforeSaveLocal, AfterAllLocal } from 'sandstone'

scripts?: {
  beforeAll?: (local: BeforeAllLocal) => void | undefined | boolean | Promise<void | undefined | boolean>
  beforeSave?: (local: BeforeSaveLocal) => void | undefined | boolean | Promise<void | undefined | boolean>
  afterAll?: (local: AfterAllLocal) => void | undefined | boolean | Promise<void | undefined | boolean>
}
```

## The `local` parameter

Each script receives a `local` object populated with every local variable and function that exists in the build process at the moment the script runs. The TypeScript types (`BeforeAllLocal`, `BeforeSaveLocal`, `AfterAllLocal`, exported from `sandstone`) reflect exactly what's available at that point; narrower at `beforeAll`, widest at `afterAll`.

Field names match the build's own variable names, so reading or reassigning a destination like `local.clientPath = '/new/path'` does the same thing as touching the variable in build code. The build reads from `local` after the script, so mutating destination fields reroutes the build.

What `local` contains at each phase:

| Field | `beforeAll` | `beforeSave` | `afterAll` |
|-------|-------------|--------------|------------|
| `folder`, `outputFolder` | ✓ | ✓ | ✓ |
| `sandstoneConfig`, `sandstonePack` | ✓ | ✓ | ✓ |
| `saveOptions`, `resources`, `scripts` | ✓ | ✓ | ✓ |
| `cliOptions`, `packageJson`, `entrypoint` | ✓ | ✓ | ✓ |
| `worldName`, `root`, `clientPath`, `serverPath`, `packName` | ✓ | ✓ | ✓ |
| `hash`, `syncLinkedLibraries`, `getClientPath`, `getClientWorldPath`, `checkSymlinksAvailable`, `fs` | ✓ | ✓ | ✓ |
| `cacheFile`, `oldCache`, `newCache`, `changedPackTypes`, `newDirs` | | ✓ | ✓ |
| `autoRegisterPackTypes`, `processExternalResources`, `processPackTypeOutput` | | ✓ | ✓ |
| `resourceCounts`, `exports` | | | ✓ |
| `createArchive`, `exportPack`, `getExportPath`, `runExportHandler`, `cleanupOldArchives`, `cleanupOldSymlinks`, `saveCache` | | | ✓ |

The script types are exported from `sandstone`:

```ts
import type { BeforeAllLocal, BeforeSaveLocal, AfterAllLocal } from 'sandstone'
```

## Mutating destinations

The most common reason to use a script is to change where the build writes. Reassign any of the destination fields on `local`:

```ts
scripts: {
  beforeAll: ({ clientPath, ...local }) => {
    if (Bun.env.SANDSTONE_RELEASE) {
      // Re-route to a release folder for tag-triggered CI builds
      local.clientPath = '/srv/minecraft/release/.minecraft'
    }
  },
}
```

The build picks up the new value on its next read.

## Skipping builder steps

Each script can return `void`, `undefined`, or `boolean`. Returning specifically `false` skips all builder code between the current script and the next entrypoint:

| Script | `false` skips |
|--------|---------------|
| `beforeAll` | Entry-point import, dependency injection, cache setup, symlink check, beforeSave function enrichment (until `beforeSave` runs). Your `beforeAll` is responsible for prepping `local` if you want `beforeSave` to see valid state. |
| `beforeSave` | Pack-type auto-registration, file exclusions, save, export, cleanup, resource counts, exports string, afterAll function enrichment (until `afterAll` runs). Your `beforeSave` is responsible for setting up `local.resourceCounts` / `local.exports` if you want `afterAll` to see valid values. |
| `afterAll` | The final `Pack(s) compiled!` log message |

The next entrypoint still runs and the skip only covers the build code in between.

```ts
scripts: {
  beforeSave: () => {
    if (Bun.env.SANDSTONE_SKIP_SAVE) {
      // Validation-only run: skip saving, but still let afterAll run.
      return false
    }
  },
}
```

## Examples

### Regenerate a typed config before the entrypoint loads

```ts
import { writeFileSync } from 'fs'

scripts: {
  beforeAll: ({ fs }) => {
    const config = computeConfig()
    fs.writeText('./src/generated/config.ts',
      `export const CONFIG = ${JSON.stringify(config)} as const\n`)
  },
}
```

### Emit an index of every MCFunction after resources are registered

```ts
scripts: {
  beforeSave: ({ sandstonePack, outputFolder, fs }) => {
    const list = sandstonePack.core.resourceNodes
      .map(n => n.resource.name)
      .sort()
    fs.writeJSON(`${outputFolder}/function_index.json`, list)
  },
}
```

### Post a build summary

```ts
scripts: {
  afterAll: async ({ resourceCounts, exports }) => {
    await fetch('https://my-ci.example.com/notify', {
      method: 'POST',
      body: JSON.stringify({ counts: resourceCounts, exports }),
    })
  },
}
```

## Async / sync

All three hooks accept both sync and async functions. The CLI awaits them. If a hook throws, the build fails with the hook's error message.

## Watch mode

The hooks fire on every watch tick. Keep them cheap. Move expensive work into a `beforeAll` that gates on a cache file, or into a `beforeSave` that diffs against the previous output.

## Error handling

A throw inside any script aborts the build. The error is reported with the same source-mapped stack trace as a compile error. If you want a script failure to be a warning instead, wrap the body in `try { … } catch (e) { console.warn(e) }` but note that this skips the rest of the build, since the build hasn't run yet at `beforeAll` / `beforeSave` time and has already finished by `afterAll`.

## Gotchas

- **`beforeAll` runs before your entrypoint is imported.** Anything that depends on your code's registered resources is unavailable. Use `beforeSave` for that.
- **`beforeSave` runs after `autoRegisterPackTypes`.** If you have existing files in `./resources/`, they've been registered by the time `beforeSave` fires.
- **`local.fs` is the CLI's filesystem wrapper**, not Node's `fs`. Some of the available methods are `readText`, `writeText`, `writeJSON`, `writeBytes`, `ensureDir`, `remove`, `pathExists`, `fileExists`, `readDirNames`.
- **Script state is module-level.** The same `scripts` object is shared across `build` and `watch` invocations within one CLI process. If you keep state in module-level variables, clear it at the start of each hook.
