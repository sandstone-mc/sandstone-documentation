---
id: cli
title: CLI
description: The `sand` command-line tool that builds, watches, links, and scaffolds Sandstone projects.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sandstone CLI

The Sandstone CLI ships as two binaries:

- `sand` — every command for working with an existing project (`build`, `watch`, `link`, …)
- `create-sandstone` — invoked as `sand create` or `bun create sandstone` to scaffold a new project

## Commands

| Command | Purpose |
|---------|---------|
| [`sand build`](./build) | Compile the pack once and (optionally) export to a Minecraft install |
| [`sand watch`](./watch) | Build and rebuild automatically on file change, with a live UI |
| [`sand clean`](./clean) | Remove symlinks, copied folders, and `.zip` archives placed by a prior build |
| [`sand create <name>`](./create) | Scaffold a new project from a template |
| [`sand install native [libs...]`](./install) | Add official `@sandstone-mc/*` libraries |
| [`sand uninstall [libs...]`](./install) | Remove Smithed libraries |
| [`sand refresh`](./install) | Clear the Smithed cache and rebuild |
| [`sand link [libraryPath]`](./link) | Pack a library or link a local library into a consumer |
| [`sand unlink [target]`](./link) | Unpack a library or unlink a library from a consumer |

## Global options

Every command shares the same path/namespace/name resolution. CLI flags override values from `sandstone.config.ts`; the config file values override package.json defaults.

| Flag | Env var | Description |
|------|---------|-------------|
| `-h, --path <path>` | `SANDSTONE_PATH` | Project root. Default `./`. |
| `-n, --name <name>` | `SANDSTONE_NAME` | Output pack folder name. |
| `-N, --namespace <namespace>` | `SANDSTONE_NAMESPACE` | Default namespace. |
| `-w, --world <name>` | `SANDSTONE_WORLD` | World to export into (mutually exclusive with `--root`). |
| `-c, --client-path <path>` | `SANDSTONE_CLIENT_PATH` | Override the detected `.minecraft` location. |
| `--server-path <path>` | `SANDSTONE_SERVER_PATH` | Override the server folder for server-side packs. |
| `-r, --root` | `SANDSTONE_ROOT` | Export to `.minecraft/datapacks` and `.minecraft/resourcepacks`. |
| `-d, --dry` | `SANDSTONE_DRY` | Don't save files (pair with `--verbose` to inspect what would be written). |
| `-f, --verbose` | `SANDSTONE_VERBOSE` | Log every generated resource. |
| `-e, --strict-errors` | `SANDSTONE_STRICT_ERRORS` | Fail the build on type errors instead of warning. |
| `-p, --production` | `SANDSTONE_PRODUCTION` | Run in production mode (no exports; just `.sandstone/output`). |

Every flag also accepts the corresponding `SANDSTONE_<NAME>` env var. Flag > env var > config file > default.

## `create-sandstone`

Scaffolds a new project by cloning a template branch from `sandstone-mc/sandstone-template`.

<Tabs>
  <TabItem value="sand" label="sand" default>
    ```bash
    sand create my-pack
    ```
  </TabItem>
  <TabItem value="bun" label="bun create">
    ```bash
    bun create sandstone my-pack
    ```
  </TabItem>
</Tabs>

See [create](./create) for the full flow, flags, and prompts.

## Project layout

The CLI expects a `sandstone.config.ts` at the project root and a `package.json` with a `module` field pointing at the entrypoint. Build output goes to `.sandstone/output/`; cached state goes to `.sandstone/cache.json`; linked libraries are tracked in `.sandstone/links.json`.

```text
my-project/
├── sandstone.config.ts   # Required - config file
├── package.json          # Required - `module` field points at entrypoint
├── src/index.ts          # Default entrypoint
├── .sandstone/
│   ├── output/           # Generated packs
│   ├── cache.json        # File hashes, symlinks, archives
│   ├── links.json        # Linked library state
│   └── watch.log         # Watch mode log
└── resources/            # Static assets copied into the pack
```
