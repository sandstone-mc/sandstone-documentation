---
id: macros
title: Function Macros
description: How to use function macros in Sandstone.
---

Macros, introduced in 1.20.2 snapshot [23w31a](https://quiltmc.org/en/mc-patchnotes/#23w31a), provide a way to substitute values anywhere in a command. While there exists many anti-patterns in terms of optimization, there are certainly many usecases where macros are very useful for optimization and previously impossible behavior.

Sandstone provides a first class experience for using said macros, beyond basic support, you can easily use existing variables (`Score`'s, `DataPoint`'s) in your commands in place of arguments.

## Basic usage

```ts
MCFunction('macro_test', () => {
  data.modify.storage('macro_test', 'Test').set.value(NBT({test:'5 10 37'}))
  functionCmd(MCFunction('using_macros', () => {
    raw('/tp @s $(test)')
  }), 'with', 'storage', 'macro_test', 'Test')
})
```

## Macro variable

MCFunction's can have environment variables & parameters, provided like so.

```ts
const $ = Macro

const name = Data('storage', 'test', 'Name')
/**
 * @param count How many diamonds to give
 */
const test = MCFunction('test', [name], (_loop: any, count: Score) => {
  $.give(name, 'minecraft:diamond', count)
})

MCFunction('foo', () => {
  name.set('MulverineX')
  const count = Objective.create('testing')('@s')

  test(count)
})
```

This is a relatively type-safe method of using Macros, something that as to date, is not possible in any other framework!

:::warning
Do note a few limitations:
 - An MCFunction with macro variables **must** be called at compile-time, otherwise it will be generated without any Macro names!
 - Variables used within a function where they are declared as parameter or environment cannot be used normally; if you need both, declare them separately.
 - Nesting capability is not available in parameters; all parameters must be in the root, however, spread operators will work!
:::

### Macro Templating

Macro variables can be used in conjunction with strings, numbers, and other variables!

```ts
const $ = Macro

const thingMap = Data('storage', 'test', 'Things')

const thing = Data('storage', 'test', 'Thing')

const test = MCFunction('get_thing', (_loop: any, index: Score) => {
  $.data.storage.modify(thing).set.from.storage(thingMap.currentTarget, $`Things[${index}]`)
})

MCFunction('foo', () => {
  const index = Objective.create('testing')('@s')

  test(index)

  // Do stuff with `thing`
})
```