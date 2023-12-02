---
id: if
title: If / Else
description: How to write if / else statements in Sandstone.
position: 2
---

import { InteractiveSnippet } from '../../../src/components'

You can easily check for in-game conditions using Sandstone's built-in `if` statement.

## Syntax

To check a condition, the following syntax is used:

```ts
_.if(condition1, () => {
  say('Condition 1 is true');
})
  .elseIf(condition2, () => {
    say('Condition 2 is true');
  })
  .else(() => {
    say('Both condition 1 and condition 2 are false');
  });
```

As you can see, this syntax mimics the original `if / else if / else` construct
from classical programming languages. `elseIf` and `else` are entirely optional,
and you can chain as many `elseIf` as needed:

```ts
_.if(condition1, () => {
  say('I am a lonely if');
});

_.if(condition2, () => {
  say(2);
})
  .elseIf(condition3, () => {
    say(3);
  })
  .elseIf(condition4, () => {
    say(4);
  });
```

## Conditions

Conditions are created using Sandstone's built-in abstractions.

### Score conditions

To check if a score matches a given condition, you can use [score comparison operators].

For example:

```ts
const self = Selector('@s');
const kills = Objective.create('kills', 'playerKillCount');
const myKills = kills(self);

_.if(myKills.greaterThan(10), () => {
  tellraw('@a', [self, ' is on a rampage!']);
});
```

#### Try it out

<InteractiveSnippet height={300} imports={['MCFunction', 'Objective', 'Selector', '_', 'tellraw']} code={`const self = Selector('@s')
const kills = Objective.create('kills', 'playerKillCount')
const myKills = kills(self)
\nMCFunction('if_score', () => {
  _.if(myKills.greaterThan(10), () => {
    tellraw('@a', [self, ' is on a rampage!'])
  })
})`} />

[score comparison operators]: /docs/features/variables/objectives#comparison

### Data conditions

To check if a block, an entity or a storage has some [NBT](/docs/features/nbt)
data, use the `_.data` condition together with the [NBT path] syntax.

In the following example, a command is run every tick for each player holding
a stick in their hand:

```ts
import { _, Selector, MCFunction, tellraw, execute } from 'sandstone';

const self = Selector('@s');

MCFunction('tick', () => {
    // Execute as every player
    execute.as(Selector('@a')).run(() => {
      // Detect the stick
      _.if(_.data.entity(self, 'SelectedItem{id:'minecraft:stick'}'), () => {
        tellraw(self, 'Hey! Nice stick you got there.');
      });
    });
  },
  { runEachTick: true }
);
```

The same can be done for blocks:

```ts
import { _, Selector, MCFunction, tellraw, execute, rel } from 'sandstone';

const self = Selector('@s');

MCFunction('tick', () => {
    // Execute at every player
    execute.as(Selector('@a')).at(self).run(() => {
        // Detect honey bottles
        _.if(Data('block', rel(0, -1, 0), 'Items[{id:'minecraft:honey_bottle'}]'), () => {
            tellraw(self, 'There is some honey beneath you');
          }
        );
      });
  },
  { runEachTick: true }
);
```

:::caution

Please note that no validation is performed on NBT paths. The following snippet
produces an invalid command due to missing quotes:

```ts
_.if(Block('block', rel(0, -1, 0), 'Items[{id:minecraft:honey_bottle}]'), () => {
  // ...
});
```

This is the resulting command:

```mcfunction
execute if data block ~ ~-1 ~ Items[{id:minecraft:honey_bottle}] run ...
```

:::

#### Try it out

<InteractiveSnippet height={300} imports={['MCFunction', 'Selector', '_', 'tellraw']} code={`const self = Selector('@s')\n
MCFunction('tick', () => {
  // Execute as every player
  execute.as(Selector('@a')).at(self).run(() => {
    // Detect honey bottles
    _.if(_.data.block(rel(0, -1, 0), 'Items[{id:'minecraft:honey_bottle'}]'), () => {
      tellraw(self, 'There is some honey beneath you')
    })
  })
}, { runEachTick: true })`} />

:::

[NBT path]: https://minecraft.fandom.com/wiki/NBT_path_format

### Boolean logic

Boolean logic in programming means comparing boolean values (`true`/`false`)
with a defined outcome. Each boolean operation has a 'truth-table' showing which
inputs lead to what output.

#### Or

The `_.or` operation succeeds if one or more of its conditions are true. It can
have more than just two conditions as inputs.

| A   | B   | result |
| --- | --- | :----: |
| ☐   | ☐   |   ☐    |
| ☒   | ☐   |   ☒    |
| ☐   | ☒   |   ☒    |
| ☒   | ☒   |   ☒    |

Example:

```ts
// Check if there is a sandstone slab on the current block, or a sandstone block under the player's feet
const condA = Block('sandstone', rel(0, -1, 0));
const condB = Block('sandstone_slab'); // Unspecified is equivalent to `~ ~ ~`
_.if(_.or(condA, condB), () => {
  say('Jackpot!');
});
```

#### And

The `_.and` operation succeeds if all its conditions are true. It can
have more than just two conditions as inputs.

| A   | B   | result |
| --- | --- | :----: |
| ☐   | ☐   |   ☐    |
| ☒   | ☐   |   ☐    |
| ☐   | ☒   |   ☐    |
| ☒   | ☒   |   ☒    |

Example:

```ts
// Check if there is a pressure plate on top of a TNT!
const condA = Block('tnt', rel(0, -1, 0));
const condB = BuiltinBlockSet('pressure_plates');
_.if(_.and(condA, condB), () => {
  say('Boom!');
});
```

#### Not

The `_.not` operation succeeds if its condition is false. It can only have one
input.

| A   | result |
| --- | :----: |
| ☐   |   ☒    |
| ☒   |   ☐    |

Example:

```ts
// Check if there is neither a sandstone slab on the current block, nor a sandstone block under the player's feet
const condA = Block('sandstone', rel(0, -1, 0));
const condB = Block('sandstone_slab'); // Unspecified is equivalent to `~ ~ ~`
_.if(_.not(_.or(condA, condB)), () => {
  say('Not a jackpot :(');
});
```

#### Try it out

<InteractiveSnippet height={250} imports={['MCFunction', '_', 'rel', 'say']} code={`// Check if there is a pressure plate on top of a TNT!
const condA = Block('tnt', rel(0, -1, 0))
const condB = BuiltinBlockSet('pressure_plates')\n
MCFunction('check_boom', () => {
  _.if(_.and(condA, condB), () => {
    say('Boom!')
  })
})`} />

#### Large scale Flow

:::warning
In some scenarios a very large condition tree may be necessary, in which case, scaled usage of Flow should be avoided, due to compile-time performance concerns.

Example:

```ts
const foo = Variable(0);

_.if(foo['<='](100000), () => {
  _.if(foo['<='](100), () => {
    for (let i = 0; i < 100; i++) {
      _.return.run(() => {
        _.if(foo['=='](i), () => {
          say(`${i}`);
        });
      });
    }
  }).elseIf(_.and(foo['>'](100), foo['<='](200)), () => {
    /// ...
  });
  /// ...
}).else(() => {
  /// ...
});
```

On better than average hardware an example like this would take several minutes to compile due to Visitor complexity; **many** nested command callbacks results in unacceptably slow compile times.

To avoid this, use primitive commands instead, utilizing tools like `raw` when necessary, and/or compiling your trees once and saving them in external resources.
:::
