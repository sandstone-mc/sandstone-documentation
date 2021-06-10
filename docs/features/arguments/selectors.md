---
id: selectors
title: Selectors
description: How to create selectors with Sandstone.
---

import { InteractiveSnippet } from '../../../src/components'

You can use Sandstone to create any selector, in an easy and type-safe way.

## The basics

### General Syntax

To create a selector, you need to provide the target and the arguments to `Selector`:
```ts
import { Selector } from 'sandstone'

Selector('@a', { /** Arguments */ })
```

The first part is the `targets`: it can be `@s`, `@r`, `@p`, `@a` or `@e`.
The second par is the `arguments`. In this object, you can specify any property that would fit into a vanilla selector:

```ts
Selector('@e', { type: 'minecraft:cow', limit: 1, sort: 'random' })
```

### Usage

To use selectors, you need to assign them to a variable, and pass them to a command:
```ts
// Kill all cows
const cows = Selector('@e', { type: 'minecraft:cow' })
kill(cows)

// Give 32 diamonds to winners
const winners = Selector('@a', { tag: 'winner' })
give(winners, 'minecraft:diamond', 32)
```

#### Try it out

<InteractiveSnippet height={250} imports={[]} code={`
MCFunction('selectors', () => {
  // Kill all cows
  const cows = Selector('@e', { type: 'minecraft:cow' })
  kill(cows)\n
  // Give 32 diamonds to winners
  const winners = Selector('@a', { tag: 'winner' })
  give(winners, 'minecraft:diamond', 32)
})
`}/>

## Special Arguments

While most arguments work exactly like the vanilla ones, some of them have a few particularities.

### Scores

#### General syntax

For the `scores` argument, you can specify a whole number or a range. Ranges are made using an array: `[0, 7]` becomes `0..7`. If you need an open-ended range (like `8..` or `..19`), you can use `null` or `Infinity`: 

- `[8, null]` and `[8, +Infinity]` both become `8..`
- `[null, 19]` and `[-Infinity, 19]` both become `..19`

Here is an exemple of a selector that checks if a player has more than 10 kills, less than 50 coins and exactly 0 deaths:
```ts
Selector('@s', {
  scores: { 
    'kills': [10, +Infinity],
    'coins': [-Infinity, 50],
    'deaths': 0,
  } 
})
```

#### Matching a Sandstone objective

If you want to use an existing objective, you can use the following ES6 syntax:
```ts
const killsObjective = createObjective('kills', 'playerKillCount')

Selector('@s', {
  scores: {
    [killsObjective.name]: [10, +Infinity],
  }
})
```

### Advancements

#### General syntax

Advancements arguments in Sandstone selectors work precisely like they would in-game, but their complicated syntax deserves a reminder.

To ensure the player has the `minecraft:story:/form_obsidian` advancement, you would use the following syntax:
```ts
Selector('@s', {
  advancements: {
    'story/form_obsidian': true,
  }
})
```

To select player who wore at least once a full iron armor, you would do:
```ts
Selector('@s', {
  advancements: {
    'story/obtain_armor': true,
  }
})
```

#### Matching a criteria

To select players who wore at least once a iron helmet, you would do:
```ts
Selector('@s', {
  advancements: {
    'story/obtain_armor': {
      'iron_helmet': true, 
    },
  }
})
```

As you can see, matching a single (or several) advancements criteria is done using a nested object. In the end, the syntax could be defined as:
```ts
Selector('@s', {
  advancements: {
    // Matches a whole advancement
    '<advancement name>': boolean,
    // Matches some advancement criterion
    '<advancement name>': {
      '<criteria 1>': boolean,
      '<criteria 2>': boolean,
    }
  }
})
```

#### Matching a Sandstone Advancement

In order to use a Sandstone advancement in a selector, you can use the following ES6 syntax:
```ts
const myAdvancement = Advancement('myAdvancement', ...)

Selector('@s', {
  advancements: {
    [myAdvancement.name]: true,
  }
})
```

### Tags

Entity tags can be either specified as a single string, or an array of strings.

```ts
// Will compile to `@a[tag=single_tag]`
Selector('@a', { tag: 'single_tag' })

// Will compile to `@a[tag=tag1,tag=tag2]`
Selector('@a', { tag: ['tag1', 'tag2'] })
```

### Predicates

#### General Syntax

Just like tags, you can match one or several predicates at once. This is done using a string or an array of strings.

```ts
// Will compile to `@a[predicate=mypredicate]`
Selector('@a', { predicate: 'mypredicate' })

// Will compile to `@a[predicate=first_predicate,predicate=second_predicate]`
Selector('@a', { predicate: ['first_predicate', 'second_predicate'] })
```

#### Matching a Sandstone Predicate

In order to use a Sandstone predicate in a selector, you just need to use the variable like you would use a string:

```ts
const myPredicate = Predicate('mypredicate', ...)

// To match a single predicate
Selector('@s', { predicate: myPredicate })

// To match several predicates
Selector('@s', { predicate: [myPredicate, 'predicate2'] })
```

### Team

The `team` argument has the same syntax than the vanilla one, but has a built-in feature to check for the lack or the presence of a team. You can use `true` to check for entities having a team, and `false` for entities that are not inside a team.

```ts
// Check for entities inside the "red" team
Selector('@e', { team: 'red' })

// Check for entities NOT inside the "red" team
Selector('@e', { team: '!red' })

// Check for entities that aren't inside a team
Selector('@e', { team: false })

// Check for entities that are inside a team
Selector('@e', { team: true })
```
