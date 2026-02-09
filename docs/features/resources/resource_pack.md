---
id: resource_pack
title: Resource Pack
description: How to create a resource pack with Sandstone.
---

## Introduction
Sandstone features fully-typed resources for the entire resource pack. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the resource.

### Example
```ts
SoundEvent('hostile', 'slenderman_creeps', { addToSounds: true })
```

After placing the sound file in `resources/resourcepack/assets/default/sounds/hostile/slenderman_creeps.ogg` and invoking this, Sandstone will automatically register the sound as an event.

## Supported Resources
- Atlases
- Block States
- Equipment
- Fonts
- [Item Model Definitions](/docs/features/resources/item_model_definitions)
- Languages/Translations
- Models
- Particles
- Post Effects
- Shaders
- Sounds
- Texts
- Textures
- Waypoint Styles

Anything unsupported can simply be placed in the external resources directory, exported via `RawResource`, or fully abstracted via `CustomResourceClass`!