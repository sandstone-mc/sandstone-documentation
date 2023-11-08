---
id: nbt
title: NBTs
description: How to write NBTs in Sandstone.
---

## General Syntax
In Sandstone, NBTs are regular JavaScript objects. JavaScript objects are very close to NBTs: they have arrays, objects, keys and values, numbers and strings.

For example, to summon an invisible armor stand with the "hello" tag and a pumpkin on his head, you would do the following command:
```ts
summon('minecraft:armor_stand', rel(0, 0, 0), { 
    Invisible: 1, 
    Tags: ["hello"], 
    ArmorItems: [
      {}, {}, {}, { id: "minecraft:carved_pumpkin", Count: 1 },
    ]
})
```

## Units

### Usefulness
Despite JavaScript objects and NBTs being close, there is one thing missing from JavaScript objects that is required in NBTs: specifying units.

For example, to summon an armor stand with a given rotation, you need to specify that the values are floats.

With this command, you get the expected result:
```
/summon minecraft:armor_stand ~ ~ ~ {Rotation: [90.0f, 0.0f]}
```

![Result 90°](/img/nbts/90.png)

Omit the unit, and the armor stand rotation will be wrong:
```
/summon minecraft:armor_stand ~ ~ ~ {Rotation: [90.0, 0.0]}
```

![Result 90°](/img/nbts/0.png)


Here, specifying that the values are floats is mandatory. However, this isn't possible to do it with a normal JavaScript object.

### Unit Syntax

To specify a unit, you must call the corresponding method under the `NBT` object. For all units, there are 2 possible calls:
- With a single number. It will add the given unit to the number.
- With an array of numbers. It will add the given unit to all numbers in the array.

For example, to summon an armor stand with `Invisible: 1b` and `Rotation: [90f, 0f]`, you must write:
```ts
import { NBT } from 'sandstone'

summon('minecraft:armor_stand', rel(0, 0, 0), {
  Invisible: NBT.byte(1),       // => Invisible: 1b
  Rotation: NBT.float([90, 0]), // => Rotation: [90f, 0f]
})
```

### All units

Here is a summary of all units and their corresponding methods.

type       |  unit   | method
-----------|---------|-------------
float      |  `'f'`  | `NBT.float` 
double     |  `'d'`  | `NBT.double`
byte       |  `'b'`  | `NBT.byte`
short      |  `'s'`  | `NBT.short`
long       |  `'l'`  | `NBT.long`
int array  |  `'I;'` | `NBT.integerArray`
long array |  `'L;'` | `NBT.longArray`

Integer array and Long array are **different** from arrays of integers and arrays of longs. These types were added recently, and are use in a few specific places. They are represented this way:
```py
{ Test: [I; 0, 1, 2 ] } # Integer array
{ Test: [L; 0, 1, 2 ] } # Long array
```

Integer arrays are used in [custom player heads IDs](https://minecraft.wiki/Head#Item_data), and in [several Villager NBTs](https://minecraft.wiki/Mob/ED) storing locations.

Long arrays are used to store [chunk data](https://minecraft.wiki/Chunk_format#NBT_structure).

### Unit-free Syntax

Another syntax exists. It's more compact, easier to read, but has absolutely no type safety and no validation. It uses the template string syntax:
```ts
import { NBT } from 'sandstone'

summon('minecraft:armor_stand', rel(0, 0, 0), {
  Invisible: NBT`1b`,       // => Invisible: 1b
  Rotation: NBT`[90f, 0f]`, // => Rotation: [90f, 0f]
}) 
// => /summon minecraft:armor_stand ~ ~ ~ {Invisible:1b, Rotation:[90f, 0f]}
```

:::caution
Please note than no validation is performed. For example, missing a bracket will result in an invalid command.
```ts
summon('minecraft:armor_stand', rel(0, 0, 0), {
  Rotation: NBT`[90f, 0f`, // Notice the missing square bracket
})
```

The above snippet results in the following **invalid** command:
```mcfunction
summon minecraft:armor_stand ~ ~ ~ {Rotation:[90f, 0f}
```

:::
