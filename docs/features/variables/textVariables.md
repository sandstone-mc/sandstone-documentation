---
id: textVariables
title: JSON Text Components
description: How to use JSON Text Components (for /tellraw, /title, /bossbar...) with Sandstone.
---

Many commands (`tellraw`, `title`, `bossbar`, sign/book text, etc.) accept a **JSON Text Component**: plain text mixed with formatting, interactivity, and dynamic content. In Sandstone, a JSON Text Component can be a string, an object, or an array of either.

## Interpolating variables

Sandstone values (a `Score`, a `Selector`, a `Data` point, etc.) can be placed directly inside a component array. Sandstone converts them to the correct `score`/`selector`/`nbt` content tag automatically.

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

## Content types

Besides plain text, a component object can hold one of the following content tags.

### Text

```ts
tellraw('@a', { text: 'Hello!' })

// Shorthand: a bare string is treated as { text: '...' }
tellraw('@a', 'Hello!')
```

### Score

Displays a score holder's value in an objective. Using a Sandstone `Score` directly (as
shown above) is preferred, but the raw form is also available:

```ts
tellraw('@a', { score: { name: '@s', objective: 'kills' } })
```

### Selector

Displays the name(s) of the entities found by a selector. Using a Sandstone `Selector`
directly is preferred:

```ts
tellraw('@a', ['Killer: ', Selector('@s')])

// Raw form, with a custom separator between multiple names
tellraw('@a', { selector: '@a', separator: { text: ' & ', color: 'gray' } })
```

### Translatable

Displays a translation key, resolved to the viewer's selected language.

```ts
tellraw('@a', { translate: 'my_pack.greeting', with: ['World'] })
```

### Keybind

Displays the name of the button currently bound to an action.

```ts
tellraw('@a', { keybind: 'key.inventory' })
```

### NBT

Looks up and displays NBT data from an entity, block entity, or storage. Using a Sandstone
`Data` point directly (as with `Score`/`Selector` above) is preferred over the raw form:

```ts
tellraw('@a', ['Stage: ', Data('storage', 'my_pack:main', 'stage')])

// Raw form
tellraw('@a', { nbt: 'stage', storage: 'my_pack:main', interpret: false })
```

## Formatting

Any component (of any content type) accepts formatting fields:

```ts
tellraw('@a', {
  text: 'Achievement unlocked!',
  color: 'gold',
  bold: true,
  italic: false,
  underlined: true,
  strikethrough: false,
  obfuscated: false,
  font: 'minecraft:alt',
})
```

## Nesting & children

An array of components is joined together, and any component can carry `extra` children which inherit its formatting/interactivity unless they override it:

```ts
tellraw('@a', [
  { text: 'Warning: ', color: 'red', bold: true },
  { text: 'the floor is lava.', color: 'red' },
])

tellraw('@a', {
  text: 'Warning: ',
  color: 'red',
  bold: true,
  extra: [{ text: 'the floor is lava.', bold: false }],
})
```
