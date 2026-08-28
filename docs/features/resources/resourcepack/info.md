---
id: info
title: Information
description: How to create resource pack resources with Sandstone.
sidebar_position: 1
---

## Introduction

Sandstone features fully-typed resources for the entire resource pack. Like for all
resources, you need to provide a name, which can include a namespace and folders. You then
provide the definition of the resource.

```ts
SoundEvent('hostile', 'slenderman_creeps', undefined, { addToSounds: true })
```

After placing the sound file in `resources/resourcepack/assets/default/sounds/hostile/slenderman_creeps.ogg`
and invoking this, Sandstone will automatically register the sound as an event.

## Supported resources

- Atlases
- Block States
- Equipment
- Fonts
- [Item Model Definitions](/docs/features/resources/resourcepack/item_model_definitions)
- Languages/Translations
- Models
- Particles
- Post Effects
- Shaders
- Sounds
- Texts
- Textures
- Waypoint Styles

Resources without a link yet are fully typed and documented via autocompletion/jsdoc in the
meantime, or by looking at the relevant [Minecraft wiki article](https://minecraft.wiki/w/Resource_pack).

Anything unsupported can simply be placed in the [external resources directory](/docs/features/resources/existing_resources),
exported via `RawResource`, or fully abstracted via `CustomResourceClass` - see
[Custom Resources](/docs/features/resources/custom_resource).
