---
id: data
title: Data
description: How to handle points of nbt data (storage, entity, block) with Sandstone.
---

## The basics

By calling `Data`, Sandstone will return an `DataClass` object with convenient methods.

```ts
import { Data } from 'sandstone'

const pig = Data('entity', '@e[type=pig,sort=nearest,limit=1]')
```

## Data Points

### The basics

In Minecraft, nbt data can be applied to 3 kind of things : storage, entities, & blocks. When scoped to a path, they are called *Data Points*.

In Sandstone, to get the value of an nbt path for a given target, you `select` the path.

```ts
// Get amount of health on the executor
const healthRemaining = pig.select('Health')

// Get the first potion effect on the executor
const firstEffect = pig.select('active_effects[0].id')

// Get label tags on the executor
const labels = pig('Tags')

// Get the nbt of an item being held by a mob
const item = Data('entity', '@s').select('HandItems[0]').select('tag')
```

### Operations

Sandstone has a number of helper methods to perform operations on data points.

#### Inline operations

Inline operations are operations that modify the data point. For example, `labels.append('mean')` would compile in `data modify entity @e[type=pig,sort=nearest,limit=1] Tags append value "mean"`. The value of `labels` will change.

There is one inline method for each type of operation, and they all accept nbt values, scores, and other data points:

```ts
/* Setting */
// Set the health to 10
healthRemaining.set(10)
// Set the health equal to another entity
healthRemaining.set(cowHealth)
// Halve the health
healthRemaining.set(Variable(healthRemaining).dividedBy(2))

/* Merging */
// Change/add multiple fields without disturbing other nbt
item.merge({display: {Lore: ['"Indestructible"']}, Unbreakable: NBT.byte(1)})
// Merge from the closest player's item properties
item.select('properties').merge(Data('entity', '@p', 'SelectedItems[0].tag.properties'))

/* Appending */
// Make the pig 'funny'
labels.append('funny')
// Add an enchantment to an item
item.select('Enchantments').append({ id: 'sharpness', lvl: 5 })

/* Prepend */
// Add to the top of item lore
item.select('display.Lore').prepend('Hello there!')

/* Insert */
// Add the pig after the second mob in the stack
futureMobStack.insert(DataVariable({id: 'pig'}).merge(pig), 2)

/* Remove */
// Delete an item from the first slot of a chest
Data('block', '~ ~ ~', 'Items[{Slot:0b}]').remove()
```

Every operation returns the data point. Therefore, you can chain them:
```ts
// Add 'a' to the end of a list, add 'b' to the beginning of a list
list.append('a').prepend('b')
```

### Comparison

Data points are easy to compare against another value, and integrate perfectly with Sandstone's [flow statements](/docs/features/flow/if).

`equals` accepts an nbt value, a score, or another data point.

You can use it in any flow statement:
```ts
// If the pig is invisible, make it easy to find
_.if(firstEffect.equals('minecraft:invisible'), () => {
  effect.give('@s', 'glowing', 10, false)
})
```

### String parsing

A data point representing a string can be sliced into a new, smaller one, that can then be used, by using `slice`.

```ts
// If the pig has an effect, warn everyone
tellraw('@a', ['The pig is ', DataVariable(firstEffect.slice(9))])


const foobar = DataVariable('foobar')
const foo = DataVariable(foobar.slice(0, 2))
const bar = DataVariable(foobar.slice(-3))
```
