---
id: if
title: If / Else
description: How to write if / else statements in Sandstone.
position: 2
---

import { InteractiveSnippet } from '../../../src/components'

You can easily check for in-game conditions using Sandstone's built-in `if` statement.

## Syntax

To check a condition, the following syntax is used:

```ts
_.if(condition1, () => {
  say('Condition 1 is true')
})
  .elseIf(condition2, () => {
    say('Condition 2 is true')
  })
  .else(() => {
    say('Both condition 1 and condition 2 are false')
  })
```

As you can see, this syntax mimics the original `if / else if / else` construct
from classical programming languages. `elseIf` and `else` are entirely optional,
and you can chain as many `elseIf` as needed:

```ts
_.if(condition1, () => {
  say('I am a lonely if')
})

_.if(condition2, () => {
  say(2)
})
  .elseIf(condition3, () => {
    say(3)
  })
  .elseIf(condition4, () => {
    say(4)
  })
```

## Conditions

Conditions are created using Sandstone's built-in abstractions.

### Score conditions

To check if a score matches a given condition, you can use [score comparison operators].

For example:

```ts
const kills = Objective.create('kills', 'playerKillCount')
const myKills = kills('@s')

_.if(myKills.greaterThan(10), () => {
  tellraw('@a', ['@s', ' is on a rampage!'])
})
```

#### Try it out

```ts sandstone height=300
const kills = Objective.create('kills', 'playerKillCount')
const myKills = kills('@s')

MCFunction('if_score', () => {
  _.if(myKills.greaterThan(10), () => {
    tellraw('@a', [Selector('@s'), ' is on a rampage!'])
  })
})
```

[score comparison operators]: /docs/features/variables/objectives#comparison

### Data conditions

To check if a block, an entity or a storage has some [NBT](/docs/features/nbt)
data, use the `_.data` condition together with the [NBT path] syntax.

In the following example, a command is run every tick for each player holding
a stick in their hand:

```ts
import { _, Selector, MCFunction, tellraw, execute } from 'sandstone'

MCFunction('tick', () => {
    // Execute as every player
    execute.as(Selector('@a')).run(() => {
      // Detect the stick
      _.if(_.data.entity('@s', 'SelectedItem{id:'minecraft:stick'}'), () => {
        tellraw('@s', 'Hey! Nice stick you got there.')
      })
    })
  },
  { runEveryTick: true }
)
```

The same can be done for blocks:

```ts
import { _, Selector, MCFunction, tellraw, execute, rel } from 'sandstone'

MCFunction('tick', () => {
    // Execute at every player
    execute.as(Selector('@a')).at('@s').run(() => {
        // Detect honey bottles
        _.if(Data('block', rel(0, -1, 0), 'Items[{id:'minecraft:honey_bottle'}]'), () => {
            tellraw('@s', 'There is some honey beneath you')
          }
        )
      })
  },
  { runEveryTick: true }
)
```

:::caution

Please note that no validation is performed on NBT paths. The following snippet
produces an invalid command due to missing quotes:

```ts
_.if(Data('block', rel(0, -1, 0), 'Items[{id:minecraft:honey_bottle}]'), () => {
  // ...
})
```

This is the resulting command:

```mcfunction
execute if data block ~ ~-1 ~ Items[{id:minecraft:honey_bottle}] run ...
```

:::

#### Try it out

```ts sandstone height=300
MCFunction('tick', () => {
  // Execute as every player
  execute.as(Selector('@a')).at('@s').run(() => {
    // Detect honey bottles
    _.if(Data('block', rel(0, -1, 0), 'Items[{id:"minecraft:honey_bottle"}]'), () => {
      tellraw('@s', 'There is some honey beneath you')
    })
  })
}, { runEveryTick: true })
```

:::

[NBT path]: https://minecraft.fandom.com/wiki/NBT_path_format

Data instances also support `.equals(value)`, which compares the stored value against an NBT value, a `Score`, or another Data instance instead of just checking for existence:

```ts
_.if(Data('storage', 'my_pack:main', 'stage').equals(3), () => {
  say('Stage 3 reached!')
})
```

### Block conditions

`_.block` compares the block at a given position against a block ID (which can be a
[tag](/docs/features/resources/datapack/tags)), optionally matching block state properties and/or block entity NBT data. Sandstone provides autocompletion for both the state keys/values and the NBT shape, based on the block you specify.

```ts
// Basic block check
_.if(_.block(abs(0, 64, 0), 'minecraft:stone'), () => { ... })

// Check block with a specific state
_.if(_.block(abs(0, 64, 0), 'minecraft:oak_log', { axis: 'y' }), () => { ... })

// Check a block entity's NBT
_.if(_.block(abs(0, 64, 0), 'minecraft:chest', { facing: 'north' }, { Items: [] }), () => { ... })
_.if(_.block(['~', '~', '~1'], 'minecraft:command_block', {}, { Command: 'say Hello' }), () => { ... })
```

### Blocks conditions

`_.blocks` compares the blocks contained in two equally sized volumes. `scan_mode` can be `'all'` (compare every block, the default) or `'masked'` (ignore air blocks in the source volume).

```ts
_.if(_.blocks(abs(0, 0, 0), abs(4, 4, 4), abs(100, 0, 0), 'masked'), () => {
  say('The structure matches!')
})
```

### Biome conditions

`_.biome` checks the biome at a given position (which can be a biome tag).

```ts
_.if(_.biome(rel(0, 0, 0), 'minecraft:desert'), () => {
  say("It's hot out here.")
})
```

### Dimension conditions

`_.dimension` checks whether the command is executing in a given dimension.

```ts
_.if(_.dimension('minecraft:the_nether'), () => {
  say('Watch out for lava!')
})
```

### Entity conditions

`_.entity` checks whether one or more entities matching a selector exist. You can use a `Selector` directly as a condition to the same effect.

```ts
_.if(_.entity('@a[tag=example]'), () => { ... })

// Equivalent, a Selector can be used directly as a condition:
_.if(Selector('@a', { tag: 'example' }), () => { ... })
```

Several other Sandstone values also implement this "usable directly as a condition"
behavior, so you never need a dedicated `_.` wrapper for them:

- [`Label`](/docs/features/variables/labels) instances (e.g. `_.if(sick('@s'), ...)`)
- [`Advancement`](/docs/features/resources/datapack/advancements) instances (checks the current executor has it)
- [`Predicate`](/docs/features/resources/datapack/predicates) instances (equivalent to `_.predicate(...)`)

### Item conditions

`_.items.block` and `_.items.entity` test whether a container's slots contain items
matching an [item predicate](/docs/features/variables/itemPredicate).

```ts
// Check if a chest has any diamonds
_.if(_.items.block(abs(0, 64, 0), 'container.*', 'minecraft:diamond'), () => { ... })

// Check if the nearest player has any diamonds
_.if(_.items.entity('@p', 'inventory.*', 'minecraft:diamond'), () => { ... })

// Check for an enchanted sword using an ItemPredicate builder
_.if(
  _.items.entity('@p', 'weapon.mainhand', ItemPredicate('minecraft:diamond_sword').has('minecraft:enchantments')),
  () => { ... },
)
```

### Chunk loaded conditions

`_.chunksLoaded` checks whether the chunk containing a given position is loaded.

```ts
_.if(_.chunksLoaded(abs(1000, 0, 1000)), () => {
  say('That chunk is loaded!')
})
```

### Function conditions

`_.function_` (named with a trailing underscore since `function` is a reserved word) checks a function or function tag and matches its return value(s). If given a function tag, all functions in the tag run regardless of the results of prior functions in that tag.

```ts
_.if(_.function_('my_pack:some_function'), () => { ... })

const check = MCFunction('check', () => {
  _.return.run(1)
})
_.if(_.function_(check), () => { ... })
```

### Predicate conditions

`_.predicate` checks whether a [predicate](/docs/features/resources/datapack/predicates) succeeds, accepting either a predicate's name or a `PredicateClass` instance directly:

```ts
_.if(_.predicate('my_pack:is_raining'), () => { ... })

const isRaining = Predicate('is_raining', { condition: 'minecraft:weather_check', raining: true })
_.if(_.predicate(isRaining), () => { ... })
```

### Boolean logic

Boolean logic in programming means comparing boolean values (`true`/`false`)
with a defined outcome. Each boolean operation has a 'truth-table' showing which
inputs lead to what output.

#### Or

The `_.or` operation succeeds if one or more of its conditions are true. It can
have more than just two conditions as inputs.

| A   | B   | result |
| --- | --- | :----: |
| ☐   | ☐   |   ☐    |
| ☒   | ☐   |   ☒    |
| ☐   | ☒   |   ☒    |
| ☒   | ☒   |   ☒    |

Example:

```ts
// Check if there is a sandstone slab on the current block, or a sandstone block under the player's feet
const condA = _.block(rel(0, -1, 0), 'sandstone')
const condB = _.block(rel(0, 0, 0), 'sandstone_slab')
_.if(_.or(condA, condB), () => {
  say('Jackpot!')
})
```

#### And

The `_.and` operation succeeds if all its conditions are true. It can
have more than just two conditions as inputs.

| A   | B   | result |
| --- | --- | :----: |
| ☐   | ☐   |   ☐    |
| ☒   | ☐   |   ☐    |
| ☐   | ☒   |   ☐    |
| ☒   | ☒   |   ☒    |

Example:

```ts
// Check if there is a pressure plate on top of a TNT!
const condA = _.block(rel(0, -1, 0), 'tnt')
const condB = BuiltinBlockSet('pressure_plates')
_.if(_.and(condA, condB), () => {
  say('Boom!')
})
```

#### Not

The `_.not` operation succeeds if its condition is false. It can only have one
input.

| A   | result |
| --- | :----: |
| ☐   |   ☒    |
| ☒   |   ☐    |

Example:

```ts
// Check if there is neither a sandstone slab on the current block, nor a sandstone block under the player's feet
const condA = _.block(rel(0, -1, 0), 'sandstone')
const condB = _.block(rel(0, 0, 0), 'sandstone_slab'); // Unspecified is equivalent to `~ ~ ~`
_.if(_.not(_.or(condA, condB)), () => {
  say('Not a jackpot :(')
})
```

#### Large scale Flow

:::warning
In some scenarios a very large condition tree may be necessary, in which case, scaled usage of Flow should be avoided, due to compile-time performance concerns.

Example:

```ts
const foo = Variable(0)

_.if(foo['<='](100000), () => {
  _.if(foo['<='](100), () => {
    for (let i = 0; i < 100; i++) {
      _.return.run(() => {
        _.if(foo['=='](i), () => {
          say(`${i}`)
        })
      })
    }
  }).elseIf(_.and(foo['>'](100), foo['<='](200)), () => {
    /// ...
  })
  /// ...
}).else(() => {
  /// ...
})
```

On better than average hardware an example like this would take several minutes to compile due to Visitor complexity; **many** nested command callbacks results in unacceptably slow compile times.

To avoid this, use primitive commands instead, utilizing tools like `raw` when necessary, and/or compiling your trees once and saving them in external resources.
:::
