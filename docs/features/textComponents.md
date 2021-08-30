---
id: textComponents
title: JSON Text Components
description: How to create JSON Text Components (for /tellraw, /title, /bossbar...) with Sandstone.
---

Sandstone allows using JSON Text Components the same way you would use them in
Minecraft, just with all the linting and type-safety included. A documentation
for all the component types can be found on the [Minecraft Wiki](https://minecraft.fandom.com/wiki/Raw_JSON_text_format).

## Formatting

Components can be formatted:
```ts
{
  text: "AWESOME",
  color: "gold",
  bold: true,
  italic: true,
  underlined: true,
  obfuscated: true
}
```

Text colors are either one of the 16 [builtin color names] or a custom 24-bit
hexadecimal RGB color when preceded with a `#` (eg. `#55FF55`).

It is also possible to change the font of the text. One alternate builtin font
is `minecraft:alt`, the enchanting table font:
```ts
{
  text: "I am literally magic",
  font: "minecraft:alt"
}
```

[builtin color names]: https://minecraft.fandom.com/wiki/Formatting_codes#Color_codes

## Grouping

Chat components can be grouped together in lists. When using groups, the first
element has the base formatting that all further elements inherit if they don't
specify it themselves. In the following example, the first **and** the second
"very" are formatted bold:
```ts
[
  { text: "Groups" },
  " are ",
  [
    { text: "very ", bold: true },
    "very "
  ],
  "neat!"
]
```

A similar method of getting the same result is using `extra`:
```ts
{
  text: "I am ",
  extra: [
    "special"
  ]
}
```

## Chat Component types

Here are some of the more common component types.

### Plain text

Example:
```ts
title(Selector('@a')).title([
  { text: 'Hello from ' },
  { text: 'Sandstone!', color: 'gold' }
])
```

### Entity names

Displays the name of one or more entities separated by a comma or a custom
separator component.

Example:
```ts
const closest = Selector('@p', {distance: [.1, Infinity]})

tellraw(Selector('@a'), {
  text: 'My closest friend is ',
  extra: [{
    selector: closest
  }]
})
```

### NBT values

Displays an NBT value.

The component needs an nbt path and the source, which can be an entity, a block
or a storage.

Example:
```ts
tellraw(Selector('@a'), {
  text: 'My favorite hotbar slot is number ',
  extra: {
    nbt: 'SelectedItemSlot',
    entity: Selector('@s')
  }
})
```

### Translated text

Displays translated text with optional templates.

This example prints "&lt;Notch&gt; Sandstone is nice":
```ts
tellraw(Selector('@a'), {
  translate: 'chat.type.text',
  with: [
    'Notch',
    'Sandstone is nice'
  ]
})
```

The example used the following translation:
```json
{
  // ...
  "chat.type.text": "<%s> %s"
  // ...
}
```

<!-- TODO: add more if explanation is needed -->