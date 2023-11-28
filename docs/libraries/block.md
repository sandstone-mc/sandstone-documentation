---
id: block
title: Block Library
description: How to use the official Block Library
---

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
Block().to('custom', (block, properties) => summon('block_display', { block_state: {Name: block, ...(properties ? {Properties: properties} : {})}}))

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