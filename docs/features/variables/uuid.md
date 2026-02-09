---
id: uuid
title: UUID
description: How to work with entity UUIDs in Sandstone.
---

## Overview

UUIDs (Universally Unique Identifiers) are 128-bit values that Minecraft uses to uniquely identify every entity in the world. Unlike selectors which can match multiple entities or change over time, a UUID always refers to exactly one specific entity.

Sandstone's `UUID` class provides a type-safe way to work with UUIDs across different representations:
- **String format**: The standard hyphenated form like `f81d4fae-7dec-11d0-a765-00a0c91e6bf6`
- **Integer array**: Four 32-bit signed integers `[I; -123456789, 123456789, -987654321, 987654321]`
- **Scores**: Four scoreboard scores holding the integer values
- **Data point**: An NBT path containing the UUID as an int array

## Creating UUIDs

### From a Known UUID

Use a static UUID string or integer array when you know the exact entity you want to reference:

```ts
import { UUID } from 'sandstone'

// From a string (standard hyphenated format)
const playerUUID = UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')

// From an integer array
const mobUUID = UUID([-123456789, 2111568922, -1818263473, 985609794])
```

### Generate a Random UUID

Calling `UUID()` with no arguments generates a random UUID. This is useful for creating unique identifiers at pack compile time:

```ts
import { UUID } from 'sandstone'

// Generate a random UUID
const randomUUID = UUID()
```

You can also import the `randomUUID` utility directly for use in other contexts:

```ts
import { randomUUID } from 'sandstone/utils'

const uuidArray = randomUUID()  // Returns [number, number, number, number]
```

### From a Selector

Create a UUID reference from an entity selector. The selector must target exactly one entity:

```ts
import { UUID, Selector } from 'sandstone'

// From the nearest player
const nearestPlayer = UUID(Selector('@p'))

// From a specific tagged entity
const bossEntity = UUID(Selector('@e', { type: 'minecraft:wither', limit: 1, tag: 'boss' }))
```

### From Scores

If you have four scores that contain UUID integer values:

```ts
import { UUID, Objective } from 'sandstone'

const uuidObj = Objective.create('uuid_parts', 'dummy')
const scores = [uuidObj('uuid_0'), uuidObj('uuid_1'), uuidObj('uuid_2'), uuidObj('uuid_3')] as const

// Create UUID from existing scores (assumes they're already set)
const entityUUID = UUID(scores)
```

### From a Data Point

Reference a UUID stored in NBT data:

```ts
import { UUID, Data } from 'sandstone'

// From an entity's UUID data
const pigUUID = UUID(Data('entity', '@e[type=pig,limit=1]', 'UUID'))

// From storage
const storedUUID = UUID(Data('storage', 'mypack:data', 'saved_uuid'))
```

## Primary Sources and Conversions

Each UUID has a "primary source" that determines how it was created. You can add additional source representations for flexibility:

```ts
import { UUID, Selector } from 'sandstone'

// Create from selector, but also generate scores for arithmetic operations
const player = UUID(Selector('@p'), {
  sources: {
    scores: true  // Auto-generate and populate four scores
  }
})

// Create from a known UUID, and store in data storage
const known = UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6', {
  sources: {
    data: true  // Auto-generate a storage data point
  }
})
```

### Source Options

The `sources` option accepts:

| Option | Value | Description |
|--------|-------|-------------|
| `scores` | `true` | Auto-generate four `Variable()` scores and populate them |
| `scores` | `[scoreArray]` | Use specified scores and populate them |
| `scores` | `scoreArray` | Use specified scores (assume already populated) |
| `data` | `true` | Auto-generate a data storage point and populate it |
| `data` | `[dataPoint]` | Use specified data point and populate it |
| `data` | `dataPoint` | Use specified data point (assume already populated) |
| `selector` | `Selector` | Associate a selector for `execute.as()` operations |

## Using UUIDs

### Execute as Entity

Use the `execute` property to run commands as the entity:

```ts
import { UUID, Selector, effect } from 'sandstone'

// Known UUID - works directly
const known = UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
known.execute.run.effect.give('@s', 'minecraft:regeneration', 10)

// Selector-based UUID - works directly
const player = UUID(Selector('@p'))
player.execute.run.effect.give('@s', 'minecraft:regeneration', 10)

// Chain with other execute modifiers
player.execute.at('@s').run.setblock('~ ~-1 ~', 'minecraft:gold_block')
```

#### Execute with Known UUIDs and Selectors

For known UUIDs and selector-based UUIDs, `execute` works directly:

```ts
// Known UUID - converted to string at build time
const known = UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
known.execute.run.say('Hello')  // execute as f81d4fae-7dec-11d0-a765-00a0c91e6bf6

// Selector - uses the selector directly
const player = UUID(Selector('@p'))
player.execute.run.say('Hello')  // execute as @p
```

#### Execute with Data/Scores UUIDs (gibbs_uuid)

UUIDs stored as data or scores require runtime conversion from int array to string format. Sandstone uses the [gibbs_uuid](https://smithed.dev/packs/gibbs_uuid) library for this conversion.

**Step 1: Convert and cache the UUID**

Call `convertForMacro()` to convert the UUID to string format and cache it:

```ts
import { MCFunction, UUID, Data } from 'sandstone'

MCFunction('use_stored_uuid', () => {
  const storedUUID = UUID(Data('storage', 'mypack:data', 'saved_uuid'))

  // Convert UUID int array to string and cache it
  storedUUID.convertForMacro()

  // Now execute works - uses the cached converted value
  storedUUID.execute.run.say('Hello from the stored entity!')
})
```

**How it works:**

1. `convertForMacro()` copies the UUID to `gu:main in`
2. Calls `gu:generate_from_storage` to convert int array → string
3. Caches the result in `__sandstone:uuid_cache` indexed by the UUID value
4. `execute` looks up the cached string using a macro function

**Alternative: Selector fallback**

If you don't want to use gibbs_uuid, provide a selector fallback:

```ts
const dataUUID = UUID(Data('storage', 'mypack:data', 'uuid'), {
  sources: { selector: Selector('@e', { limit: 1 }) }
})
dataUUID.execute.run.say('Hello')  // Uses the fallback selector
```

:::note
The gibbs_uuid library is automatically added as a Smithed dependency when you use `convertForMacro()`.
:::

### In Conditions

UUIDs can be used in flow conditions to check if the entity exists:

```ts
import { UUID, Selector, _, tellraw } from 'sandstone'

const target = UUID(Selector('@e', { type: 'minecraft:villager', limit: 1, tag: 'merchant' }))

_.if(target, () => {
  tellraw('@a', 'The merchant is still alive!')
})
```

### In JSON Text Components

UUIDs integrate with tellraw and other JSON text commands:

```ts
import { UUID, Selector, tellraw } from 'sandstone'

const player = UUID(Selector('@p'))

// Display the entity's name
tellraw('@a', ['Welcome, ', player])
```

### String Conversion

Convert between UUID formats:

```ts
import { UUID } from 'sandstone'

// From string to array
const uuid = UUID('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
console.log(uuid.known)  // [-123456789, 2111568922, -1818263473, 985609794]

// From array to string (only for known UUIDs)
const uuidString = uuid.arrayToString()  // 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
```

## Converting Between Sources

You can add additional source representations after creation:

```ts
import { UUID, Selector, Variable } from 'sandstone'

const entity = UUID(Selector('@e', { limit: 1, type: 'minecraft:pig' }))

// Store the UUID in scores for later use
entity.setScores([Variable(), Variable(), Variable(), Variable()])

// Store in a data point
entity.setData()

// Associate a selector for execute operations
entity.setSelector(Selector('@e', { type: 'minecraft:pig', limit: 1 }))
```

## Practical Examples

### Saving and Loading Entity References

Store a reference to an entity for later use:

```ts
import { MCFunction, UUID, Data, Selector, execute, tellraw } from 'sandstone'

// Storage for the saved UUID
const savedTarget = Data('storage', 'mypack:data', 'target_uuid')

MCFunction('save_target', () => {
  // Save the nearest pig's UUID to storage
  const target = UUID(Selector('@e', { type: 'minecraft:pig', limit: 1 }), {
    sources: { data: [savedTarget] }
  })
  tellraw('@s', 'Target saved!')
})

MCFunction('teleport_to_target', () => {
  // Load UUID from storage with a selector fallback for execute
  const target = UUID(savedTarget, {
    sources: { selector: Selector('@e', { type: 'minecraft:pig', limit: 1 }) }
  })
  // Execute at the entity's location and teleport @s there
  target.execute.at('@s').run.tp('@s', '~ ~ ~')
})
```

### Tracking Specific Entities

Create a system that tracks a specific entity:

```ts
import { MCFunction, UUID, Selector, _, execute, tellraw, effect } from 'sandstone'

MCFunction('mark_boss', () => {
  // Get the UUID of the nearest wither
  const boss = UUID(Selector('@e', { type: 'minecraft:wither', limit: 1 }))

  // Use it in conditions and commands
  _.if(boss, () => {
    boss.execute.run(() => {
      effect.give('@s', 'minecraft:glowing', 600, 0, true)
    })
    tellraw('@a', ['The boss has been marked!'])
  })
})
```

## Technical Notes

- UUIDs created from selectors or data points require the entity to exist at runtime
- Known UUIDs (from strings or arrays) can be used even if the entity doesn't currently exist
- The integer array format uses signed 32-bit integers, which can be negative
- UUID scores and data storage are stored in the `__sandstone` namespace when auto-generated
- **Execute with data/scores**: Call `convertForMacro()` first to convert the UUID using gibbs_uuid, then use `execute`. The converted value is cached in `__sandstone:uuid_cache` indexed by the UUID int array (for data) or first score value (for scores).
- **gibbs_uuid dependency**: When using `convertForMacro()`, Sandstone automatically adds gibbs_uuid as a Smithed dependency to your pack.
