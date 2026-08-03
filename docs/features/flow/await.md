---
id: await
title: Await (Sleep / Until)
description: How to add delay(s) & conditional deference to your functions with Sandstone.
sidebar_position: 4
---

import { InteractiveSnippet } from '../../../src/components'

Examples:

```ts sandstone height=450
MCFunction('explosive', () => {
  say('explod in 5')
  for (let i = 4; i != 0; i--) {
    _.await.sleep('1s')
    say(`${i}`)
  }
  kill('herobrine')
})

MCFunction('explod_me', () => {
  say('explod in 5')
  for (let i = 4; i != 0; i--) {
    _.await.sleep('1s')
    say(`${i}`)
  }
  kill('@s')
}, {
  asyncContext: true
})
```

```ts sandstone height=380
MCFunction('jump', () => {
  say('you should jump!')
  _.await.until(_.predicate(Predicate('jumping', {
    type: "minecraft:entity_properties",
    entity: "this",
    predicate: {
      "minecraft:type_specific/player": {
        input: {
          jump: true
        }
      }
    }
  })), '1t')
  give('@s', 'diamond', 1)
}, {
  asyncContext: true
})
```