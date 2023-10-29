---
id: mcmeta
title: mcmeta
description: How to use generated mcmeta files in your projects.
---

Sandstone provides a way to use Misode's GitHub repository, [mcmeta](https://github.com/misode/mcmeta), containing generated resources from the game.

```ts
// Request from a generated file
const villagerTypes = JSON.parse(await mcmetaCache.get('registries', 'villager_type/data.json'))


// Modify a vanilla loot table
const jungleChest = LootTable('minecraft:chests/jungle_temple', {})

jungleChest.lootTableJSON = {
  ...await getExistingResource(jungleChest),
  ...{
    pools: [{
      bonus_rolls: 0.0,
      entries: [
        {
          type: 'minecraft:empty',
          weight: 2
        },
        {
          type: 'minecraft:item',
          functions: [
            {
              add: false,
              count: 2.0,
              function: 'minecraft:set_count'
            }
          ],
          name: 'minecraft:wild_armor_trim_smithing_template'
        }
      ],
      rolls: 1.0
    }]
  }
}


// Modify a vanilla texture
const inventoryGui = Texture('gui', 'minecraft:container/inventory')

inventoryGui.buffer = doSomething(await getExistingResource(inventoryGui))
```