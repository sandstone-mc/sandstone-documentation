---
id: advancements
title: Advancements
description: How to create advancements with Sandstone.
---

## Introduction
Sandstone features fully-typed advancements. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the advancement.

## Syntax

### Minimal

The minimal syntax for advancements is the following:
```ts
import { Advancement } from 'sandstone/core'

Advancement('advancement_name', {
  criteria: {
    'criteria_name': {
      trigger: 'trigger_name',
      conditions: {
        /* conditions */
      }
    }
  }
})
```

As you can see, you must provide at least 1 criteria. It must have a name, and a trigger. The trigger is autocompleted from a list of all possible triggers. Once you specified a `trigger`, the `conditions` object will tell you what properties are possible.

### Example

![Example of Advancement autocompletion](../../images/autocompletion/advancement.gif)

### Additional properties

All additional properties can be directly found via autocompletion (as shown above), or by looking at the [Minecraft wiki article on Advancements](https://minecraft.gamepedia.com/Advancement/JSON_format#File_Format).

## Known bug

The `requirements` property only accepts actual criteria names. This is to ensure the datapack will actually run in Minecraft. However, the autocompletion does not work on them, even though the criteria names could be infered. This is due to a Typescript bug: if it is annoying to you, please vote on [this issue.](https://github.com/microsoft/TypeScript/issues/41645)