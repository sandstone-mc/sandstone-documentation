---
id: item_modifiers
title: Item Modifiers
description: How to create item modifiers with Sandstone.
---

## Introduction
Sandstone features fully-typed item modifiers. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the item modifier.

The minimal syntax for damage types is the following:
```ts
import { ItemModifier } from 'sandstone'

ItemModifier('item_modifier_name', {
  function: 'set_name',

  name: { text: 'Funny item' }
})
```

### Modifier functions

All modifier functions can be directly found via autocompletion/jsdoc, or by looking at the [Minecraft wiki article on Item Modifiers](https://minecraft.wiki/Item_modifier).

## Usage

### Directly modify
```ts
const myItemModifier = ItemModifier(...)

// Modifies the item in the first slot of the current block
myItemModifier.modify.block('~ ~ ~', 'container.0')

// Modifies the item in the first hotbar slot of the current player
myItemModifier.modify.entity('@s', 'hotbar.0')
```