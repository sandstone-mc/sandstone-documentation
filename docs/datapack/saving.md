---
id: saving
title: Saving the datapack
description: How to save your datapack with Sandstone.
---
Using Sandstone, you can choose to either save the datapack to the current directory, or to save it directly in one of your Minecraft world. The first argument to the `saveDatapack` method is the name of the datapack. If you only provide this argument, the datapack will be saved to your current directory.

```js
// Save the datapack to the current directory
saveDatapack('My datapack')
```

As a second argument, `saveDatapack` accepts options. They are listed below.

| option | type | description |
| ------ | ---- | ----------- |
| `verbose` | `boolean` | If true, the resulting commands will be displayed in the console. |
| `world`| `string` |  The name of the world to save your datapack into. If left unspecified, the datapack will be saved in the current directory. Incompatible with `asRootDatapack`. |
| `asRootDatapack` | `boolean` | Whether the datapack should be saved to the `.minecraft/datapacks` folder. Incompatible with `world`. |
`minecraftPath` | `string`  | The location of the `.minecraft` folder. If left unspecified, it will be automatically discovered. |
`dryRun` | `boolean` | If true, then the datapack will not be saved to the file system. Combined with `verbose`, it allows to only show the results in the console. |

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
MCFunction('hello', () => {
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
