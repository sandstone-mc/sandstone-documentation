---
id: dynamic
title: Dynamic Variables
description: How to use dynamic variables in Sandstone.
---

## Scores - Introduction

Sometimes, you want a single numerical variable that is not tied to a specific objective. For example:
- A `counter` variable, that just counts from a number to another one.
- A `numberOfEntities` variable, that counts the number of entities in the game.
- Any variable that does not require a whole objective.

Sandstone allows you to directly write those variables, without creating the objective yourself, nor writing any command.

## Syntax

To create a variable, the following syntax can be used:
```ts
import { Variable } from 'sandstone'

// Create a variable initialized to 0
const myCounter = Variable(0)

// Create a variable that isn't initialized
const numberOfEntities = Variable()
```

Variables are just an instance of a score holder's score. You can use [all the methods](objectives#scores-holders) they have, including all operations and comparisons: `add`, `remove`, `divide`, `multiply`, `equals`, `greaterThan`...

There are two kind of variables: global variables, and scoped variables.

### Global variables

Global variables are not declared inside any MCFunction. They will be initialized during the datapack loading. If an initial value has been given, each time the datapack is loaded, the variable will be set to this initial value.

```ts
// The number of entities will be set to 0 when the datapack loads
const numberOfEntities = Variable(0)
```

### Scoped variables
Scoped variables are declared inside a given MCFunction. 
**Each time the function is called**, the variable will be initialized and set to its initial value (if any).

```ts
MCFunction('count_diamonds', () => {
  const totalDiamonds = Variable(0)
  
  execute.as('@a').run(() => {
    const myDiamonds = Variable()

    // Store the number of diamonds the player has in `myDiamonds`
    execute.store.result.score(myDiamonds).runOne.clear('@s', 'minecraft:diamonds', 0)

    // Add user diamonds to the total
    totalDiamonds.add(myDiamonds)
  })

  tellraw('@a', ['The total number of diamonds is ', totalDiamonds])
})
```

## Data - Introduction

Sometimes, you will want a point of data storage not tied to a specific namespace. For example:
- A `vector` variable, where you pass a float to another function.
- A `display` variable, where you assemble a display entity's nbt.
- Any nbt value (component or primitive)

Sandstone allows you to directly write those variables, without deciding on a storage location, nor writing any command.

## Syntax

To create a variable, the following syntax can be used:
```ts
import { DataVariable } from 'sandstone'
import { NBT } from 'sandstone/variables'

// Create a data variable initialized to 3.35f
const vector = DataVariable(NBT.float(3.35))

// Create a variable that isn't initialized
const display = DataVariable()
```

Data Variables are just an instance of a Data Point; you can use [all the methods](data#data-point) they have, including all operations: `select`, `set`, `merge`, `append`, `prepend`, `insert`, `remove`, `slice`, `equals`...