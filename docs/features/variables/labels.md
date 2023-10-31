---
id: labels
title: Labels
description: How to create & use label tags with Sandstone.
---

Example:
```ts
const sick = Label('sick')

// Tag current executor as sick
sick('@s').add()

// Current executor is healed!
sick('@s').remove()

// As nearest sick player
execute.as(sick('@p'))

// Whether there's a cow within 10 blocks that is sick
_.if(Selector('@e', { type: 'cow', limit: 1, tag: sick }), () => { ... })
```