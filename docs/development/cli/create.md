---
id: create
title: Create
description: Scaffold a new Sandstone project from a template.
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `sand create`

Scaffolds a new Sandstone project by cloning a template branch from [`sandstone-mc/sandstone-template`](https://github.com/sandstone-mc/sandstone-template) into a fresh directory.

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

The argument is the **directory name**, not the output pack name — those are configured separately in the prompts (or via flags).

## Options

| Flag | Env var | Description |
|------|---------|-------------|
| `-n, --name <name>` | `SANDSTONE_NAME` | Pack name. |
| `-N, --namespace <namespace>` | `SANDSTONE_NAMESPACE` | Default namespace. |
| `-w, --world <name>` | `SANDSTONE_WORLD` | World to export into. |
| `-c, --client-path <path>` | `SANDSTONE_CLIENT_PATH` | `.minecraft` path. |
| `--server-path <path>` | `SANDSTONE_SERVER_PATH` | Server folder path. |

Flags skip the corresponding prompt.

## Prompt flow

1. **Library or pack?** — choose Library for a reusable module project, or Pack for a self-contained datapack.
2. **Sandstone version** — pick the minor to scaffold against. Defaults to the current `master`.
3. **Pack name** — the `name` field in `sandstone.config.ts` and the output folder name.
4. **Namespace** — the default resource namespace.
5. **Save location** — pick a detected Minecraft install (or `None` for output-only).
6. **Minecraft instance** — if a save location was picked, choose which instance.
7. **World** — if `--world` was used, choose the world.
8. **Package manager** — bun, pnpm, yarn, or npm.

After the prompts, the template is cloned, dependencies are installed, and `sandstone.config.ts` is configured with the answers.

## After creating

```bash
cd my-pack
sand build   # Sanity-check the scaffolded project
```

The scaffolded project ships with an example function in `src/index.ts`. Replace it with your own.
