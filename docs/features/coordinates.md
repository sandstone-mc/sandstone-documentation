---
id: coordinates
title: Coordinates
description: How to use coordinates in Sandstone.
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
import { abs, rel, loc } from 'sandstone/variables'

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
