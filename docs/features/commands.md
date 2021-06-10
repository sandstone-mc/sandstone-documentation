---
id: commands
title: Commands
description: How to write commands in Sandstone.
sidebar_position: 1
---
import { InteractiveSnippet } from '../../src/components'

## Basics

In Sandstone, all commands can directly be imported from `sandstone`:

```jsx
import { advancement, execute, kill, say, scoreboard } from 'sandstone'
```

When typing a command or a subcommand, there are two possibilities:

* The command/subcommand has several subcommands, like `effect give|clear`. To access a subcommand, access it as a property: `effect.give` or `effect.clear`

* The command/subcommand has no subcommands. It directly has argument, like `enchant`. To specify the arguments, call it as a normal function: `enchant("@a", "minecraft:sharpness")`

A command can have multiple subcommands, which all have arguments: `effect.give('@a', 'minecraft:speed', 30, 2)` or `effect.clear('@a', 'minecraft:night_vision')`.

:::caution
A command is only written to the datapack if it has been called. For example, some commands do not have any arguments, like `/reload`. In Sandstone, you'd have to type `reload()`. Only typing `reload` will **not** call the command, and nothing will appear in your datapack.
:::

### Examples

Here is the command to give 64 diamonds to all players:
```ts
give('@a', 'minecraft:diamond', 64)
```

Here is the command to give Speed II to all players:
```ts
effect.give('@a', 'minecraft:speed', 1)
```

Here is the command to grant all advancements to all players:
```ts
advancement.grant('@a').everything()
```

#### Try it out

<InteractiveSnippet height={200} imports={['MCFunction', 'give', 'effect', 'advancement']} code={`
MCFunction('example', () => {
  give('@a', 'minecraft:diamond', 64)
  effect.give('@a', 'minecraft:speed', 1)
  advancement.grant('@a').everything()
})
`} />

### Documentation

Use VSCode autocompletion to show you what arguments/property should be used on each command. 

Sandstone includes the Wiki documentation on each command, and for each parameter: you can look it up to understand what a command or a parameter does.

This example shows that Sandstone hints you what arguments are needed, and tell you what they actually do:

![documentation](/img/autocompletion/command.gif)

## Optional arguments

In Minecraft, some commands have optional arguments. Let's stay with the `/effect give` command. According to the [Wiki](https://minecraft.gamepedia.com/Commands/effect#Syntax), It has 2 to 5 arguments:

```/effect give <targets> <effect> [<seconds>] [<amplifier>] [<hideParticles>]```

As you can see, the `targets` and the `effect` arguments are **mandatory**. Minecraft doesn't know what to do if you do not provide them. However, the `seconds`, `amplifier` and `hideParticles` arguments are all optionals. If you do not specify them, Minecraft uses default values.

In this aspect, Sandstone is identical to Minecraft. When typing `effect.give()`, your IDE will show you the possible arguments:

![argumentshint1](/img/hints/give.png)

As you can see, the `targets` and the `effect` argument are not followed by a question mark `?`. It means they are mandatory, just like in Minecraft. However, the `seconds`, `amplifier` and `hideParticles` arguments are followed by a question mark `?`: Sandstone does not require them. 

This feature is very useful: **you don't have to remember the syntax of all commands**, Sandstone does that for you. Also, Sandstone gives you precise documentation on the behaviour of each command: you don't have to check the Wiki anymore!

#### Try it out

<InteractiveSnippet height={250} imports={['MCFunction', 'effect']} code={`
MCFunction('optional_arguments', () => {
  // effect.give('@a') -> Invalid!
  effect.give('@a', 'minecraft:haste')
  effect.give('@a', 'minecraft:haste', 10)
  effect.give('@a', 'minecraft:haste', 10, 1)
  effect.give('@a', 'minecraft:haste', 10, 1, true)
})
`} />

## Execute

### Single command

Sandstone has a special syntax for the `/execute` command. At its core, it looks just like Minecraft:

```ts
execute.as('@a').at('@s')
```

Calling a single command looks similar too:

```ts
// Sets a block of dirt under all players
execute.as('@a').at('@s').run.setblock(rel(0, 0, 0), 'minecraft:dirt')
```

This will result in `execute as @a at @s run setblock ~ ~ ~ minecraft:dirt`. 

#### Try it out:
<InteractiveSnippet height={280} imports={['MCFunction', 'execute', 'rel']} code={`
MCFunction('single_execute', () => {
  // Make a random player say Hello
  execute.as('@r').run.say('Hello!')\n
  // Put a block of dirt on a random player
  execute.as('@r').at('@s').run.setblock(rel(0, 0, 0), 'minecraft:dirt')\n
  // Summon a TNT on all players!
  execute.as('@a').at('@s').run.summon('minecraft:tnt', rel(0, 0, 0))
})
`} />

In Sandstone, `run` is used to execute *single **and** multiple commands*.

Here is how you could execute multiple commands with `run`:

```ts
execute.as('@a').at('@s').run(() => {
  // All this commands are executed "as @a at @s".
  // Sets a block of dirt under all players, and air on their body & head.
  setblock('~ ~-1 ~', 'minecraft:dirt')
  setblock('~ ~ ~', 'minecraft:air')
  setblock('~ ~1 ~', 'minecraft:air')
})
```

Let's see a live example to understand what Sandstone does under the hood.
<InteractiveSnippet height={250} imports={[]} code={`
MCFunction('main', () => {
  execute.as('@a').at('@s').run(() => {
    // All this commands are executed "as @a at @s".
    // Sets a block of dirt under all players, and air on their body & head.
    setblock(rel(0, -1, 0), 'minecraft:dirt')
    setblock(rel(0,  0, 0), 'minecraft:air')
    setblock(rel(0, +1, 0), 'minecraft:air')
  })
})
`} />

As you can see, Sandstone automatically created a new MCFunction for you (here, called `main/execute_as`). It contains all your nested commands (all the setblocks), and is called by the `execute` command. Therefore, you achieve the desired effect **without managing several files youself**.
