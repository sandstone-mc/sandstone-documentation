---
id: mcmeta
title: mcmeta
description: How to read existing vanilla resources from inside your Sandstone code.
sidebar_position: 11
---

Sandstone ships [Misode's mcmeta](https://github.com/misode/mcmeta) project — generated snapshots of every file Minecraft ships for each version — and exposes it through two helpers on the active pack. Both take paths relative to the standard resource locations and return the file contents as `string` (text) or `ArrayBuffer | Buffer` (binary).

## `getVanillaResource(path, text?, type?)`

Vanilla-only. Pulls a file from the mcmeta snapshot for the `mcmeta` Minecraft version configured in `sandstone.config.ts`.

```ts
import { getVanillaResource } from 'sandstone'

// Server-side (datapack) resource, text
const villagerTypes = JSON.parse(
  await getVanillaResource('registries/villager_type/data.json'),
)

// Client-side (resource pack) resource, text
const villagerTexture = JSON.parse(
  await getVanillaResource('assets/minecraft/textures/entity/villager/profession/farmer.png', true, 'client'),
)

// Binary fetch — pass text:false
const vanillaNbt = await getVanillaResource('some/path.nbt', false, 'server')
```

`type` is `'server'` (datapack, the default) or `'client'` (resource pack). Both `data/` and `assets/` trees are exposed.

## `getExistingResource(resource, encoding?)`

Smart overload that resolves a **Sandstone resource instance** to its on-disk location. Useful for two things in particular:

1. **Reading a vanilla resource's JSON** when you only know the resource object. If the resource is in the `minecraft` namespace, the call hits the mcmeta snapshot — same as `getVanillaResource`, but you don't have to figure out the relative path yourself.
2. **Reading your own resource's JSON** before you've committed to a definition, so you can extend an existing one (the canonical "modify a vanilla loot table" pattern).

```ts
import { getExistingResource, LootTable, Texture } from 'sandstone'

// 1. Vanilla — fetched from mcmeta because the namespace is 'minecraft'
const jungleChest = LootTable('minecraft:chests/jungle_temple', {})
await getExistingResource(jungleChest)
// jungleChest.lootTableJSON is populated (parsed JSON, not raw text).

// 2. Local — reads resources/<packType>/<subFolder>/<path>.<ext>
const myAdvancement = Advancement('my_pack:custom', {})
await getExistingResource(myAdvancement)
// myAdvancement.advancementJSON is populated.

// 3. Texture — reads the bytes (binary by default) AND assigns them onto the
//    TextureClass's `buffer` field, so the same call wires up a typed reference.
const inventoryGui = Texture('gui', 'minecraft:container/inventory', undefined as any)
await getExistingResource(inventoryGui)
// inventoryGui.buffer is now populated; pass the Texture reference on.
```

The path it constructs for the local case is `<packType>/<resourceSubFolder>/<path>/<name>.<fileExtension>` — the same layout the default `resources/` walker expects. So a `LootTable('my_pack:foo', {})` resolves to `resources/datapack/data/my_pack/loot_table/foo.json` and a `Texture('item', 'my_pack/foo', png)` resolves to `resources/resourcepack/assets/my_pack/textures/item/foo.png`.

When you pass a resource to `getExistingResource`, the helper also threads the result back onto the resource itself, so you can read-and-mutate without an extra step. Resources that expose a `buffer` field (`TextureClass`, `SoundEvent`, etc.) get the raw bytes assigned there. Resources with a `texts` field (`PlainTextClass`) get the raw string written there. Everything else is parsed as JSON and assigned to the resource's `json` field, or — if there's no `json` — to the first public field ending in `JSON` (e.g. `lootTableJSON`, `advancementJSON`, `damageTypeJSON`, `soundsJSON`). See [Textures → Picking up textures already in `resources/resourcepack/`](/docs/features/resources/resourcepack/textures#picking-up-textures-already-in-resourcesresourcepack) and [Existing Resources → Reading and mutating an existing resource](/docs/features/resources/existing_resources#reading-and-mutating-an-existing-resource) for the pattern.

## `mcmetaCache`

Underlying cache both helpers route through. Use it directly when you need a one-off fetch without constructing a Sandstone resource:

```ts
import { mcmetaCache } from 'sandstone'

const villagerTypes = JSON.parse(
  await mcmetaCache.get('registries', 'villager_type/data.json'),
)
```

This is what `getVanillaResource` and the vanilla branch of `getExistingResource(resource)` call under the hood. Prefer the named helpers in your own code — `mcmetaCache` exists for low-level access.

## Examples

### Extending a vanilla loot table

```ts
import { getExistingResource, LootTable } from 'sandstone'

const jungleChest = LootTable('minecraft:chests/jungle_temple', {})
await getExistingResource(jungleChest)

jungleChest.lootTableJSON = {
  ...jungleChest.lootTableJSON,
  pools: [
    { ...jungleChest.lootTableJSON.pools[0], bonus_rolls: 0 },
    ...jungleChest.lootTableJSON.pools.slice(1),
  ],
}
```

### Extending a vanilla texture / model

```ts
import { getExistingResource, Texture } from 'sandstone'

const inventoryGui = Texture('gui', 'minecraft:container/inventory', undefined as any)
await getExistingResource(inventoryGui)
inventoryGui.buffer = doSomething(inventoryGui.buffer)
```

### Bulk-loading vanilla registries

```ts
import { getVanillaResource } from 'sandstone'

const damageTypes = JSON.parse(
  await getVanillaResource('registries/damage_type/data.json'),
)
const enchantments = JSON.parse(
  await getVanillaResource('registries/enchantment/data.json'),
)
```

## See also

- [Existing Resources](/docs/features/resources/existing_resources) — covers the other `getExistingResource(path, encoding?)` overload, which reads from your own `resources/` tree
- [`resources` in `sandstone.config.ts`](/docs/development/config/info#resources) — `exclude` and `handle` apply to the files `getExistingResource` reads
