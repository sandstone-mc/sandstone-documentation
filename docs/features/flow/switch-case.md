---
id: switch-case
title: Switch/Case
description: How to provide per-case logic for a Score or DataPoint in Sandstone.
---

import { InteractiveSnippet } from '../../../src/components'

Sandstone provides a powerful `switch`/`case` abstraction that compiles to efficient Minecraft commands. Depending on what you're switching on, Sandstone automatically chooses the optimal dispatch strategy.

## Basic Syntax

The recommended way to use switch/case is with the fluent API:

```ts
import { _, Objective, say } from 'sandstone'

const state = Objective.create('state')('@s')

_.switch(state, _
  .case<Score>(0, () => say('State is zero'))
  .case(1, () => say('State is one'))
  .case(2, () => say('State is two'))
  .default(() => say('Unknown state'))
)
```

## Switching on Scores

When switching on a `Score` with static numeric values, Sandstone generates O(1) dispatch using macros. Each case becomes a separate function named after its value (e.g., `case_0`, `case_1`, `case_2`), and the score value is used directly to call the matching function.

#### Try it out

```ts sandstone height=350
const level = Objective.create('level')('@s')

MCFunction('level_check', () => {
  _.switch(level, _
    .case<Score>(1, () => say('Level 1 - Tutorial'))
    .case(2, () => say('Level 2 - Easy'))
    .case(3, () => say('Level 3 - Medium'))
    .case(4, () => say('Level 4 - Hard'))
    .default(() => say('Invalid level'))
  )
})
```

If a case doesn't exist for the current value and there's a default/fallback, the switch gracefully handles it using `execute store success` to detect failed macro calls.

## Switching on NBT Data

You can also switch on NBT data stored in entities, blocks, or storage. Sandstone uses an efficient lookup table from data storage to map values to case indices:

```ts sandstone height=350
const itemType = Data('storage', 'game:data', 'CurrentItem.type')

_.switch(itemType, _
  .case({ type: 'sword' }, () => say('Melee weapon equipped'))
  .case({ type: 'bow' }, () => say('Ranged weapon equipped'))
  .case({ type: 'staff' }, () => say('Magic weapon equipped'))
  .default(() => say('Unknown item type'))
)
```

## Condition-Based Cases

For more complex matching logic, you can use condition functions instead of static values:

```ts
const score = Objective.create('score')('@s')

_.switch(score, _
  .case<Score>((v) => v.matches([0, 10]), () => {
    say('Score is 0-10 (low)')
  })
  .case((v) => v.matches([11, 50]), () => {
    say('Score is 11-50 (medium)')
  })
  .case((v) => v.matches([51, 100]), () => {
    say('Score is 51-100 (high)')
  })
  .default(() => say('Score out of expected range'))
)
```

Condition cases are checked sequentially using `execute if` chains. They're evaluated in order until one matches.

:::tip Type Annotation
When using condition functions, you may need to provide a type annotation on the first `.case()` call: `_.case<Score>((v) => ...)`. This helps TypeScript infer the correct type for the value parameter.
:::

## Mixed Cases

You can combine static cases with condition cases. Static cases are checked first (O(1)), and if none match, condition cases are evaluated sequentially:

```ts
_.switch(score, _
  .case(0, () => say('Exactly zero'))
  .case(1, () => say('Exactly one'))
  .case((v) => v.matches([10, 20]), () => say('Between 10-20'))
  .case((v) => v.greaterOrEqualThan(100), () => say('100 or more'))
  .default(() => say('Some other value'))
)
```

## Array Syntax

An alternative array-based syntax is also available:

```ts
_.switch(score, [
  ['case', 0, () => say('Zero')],
  ['case', 1, () => say('One')],
  ['case', (v) => v.matches([10, 20]), () => say('10-20')],
  ['default', () => say('Default')],
])
```

This syntax is equivalent to the fluent API but may be preferred in some situations.

## Return Values

Switch cases can return values that propagate to the caller. This is useful when using switches inside `execute store`:

```ts
execute.store.result.score(resultScore).run(() =>
  _.switch(input, _
    .case(0, () => {
      // Case body...
      // The return value of the last command is captured
    })
  )
)
```

## Performance Considerations

| Switch Type | Lookup Complexity | Best For |
|-------------|-------------------|----------|
| Score with static values | O(1) | Known discrete values (0, 1, 2, ...) |
| NBT with static values | O(1)* | Enum-like string/object matching |
| Condition cases only | O(n) | Range checks, complex predicates |
| Mixed (static + conditions) | O(1) then O(n) | Common values + edge cases |

Static cases are always checked first, so put your most common cases as static values when possible.
