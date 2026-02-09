---
id: itemPredicate
title: ItemPredicate
description: Type-safe builder for item predicates used in commands like clear and execute if items.
---

## Overview

ItemPredicate is a builder for creating item predicates that test for items in inventories, containers, and slots. It provides a fluent API for matching items by type, components, and properties.

Item predicates are used in:
- `clear` command - remove items from player inventories
- `execute if items` - test for items in entity/block inventories
- Flow conditions (`_.items`) - conditional logic based on inventory contents
- Item model definitions - conditional models based on item properties

```ts
import { ItemPredicate, NBT } from 'sandstone'

// Simple item match
const diamondSword = ItemPredicate('minecraft:diamond_sword')

// Item with component tests
const enchantedSword = ItemPredicate('minecraft:diamond_sword')
  .has('minecraft:enchantments')
  .without('minecraft:damage')

// Any item with count constraint
const smallStack = ItemPredicate('*').count({ max: 16 })

// Tag with negation
const undamagedSword = ItemPredicate('#minecraft:swords').without('minecraft:damage')
```

## Creating Predicates

ItemPredicate accepts an item type as its first argument:

```ts
// Specific item
ItemPredicate('minecraft:diamond')

// Item tag (prefixed with #)
ItemPredicate('#minecraft:logs')

// Tag object
const swordsTag = Tag('item', 'mypack:special_swords', ['minecraft:diamond_sword'])
ItemPredicate(swordsTag)

// Wildcard (any item)
ItemPredicate('*')
```

## Component Tests

### Existence Tests

Check whether a component exists on an item:

```ts
// Has custom name
ItemPredicate('minecraft:diamond_sword').has('minecraft:custom_name')

// Does not have damage
ItemPredicate('minecraft:iron_pickaxe').without('minecraft:damage')

// Has enchantments but no custom data
ItemPredicate('*')
  .has('minecraft:enchantments')
  .without('minecraft:custom_data')
```

### Exact Matching

Test for exact component values using the `=` operator:

```ts
// Item with zero damage
ItemPredicate('minecraft:diamond_sword').exact('minecraft:damage', NBT.int(0))

// Item with specific unbreakable value
ItemPredicate('*').exact('minecraft:unbreakable', {})

// Negated exact match (item with non-zero damage)
ItemPredicate('minecraft:diamond_sword').notExact('minecraft:damage', NBT.int(0))
```

### Sub-Predicate Matching

Match against component predicates using the `~` operator. This allows partial matching and range tests:

```ts
// Sword with Sharpness enchantment at level 3+
ItemPredicate('minecraft:diamond_sword')
  .match('minecraft:enchantments', [{
    enchantments: 'minecraft:sharpness',
    levels: { min: NBT.int(3) }
  }])

// Item with low durability
ItemPredicate('*').match('minecraft:damage', {
  durability: { max: NBT.int(10) }
})

// Item with specific custom data field
ItemPredicate('*').match('minecraft:custom_data', {
  player_id: NBT.int(123)
})

// Negated match (sword without Curse of Vanishing)
ItemPredicate('minecraft:diamond_sword')
  .notMatch('minecraft:enchantments', [{
    enchantments: 'minecraft:curse_of_vanishing'
  }])
```

### Count Tests

Test stack count ranges:

```ts
// Exactly 64 items
ItemPredicate('*').count(64)

// Between 1 and 16 items
ItemPredicate('minecraft:diamond').count({ min: 1, max: 16 })

// At least 32 items
ItemPredicate('*').count({ min: 32 })

// At most 16 items
ItemPredicate('*').count({ max: 16 })
```

## OR Logic

Create OR groups where any condition can match. Use the `or()` method with builder callbacks:

```ts
// Items without damage OR with damage=0 (pristine items)
ItemPredicate('*').or(
  i => i.without('minecraft:damage'),
  i => i.exact('minecraft:damage', NBT.int(0))
)

// Diamond or gold swords
ItemPredicate('*').or(
  i => i.exact('minecraft:item', 'minecraft:diamond_sword'),
  i => i.exact('minecraft:item', 'minecraft:golden_sword')
)

// Multiple conditions in OR
ItemPredicate('#minecraft:tools').or(
  i => i.has('minecraft:enchantments'),
  i => i.without('minecraft:damage'),
  i => i.match('minecraft:custom_data', { special: true })
)
```

The resulting predicate uses `|` to join OR conditions: `*[!minecraft:damage|minecraft:damage=0]`

## Using with Commands

### Clear Command

Remove items from player inventories:

```ts
import { clear, ItemPredicate, NBT } from 'sandstone'

// Clear specific item
clear('@p', 'minecraft:dirt')

// Clear with predicate - remove enchanted swords
clear('@p', ItemPredicate('minecraft:diamond_sword').has('minecraft:enchantments'))

// Clear damaged tools
clear('@a', ItemPredicate('#minecraft:tools').has('minecraft:damage'))

// Clear with quantity limit - remove up to 64 cobblestone
clear('@p', ItemPredicate('minecraft:cobblestone'), 64)

// Clear any item with low durability
clear('@a', ItemPredicate('*').match('minecraft:damage', {
  durability: { max: NBT.int(10) }
}))
```

### Execute If Items

Test for items in inventories:

```ts
import { execute, ItemPredicate, _, Objective, abs } from 'sandstone'

// Check if player has diamonds in inventory
_.if(execute.if.items.entity('@p', 'inventory.*', 'minecraft:diamond'), () => {
  // Commands here run if player has diamonds
})

// Check for enchanted sword in main hand
_.if(
  execute.if.items.entity('@s', 'weapon.mainhand',
    ItemPredicate('minecraft:diamond_sword').has('minecraft:enchantments')
  ),
  () => {
    // Player is holding an enchanted sword
  }
)

// Count items in inventory
const score = Objective.create('item_count', 'dummy')('@s')
execute.store.result.score(score).if.items.entity('@p', 'inventory.*',
  ItemPredicate('minecraft:diamond')
)

// Check chest for specific items
_.if(
  execute.if.items.block(abs(0, 64, 0), 'container.*',
    ItemPredicate('minecraft:diamond').count({ min: 10 })
  ),
  () => {
    // Chest has at least 10 diamonds
  }
)
```

### Flow Conditions

Use ItemPredicate with Flow's `_.items` condition to create cleaner, more readable conditional logic:

```ts
import { _, ItemPredicate, say, give, abs, NBT } from 'sandstone'

// Check if player has diamonds in inventory
_.if(_.items.entity('@p', 'inventory.*', 'minecraft:diamond'), () => {
  say('Player has diamonds!')
})

// Check for enchanted item in main hand
_.if(
  _.items.entity('@s', 'weapon.mainhand',
    ItemPredicate('minecraft:diamond_sword').has('minecraft:enchantments')
  ),
  () => {
    say('You have an enchanted sword!')
  }
)

// Check chest contents
_.if(
  _.items.block(abs(0, 64, 0), 'container.*',
    ItemPredicate('minecraft:diamond').count({ min: 10 })
  ),
  () => {
    say('Chest has at least 10 diamonds')
  }
)

// Complex condition with else
_.if(
  _.items.entity('@s', 'inventory.*',
    ItemPredicate('#minecraft:tools').match('minecraft:damage', {
      durability: { max: NBT.int(10) }
    })
  ),
  () => {
    say('You have a nearly broken tool!')
    give('@s', 'minecraft:diamond', 1)
  }
).else(() => {
  say('All tools are in good condition')
})
```

**Negating Predicates:**

Use `.notMatch` and `.notExact` to create negative conditions directly on the predicate:

```ts
import { _, ItemPredicate, say, NBT } from 'sandstone'

// Check for items WITHOUT a specific enchantment
_.if(
  _.items.entity('@s', 'inventory.*',
    ItemPredicate('minecraft:diamond_sword')
      .notMatch('minecraft:enchantments', [{
        enchantments: 'minecraft:curse_of_vanishing'
      }])
  ),
  () => {
    say('You have a sword without Curse of Vanishing!')
  }
)

// Check for items with non-zero damage (damaged items)
_.if(
  _.items.entity('@s', 'inventory.*',
    ItemPredicate('#minecraft:tools').notExact('minecraft:damage', NBT.int(0))
  ),
  () => {
    say('You have a damaged tool!')
  }
)

// Combine positive and negative conditions
_.if(
  _.items.entity('@s', 'weapon.mainhand',
    ItemPredicate('minecraft:diamond_sword')
      .has('minecraft:enchantments')
      .notMatch('minecraft:enchantments', [{
        enchantments: 'minecraft:curse_of_binding'
      }])
  ),
  () => {
    say('Enchanted sword without curses!')
  }
)
```

**Slot Selectors:**

Entity slot patterns for `_.items.entity()`:
- `inventory.*` - All inventory slots
- `hotbar.*` - Hotbar slots (0-8)
- `inventory.0` - Specific inventory slot
- `weapon.mainhand` / `weapon.offhand` - Hands
- `armor.head` / `armor.chest` / `armor.legs` / `armor.feet` - Armor slots
- `enderchest.*` - Ender chest contents
- `horse.chest` - Horse armor/chest slot
- `horse.*` - All horse/donkey/llama inventory slots

Container slot patterns for `_.items.block()`:
- `container.*` - All container slots
- `container.0` - Specific container slot

## Item Model Definitions

Override vanilla item models to display different models based on item properties. This is useful for showing custom models when items have specific enchantments, custom data, or other components:

```ts
import { ItemPredicate, ItemModelDefinition } from 'sandstone'

// Override diamond sword - show custom model when enchanted and undamaged
ItemModelDefinition('minecraft:diamond_sword',
  ItemPredicate('minecraft:diamond_sword')
    .has('minecraft:enchantments')
    .without('minecraft:damage')
    .model()
    .onTrue('mypack:item/enchanted_pristine_sword')
    .onFalse('minecraft:item/diamond_sword')
)

// Override diamond - show special model for quest items
ItemModelDefinition('minecraft:diamond',
  ItemPredicate('minecraft:diamond')
    .match('minecraft:custom_data', { quest_item: true })
    .model()
    .onTrue('mypack:item/quest_diamond')
    .onFalse('minecraft:item/diamond')
)
```

## Complex Examples

### Multi-Condition Predicates

Combine multiple tests with AND logic (each method call):

```ts
import { ItemPredicate, NBT } from 'sandstone'

// Enchanted, undamaged diamond sword with custom name
const specialSword = ItemPredicate('minecraft:diamond_sword')
  .has('minecraft:enchantments')
  .has('minecraft:custom_name')
  .without('minecraft:damage')

// Tool with specific enchantment and high durability
const goodTool = ItemPredicate('#minecraft:tools')
  .match('minecraft:enchantments', [{
    enchantments: 'minecraft:unbreaking',
    levels: { min: NBT.int(2) }
  }])
  .match('minecraft:damage', {
    durability: { min: NBT.int(50) }
  })
```

### Combining AND and OR

```ts
// Swords that are either enchanted OR undamaged
const usefulSword = ItemPredicate('#minecraft:swords').or(
  i => i.has('minecraft:enchantments'),
  i => i.without('minecraft:damage')
)

// Items with custom data matching one of several patterns
const markedItem = ItemPredicate('*')
  .or(
    i => i.match('minecraft:custom_data', { type: 'quest' }),
    i => i.match('minecraft:custom_data', { type: 'reward' }),
    i => i.match('minecraft:custom_data', { type: 'special' })
  )
```

### Practical Use Cases

```ts
import { clear, _, ItemPredicate, say, NBT } from 'sandstone'

// Clean up damaged tools from inventory
clear('@a', ItemPredicate('#minecraft:tools').match('minecraft:damage', {
  durability: { max: NBT.int(5) }
}))

// Check if player has required quest item
_.if(
  _.items.entity('@s', 'inventory.*',
    ItemPredicate('minecraft:diamond').match('minecraft:custom_data', {
      quest_id: 'main_quest_1'
    })
  ),
  () => {
    say('Quest item found!')
  }
)

// Remove all non-stackable items
clear('@a', ItemPredicate('*')
  .exact('minecraft:max_stack_size', NBT.int(1))
)
```

## Component Types

ItemPredicate uses generated types from Minecraft data. Common components include:

**Existence/Exact (`has`, `without`, `exact`):**
- `minecraft:custom_name`
- `minecraft:lore`
- `minecraft:enchantments`
- `minecraft:damage`
- `minecraft:unbreakable`
- `minecraft:custom_data`
- `minecraft:dyed_color`
- `minecraft:trim`

**Sub-predicates (`match`):**
- `minecraft:enchantments` - enchantment list with level ranges
- `minecraft:damage` - durability ranges
- `minecraft:custom_data` - NBT pattern matching
- `minecraft:stored_enchantments` - for enchanted books
- `minecraft:potion_contents` - potion types and effects

TypeScript autocomplete will show all available components based on the Minecraft version configured in `sandstone.config.ts`.

## Technical Details

### String Representation

ItemPredicate compiles to Minecraft's item predicate syntax:

```ts
import { ItemPredicate, NBT } from 'sandstone'

ItemPredicate('minecraft:diamond')
// → minecraft:diamond

ItemPredicate('minecraft:diamond_sword').has('minecraft:enchantments')
// → minecraft:diamond_sword[minecraft:enchantments]

ItemPredicate('*').without('minecraft:damage')
// → *[!minecraft:damage]

ItemPredicate('*').or(
  i => i.without('minecraft:damage'),
  i => i.exact('minecraft:damage', NBT.int(0))
)
// → *[!minecraft:damage|minecraft:damage=0]

ItemPredicate('#minecraft:swords')
  .has('minecraft:enchantments')
  .count({ min: 1 })
// → #minecraft:swords[minecraft:enchantments,count~{min:1}]
```

### Method Chaining

All predicate methods return `this`, allowing fluent chaining:

```ts
ItemPredicate('minecraft:diamond_sword')
  .has('minecraft:enchantments')
  .without('minecraft:damage')
  .has('minecraft:custom_name')
  .count({ max: 1 })
```

### Type Safety

ItemPredicate leverages TypeScript's type system:

- Component names are type-checked against Minecraft's registry
- Component values are validated against their types
- Predicate values have stricter types than exact values
- Tag types are properly distinguished from item types

```ts
import { ItemPredicate, NBT } from 'sandstone'

// ✓ Valid
ItemPredicate('minecraft:diamond_sword').exact('minecraft:damage', NBT.int(0))

// ✗ Type error - 'invalid_component' doesn't exist
ItemPredicate('minecraft:diamond_sword').exact('invalid_component', NBT.int(0))
```
