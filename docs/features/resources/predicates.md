---
id: predicates
title: Predicates
description: How to create predicates with Sandstone.
---

## Introduction
Sandstone features fully-typed predicates. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the loot table.

## Syntax

### Minimal

The minimal syntax for predicates is the following:
```ts
import { Predicate } from 'sandstone/core'

Predicate('predicate_name', {
  condition: '<condition type>',
  ...additionalProperties,
})
```

As you can see, you must provide the `condition` of the predicate. Depending on this condition, several properties will be available.

### Example

![Example of Predicate autocompletion](../../images/autocompletion/predicate.gif)

## Additional properties

Predicates do not have additional properties, however they have condition-dependant properties. All those can be found directly via autocompletion (as shown above), or by looking at the [Minecraft wiki article on Predicates](https://minecraft.gamepedia.com/Predicate#JSON_structure).