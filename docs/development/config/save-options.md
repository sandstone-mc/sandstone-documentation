---
id: save-options
title: Save Options
description: Where Sandstone writes the generated files.
---

# `saveOptions`

`saveOptions` controls where the build output goes. Every field is optional; the default behavior is to write only to `.sandstone/output/` in the project root, with no exports.

```ts
saveOptions?: {
  world?: string
  root?: true
  clientPath?: string
  serverPath?: string
  exportZips?: boolean
  customFileHandler?: (relativePath, content) => Promise<void>
  indentation?: string | number
}
```

## Destinations

The build picks destinations in this order, with the first match winning:

1. `cliOptions.root` / `cliOptions.world` / `cliOptions.clientPath` / `cliOptions.serverPath` (CLI flag or env var).
2. The corresponding field on `saveOptions`.
3. The detected `.minecraft` folder (only for `clientPath`).

`root` and `world` are mutually exclusive; passing both is a build error.

### `world`

```ts
saveOptions: { world: 'MyWorld' }
```

The datapack is exported to `<clientPath>/saves/MyWorld/datapacks/<name>`. This is the **per-world** export.

What happens to the resource pack depends on `exportZips` (see below). The most common case is that you **don't** want `saves/<world>/resources.zip` written at all; you only want the datapack in the world. Set `exportZips: false` to put the resource pack in `<clientPath>/resourcepacks/<name>` (as a folder) instead. Leave `exportZips` unset and the resource pack defaults to a zip in the world's folder.

### `root`

```ts
saveOptions: { root: true }
```

The pack is exported to `<clientPath>/datapacks/<name>` and `<clientPath>/resourcepacks/<name>`.

### `clientPath`

```ts
saveOptions: { clientPath: '/path/to/.minecraft' }
```

Override the auto-detected `.minecraft` folder. Use this when your install is non-standard (custom launcher, Flatpak, manually relocated). The CLI falls back to auto-detection when this is omitted.

### `serverPath`

```ts
saveOptions: { serverPath: '/path/to/server' }
```

Where to write **server-side** packs (pack types with `networkSides: 'server'`). Independent of `clientPath`; you can target a local dedicated server with `serverPath` while keeping `clientPath` on your local install.

## `exportZips`

```ts
saveOptions: { exportZips: true }   // or false
```

Overrides the `archiveOutput` flag that each `PackType` was constructed with. The built-in `DataPack` defaults to a folder and the built-in `ResourcePack` defaults to a `.zip` archive. `exportZips: true` flips the datapack to a zip; `exportZips: false` flips the resource pack to a folder. For custom `PackType`s, `exportZips` flips the `archiveOutput` value passed to the type's constructor.

When zipped, the archive is created from `.sandstone/output/<type>/` and named after the pack (`<name>.zip` for root exports, `resources.zip` for world exports).

## `customFileHandler`

```ts
saveOptions: {
  customFileHandler: async (relativePath, content) => {
    if (relativePath.endsWith('.json')) {
      return JSON.stringify(JSON.parse(content.toString()), null, 2)
    }
    return content
  }
}
```

Replaces the default file writer. When set, you're responsible for writing each file yourself. Typical use cases are custom upload targets or integration with other precompilers/frameworks.

## `indentation`

```ts
saveOptions: { indentation: 2 }
```

The indentation passed to `JSON.stringify` for every JSON / `.mcmeta` file.

## Resolution order in practice

A typical config that exports to a detected install:

```ts
saveOptions: {
  root: true,
  exportZips: false,
}
```

A typical config that targets a specific world with no resource pack shipped:

```ts
saveOptions: {
  world: 'DevWorld',
  exportZips: false,
}
```

This puts the datapack in `saves/DevWorld/datapacks/<name>` and the resource pack in `<clientPath>/resourcepacks/<name>` (as a folder). To write the resource pack as a `resources.zip` in the world folder instead, drop `exportZips: false`.

A CI-only build (no exports):

```ts
saveOptions: {}  // CLI --production or SANDSTONE_PRODUCTION=production also disables exports
```

## Combining with CLI flags

Every field can be overridden from the command line:

```bash
sand build --root --client-path /custom/.minecraft
sand build --world MyTestWorld
sand build --production   # ignores saveOptions destinations entirely
```
