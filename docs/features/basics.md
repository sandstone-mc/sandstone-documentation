---
id: basics
title: The Basics
sidebar_label: The Basics
---
## Writing a command

In Sandstone, all commands can directly be imported from `sandstone`:

```ts
import { advancement, execute, kill, say, scoreboard } from 'sandstone/commands'
```

When typing a command or a subcommand, there are two possibilities:

* The command/subcommand has several subcommands, like `effect give|clear`. To access a subcommand, access it as a property: `effect.give` or `effect.clear`

* The command/subcommand has no subcommands. It directly has argument, like `enchant`. To specify the arguments, call it as a normal function: `enchant("@a", "minecraft:sharpness")`

A command can have multiple subcommands, which all have arguments: `effect.give('@a', 'minecraft:speed', 30, 2)` or `effect.clear('@a', 'minecraft:night_vision')`.

**Important**: A command is only written to the datapack if it has been called. For example, some commands do not have any arguments, like `/reload`. In Sandstone, you'd have to type `reload()`. Only typing `reload` will **not** call the command, and nothing will appear in your datapacK.

### Optional arguments

In Minecraft, some commands have optional arguments. Let's stay with the `/effect give` command. According to the [Wiki](https://minecraft.gamepedia.com/Commands/effect#Syntax), It has 2 to 5 arguments:

```/effect give <targets> <effect> [<seconds>] [<amplifier>] [<hideParticles>]```

As you can see, the `targets` and the `effect` arguments are **mandatory**. Minecraft doesn't know what to do if you do not provide them. However, the `seconds`, `amplifier` and `hideParticles` arguments are all optionals. If you do not specify them, Minecraft uses default values.

In this aspect, Sandstone is identical to Minecraft. When typing `effect.give()`, your IDE will show you the possible arguments:

![argumentshint1](../images/argumentshint1.png)

On the left, you can see there are 4 different ways to call `effect.give`. The first one is shown here: you can just give a target and an effect, and Minecraft will be happy. If you type them and try to enter a **third** argument, your IDE will automatically show the next possible argument:

![argumentshint2](../images/argumentshint2.png).

It's telling you the third argument is the number of seconds. If you keep going (or type the Down arrow to display all possibilities), you will see that Sandstone allows what Minecraft allows. It's very useful: **you don't have to remember the syntax of all commands**, Sandstone does that for you.

### Execute

Sandstone has a special syntax for the `/execute` command. At its core, it looks just like Minecraft:

```js
execute.as("@a").at("@s")
```

The divergent part is the command call:

```js
// Sets a block of dirt under all players
execute.as("@a").at("@s").runOne.setblock('~ ~-1 ~', 'minecraft:dirt')
```

This will result in `execute as @a at @s run setblock ~ ~-1 ~ minecraft:dirt`. As you can see, you **use runOne instead of run**. In Sandstone, `run` is used to execute *multiple commands*, and `runOne` to execute *only one* command.

For example, here is how you could execute multiple commands with `run`:

```js
execute.as('@a').at('@s').run(() => {
  // All this commands are executed "as @a at @s".
  // Sets a block of dirt under all players, and air on their body & head.
  setblock('~ ~-1 ~', 'minecraft:dirt')
  setblock('~ ~ ~', 'minecraft:air')
  setblock('~ ~1 ~', 'minecraft:air')
})
```

If you try running such commands, under a mcfunction named "main" with verbose saving, you'll have the following results:

```mcfunction
# default:main
execute as @a at @s run function default:main/execute_as

# default:main/execute_as
setblock ~ ~-1 ~ minecraft:dirt
setblock ~ ~ ~ minecraft:air
setblock ~ ~1 ~ minecraft:air
```

As you can see, Sandstone automatically created a new mcfunction for you. It contains all your nested commands (all the setblocks), and is called by the `execute` command. Therefore, you achieve the desired effect **without managing several files youself**.

## Saving the datapack

Using sandstone, you can choose to either save the datapack to the current directory, or to save it directly in one of your Minecraft world. The first argument to the `saveDatapack` method is the name of the datapack. If you only provide this argument, the datapack will be saved to your current directory.

```js
// Save the datapack to the current directory
saveDatapack('My datapack')
```

As a second argument, `saveDatapack` accepts options. They are listed below.

| options | description |
| ------- | ----------- |
| verbose        | If true, the resulting commands will be displayed in the console.                                                                            |
| world          | The name of the world to save your datapack into. If left unspecified, the datapack will be saved in the current directory.                  |
| asRootDatapack | If `true`, then the resulting datapack will be saved to the `.minecraft/datapacks` folder.                                                   |
| minecraftPath  | The location of the .minecraft folder. If left unspecified, it will be automatically discovered.                                             |
| dryRun         | If true, then the datapack will not be saved to the file system. Combined with `verbose`, it allows to only show the results in the console. |

As you can see, Sandstone can save your datapack directly in one of your world:
```js
import { saveDatapack } from 'sandstone/core'

// Save the datapack in "An awesome world", with the "My datapack" name.
saveDatapack('My datapack', {
  world: 'An awesome world'
})
```

To achieve this, Sandstone automatically detects where your `.minecraft` folder is located. If you modified your `.minecraft` location, Sandstone could fail to find it. In that case, Sandstone will give you a clear error message. You will then have to manually specify your `.minecraft` location:
```js
// Save the datapack in "An awesome world", in a custom .minecraft folder
saveDatapack('My datapack', {
  world : 'An awesome world',
  minecraftPath: 'C:/Program Files/.minecraft'
})
```

Sometimes, you might want direct feedback on the functions you're writing. The `verbose` option will display all functions & commands in your console.
```js
mcfunction('hello', () => {
  say('Hello world!')
})

saveDatapack('My datapack', {
  verbose: true
})
```

Will output:
```mcfunction
# default:hello
say Hello world!
```
