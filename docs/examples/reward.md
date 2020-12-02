---
id: reward
title: "An example : Rewarding players"
sidebar_label: Rewarding players
description: An example of rewarding function with Sandstone.
---

Let's write a small datapack that has only one purpose. When a `default:reward` function is called, it needs to reward all players with 1 diamond for each kill they made. For example, a player with 8 kills will get 8 diamonds.

We are going to save this datapack directly in a world named `My Test World`. **Don't forget to change it to your actual world's name!**

### Creating the structure

First, we will write the actual structure of the datapack, without writing any command.

```js
import { MCFunction, savePack } from 'sandstone/core'

MCFunction('reward', () => {
   // Nothing for the moment
})

savePack('Kills Rewarding Datapack', { verbose: true, world: 'My Test World' })
```

The datapack will be created, even though it's actually empty. We did 2 things here:

1. We created our `default:reward` function. It's the one that will contain our rewarding commands.

2. We saved the datapack with the name `Kills Rewarding Datapack`, directly in our `My Test World` world. We activated verbose saving to log the resulting functions in our terminal.

### Creating the score

We will now create the score that tracks the number of kills done by players.

```js {4}
import { MCFunction, savePack } from 'sandstone/core'
import { createObjective } from 'sandstone/variables'

const kills = createObjective('kills', 'playerKills', 'Current Player Kills')

MCFunction('reward', () => {
  // Nothing for the moment
})

savePack('Kills Rewarding Datapack', { verbose: true, world: 'My Test World' })
```

:::tip
Look at the highlighted lines to see which lines changed.
:::

This time, we created an objective named `kills`, tracking the `playerKills` criterion. In order to achieve this, we imported `createObjective` from `sandstone/variables`. 

:::note
You can notice that, in the outputted log, the `__init__` MCFunction now automatically creates the `kills` objective for you.
:::

### Executing commands as all players

We want to check

### Rewarding one diamond

Now, we are going to reward **one** diamond if the player has **at least one kill**. We will then remove one kill from him. While it is not our objective, it's a nice intermediate step.

```js
import { MCFunction, savePack, _ } from 'sandstone/core'
import { createObjective } from 'sandstone/variables'
import { give } from 'sandstone/commands'

const kills = createObjective('kills', 'playerKills', 'Current Player Kills')

MCFunction('reward', () => {
  // Execute on each player
  execute.as('@a').run(() => {
    // Get the player's kills
    const myKills = kills.ScoreHolder('@s')

    // Reward one diamond if the player have a kill, and remove 1 kill
    _.if(myKills.greaterThan(0), () => {
      give('@s', 'minecraft:diamond')
      myKills.remove(1)
    })
  })
})

savePack('Kills Rewarding Datapack', { verbose: true, world: 'My Test World' })
```
