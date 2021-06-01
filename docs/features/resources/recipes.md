---
id: recipes
title: Recipes
description: How to create recipes with Sandstone.
---

## Introduction
Sandstone features fully-typed custom recipes. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the recipe.

Sandstone has special autocompletion for Recipes: for shapeless & shaped recipes, it automatically tells you what keys need to be defined - and prevent you from forgetting an item of your pattern.

## Syntax

### Minimal

The minimal syntax for custom recipes is the following:
```ts
import { Recipe } from 'sandstone'

Recipe('recipe_name', {
  type: '<type>',
  result: '<item>' /* or */ { item: '<item>' },
})
```

As you can see, you must provide the `type` of the recipe. Depending on this condition, several properties will be available. The `result` must be either an item name (for some types), or an object specifying the item name & the number of resulting items (for other types). You can make the difference using built-in documentation.

### Example

#### Shaped autocompletion

![Example of Recipe autocompletion](/img/autocompletion/recipe.gif)

#### Normal autocompletion

![Second example of Recipe autocompletion](/img/autocompletion/recipe2.gif)

## Additional properties

Recipes do not have additional properties, however they have type-dependant properties. All those can be found directly via autocompletion (as shown above), or by looking at the [Minecraft wiki article on Recipes](https://minecraft.gamepedia.com/Recipe#JSON_format).