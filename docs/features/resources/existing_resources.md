---
id: existing_resources
title: Existing Resources
description: How to leverage existing resources with Sandstone.
---

Often when developing a pack, either with a resource pack or internal dependencies, you will have files that should be exported alongside the rest of your pack. Sandstone allows you to accomplish this with the `resources` directory in your project root (next to the `src` folder and the `sandstone.config.ts`).

```
- resources
- - datapack
- - - data
- - - - internal_lib
- - - - - functions
- - - - - - do_something.mcfunction
- - resourcepack
- - - assets
- - - - my_pack
- - - - - textures
- - - - - - item
- - - - - - - shiny_pickaxe.png
```