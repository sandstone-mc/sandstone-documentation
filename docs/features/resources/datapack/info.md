---
id: info
title: Information
description: The full list of datapack resources supported by Sandstone.
sidebar_position: 1
---

## Introduction

Sandstone features fully-typed resources for the entire datapack. Like for all resources,
you need to provide a name, which can include a namespace and folders. You then provide the
definition of the resource.

Functions are central enough to warrant their own section - see [Functions](/docs/features/functions).
Anything unsupported can simply be placed in the [external resources directory](/docs/features/resources/existing_resources),
exported via `RawResource`, or fully abstracted via `CustomResourceClass` - see
[Custom Resources](/docs/features/resources/custom_resource).

## Supported resources

- [Advancements](/docs/features/resources/datapack/advancements)
- Chat Types
- [Damage Types](/docs/features/resources/datapack/damage_types)
- Dialogs
- [Item Modifiers](/docs/features/resources/datapack/item_modifiers)
- [Loot Tables](/docs/features/resources/datapack/loot_tables)
- Number Providers
- [Predicates](/docs/features/resources/datapack/predicates)
- [Recipes](/docs/features/resources/datapack/recipes)
- Slot Sources
- Structures
- [Tags](/docs/features/resources/datapack/tags)
- Test Environments & Test Instances (Gametest)
- Timelines
- Trade Sets
- World Clocks

### Data-component-specific

- Banner Patterns
- Block Transformers
- Decorated Pot Patterns
- Enchantments (and Enchantment Providers)
- Instruments
- Jukebox Songs
- Sulfur Cube Archetypes
- Trial Spawners
- [Trim Materials & Trim Patterns](/docs/features/resources/datapack/trims)
- Variants
- Villager Trades

Resources without a link yet are fully typed and documented via autocompletion/jsdoc in the
meantime, or by looking at the relevant [Minecraft wiki article](https://minecraft.wiki/w/Data_pack).
