---
id: tags
title: Tags
description: How to create & use tags with Sandstone.
---

## Introduction

A tag groups several resources of the same registry (blocks, items, entity types, functions, damage types, and more) under a single `#namespace:name` reference, which canthen be used anywhere that registry's resources are accepted.

```ts
import { Tag } from 'sandstone'

const logs = Tag('block', 'logs', ['minecraft:oak_log', 'minecraft:spruce_log'])

_.if(_.block(rel(0, -1, 0), logs), () => {
  say('Standing on a log!')
})
```

The first argument is the tag's registry (`'block'`, `'item'`, `'entity_type'`, `'function'`, `'damage_type'`, `'enchantment'`... any taggable registry), the second is the tag's name, and the third is the list of values.

## Values

A tag's values can be:
- A registry ID string (`'minecraft:oak_log'`)
- A resource instance of the matching registry (an `MCFunction`, a `DamageType`, etc.)
- Another `Tag` of the same registry, to nest tags inside one another
- An object of the form `{ id: <value>, required: false }`

```ts
const init = MCFunction('init', () => { ... })

const onLoad = Tag('function', 'load', [
  init,
  { id: 'some_datapack:load', required: false },
])
```

## Modifying a tag

Tags support `push`, `unshift`, and `has` after creation - useful for extending a tag from several places in your codebase (for example, an "immunity" damage type tag that different files each add their own damage type to):

```ts
const immuneTo = Tag('damage_type', 'immune_to', [])

immuneTo.push('minecraft:fire', 'minecraft:lava')
immuneTo.unshift('minecraft:in_fire')

immuneTo.has('minecraft:lava') // true
```

## Referencing an existing tag

To reference a vanilla or another datapack's tag without redefining it, just use its `#namespace:name` string directly wherever a tag reference is expected.

```ts
_.if(_.block(rel(0, 0, 0), '#minecraft:logs'), () => { ... })
```