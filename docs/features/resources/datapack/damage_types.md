---
id: damage_types
title: Damage Types
description: How to create damage types with Sandstone.
---

## Introduction
Sandstone features fully-typed damage types. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the damage type.

The minimal syntax for damage types is the following:
```ts
import { DamageType } from 'sandstone'

DamageType('damage_type_name', {
  message_id: 'name',

  exhaustion: 5,

  scaling: 'never',
})
```

### Additional properties

All additional properties can be directly found via autocompletion/jsdoc, or by looking at the [Minecraft wiki article on Damage Types](https://minecraft.wiki/Damage_type).

## Usage

### Invoking damage

```ts
const myDamageType = DamageType(...) 

// Inflict 5 hearts of damage on the current entity (`@s`).
myDamageType.damage(10)

// Inflict 2.5 hearts of damage on the current entity, coming from 2 blocks behind them, attributed to the closest entity with the slenderman label tag.
myDamageType.damage(5, '^ ^ ^-2', Selector('@e', { distance: [null, 15], limit: 1, tag: 'slenderman' }))

// Inflict 2 hearts of damage on the current player, coming directly from a custom projectile, attributed to the closest other player
const current = Label('current')('@s')
current.add()
myDamageType.damage(4, Selector('@e', { distance: [null, 15], limit: 1, tag: 'fireball' }), Selector('@p', { tag: `!${current}` }))
current.remove()

// Inflict 10 hearts of damage on the nearest player.
myDamageType.damage('@p', 20)
```

### Setting flags
```ts
DamageType('damage_type_name', {
  message_id: 'name',

  exhaustion: 5,

  scaling: 'never',
}, {
  flags: ['no_knockback', 'bypasses_cooldown']
})
```

Instead of having to manually create damage type group tags and add your types to them, Sandstone will handle that for you.

### Displaying the translation key

If you would like to manually display the death message somewhere for your damage type, it is as easy as including it in a text component.

```ts
const myDamageType = DamageType(...) 

tellraw('@a', ['A death hath occurred!!\n', myDamageType])
```