---
id: switch-case
title: switch/case
description: How to provide per-case logic for a Score or DataPoint in Sandstone.
---

You can easily handle a state depending on its current value using Sandstone's built-in `switch`/`case`.

## Syntax

```ts
const state = Variable()

// ...

_.switch(state, _
  .case(0, () => {
    say('Handling for first state')
  })
  .case(1, () => {
    say('Handling for second state')
  })
  .case(2, () => {
    say('Handling for third state')
  })
  .default(() => _.throw(['Unexpected state! ', state]))
)
```

As you can see, this is fairly similar to the traditional `switch`/`case` syntax in common languages.

### Switching on an NBT value

```ts
const item = Data('entity', '@s', 'Inventory[0].Enchantments[0].id')

_.switch(item, _
  .case('minecraft:sharpness', () => say('ouch!'))
  .case('minecraft:knockback', () => say('woah!'))
  .default(() => say('phew!'))
)
```