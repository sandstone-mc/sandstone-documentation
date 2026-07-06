---
id: item_model_definitions
title: Item Model Definitions
description: How to create conditional item models with Sandstone.
---

## Introduction

Item Model Definitions allow you to override vanilla item models with conditional logic. This is useful for displaying different models based on item properties like enchantments, custom data, damage, or other components.

The resource is placed in `assets/<namespace>/items/<item>.json` in the resource pack.

## Basic Syntax

```ts
import { ItemModelDefinition, ItemPredicate } from 'sandstone'

ItemModelDefinition('minecraft:diamond_sword',
  ItemPredicate('minecraft:diamond_sword')
    .has('minecraft:enchantments')
    .model()
    .onTrue('mypack:item/enchanted_sword')
    .onFalse('minecraft:item/diamond_sword')
)
```

The first argument is the item to override (typically a vanilla item like `minecraft:diamond_sword`). The second argument is an ItemPredicate with `.model()` called to convert it to a model builder.

## Model Builder Methods

After calling `.model()` on an ItemPredicate, you get access to model-specific methods:

### onTrue / onFalse

Specify which model to use when conditions match or don't match:

```ts
import { ItemModelDefinition, ItemPredicate } from 'sandstone'

ItemModelDefinition('minecraft:diamond_pickaxe',
  ItemPredicate('minecraft:diamond_pickaxe')
    .has('minecraft:enchantments')
    .without('minecraft:damage')
    .model()
    .onTrue('mypack:item/pristine_enchanted_pickaxe')
    .onFalse('minecraft:item/diamond_pickaxe')
)
```

## Common Use Cases

### Custom Model for Enchanted Items

Show a glowing or special model when an item is enchanted:

```ts
import { ItemModelDefinition, ItemPredicate } from 'sandstone'

ItemModelDefinition('minecraft:netherite_sword',
  ItemPredicate('minecraft:netherite_sword')
    .has('minecraft:enchantments')
    .model()
    .onTrue('mypack:item/enchanted_netherite_sword')
    .onFalse('minecraft:item/netherite_sword')
)
```

### Custom Model Based on Custom Data

Show different models for items with specific custom data (useful for custom items):

```ts
import { ItemModelDefinition, ItemPredicate } from 'sandstone'

// Quest items get a special glow
ItemModelDefinition('minecraft:diamond',
  ItemPredicate('minecraft:diamond')
    .match('minecraft:custom_data', { quest_item: true })
    .model()
    .onTrue('mypack:item/quest_diamond')
    .onFalse('minecraft:item/diamond')
)

// Different weapon tiers
ItemModelDefinition('minecraft:iron_sword',
  ItemPredicate('minecraft:iron_sword')
    .match('minecraft:custom_data', { tier: 'legendary' })
    .model()
    .onTrue('mypack:item/legendary_iron_sword')
    .onFalse('minecraft:item/iron_sword')
)
```

### Pristine vs Damaged Items

Show a clean model only when the item has no damage:

```ts
import { ItemModelDefinition, ItemPredicate } from 'sandstone'

ItemModelDefinition('minecraft:diamond_chestplate',
  ItemPredicate('minecraft:diamond_chestplate')
    .without('minecraft:damage')
    .model()
    .onTrue('mypack:item/pristine_diamond_chestplate')
    .onFalse('minecraft:item/diamond_chestplate')
)
```

### Multiple Conditions

Combine multiple conditions for complex logic:

```ts
import { ItemModelDefinition, ItemPredicate, NBT } from 'sandstone'

// Show special model only for enchanted, undamaged, named swords
ItemModelDefinition('minecraft:diamond_sword',
  ItemPredicate('minecraft:diamond_sword')
    .has('minecraft:enchantments')
    .has('minecraft:custom_name')
    .without('minecraft:damage')
    .model()
    .onTrue('mypack:item/legendary_sword')
    .onFalse('minecraft:item/diamond_sword')
)
```

## Output Structure

The generated JSON uses Minecraft's item model condition system:

```json
{
  "model": {
    "type": "condition",
    "property": "has_component",
    "component": "minecraft:enchantments",
    "on_true": {
      "type": "model",
      "model": "mypack:item/enchanted_sword"
    },
    "on_false": {
      "type": "model",
      "model": "minecraft:item/diamond_sword"
    }
  }
}
```

When multiple conditions are used, they are nested to create AND logic.

## Integration with ItemPredicate

ItemModelDefinition works seamlessly with all ItemPredicate methods:

- `.has(component)` - Check if component exists
- `.without(component)` - Check if component doesn't exist
- `.exact(component, value)` - Check for exact component value
- `.notExact(component, value)` - Check that component doesn't have exact value
- `.match(component, predicate)` - Check component against a predicate
- `.notMatch(component, predicate)` - Check component doesn't match predicate

See [ItemPredicate](/docs/features/variables/itemPredicate) for full documentation on available methods.

## Notes

- The item name should be the vanilla item you're overriding (e.g., `minecraft:diamond_sword`)
- Model references in `onTrue`/`onFalse` should point to valid model files in your resource pack
- Conditions are evaluated in order and nested for AND logic
- This generates files in `assets/<namespace>/items/` in the resource pack output
