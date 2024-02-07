---
id: return-throw
title: Return & Throw
description: How to manually manage function flow in Sandstone.
---

You can easily exit a function context early using Sandstone's built-in `return` statement, and exit with an error using `throw`.

## Return

### Syntax

```ts
say('checking for zombies')

_.if(Selector('@e', { type: 'zombie', distance: [null, 25] }), () => _.return.run.say('zombies found! beware!'))

// same as

execute.if.entity(Selector('@e', { type: 'zombie', distance: [null, 25] })).run.return.run.say('zombies found! beware!')

say('no zombies found, safe!')
```

As you can see, this strays somewhat from the traditional `return` syntax in common languages, but behaves similarly.

### Returning a value

```ts
_.if(Selector('@s', { type: 'zombie' }), () => _.return(0))

_.if(Selector('@s', { type: 'skeleton' }), () => _.return(1))

_.if(Selector('@s', { type: 'creeper' }), () => _.return(2))
```

When running this function, you can store it into a Score to get an enum of which common hostile mob the current executor is. Due to how return works, if the executor is a zombie, the other 2 checks do not have to run, matching the behavior of `elseIf`.

### Returning another function

```ts
_.if(Selector('@s', { type: 'zombie' }), () => _.return.run(() => {
  // Do zombie stuff

  _.return(0)
}))

_.if(Selector('@s', { type: 'skeleton' }), () => _.return.run(() => {
  // Do skeleton stuff

  _.return(1)
}))

_.if(Selector('@s', { type: 'creeper' }), () => _.return.run(() => {
  // Do creeper stuff

  _.return(2)
}))
```

Instead of only returning a value, each return will also be able to run logic for the mob.

## Throw

### Syntax

```ts
_.if(Selector('@e', { tag: 'necessary_entity', limit: 1 }), () => {
  // Do necessary things
})
.else(() => _.throw('Failed to do necessary things!'))

say('Successfully did necessary things')
```

As you can see, this is fairly similar to the traditional `throw` syntax in common languages.

### Scoping the error broadcast

```ts
_.throw('Failed to do necessary things!', Selector('@a', { tag: 'admin' }))
```

### Internal error handling

```ts
// In the main loop
const error = DataVariable(NBT.byte(0), 'error')

// In a child function

_.throw('Failed to do necessary things!', false, error)

// Back in the main loop

_.if(_.not(error.equals(NBT.byte(0))), () => {
  // Handle error
})
```