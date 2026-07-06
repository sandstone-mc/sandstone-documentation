---
id: trigger
title: Trigger
description: How to create score-based triggers with Sandstone.
---

## Introduction

`Trigger` is a lightweight score-based event system. It creates a dedicated `dummy` scoreboard objective, plus a shared polling function (one per distinct `pollingEvery` value, reused by all your triggers with that same interval, see [`runEvery`](/docs/features/functions#properties)).

Whenever an entity's score on that objective is `1` or higher, the next time the polling function runs it invokes your handler for that entity (as `@s`), then resets their score back to `0`.

```ts
import { Trigger } from 'sandstone'

const heal = Trigger('heal', () => {
  effect.give('@s', 'minecraft:instant_health', 1, 1)
}, 20 /* poll every 20 ticks (once a second) */)
```

`pollingEvery` defaults to `1` (checked every tick) if omitted.

## Handlers

The callback passed to `Trigger` can take a few different shapes:

### A plain callback

Runs once per triggered entity. Use this when you don't need the score's exact value.

```ts
Trigger('heal', () => {
  effect.give('@s', 'minecraft:instant_health', 1, 1)
})
```

### An existing MCFunction

```ts
const healFn = MCFunction('heal_fn', () => {
  effect.give('@s', 'minecraft:instant_health', 1, 1)
})

Trigger('heal', healFn)
```

### `['num', max, callback]`

Decomposes the score into a switch over its exact value (`1` to `max`), calling `callback` with the matched number.

```ts
Trigger('choose_kit', ['num', 3, (num) => {
  _.if(num['=='](1), () => give('@s', 'minecraft:iron_sword'))
  _.if(num['=='](2), () => give('@s', 'minecraft:bow'))
  _.if(num['=='](3), () => give('@s', 'minecraft:shield'))
}], 20)
```

### `['score', callback]`

Passes the raw `Score` to your callback, for custom comparisons instead of an exact match switch.

```ts
Trigger('donate', ['score', (score) => {
  _.if(score.greaterThan(100), () => {
    tellraw('@s', 'Thanks for the generous donation!')
  })
}], 20)
```

## Accessing the objective

The `objective` property exposes the underlying `Objective`, useful for setting or reading scores directly:

```ts
const heal = Trigger('heal', () => { ... })

heal.objective('@s').set(1)
```
