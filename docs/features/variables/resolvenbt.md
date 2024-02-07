---
id: resolvenbt
title: ResolveNBT
description: How to resolve dynamic NBT with Sandstone.
---

Example:
```ts
const protection = Variable(2)

MCFunction('equip_zombie', () => {
  const item = {
    Count: NBT.byte(1),
    tag: {
      Enchantments: [{id: 'protection', lvl: ResolveNBTPart(protection)}]
    }
  }

  execute.summon('zombie').run.data.modify('@s', ArmorItems, ResolveNBT([
    { id: 'diamond_helmet', ...item, },
    { id: 'diamond_chestplate', ...item, },
    { id: 'diamond_leggings', ...item, },
    { id: 'diamond_boots', ...item, },
  ]))
})
```