---
id: info
title: Vanilla Dependencies
description: Ship extra datapacks and resource packs alongside your main pack via `resources/<type>_dependencies/`.
sidebar_position: 10
---

# Vanilla Dependencies

Two special folders under your project's `resources/` directory let you ship **additional datapacks and resource packs** alongside your main pack, without writing any Sandstone code for them:

- `resources/datapack_dependencies/`
- `resources/resourcepack_dependencies/`

Drop folders or `.zip` archives into either folder and Sandstone copies them through to the build output. On export, they appear as **separate folder packs** alongside your main pack — your main pack never contains their files.

## What they do

When the build starts, Sandstone checks whether either folder exists and is non-empty. If so, it auto-registers a matching pack type:

| Folder | Registered pack type | Side | Output format |
|--------|----------------------|------|---------------|
| `resources/datapack_dependencies/` | `datapack_dependencies` | server | folder (unzipped) |
| `resources/resourcepack_dependencies/` | `resourcepack_dependencies` | client | folder (unzipped) |

The contents of each folder are walked recursively and copied verbatim into `.sandstone/output/<type>_dependencies/...`. File handlers and exclusions from [`resources`](/docs/development/config/info#resources) in `sandstone.config.ts` apply to these files the same way they do for normal `resources/datapack/` and `resources/resourcepack/` content.

If you want them as `.zip` archives instead of folders, set [`saveOptions.exportZips`](/docs/development/config/save-options#exportzips).

## Where they end up on export

The destinations mirror your main pack's export target:

### `datapack_dependencies`

| Export target | Destination |
|---------------|-------------|
| `--world <name>` | `<clientPath>/saves/<world>/datapacks/...` (alongside your main datapack) |
| `--root` | `<clientPath>/datapacks/...` |
| `--server-path` | `<serverPath>/world/datapacks/...` |

The contents appear as their own folder packs inside `datapacks/`, so each dependency stays independently installable.

### `resourcepack_dependencies`

| Export target | Destination |
|---------------|-------------|
| `--world <name>` | Same as resourcepack (per-world) — see [Save Options](/docs/development/config/save-options) |
| `--root` | `<clientPath>/resourcepacks/...` |
| `--server-path` | `<serverPath>/...` |

## Layout example

```
my-sandstone-project/
├── src/
├── sandstone.config.ts
└── resources/
    ├── datapack/                 # Your main datapack (Sandstone-generated)
    └── datapack_dependencies/    # Extra datapacks shipped alongside
        ├── my-helper-pack/       # A folder — copied through as-is
        │   └── data/
        │       └── minecraft/
        │           └── tags/...
        └── another-pack.zip      # A zipped dependency — copied through as-is
```

```
resources/
├── resourcepack/                 # Your main resource pack
└── resourcepack_dependencies/    # Extra resource packs shipped alongside
    └── skin-pack/
        └── assets/...
```

## When the folders are empty (or missing)

Nothing extra is registered. The build proceeds with just your main pack. This means you can keep the folders in version control with a `.gitkeep` file (or simply empty) and they will be ignored until you actually drop a dependency in.
