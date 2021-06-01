---
id: if
title: If / Else
description: How to write if / else statmements in Sandstone.
position: 2
---

You can easily check for in-game conditions using Sandstone's builtin `if` statement.

## Syntax

To check a condition, the following syntax is used:
```ts
_
 .if(condition1, () => {
   say('Condition 1 is true')
 })
 .elseIf(condition2, () => {
   say('Condition 2 is true')
 })
 .else(() => {
   say('Both condition 1 and condition 2 are false')
 })
```

As you can see, this syntax mimicks the original `if / else if / else` construct from classical programming languages. `elseIf` and `else` are entirely optional, and you can chain as many `elseIf` as needed:

```ts
_.if(condition1, () => {
  say('I am a lonely if')
})

_
 .if(condition2, () => {
   say(2)
 })
 .elseIf(condition3, () => {
   say(3)
 })
 .elseIf(condition4, () => {
   say(4)
 })
```

## Conditions

Conditions are created using Sandstone's built-in abstractions.

### Score conditions

To check if a score matches a given condition, you can use [Score's comparison operators](/docs/features/objectives#comparison).

For example:
```js
const self = Selector('@s')
const kills = Objective.create('kills', 'playerKillCount')
const myKills = kills(self)

_.if(myKills.greaterThan(10), () => {
  tellraw('@a', [self, 'is on a rampage!'])
})
```

### Data conditions

### Block conditions

## Boolean logic