---
id: coordinates
title: Coordinates
description: How to use coordinates in Sandstone.
sidebar_position: 4
---

## Introduction

In Sandstone, coordinates and rotation are just an array of strings.

For example,
```ts
// Compiles to /setblock 0 5 0 dirt
setblock(['0', '5', '0'], 'dirt')

// Compiles to /setblock ~ ~10 ~ dirt
setblock(['~', '~10', '~'], 'dirt')
```

However, this isn't convenient to use. Therefore, Sandstone provides three helper functions to allow you to easily use numerical values as absolute, relative or local coordinates.

## Syntax

In order to create coordinates from numbers, you can use one of the following functions:

- `absolute` or `abs` for absolute coordinates
- `relative` or `rel` for relative coordinates, using the tilde `~` notation
- `local` or `loc` for local coordinates, using the caret `^` notation

You can use them in two ways: with a single number, or with several ones. A single number returns a single string. Several numbers will return an array of strings:
```ts
import { abs, rel, loc } from 'sandstone'

// A single number
abs(5) ➨ '5'
rel(5) ➨ '~5'
loc(5) ➨ '^5'

// Several numbers
abs(0, 10, 0) ➨ ['0', '10',  '0']
rel(0, 10, 0) ➨ ['~', '~10', '~']
loc(0, 10, 0) ➨ ['^', '^10', '^']
```

If you want to mix different kind of coordinates in the same command, you should use single numbers. If all your coordinates are of the same kind, multiple numbers are better.

```ts
// Compiles to /setblock 0 0 0 dirt
setblock(rel(0, 0, 0), 'dirt')

// Compiles to /setblock ^ ^ ^1 dirt
setblock(loc(0, 0, 1), 'dirt')

// Compiles to /setblock ~ 0 ~ bedrock
setblock([rel(0), abs(0), rel(0)], 'dirt')
```

## Vector manipulation

When `absolute`, `relative`, or `local` is called with more than one number, the result is a `VectorClass` — an N-dimensional coordinate vector. `VectorClass` exposes static arithmetic methods that operate component-wise, preserving each component's coordinate plane (`~`, `^`, or absolute):

```ts
import { VectorClass, absolute, relative } from 'sandstone'

const a = absolute(10, 20, 30)
const b = absolute(1, 2, 3)

VectorClass.subtractedFrom(a, b)  // ➨ absolute(9, 18, 27)
VectorClass.addedTo(a, b)        // ➨ absolute(11, 22, 33)
VectorClass.multipliedBy(a, b)   // ➨ absolute(10, 40, 90)
VectorClass.dividedBy(a, b)      // ➨ absolute(10, 10, 10)
```

Both arguments must use the same plane per component. Mixing `~` with `^`, or either with absolute, throws:

```ts
VectorClass.addedTo(relative(10), absolute(5))
// Error: Attempted to add 5 to ~10 (a[0]). Incompatible plane.
```

If `b` is shorter than `a`, the missing trailing components are taken from `a` unchanged.

## Switching between absolute and relative

Two helpers convert a vector from one plane to another using an absolute origin:

```ts
import { VectorClass, absolute, relative } from 'sandstone'

// Convert absolute base to a relative offset, anchored at an absolute point.
VectorClass.relativeTo(
  absolute(10, 20, 30),   // base
  absolute(5, 5, 5),      // anchor
)
// ➨ relative(5, 15, 25)

// Convert a relative vector back to absolute, anchored at an absolute origin.
VectorClass.fromRelative(
  relative(5, 15, 25),    // base
  absolute(5, 5, 5),      // origin
)
// ➨ absolute(10, 20, 30)
```

`relativeTo` requires an absolute `base` and an absolute `anchor`. `fromRelative` requires a relative `base` and an absolute `origin`. Either throws if the inputs violate these constraints.
