---
id: functions
title: Writing Functions
description: How to write functions in Sandstone.
---
## Creating a Minecraft function

As you saw earlier, you can create a Minecraft function using `mcfunction`:

```js
// Create a Minecraft function inside the default namespace, 
// named "main.mcfunction"
mcfunction('main', () => {...})
```

By specifying only the function's name, it will be created inside the default namespace. However, you can specify it yourself:
```js
// Create a Minecraft function inside the `mydatapack` namespace, 
// named "main.mcfunction"
mcfunction('mydatapack:main', () => {...})
```

Here, your function will be created inside the `mydatapack` namespace.

## Calling a Minecraft function

One of the goal of Sandstone is to promote reusable block of commands. To make this possible, you have the ability to call other functions.

Your first possibility is to call another Minecraft function, just like you would in a normal Minecraft Datapack. To achieve this, you need to assign your mcfunction to a variable:

```js
const main = mcfunction('main', () => {
  say("This is the main function.")
  give('@a', 'minecraft:diamond')
})

mcfunction('callMainThreeTimes', () => {
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

1. It will create a `.mcfunction` file, even if it's never called. Therefore, it makes it hard to share your functions with other peoples: if your library contains 100 helper functions, all datapacks using your library will include those 100 functions - even if they only use one.

2. It cannot take parameters. If you want to have a generic function, this is not possible.

The first drawback can be solved using **lazy functions**, and the second one using **parametrized functions** or **inline functions**.

## Lazy Minecraft Functions

To prevent Sandstone creating functions when not mandatory, you can use lazy functions. A lazy function will be created **only if another function calls it**. A lazy function that isn't called won't even be present in the datapack:
```js
const useless = mcfunction('useless', () => {
  say('This function is not used anywhere')
}, { lazy: true })

mcfunction('main', () => {
  say('Main function')
})
```
Results in:
```mcfunction
# default:main
say Main function
```

As you can see, the `useless` function has not been created. Let's call it from the `main function`:
```js
const useless = mcfunction('useless', () => {
  say('This function is not used anywhere')
}, { lazy: true })

mcfunction('main', () => {
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

## Inline functions

Inline functions are normal, Javascript functions. They group up related commands in a reusable, readable piece of code. **Inline functions do not create additional mcfunctions**. They are inlined when they are called.

Let's take a simple example using inline functions:
```js
function giveDiamonds(count: number) {
  give('@a', 'minecraft:diamond', count)
  say('I gave', count, 'diamonds to everyone!')
}

mcfunction('main', () => {
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

Inline functions can do everything a normal function does: using commands, calling mcfunctions, calling other lazy functions...
