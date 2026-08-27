---
id: clean
title: sand clean
description: Remove symlinks, copied folders, and zip archives placed by a prior build.
---

# `sand clean`

Removes the external file/symlink locations that a prior `sand build` created outside the project root. The next `sand build` recreates them.

```bash
sand clean
```

## Why this exists

`sand build` writes to three kinds of locations:

- **Project-local output** - `.sandstone/output/`. Not touched by `clean`.
- **Symlinks** - e.g. `<world>/datapacks/<pack>` → project output. Created when the destination directory already exists.
- **Copied folders and `.zip` archives** - for resource packs when `exportZips` is enabled.

The symlinks are the problem. Mojang's world upgrade refuses to proceed while any symlink is present inside the world's folder — even legitimate ones pointing at the pack on disk. `sand clean` strips them out so you can upgrade, then the next `sand build` recreates them.

## What gets removed

For each pack type (`datapack`, `resourcepack`) and each destination (`clientPath`, `serverPath`):

- The resolved destination directory (or the symlink, if it's a link).
- The `<destination>.zip` sibling, if `exportZips` was used.

The exact paths are computed from `saveOptions` (the same code path `build` uses) plus any CLI override:

| Flag | Env var | Overrides |
|------|---------|-----------|
| `-h, --path <path>` | `SANDSTONE_PATH` | Project root. |
| `-w, --world <name>` | `SANDSTONE_WORLD` | `saveOptions.world`. |
| `-c, --client-path <path>` | `SANDSTONE_CLIENT_PATH` | `saveOptions.clientPath`. |
| `--server-path <path>` | `SANDSTONE_SERVER_PATH` | `saveOptions.serverPath`. |

If no locations are found, `clean` prints `No external file or symlink locations found to clean.` and exits successfully.

## Cache invalidation

`clean` also rewrites `.sandstone/cache.json`:

- The `files` map is wiped, so the next `build` treats every generated file as changed.
- Stale `symlinks` entries are pruned.

This guarantees the next build re-exports everything; you don't end up with deleted symlinks that the cache thinks are still in place.

## Typical workflow

```bash
# Before upgrading a Minecraft world
sand clean
# Upgrade the world in the Minecraft client…
sand build
```
