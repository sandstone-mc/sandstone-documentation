---
id: loops
title: While / For Loops
description: How to write while & for loops in Sandstone.
---
import { InteractiveSnippet } from '../../../src/components'

You can easily recurse given in-game conditions using Sandstone's builtin `while`, and iterate over a range/dataset using the builtin `for`.

## While

To check a condition, the following syntax is used:
```ts
_
  .while(condition, () => {
    say('Condition is true')
    /**
     * Invalidate condition once the intended function has been fulfilled.
     */
  })
```

Refer to the [if documentation](/docs/features/flow/if) for details on conditions

## For (number)

### Classic Iterator

```ts
_.for = (initial: number | Score, continue: (i: Score) => Condition, iterate: (i: Score) => Score, callback: (i: Score) => any)
```

```ts
_
  .for(0, i => i['<='](10), i => i['++'], i => {
    // Uses the score component in tellraw
    tellraw('@a', i)
  })
```

### Range Iterator

```ts
_.for = (range: [start: number | Score, end: number | Score], _: 'iterate', callback: (i: Score) => any)
```

```ts
_
  .for([0, 10], 'iterate', i => {
    // Uses the score component in tellraw
    tellraw('@a', i)
  })
```

### Binary Iterator

```ts
_.for = (range: [start: number | Score, end: number | Score, maximum?: number], _: 'iterate', callback: (i: Score) => any)
```

Allows you to use the number directly in your commands via a binary tree

```ts
_
  .for([0, 10, 10], 'binary', i => {
    say(`${i}`)
  })
```

## For (of)

```ts
const test_map = DataIndexMap({
  foo: 'bar',
  baz: 'test'
})
/**
 * {
 *   Entries: [['foo', 'bar'], ['baz', 'test']]
 *   Index: {
 *     foo: 0,
 *     baz: 1
 *   }
 * }
 */

const test_array = DataArray(['foo', 'bar', 'baz'])
/**
 * ['foo', 'bar', 'baz']
 */
```

### All DataSets

```ts
_
  .for('entry', 'of', test_map, entry => {
    tellraw('@a', entry)
  })
_
  .for('entry', 'of', test_array, entry => {
    tellraw('@a', entry)
  })
```

### Arrays

```ts
_
  .for(['i', 'entry'], 'of', test_array, (i, entry) => {
    tellraw('@a', [i, entry])
  })
```

### IndexMaps

```ts
_
  .for(['key', 'value'], 'of', test_map, (key, value) => {
    tellraw('@a', [key, value])
  })
```