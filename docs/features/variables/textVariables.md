---
id: textVariables
title: Variables in JSON Text
description: How to use variables in JSON Text Components (for /tellraw, /title, /bossbar...) with Sandstone.
---

Example:
```ts
MCFunction('herobrine_kills', () => {
  const herobrineDeaths = Objective.create('herobrine_deaths', 'deathCount')('herobrine')

  tellraw('@a', [
    'Herobrine has been killed ', herobrineDeaths, ' times!'
  ])
}, {
  runEvery: '30s'
})
```