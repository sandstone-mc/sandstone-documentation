---
id: functions
title: Minecraft Functions
description: How to write functions in Sandstone.
sidebar_position: 5
---
## Creating a Minecraft function

As you saw earlier, you can create a Minecraft function using `MCFunction`:

```ts
// Create a Minecraft function inside the default namespace, 
// named "main.mcfunction"
MCFunction('main', () => {...})
```

By specifying only the function's name, it will be created inside the default namespace. However, you can specify it yourself:
```ts
// Create a Minecraft function inside the `mydatapack` namespace, 
// named "main.mcfunction"
MCFunction('mydatapack:main', () => {...})
```

Here, your function will be created inside the `mydatapack` namespace.

## Calling a Minecraft function

One of the goal of Sandstone is to promote reusable block of commands. To make this possible, you have the ability to call other functions.

Your first possibility is to call another Minecraft function, just like you would in a normal Minecraft Datapack. To achieve this, you need to assign your MCFunction to a variable:

```ts
const main = MCFunction('main', () => {
  say("This is the main function.")
  give('@a', 'minecraft:diamond')
})

MCFunction('callMainThreeTimes', () => {
  main()
  main()
  main()
})
```

This will result in the following functions:
```mcfunction
# default:main
say This is the main function
give @a minecraft:diamond

# default:callMainThreeTimes
function default:main
function default:main
function default:main
```

This approach has several advantages:

* Commands are not duplicated. This results in a lighter datapack.

* The function can be recursive.

* It has a meaningful name in Minecraft (here, default:main).

However, it has three drawbacks:

1. It will create a `.mcfunction` file for each functions, even if they are never called. Therefore, it makes it hard to share your functions with other peoples: if your library contains 100 helper functions, all datapacks using your library will include those 100 functions - even if they only use one.

2. It cannot take parameters. If you want to have a generic set of commands, that changes depending on some parameters, this is not possible.

The first drawback can be solved using **lazy functions**, and the second one using **inline functions**.

## Lazy Minecraft Functions

To prevent Sandstone creating functions when not mandatory, you can use lazy functions. A lazy function will be created **only if another function calls it**. A lazy function that isn't called won't even be present in the datapack:
```ts
const useless = MCFunction('useless', () => {
  say('This function is not used anywhere')
}, { lazy: true })

MCFunction('main', () => {
  say('Main function')
})
```
Results in:
```mcfunction
# default:main
say Main function
```

As you can see, the `useless` function has not been created. Let's call it from the `main function`:
```ts
const useless = MCFunction('useless', () => {
  say('This function is not used anywhere')
}, { lazy: true })

MCFunction('main', () => {
  say('Calling "useless"...')
  useless()
})
```
Results in:
```mcfunction
# default:main
say Calling "useless"...
function default:useless

# default:useless
say This function is not used anywhere
```

As you can see, the `useless` function has been created, because it is called from `main`. This feature is very useful to distribute lot of functions, in a library for example.

## Minecraft function options

You can specify different options, other than `lazy`, for your Minecraft functions.

 option | type | description |
--|--|--|
`runEachTick` | `boolean` | Whether the function should run each tick. |
`runOnLoad` | `boolean` | Whether the function should run when the datapack is loaded or reloaded. |
`tags` | `string[]` | The function tags to apply to this function.
`lazy` | `boolean` | If true, then the function will only be created if it is called from another function.
``

## Inline functions

Inline functions are normal, Javascript functions. They group up related commands in a reusable, readable piece of code. **Inline functions do not create additional MCFunctions**. They are inlined when they are called.

Let's take a simple example using inline functions:
```ts
function giveDiamonds(count: number) {
  give('@a', 'minecraft:diamond', count)
  say('I gave', count, 'diamonds to everyone!')
}

MCFunction('main', () => {
  giveDiamonds(64)
  giveDiamonds(32)
})
```

This results in:
```mcfunction
## Function default:main
give @a minecraft:diamond 64
say I gave 64 diamonds to everyone!
give @a minecraft:diamond 32
say I gave 32 diamonds to everyone!
```

As you can see, the commands from the `giveDiamonds` function are directly written inside `main`. Inline functions are a very efficient way to group up related commands, which helps writing a **clean** and **logical** datapack.

Inline functions can do everything a normal function does: using commands, calling MCFunctions, calling other lazy functions...

## Waiting between commands

### The basics

Sandstone allows you to wait a fixed amount of time between some commands, without having to manually declare a new function each time. This has several purpose: dialogs, event scheduling, animations etc... Under the hood, this uses the `/schedule` command: however, all the complexity is abstracted away.

### Basic syntax

To wait a specific time between commands, there are two things to do:

1. Change your function to an asynchronous function, by adding the `async` keyword

2. Add the `await sleep(delay)` line between your commands.

`delay` can be a number of ticks, or a time string like `'1t'`, `'1s'`, `'1d'`...

Here is a minimal syntax:
```ts
MCFunction('minimal', async () => {
  say('This command runs now')
  await sleep('5s')
  say('This command runs 5s later')
})
```

There are two things to notice. First, our function is now asynchronous. They `async` keyword has been added before the parameters list:
```ts
MCFunction('minimal', async () => {...})
```

Second, we await the `sleep` function

### Example

You could simulate a dialog like this:
```ts
MCFunction('council', async () => {
  tellraw('@a', '[Aragorn] - You have my sword.')
  await sleep(10) // sleep 10 ticks, half a second.

  tellraw('@a', '[Legolas] - And my bow.')
  await sleep('1s') // sleep 1 second

  tellraw('@a', '[Gimly] - AND MY AXE!')
})
```

This example would compile to the following resources:
```mcfunction
## Function default:council
tellraw @a "[Aragorn] - You have my sword."
schedule function default:council/__sleep 10 replace
schedule function default:council/__sleep_2 1s replace

## Function default:council/__sleep
tellraw @a "[Legolas] - And my bow."

## Function default:council/__sleep_2
tellraw @a "[Gimly] - AND MY AXE!"
```