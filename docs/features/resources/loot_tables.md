---
id: loot_tables
title: Loot Tables
description: How to create loot tables with Sandstone.
---

## Introduction
Sandstone features fully-typed loot tables. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the loot table.

## Syntax

### Minimal

The minimal syntax for loot table is the following:
```ts
import { LootTable } from 'sandstone/core'

LootTable('loot_table_name', {
  /** The rewards for this loot table */
  pools: [{
    /** The rolls for this pool */
    rolls: 1,

    /** The entries for a single pool */
    entries: [{
      /** An entry has a type, and additional properties. */
      type: '<type>',
      ...additionalProperties,
    }],
  }],
})
```

As you can see, you must provide a list of pool. A pool is defined by a list of entries and a number of `rolls`. For each entry, you must provide a `type` and. Once a `type` has been specified, the specific properties for this `type` will be available through autocompletion. The pool also has `conditions` and `functions`: read the built-in documentation or the [Wikipedia article on Loot Tables](https://minecraft.gamepedia.com/Loot_table#Tags) for more information.

### Example

![Example of Loot Table autocompletion](../../images/autocompletion/loottable.gif)

### Additional properties

All additional properties can be directly found via autocompletion (as shown above), or by looking at the [Minecraft wiki article on Loot Tables](https://minecraft.gamepedia.com/Loot_table#Tags).

