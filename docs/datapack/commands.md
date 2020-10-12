---
id: commands
title: Writing Commands
description: How to write commands in Sandstone.
---
## Basics

In Sandstone, all commands can directly be imported from `sandstone`:

```ts
import { advancement, execute, kill, say, scoreboard } from 'sandstone/commands'
```

When typing a command or a subcommand, there are two possibilities:

* The command/subcommand has several subcommands, like `effect give|clear`. To access a subcommand, access it as a property: `effect.give` or `effect.clear`

* The command/subcommand has no subcommands. It directly has argument, like `enchant`. To specify the arguments, call it as a normal function: `enchant("@a", "minecraft:sharpness")`

A command can have multiple subcommands, which all have arguments: `effect.give('@a', 'minecraft:speed', 30, 2)` or `effect.clear('@a', 'minecraft:night_vision')`.

:::caution
A command is only written to the datapack if it has been called. For example, some commands do not have any arguments, like `/reload`. In Sandstone, you'd have to type `reload()`. Only typing `reload` will **not** call the command, and nothing will appear in your datapack.
:::

### Example

Here is the command to give 64 diamonds to all players:
```js
give('@a', 'minecraft:diamond', 64)
```

Here is the command to give Speed II to all players:
```js
effect.give('@a', 'minecraft:speed', 1)
```

Here is the command to grant all advancements to all players:
```js
advancement.grant('@a').everything()
```

### Documentation

Use VSCode autocompletion to show you what arguments/property should be used on each command. 

Sandstone includes the Wiki documentation on each command, and for each parameter: you can look it up to understand what a command or a parameter does.

This example shows that Sandstone hints you what arguments are needed, and tell you what they actually do:

![documentation](../images/autocompletion/command.gif)

## Optional arguments

In Minecraft, some commands have optional arguments. Let's stay with the `/effect give` command. According to the [Wiki](https://minecraft.gamepedia.com/Commands/effect#Syntax), It has 2 to 5 arguments:

```/effect give <targets> <effect> [<seconds>] [<amplifier>] [<hideParticles>]```

As you can see, the `targets` and the `effect` arguments are **mandatory**. Minecraft doesn't know what to do if you do not provide them. However, the `seconds`, `amplifier` and `hideParticles` arguments are all optionals. If you do not specify them, Minecraft uses default values.

In this aspect, Sandstone is identical to Minecraft. When typing `effect.give()`, your IDE will show you the possible arguments:

![argumentshint1](../images/argumentshint.png)

As you can see, the `targets` and the `effect` argument are not followed by a question mark `?`. It means they are mandatory, just like in Minecraft. However, the `seconds`, `amplifier` and `hideParticles` arguments are followed by a question mark `?`: Sandstone does not require them. 

This feature is very useful: **you don't have to remember the syntax of all commands**, Sandstone does that for you. Also, Sandstone gives you precise documentation on the behaviour of each command: you don't have to check the Wiki anymore!

## Execute

Sandstone has a special syntax for the `/execute` command. At its core, it looks just like Minecraft:

```js
execute.as('@a').at('@s')
```

The divergent part is the command call:

```js
// Sets a block of dirt under all players
execute.as('@a').at('@s').runOne.setblock('~ ~-1 ~', 'minecraft:dirt')
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
