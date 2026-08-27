---
id: config
title: Config
description: The `sandstone.config.ts` file that drives every build.
---

# `sandstone.config.ts`

Every Sandstone project is configured by a single `sandstone.config.ts` file at the project root. The CLI loads it via dynamic import at build time, so the file is full TypeScript; types from `sandstone` work, and you can use any language features you want.

## Minimal example

```ts
import type { DatapackConfig, SandstoneConfig } from 'sandstone'

export default {
  name: 'my-pack',
  namespace: 'my_pack',
  packUid: 'aZ0k1P9q',
  packs: {
    datapack: {
      description: 'My Sandstone datapack.',
      packFormat: 107,
    } as DatapackConfig,
  },
  saveOptions: {},
} as SandstoneConfig
```

This is roughly what `sand create` scaffolds. Add a `resourcepack` entry when you also need a resource pack.

## The `SandstoneConfig` type

The full type is exported from `sandstone`. Annotate the default export with `as SandstoneConfig` to get autocompletion and error checking in your editor. The `datapack` and `resourcepack` entries also need `as DatapackConfig` / `as ResourcePackConfig` because `packs` accepts any pack name (you can [define custom `PackType`s](/docs/features/resources/custom#custom-packs)), so each entry is typed as `unknown` by default.

```ts
import type { DatapackConfig, ResourcePackConfig, SandstoneConfig } from 'sandstone'

export default {
  // …
} as SandstoneConfig
```

The config file isn't type-checked at build time; only your editor sees the types.

## Top-level fields

| Field | Required | Description |
|-------|----------|-------------|
| [`name`](#name) | yes | Output pack folder name. |
| [`namespace`](#namespace) | yes | Default resource namespace. |
| [`packUid`](#packuid) | yes | Unique identifier for your scoreboard objectives and variables. |
| [`packs`](#packs) | yes | Per-pack-type config (datapack, optional resourcepack). See the [Minecraft Wiki](https://minecraft.wiki/w/Pack.mcmeta) for the vanilla schema. |
| [`saveOptions`](./save-options) | no | Where to write the generated files. |
| [`scripts`](./scripts) | no | Lifecycle hooks (`beforeAll`, `beforeSave`, `afterAll`). |
| [`onConflict`](#onconflict) | no | How to handle duplicate resource names. |
| [`resources`](#resources) | no | Exclude or transform generated/existing files before writing. |

## Where the file goes

The CLI looks for `sandstone.config.ts` in the directory passed to `--path` (default `./`). It does **not** search subdirectories, and it does **not** read `tsconfig.json` paths. The file must be reachable at the project root.

## Per-developer overrides with `.env`

The config file is full TypeScript and runs at build time, so you can read from `Bun.env` (or `process.env`) to vary the build per developer or per machine. Bun loads `.env` from the project root automatically before the config is imported; any variable defined there is available as `Bun.env.<NAME>` inside `sandstone.config.ts`.

Typical pattern: ship a `.env.example` with placeholder values (committed), have each developer copy it to `.env` (gitignored) and fill in their own:

```text
# .env.example (committed)
EXPORT_WORLD=MyDevWorld
EXPORT_CLIENT_PATH=
```

```text
# .env (gitignored)
EXPORT_WORLD=SteveDev
EXPORT_CLIENT_PATH=/home/steve/.minecraft
```

```ts
// sandstone.config.ts
import type { SandstoneConfig } from 'sandstone'

export default {
  name: 'my-pack',
  namespace: 'my_pack',
  packUid: 'aZ0k1P9q',
  packs: { datapack: { description: 'My pack.', packFormat: 107 } },
  saveOptions: {
    world: Bun.env.EXPORT_WORLD,
    clientPath: Bun.env.EXPORT_CLIENT_PATH || undefined,
  },
} as SandstoneConfig
```

Add `.env` to `.gitignore` (Bun ignores it by default, but make it explicit if you have other tooling that doesn't). `.env.example` is committed so the team knows which keys to set.

CI / production builds typically don't need a `.env`, pass values via `EXPORT_<NAME>` env vars on the command line or in the CI config instead.

## `name`

```ts
name: string
```

The output pack folder name. Used as the directory name when exporting to `.minecraft/datapacks/<name>`, as the `name` field in the zip archive, and as the name passed to `load`/`tick` JSON registrations. Override at the CLI with `--name` / `SANDSTONE_NAME`.

## `namespace`

```ts
namespace: string
```

The default namespace. Used for any resource declared without an explicit `mymod:resource` prefix. Override per-resource, or per-base-path. Override at the CLI with `--namespace` / `SANDSTONE_NAMESPACE`.

Must be a valid Minecraft namespace (lowercase, `[a-z0-9_.-]`, ≤ 64 chars).

## `packUid`

```ts
packUid: string
```

A unique identifier used to namespace your **scoreboard objectives** and other auto-generated variables. Must be a string of valid scoreboard characters (letters, digits, `_`, `.`, `-`, `+`).

Pick something unique per project — changing it later invalidates every score that references the old objectives.

## `packs`

The `packs` block is a record keyed by pack type (`'datapack'`, optional `'resourcepack'`). The shape of each entry mirrors the `pack.mcmeta` schema; see the [Minecraft Wiki](https://minecraft.wiki/w/Pack.mcmeta) for the canonical field reference.

```ts
packs: {
  datapack: { description: 'My pack.', packFormat: 107 },
  resourcepack: { description: 'My resource pack.', packFormat: 88 },
}
```

A `resourcepack` is required if you call any resource-pack APIs (`Texture`, `Model`, `Atlas`, `Font`, `SoundEvent`, …). Without it, no resource pack directory is generated.

## `onConflict`

```ts
onConflict?: {
  default?: 'throw' | 'replace' | 'warn' | 'rename' | 'ignore'
  function?: …        // function-specific strategies
  advancement?: …    // advancement-specific strategies
  // …one entry per resource type
}
```

How to handle two resources of the same type with the same name. The `default` entry applies to any resource type you don't override. Per-resource entries take precedence.

The basic strategies are:

| Strategy | Behavior |
|----------|----------|
| `'throw'` | Throw an error. Recommended for CI; catches typos. |
| `'replace'` | Silently overwrite the previous definition. |
| `'warn'` (default) | Print a warning, then replace. |
| `'rename'` | Auto-rename the new one to `<name>_2`, `<name>_3`, … |
| `'ignore'` | Keep the first one; drop the new one silently. |

### List resources

For resources that merge by content, two extra strategies are available:

| Strategy | Behavior |
|----------|----------|
| `'append'` | Append the new resource's entries to the existing one. |
| `'prepend'` | Prepend the new resource's entries to the existing one. |

Resources that accept `'append'` / `'prepend'`:

- `Tag` (all registry types: blocks, items, functions, …)
- `ItemModifier`
- `Predicate`
- `MCFunction` (concatenates `body` commands)
- `BlockState` (variants)
- `Language` (translations)
- `Font` (providers)
- `Atlas` (sources)
- `Text` (lines)

## `resources`

```ts
resources?: {
  exclude?: RegExp[] | { generated?: RegExp[]; existing?: RegExp[] }
  handle?: { path: RegExp; callback: (contents) => contents }[]
}
```

Control what gets written.

- `exclude.generated` - regexes of file paths (relative to `.sandstone/output/`) to drop from your own `src/`.
- `exclude.existing` - regexes of file paths to drop from `./resources/`.
- `handle` - list of `{ path, callback }` pairs. When `path.test(relativePath)` matches, `callback(contents)` is called and its return value is written instead. Useful for post-processing generated JSON.
