---
id: custom_resource
title: Custom Resources
description: How to create custom resources (& packs!) with Sandstone.
---

Sandstone features a system for supporting custom resources. Like for all resources, you need to provide a name, which can include a namespace and folders. You then provide the definition of the resource.

## Raw Resource

Sometimes, you're not building a library and you don't need to add much auxiliary function to your resource, in that case `RawResource` is perfect.

### Syntax

```ts
RawResource('scripts/drop_heads.sc', `
// A Balanced way to get player heads in survival.

// stay loaded
__config() -> (
   m(
      l('stay_loaded','true')
   )
)

__on_player_dies(player) -> (
  if(rand(1) <= 0.3,
    xv = rand(0.5)-0.25
    yv = rand(0.5)
    zv = rand(0.5)-0.25

    motion = '[' + xv + 'd, ' + yv + 'd, ' + zv + 'd' + ']'
    data = '{Motion: ' + motion + ', Item: {id: "minecraft:player_head", Count:1b, tag:{SkullOwner: "' + player + '"}}}, PickupDelay: 3s'
    spawn('item', pos(player), data)
  )
)`)
```

The above example places the [Carpet Mod](https://modrinth.com/mod/carpet) scarpet script in `(datapack folder)/scripts/drop_heads.sc`.

### Other packs

```ts
RawResource(resourcePack(), 'assets/minecraft/models/entity/pig.gecko.json', getExistingResource('entity_models/pig.gecko.json'))
```

The above example places the [GeckoLib Mod](https://modrinth.com/mod/geckolib) entity model in `(resource pack folder)/assets/minecraft/entity/pig.gecko.json`.

## Custom Resource

Sometimes you're building out support for an unsupported type of resource you'll use a lot, in which case you can create a custom resource!

```ts
const [core, CustomResource] = makeCustomResource

export type GameEventListenerJSON = {
  /** The event to listen to. */
  event: GAME_EVENTS

  /** Optional. A list of predicates to check before running the function. */
  conditions?: PredicateJSON[]

  /** The function to run when the event is triggered. */
  function: string | MCFunctionClass<undefined, undefined>
}

export class GameEventListenerClass extends CustomResource {
  public GameEventListenerJSON: GameEventListenerJSON

  constructor(sandstoneCore: SandstoneCore, name: string, listener: GameEventListenerJSON, opts: ResourceClassArguments<'default'>) {
    super(sandstoneCore, name, {
      ...opts,
      type: 'game_event',
      folder: sandstoneCore.pack.resourceToPath(name, ['game_events']),
      extension: 'json',
    })

    this.GameEventListenerJSON = listener
  }

  getValue = () => JSON.stringify(this.GameEventListenerJSON)
}

export function GameEventListener(name: string, listener: GameEventListenerJSON, opts?: ResourceClassArguments<'default'>) {
  return new GameEventListenerClass(core, name, listener, {
    addToSandstoneCore: true,
    creator: 'user',
    ...opts,
  })
}

GameEventListener('mining', {
  event: 'block_destroy',

  conditions: [{
    condition: 'minecraft:entity_properties',
    entity: 'this',
    predicate: {
      type: 'player',
    },
  }],

  function: MCFunction('mining', () => {
    say('I mined a block!')
  }),
})
```

This would provide full support for the [Picoblaze mod](https://github.com/lolgeny/picoblaze)'s implementation of game event listeners!

## Custom Packs

In some cases you may need to export multiple separate datapacks, or an entirely custom directory of resources, like the config for a mod.

### Separate Datapack

```ts
import { PackType } from 'sandstone/pack/packType'

class DataPackFoo extends PackType {
  constructor() {
    super('datapack-foo', 'saves/$worldName$/datapacks/$packName$-foo', 'world/datapacks/$packName$-foo', 'datapacks/$packName$-foo', 'server', true, 'data', true)
  }

  handleOutput = async (type: 'output' | 'client' | 'server', readFile: handlerReadFile, writeFile: handlerWriteFile) => {
    if (type === 'output') {
      await writeFile('pack.mcmeta', JSON.stringify({
        pack_format: 21,
        description: 'Foo Pack',
      }))
    }
  }
}

const fooPack = sandstonePack.packTypes.set('datapack-foo', new DataPackFoo()).get('datapack-foo')!

MCFunction('bar', () => {
  say('bar')
}, {
  packType: fooPack,
})
```

### Custom Pack

```ts
import { PackType } from 'sandstone/pack/packType'

class ModConfig extends PackType {
  constructor() {
    super('mod-config', 'config', 'config', 'config', 'both')
  }
}

export const modConfig = new ModConfig()

sandstonePack.packTypes.set('mod-config', )

RawResource(modConfig, 'techy_haven/main.cfg', `
foo=bar
baz=21
`)
```