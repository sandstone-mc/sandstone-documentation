---
id: trims
title: Trims
description: How to create trims with Sandstone.
---

## Introduction
Sandstone features fully-typed item trims. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the trim.

See [this article](https://minecraft.wiki/w/Tutorials/Adding_custom_trims) for more details.

## Patterns

```ts
TrimPattern('stripes', {
  asset_id: 'stripes',
  description: 'Stripes',
  template_item: 'stick',
})

Atlas('minecraft:armor_trims', {
  sources: [
    {
      type: 'paletted_permutations',
      textures: [
        `${Texture('models/armor', 'stripes', undefined)}`,
        `${Texture('models/armor', 'stripes_leggings', undefined)}`,
      ],
      palette_key: 'trims/color_palettes/trim_palette',
      permutations: {
        ...
      },
    },
  ],
})
```

Sandstone will automatically handle registering the pattern template item in `#minecraft:trim_templates` & adding the smithing trim recipe.

## Materials

```ts
const enderTrim = TrimMaterial('ender', {
  asset_name: 'ender',
  description: {
    color: '#258474',
    text: 'Ender'
  },
  ingredient: 'ender_pearl',
  item_model_index: 0.85
})

const trimTexture = Texture('trims/color_palettes', 'ender', undefined)

Atlas('minecraft:armor_trims', {
  sources: [
    {
      type: 'paletted_permutations',
      textures: [
        ...
      ],
      palette_key: 'trims/color_palettes/trim_palette',
      permutations: {
        ender: `${trimTexture}`
      }
    }
  ]
})

Atlas('minecraft:blocks', {
  sources: [
    {
      type: 'paletted_permutations',
      textures: [
        'trims/items/leggings_trim',
        'trims/items/chestplate_trim',
        'trims/items/helmet_trim',
        'trims/items/boots_trim'
      ],
      palette_key: 'trims/color_palettes/trim_palette',
      permutations: {
        ender: `${trimTexture}`
      }
    }
  ]
})

// Repeat for all other armor pieces
const original = JSON.parse(await getVanillaResource('minecraft/models/item/iron_chestplate.json')) as ModelData

original.overrides!.splice(7, 0, {
  model: `${Model('item', 'iron_chestplate_ender_trim', {
    parent: 'minecraft:item/generated',
    textures: {
      layer0: 'minecraft:item/iron_chestplate',
      layer1: 'minecraft:trims/items/chestplate_trim_ender'
    }
  })}`,
  predicate: {
    trim_material: enderTrim.overrideIndex
  }
})

Model('item', 'minecraft:iron_chestplate', original)
```

Sandstone will automatically handle registering the material item in `#minecraft:trim_materials`.

## Inventory Conditions

Sandstone provides a method for checking whether the player has an item with a specific pattern or material applied to it.

```ts
// Defaults to checking all equipment slots (including hand items)
_.if(enderTrim, () => {
  // Give ender abilities
})

enderTrim.equipmentCheck = 'whole_inventory'

enderTrim.equipmentCheck = 'head'

enderTrim.equipmentCheck = ['mainhand', 'offhand']
```