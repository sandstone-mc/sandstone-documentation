---
id: block
title: Block Library
description: How to use the official Block Library
---

import { Tabs } from "../../src/components";
import { InteractiveSnippet } from '../../src/components'
import TabItem from "@theme/TabItem";

## warning: this isn't updated for beta.1

## Installation

<Tabs
groupId="package-manager"
defaultValue="sand"
values={[
{label: 'Sand', value: 'sand'},
{label: 'Pnpm', value: 'pnpm'},
{label: 'Npm', value: 'npm'},
]}>
<TabItem value="sand">

```batch
sand install native block
```

</TabItem>
<TabItem value="pnpm">

```batch
pnpm i @sandstone-mc/block
```

</TabItem>
<TabItem value="npm">

```batch
npm i @sandstone-mc/block
```

</TabItem>
</Tabs>

## Getting Started

```ts
const acaciaStairs = Block('acacia_stairs', '~ ~ ~', { facing: 'north', shape: 'straight' })

acaciaStairs.set()
```

## Conversions

- World: an in-world block
- NBT: the commonly used block state NBT format in block displays, falling sand, etc. `{Name:<block_name>,Properties:{<property>:<value>}}`
- Number (`num`): each combination of block id and its properties, totalling up to ~26000.
- Custom: a callback to convert each state combination directly to what is needed, eg. summoning a block display.

Available Conversions:

- World to NBT
- World to Number
- World to Custom
- NBT to World
- NBT to Number
- NBT to Custom
- Number to NBT
- Number to World
- Number to Custom

Examples:

```ts
// Converts the current, in-world block (~ ~ ~) to a number and stores it in a score
const test = Variable()
execute.store.result.score(test).run(() => Block().to('num'))

// Converts the current, in-world block (~ ~ ~) to a block display
Block().to('custom', (block, properties) =>
  summon('block_display', {
    block_state: {
      Name: block,
      ...(properties ? { Properties: properties } : {}),
    },
  })
)

// Converts that block display back into a real block
const displayState = Data('entity', Selector('@e', { limit: 1, sort: 'nearest', distance: '..0.1', type: 'block_display' }), 'block_state')

defaultBlocks.from('nbt', displayState, 'world')
```

## BlockSets

Block conversions require generating lots of boilerplate code to achieve maximum efficiency, but this results in longer compile times, and in the case of world conversions, lower performance.

However, a lot of the time, a project only needs conversions for a scoped set of blocks, reducing the size of conversions.

```ts
// Uses a block group tag from vanilla, `wool`, scoping to only the 15 wool colors
const woolBlocks = BuiltinBlockSet('wool')

// Sets up a type-safe block set using a predefined list.
const spaceshipBlocks = new BlockSetClass(sandstonePack.core, [
  'cyan_terracotta',
  'glass',
  'sea_lantern',
  'iron_block',
  ...
] as const)

// Automatically loads in a block group tag
const barkBlocks = new BlockSetClass(sandstonePack.core, await (await fetch('https://raw.githubusercontent.com/Aeldrion/AESTD/master/data/aestd1/tags/blocks/wood_blocks.json')).json() as readonly string[])
```

### Conditionals

```ts
// Checks whether the current block (`~ ~ ~`) is stone
_.if(Block('stone'))

// Checks whether the current block (`~ ~ ~`) is a spaceship block
_.if(spaceshipBlocks)

// Checks whether the current block is a bark block & is on the X axis
_.if(Properties(barkBlocks, '~ ~ ~', { axis: 'x' }))

// Checks whether a 3x3x3 cube from the current block matches the blocks at `0 0 0`
_.if(Blocks('~ ~ ~', '~3 ~3 ~3', '0 0 0', 'all'))
```

#### Block volumes

In order to compare two block volumes, the area must be specified first using
two coordinates and then the coordinates of the corner with the lowest
coordinates (lower northwest corner). Additionally, it must be specified whether
air blocks should be ignored when comparing. For more information, take a look
at the [Minecraft Wiki](https://minecraft.fandom.com/wiki/Commands/execute#.28if.7Cunless.29_blocks).

The following example compares the 3x3 area of blocks below the player with
the area above them:

```ts
import { _, Selector, MCFunction, tellraw, execute, rel } from 'sandstone'

const Self = Selector('@s')

MCFunction('tick', () => {
    // Execute as every player
    execute.as(Selector('@a')).at(Self).run(() => {
        // Detect sandstone under the player
        _.if(
          Blocks(
            // Area
            rel(-1, -1, -1),
            rel(1, -1, 1),
            // Corner
            rel(-1, 2, -1),
            // Scan Mode
            'all'
          ), () => {
            tellraw(Self, 'Above and below, it is all the same')
          }
        )
      })
  },
  { runEveryTick: true }
)
```

#### Try it out

```ts sandstone height=300
MCFunction('tick', () => {
  // Execute as every player
  execute.as(Selector('@a')).at('@s').run(() => {
    // Detect sandstone under the player
    _.if(_.block(rel(0, -1, 0), 'sandstone'), () => {
      tellraw('@s', 'The framework is below your feet!')
    })
  })
}, { runEveryTick: true })
```