---
id: objectives
title: Score Objectives
description: How to handle scoreboard objectives with Sandstone.
---

## The basics

Sandstone can handle the lifetime of scoreboard objectives for you. By calling `createObjective`, Sandstone will create the specified objective when the datapack loads, and will return an `Objective` object with convenient methods.

```ts
import { createObjective } from 'sandstone/variables'

const kills = createObjective('kills', 'playerKillCount', [{text: 'Player Kills'}])
```

## Scores Holders

### The basics

In Minecraft, scores can be applied to 2 kind of things : fake players, and entities. They are called *Score Holders*.

In Sandstone, to get the value of an objective for a given score holder, you must use the `.ScoreHolder()` method.

```ts
// Get the number of kills of the executor
const myKills = kills.ScoreHolder('@s')

// Get the number of kills of a random player
const randomPlayerKills = kills.ScoreHolder('@r')

// Get the number of kills of all players
const allPlayersKills = kills.ScoreHolder('@a')

// Get the number of kills of the winner
const winnerKills = kills.ScoreHolder(Selector('@p', { tag: 'winner' }))
```

### Operations

Sandstone has a number of helper methods to perform operations on scores.

#### Inline operations

Inline operations are operations that modify the base score. For example, `myKills.add(2)` would compile in `scoreboard players add @s kills 2`. The value of `myKills` will change.

There is one inline method for each type of operations (`+`, `-`, `×`, `÷`), and they all accept numbers and other player scores:
```ts
/* Addition */
// Add 2 to my kills
myKills.add(2)
// Add the kills of the winner to my kills
myKills.add(winnerKills)

/* Substraction */
// Remove 2 from my kills
myKills.remove(2)
// Remove the kills of the winner from my kills
myKills.remove(winnerKills)

/* Multiplication */
// Multiply my kills by 4
myKills.multiply(4)
// Multiply my kills by the number of kills of the winner
myKills.multiply(winnerKills)

/* Division */
// Divide my kills by 4
myKills.divide(4)
// Divide my kills by the number of kills of the winner
myKills.divide(winnerKills)

/* Modulo */
// Set my kills to my kills modulo 4
myKills.modulo(4)
// Set my kills to my kills modulo the number of kills of the winner
myKills.modulo(winnerKills)
```

There are two more inline operation:
1. The `set` method. It sets the score to the given value, or player score.
2. The `swap` method. It takes another player's score as an argument, and swap both values.
```ts
// Set my kills to 0
myKills.set(0)

// Swap my kills with the kills of the winner
myKills.swap(winnerKills)

// My kills are now the kills of the winner, and his kills are now 0.
```

Every operation returns the base score. Therefore, you can chain them:
```ts
// Increment my kills by 1, then multiply it by 2
myKills.add(1).multiply(2)
```

#### Effect-free operations
Effect-free operations are operations that create a whole new score to store the result. Therefore, the base score is never updated.

For example, `myKills.plus(2)` would compile in something like:
```haskell
# First, copy the base score to a new one
scoreboard players set operation anonymous_1 sandstone_anon = @s kills

# Then, add 2 to this new score
scoreboard players add anonymous_1 sandstone_anon 2
```

In other aspects, they are similar to inline operations: there is a method for each type of operation (`+`, `-`, `×`, `÷`), and they all accept a number or another player score:

```ts
/* Addition */
//  Get my kills plus two - `myKills` will be left unchanged.
const killsPlus2 = myKills.plus(2)
// Get the sum of the kills of the winner and my kills
const sumOfKills = myKills.plus(winnerKills)

/* Substraction */
// Get my kills minus two
const killsMinus2 = myKills.minus(2)
// Get the difference of my kills and the kills of the winner 
const killsDifference = myKills.minus(winnerKills)

/* Multiplication */
// Get my kills times 4
const killsTimes4 = myKills.times(4)
// Get the product of the kills of the winner and my kills
const killsProduct = myKills.times(winnerKills)

/* Division */
// Get my kills divided by 4
const killsDividedBy4 = myKills.dividedBy(4)
// Get the ratio of my kills divided by the number of kills of the winner
const killsRatio = myKills.dividedBy(winnerKills)

/* Modulo */
// Get my kills to my kills modulo 4
myKills.moduloBy(4)
// Get my kills to my kills modulo the number of kills of the winner
myKills.moduloBy(winnerKills)
```

### Mathematics

All these operations can be chained together: they allow you to write complex operation without complexity.

```ts
// Set myKills to (myKills + 1) * 2
myKills.add(1).multiply(2)

// Get myKills + (winnerKills / 2)
const result = myKills.plus(winnerKills.dividedBy(2))
```

Since the result of operations are another `PlayerScore`, you can also chain comparisons after operations.

### Comparison

Scores are easy to compare against another value, and integrate perfectly with Sandstone's [flow statements](/features/flow.md).

There is 5 comparison methods, that all accepts both a number and another player's score: `lowerOrEqualThan`, `lowerThan`, `equalTo`, `greaterOrEqualThan`, and `greaterThan`.

You can use them in any flow statement:
```ts
// If the player has more than 1 kill, give him a diamond
_.if(myKills.greaterThan(0), () => {
  give('@s', 'minecraft:diamond')
})

// Give the player one diamond for each kills he has
_.while(myKills.greaterThan(0), () => {
  give('@s', 'minecraft:diamond')
  myKills.remove(1)
})

// Similar as above, but using a for loop
_.forScore(myKills, myKills.greaterThan(0), () => myKills.remove(1), () => {
  give('@s', 'minecraft:diamond')
})

// If the player has between 10 and 20 kills, tell everyone he's a hero
const player = Selector('@s')
_.if(_.and(myKills.greaterOrEqualThan(10), myKills.lowerThan(20)), () => {
  tellraw('@a', [player, ' is a hero!'])
})

// However, if he has more than 20 kills, tell everyone he is a legend
_.if(myKills.greaterOrEqualThan(20), () => {
  tellraw('@a', [player, { text: ' is a legend!', color: 'red' }])
})

// If he has 0 kill... Kill him.
_.if(myKills.equalTo(0), () => {
  kills(player)
})
```
