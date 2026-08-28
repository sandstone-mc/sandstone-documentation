---
id: existing_resources
sidebar_position: 3
title: Existing Resources
description: How to ship your own files alongside the pack Sandstone generates.
---

Most packs need files Sandstone doesn't (and shouldn't) generate — structure `.nbt` files, models, textures, sounds, font bitmaps, vanilla shader overrides, raw JSON, etc. Two patterns handle all of them.

## The default: drop into `resources/<packType>/`

The CLI auto-walks two folders at the project root and copies their contents into the corresponding pack output, unchanged:

- `resources/datapack/` → into the datapack at `data/...`
- `resources/resourcepack/` → into the resource pack at `assets/...`

```
my-project/
├── src/
├── sandstone.config.ts
└── resources/
    ├── datapack/                 # ← copies into .sandstone/output/datapack/data/...
    │   └── internal_lib/
    │       └── functions/
    │           └── do_something.mcfunction
    └── resourcepack/             # ← copies into .sandstone/output/resourcepack/assets/...
        └── my_pack/
            └── textures/
                └── item/
                    └── shiny_pickaxe.png
```

The contents are passed through verbatim. `resources.exclude.generated` and `resources.exclude.existing` regexes in `sandstone.config.ts` apply here, and `resources.handle` callbacks can rewrite file contents before they're written (see [`resources`](/docs/development/config/info#resources)).

## Arbitrary organization + build-time reads

You're not limited to those two folders. Put files anywhere under `resources/` and read them yourself at build time with `getExistingResource` (the Sandstone-native read helper — see below). Then ship them through a typed Sandstone API or `RawResource`. Anything in the `resources/` tree that **isn't** picked up by the default `resources/datapack/` and `resources/resourcepack/` walkers stays put on disk for your code to read.

```text
my-project/
├── resources/
│   ├── assets/                  # arbitrary folder, NOT a special path
│   │   ├── avatar/
│   │   │   └── player.png
│   │   ├── balloon/
│   │   │   ├── primary.png
│   │   │   └── model.json
│   │   └── font/
│   │       └── monospace/
│   │           ├── ascii.png
│   │           └── providers.json
│   └── data/                    # arbitrary folder
│       └── showcase/
│           └── magic.nbt
```

The CLI never deletes files from `resources/` between builds — it's a regular project folder.

### `getExistingResource(path, encoding?)` — the read helper

Use `getExistingResource` to read files you've put under arbitrary folders inside `resources/` (anything *not* in `resources/datapack/` or `resources/resourcepack/`, which the default walker already handles):

```ts
// .json files are parsed for you (return type widens to `unknown`)
const providers = await getExistingResource('assets/my_pack/font/providers.json')

// Other extensions return text
const text = await getExistingResource('assets/my_pack/notes.txt')

// Binary — pass encoding: false (overrides the .json auto-parse)
const buffer = await getExistingResource('data/my_pack/structures/magic.nbt', false)
```

The path is resolved relative to `<workingDir>/resources/`, so `getExistingResource('assets/my_pack/foo.png')` reads `resources/assets/my_pack/foo.png`. Absolute paths bypass the resolution. The `.json` auto-parse is keyed off the path's extension via a template string type, so `.json5` / `.jsonc` / etc. are treated as plain text.

The other overload — `getExistingResource(resource, encoding?)`, which reads a Sandstone resource instance and falls back to mcmeta for `minecraft:*` — is documented in [mcmeta](/docs/features/mcmeta).

### `RawResource` for shipping to an exact path

When you have a file that should land at a specific output path (a structure file used by `place.template`, a script, an arbitrary binary), pass the buffer to `RawResource` and give it the final datapack path:

```ts
RawResource(
  `${NAMESPACE}/structure/magic.nbt`,
  await getExistingResource('data/showcase/magic.nbt', false),
)
```

This writes the bytes verbatim to `.sandstone/output/datapack/data/<NAMESPACE>/structure/magic.nbt`, where `place.template("namespace:magic")` expects them.

### Typed resource APIs

For resource types Sandstone has typed wrappers for, use those instead of `RawResource` so the file lands in the right place and the resource gets registered with the active pack:

```ts
// Reads resources/assets/font/monospace/ascii.png → writes assets/<ns>/textures/font/monospace/ascii.png
Texture('font', 'monospace/ascii', await getExistingResource('assets/font/monospace/ascii.png', false))

// Reads resources/assets/balloon/model.json → writes assets/<ns>/models/balloons/sand_castle.json
Model('balloons', 'sand_castle', await getExistingResource('assets/balloon/model.json'))

// Registers a custom painting variant; the texture path is derived from the Texture resource
Variant('painting', 'sandstone_mascot', {
  asset_id: Texture('painting', 'sandstone_mascot', await getExistingResource('assets/mascot.png', false))
    .name.replace('painting/', '') as `${string}:${string}`,
  height: 4,
  width: 3,
})

// .json paths are parsed for you
Font('monospace', (await getExistingResource('assets/font/monospace/providers.json') as { providers: Parameters<typeof Font>[1] }).providers)
```

See [Textures](/docs/features/resources/resourcepack/textures) for the full `Texture` API and pattern.

## Reading and mutating an existing resource

When you call `getExistingResource(resource, ...)`, the helper not only returns the bytes — it also writes them back onto the resource itself, so the same call wires up a typed reference you can mutate and re-save. This isn't just for textures; the rule is generic:

- If the resource exposes a `buffer` field (textures, sound events, …), the raw bytes are written there.
- If the resource exposes a `texts` field (`PlainTextClass`), the raw string is written there.
- Otherwise the value is parsed as JSON and assigned to the resource's `json` field. If there's no `json` field, the helper looks for the first public field ending in `JSON` and writes there — that's how `LootTable`'s `lootTableJSON`, `Advancement`'s `advancementJSON`, `DamageType`'s `damageTypeJSON`, `SoundEvent`'s `soundsJSON`, etc. all get populated without any per-resource wiring.

The CLI writes those same fields to disk on save, so a read-then-mutate cycle ends up writing the modified version back out:

```ts
import sharp from 'sharp'

// JSON resource: extend a vanilla loot table
const jungleChest = LootTable('minecraft:chests/jungle_temple', {})
await getExistingResource(jungleChest)
jungleChest.lootTableJSON = {
  ...jungleChest.lootTableJSON,
  pools: jungleChest.lootTableJSON.pools.map((p, i) =>
    i === 0 ? { ...p, bonus_rolls: 0 } : p,
  ),
}

// Binary resource: derive a tinted variant from a shipped texture
const baseTex = Texture('item', 'base_balloon', undefined as any)
await getExistingResource(baseTex)
baseTex.buffer = await sharp(await Binary.asLegacyBuffer(baseTex.buffer)).modulate({ hue: 30 }).png().toBuffer()
```

## Organizing files however you want

The default walker only knows about two folders (`resources/datapack/`, `resources/resourcepack/`) and mirrors their layout into the pack output. Everything else — how you group files, where the source lives, what builds into what — is yours to decide. The walker plus a build-time read is enough to express any layout.

A worked example, just to show how flexible this is: shaders live under `src/` next to the TypeScript that consumes them, not under `resources/resourcepack/`, because they're hand-authored source — not outputs from an external editor the way model JSON often is. The `resources/resourcepack/` entry is a symlink so the walker still finds them:

```text
src/sections/rhythm/config/internal/shaders/        # source of truth (hand-authored)
├── sdk.toml
├── index.ts                                        # generates marker textures from sdk.toml at build time
├── item.fsh/
│   ├── include.glsl
│   └── main.glsl
└── item.vsh/
    ├── include.glsl
    └── main.glsl

resources/resourcepack/assets/your_pack/shaders/include/sdk/   # symlinks → src
├── sdk.toml           →  ../../../../../../../src/sections/rhythm/config/internal/shaders/sdk.toml
├── item.fsh/{include,main}.glsl
└── item.vsh/{include,main}.glsl
```

The CLI then ships whatever ends up under `resources/resourcepack/` — symlinks resolved, hand-authored or generated, doesn't matter.

The same shape works for any file group: keep the canonical source under `src/`, ship via a `resources/resourcepack/` symlink, generate any derivative assets (marker textures, preprocessed shaders, baked models) at build time and write them into the same tree.

## See also

- [Textures](/docs/features/resources/resourcepack/textures) — the `Texture(type, name, buffer)` API
- [Custom Resources](/docs/features/resources/custom) — `RawResource` + `makeCustomResource` for shipping files that don't match any typed API
- [Vanilla Dependencies](/docs/features/vanilla-dependencies) — `resources/datapack_dependencies/` and `resources/resourcepack_dependencies/` for shipping extra packs alongside yours
- [`resources` in `sandstone.config.ts`](/docs/development/config/info#resources) — `exclude` and `handle` apply to both the default walker and any `RawResource` paths
