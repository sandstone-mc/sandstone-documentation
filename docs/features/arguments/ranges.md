---
id: ranges
title: Ranges
description: How to use ranges in Sandstone.
---

import { InteractiveSnippet } from '../../../src/components'

## Introduction

Ranges are used in several commands: selectors, `execute if score matches`... In Sandstone, a dedicated syntax is used to create a range.

## Syntax

To create a range, you can specify a whole number or a an array: `0` becomes `0`, `[0, 7]` becomes `0..7`. If you need an open-ended range (like `8..` or `..19`), you can use the following syntax: 

- `[8, ]` becomes `8..`
- `[, 7]` becomes `..7`

This is the officially supported syntax. However, for several reasons, the following syntaxes are also valid:
- `[8, undefined]`, `[8, null]` and `[8, +Infinity]` all become `8..`
- `[undefined, 7]`, `[null, 7]` and `[-Infinity, 7]` all become `..7`

#### Example

Here is a basic example, using the `distance` Selector's argument, which takes a range:
```ts
Selector('@a', { distance: 5 })       // @a[distance=5]
Selector('@a', { distance: [5, 10] }) // @a[distance=5..10]
Selector('@a', { distance: [, 5] })   // @a[distance=..5]
Selector('@a', { distance: [5, ] })   // @a[distance=5..]
```

---

#### Try it out

<InteractiveSnippet height={225} imports={['MCFunction', 'kill', 'Selector']} code={`
MCFunction('range', () => {
  kill(Selector('@a', { distance: 5 }))       // @a[distance=5]
  kill(Selector('@a', { distance: [5, 10] })) // @a[distance=5..10]
  kill(Selector('@a', { distance: [, 5] }))   // @a[distance=..5]
  kill(Selector('@a', { distance: [5, ] }))   // @a[distance=5..]
})
`} />