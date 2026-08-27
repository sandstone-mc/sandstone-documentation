---
id: build
title: sand build
description: Compile the datapack and resource pack once.
---

# `sand build`

Compiles your project into a datapack (and resource pack, if configured) and writes the result to `.sandstone/output/`. With `--root`, `--world`, or a configured `clientPath`/`serverPath`, also copies the result into a Minecraft install or server folder.

```bash
sand build
```

## Options

All [global options](./index#global-options) apply. The build command doesn't add any command-specific flags beyond them.

## What happens

1. **Load config** - `sandstone.config.ts` is dynamically imported from the project root.
2. **Load entrypoint** - your code (the file referenced by `package.json#module`) is imported. Every `MCFunction`, `Advancement`, `LootTable`, etc. registers resources with the active `SandstonePack`.
3. **Run `beforeAll` script** - if defined in `saveOptions`.
4. **Resolve destinations** - combines CLI flags with `saveOptions` (CLI wins).
5. **Run `beforeSave` script**.
6. **Save packs** - visitors transform the AST, then the file handler writes each generated file to `.sandstone/output/`. A content-hash cache (`.sandstone/cache.json`) skips files that haven't changed.
7. **Export** - for each pack type, copy or symlink the output to the resolved client/server destination. Resource packs with `archiveOutput` get zipped when `exportZips` is enabled.
8. **Clean stale files** - anything in `.sandstone/output/` not produced by this build is removed.
9. **Run `afterAll` script**.

On success the count line is printed:

```text
Pack(s) compiled! (42 functions, 18 other resources) Exported to client.
```

## Production mode

`--production` (`SANDSTONE_PRODUCTION=production`) skips export entirely. Files still land in `.sandstone/output/`, but nothing is copied to a Minecraft install or server. Use this in CI to verify a build without touching any external folder.

## Dry run

`--dry` runs the full pipeline but writes nothing. Pair with `--verbose` to see every file that *would* be written:

```bash
sand build --dry --verbose
```
