---
id: sleep
title: Sleep
description: How to add delay(s) to your functions with Sandstone.
---

import { InteractiveSnippet } from '../../src/components'

Examples:

```ts sandstone height=450
MCFunction('explosive', () => {
  say('explod in 5')
  for (let i = 4; i != 0; i--) {
    sleep('1s')
    say(i)
  }
  kill('herobrine')
})

MCFunction('explod_me', () => {
  say('explod in 5')
  for (let i = 4; i != 0; i--) {
    sleep('1s')
    say(i)
  }
  kill('@s')
}, {
  asyncContext: true
})
```