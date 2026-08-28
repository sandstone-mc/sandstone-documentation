---
id: textures
title: Textures
description: How to ship texture files into your resource pack with Sandstone.
sidebar_position: 2
---

# Textures

`Texture(type, name, buffer)` writes a `.png` into your resource pack and registers it as a typed texture resource. The buffer comes from wherever you want — the file just needs to end up as `ArrayBuffer | Buffer` at build time.

```ts
import { Texture } from 'sandstone'

Texture('item', 'shiny_pickaxe', await Bun.file('resources/textures/shiny_pickaxe.png').arrayBuffer())
// → assets/<your-namespace>/textures/item/shiny_pickaxe.png
```

## Categories

The first argument is the texture's category — the path segment under `textures/`. The full list mirrors Minecraft's texture namespaces:

```
item | block | entity | entity/<subtype> | gui | colormap | environment | particle
| armor | painting | mob_effect | instrument | banner_pattern
| ... (any registered texture type)
```

TypeScript autocomplete narrows the list based on `mcmeta` in `sandstone.config.ts` (the Minecraft version). The first arg drives both the output path and the metadata validation:

```ts
Texture('item', 'shiny_pickaxe', png)              // → assets/<ns>/textures/item/shiny_pickaxe.png
Texture('block', 'polished_stone', png)            // → assets/<ns>/textures/block/polished_stone.png
Texture('entity/villager', 'profession/farmer', png)
// → assets/<ns>/textures/entity/villager/profession/farmer.png
```

The output path can be used as a string in models, item definitions, etc.:

```ts
import { Texture } from 'sandstone'

const tex = Texture('item', 'balloon/primary', asset('balloon', 'primary.png'))

tex.name           // 'my_pack:item/balloon/primary'
tex.toString()     // 'my_pack:item/balloon/primary'
```

## Reading the buffer

`Texture` accepts `Promise<ArrayBuffer | Buffer> | ArrayBuffer | Buffer`. Pick whatever is easiest for the file source:

```ts
// From resources/<anything>/ at build time
const png = Bun.file('resources/textures/foo.png').arrayBuffer()

// Async read at the top of an entrypoint
const png = await Bun.file('resources/textures/foo.png').arrayBuffer()

// Direct ESM import for static assets (needs resolveJsonModule)
import pngBytes from './assets/foo.png'
```

See [Existing Resources](/docs/features/resources/existing_resources) for the broader pattern: the [2026 Sandstone Smithed Summit Booth](/showcase/summit-2026-booth) reads from `resources/assets/<group>/...` with a helper, which keeps file organization decoupled from pack output structure.

## Sprite textures

Pass `sprite: true` (or a target path string) for `Texture` to register the texture as a sprite atlas source. Minecraft sprites are stitched into a single atlas at load time and referenced by their position:

```ts
Texture('gui/sprite', 'progress_bar', png, { sprite: true })
// → assets/<ns>/textures/gui/sprite/progress_bar.png
```

## Meta

For animated textures and other metadata, pass `meta`:

```ts
Texture('block', 'lava_still', png, {
  meta: {
    animation: {
      frametime: 2,
      interpolate: true,
      frames: [0, 1, 2, 1, 0],
    },
  },
})
```

`meta` is validated against the category; the available fields change with the Minecraft version configured in `sandstone.config.ts`.

## Picking up textures already in `resources/resourcepack/`

Construct a `Texture` and hand it to `getExistingResource`: the helper reads the file from the standard walker path (`resources/<packType>/<subFolder>/<path>.<ext>`) **and** assigns the resulting buffer onto the `Texture`'s `buffer` field. From there, anything you do to that buffer — reassign it, mutate it in place, hand it to `sharp`, decode pixel data — is what ends up in the output. The CLI writes `tex.buffer` to the pack on save, so:

- **Derive a new texture** from a `.png` you ship, by replacing the buffer with processed bytes:
  ```ts
  import { Binary, getExistingResource, Texture } from 'sandstone'
  import sharp from 'sharp'

  const baseTex = Texture('item', 'base_balloon', undefined as any)
  await getExistingResource(baseTex)

  baseTex.buffer = await sharp(await Binary.asLegacyBuffer(baseTex.buffer))
    .modulate({ hue: 30 })
    .png()
    .toBuffer()
  // baseTex is now the tinted variant — output uses the new buffer.
  ```
- **Make a *new* `Texture` from an existing one** — read bytes from one file, process them, and hand the result to a separate `Texture` resource:
  ```ts
  const primary = Texture('item', 'base_balloon', undefined as any)
  await getExistingResource(primary)

  const tintedBuffer = await sharp(await Binary.asLegacyBuffer(primary.buffer))
    .modulate({ hue: 30 })
    .png()
    .toBuffer()

  const secondary = Texture('item', 'tinted_balloon', tintedBuffer)
  // Both primary (original) and secondary (tinted) end up in the pack.
  ```
- **Edit the bytes in place** — replace `tex.buffer` with anything else (`Buffer`, `ArrayBuffer`, or a `Promise` of either) and that's what gets written.

Without the explicit `Texture` round-trip, the CLI would still copy the original `.png` through to the pack output — so the shortcut is only useful when you intend to **do something with the bytes**: derivative textures, image processing, palette extraction, runtime-driven recoloring, atlas baking, etc.

If your file lives outside `resources/resourcepack/` (e.g. `resources/assets/...` with the arbitrary-organization layout from [Existing Resources](/docs/features/resources/existing_resources)), read it explicitly with `Bun.file` (or the string-mode `getExistingResource(path, encoding?)`) and pass the buffer to `Texture` — the auto-assignment only applies to the standard layout.

## Generating textures programmatically

Anything that returns `ArrayBuffer | Buffer` is fair game for `Texture.texture`, including image buffers you build at build time. The [2026 Sandstone Smithed Summit Booth](/showcase/summit-2026-booth) uses this for **shader marker textures** — tiny 16×16 PNGs whose specific pixel values identify which variant the shader is rendering:

```ts
// src/sections/rhythm/config/internal/shaders/index.ts
import sharp from 'sharp'
import sdkConfig from './sdk.toml'  // id = [83, 78, 68, 255] — bytes "SND" + 0xFF

type RGBA = [number, number, number, number]

async function shaderTarget(extraPixels: Array<[number, number, RGBA]>) {
  const data = new Uint8Array(16 * 16 * 4)
  for (let i = 3; i < data.length; i += 4) data[i] = 255  // full alpha

  for (const [x, y, [r, g, b, a]] of extraPixels) {
    const i = (y * 16 + x) * 4
    data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = a
  }

  return sharp(data, { raw: { width: 16, height: 16, channels: 4 } })
    .png()
    .toBuffer()
}

;['rainbows', 'neon', 'void'].forEach((variant, i) => {
  Texture('item', `rhythm/skybox_${variant}`, await shaderTarget([
    [0, 0, [1, 2, 3, 255]],
    [1, 0, sdkConfig.id as RGBA],        // marker: SDK identifier
    [2, 0, [i, 0, 0, 255]],              // marker: variant index
  ]))
})
```

Pixel `(1, 0)` and `(2, 0)` carry the variant identity; the shader reads them at runtime to know which pipeline to execute. All three textures share the same dimensions so the model UVs are stable across variants — only the marker bytes differ.

The same approach works for any image library that returns a `Buffer` (`sharp`, `@napi-rs/canvas`, hand-built `Uint8Array`s, etc.). Wrap whatever you build into a promise/buffer and pass it as `texture`.

## See also

- [Existing Resources](/docs/features/resources/existing_resources) — the arbitrary-folder read pattern that powers most texture use in real packs
- [Item Model Definitions](/docs/features/resources/resourcepack/item_model_definitions) — the most common consumer of `Texture` references
- [Custom Resources](/docs/features/resources/custom) — `RawResource` when you need to ship a texture to an exact path without registering it
