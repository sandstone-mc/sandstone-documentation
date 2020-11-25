---
id: first-function
title: Your First Function
description: Write your first Sandstone function.
hide_table_of_contents: true
---

Let's write your first Minecraft function. Start VSCode, and open the folder you created. In the directory, create a new file named `helloworld.ts`, with the following content:

:::note Hint
You can copy the code by clicking on the top-right corner of the code block!
:::

```ts title="helloworld.ts"
import { say } from 'sandstone/commands'
import { MCFunction, saveDatapack } from 'sandstone/core'

MCFunction('hello', () => {
  say('Hello world!')
})

saveDatapack('My datapack', { verbose: true })
```
To run this file, type the following command in your terminal:

:::info 
To start a Terminal in VSCode, look at the top bar, click on Terminal > New Terminal.
:::


```bash
npx ts-node helloworld.ts
```

First, you should see the following output in your console:
```mcfunction
# default:hello
say Hello world!
```

Also, you should see a new folder in your current working directory, named `My datapack`. If you do, congratulations! You just wrote your first Minecraft function using Sandstone. You can explore your `My datapack` folder: you'll see it is a valid datapack, with your custom function in it!

### Explanation
Let's do a line-by-line explanation.

```js
import { say } from 'sandstone/commands'
import { MCFunction, saveDatapack } from 'sandstone/core'
```
This line tells Sandstone what we need to use. Here, we need one command, `say`, and two Sandstone functions, `MCFunction` and `saveDatapack`. The commands are located in `sandstone/commands`, the Sandstone functions are located in `sandstone/core`.


```ts
MCFunction('hello', () => {...})
```
This line tells Sandstone we want to create a new MCFunction, called `hello`. We do not have to specify the namespace: here, the default namespace will be used. If you want, you can specify the namespace yourself, like you would in Minecraft: `mynamespace:hello`.
Inside the curly brackets `{...}`, we will specify the commands we want to write inside this MCFunction.

*For the moment, you cannot change the default namespace.*

```ts
  say('Hello world!')
```
This line tells Sandstone that we want to write the `/say` command in the current MCFunction, with the `Hello world!` argument. It will result in the command `say Hello world!`.

```ts
saveDatapack('My datapack', {
  verbose: true
})
```
This line tells Sandstone to save the all MCFunctions to the actual file system. Here, the first argument specifies the datapack's name. The second argument is the options. The `verbose` option allows you to display the resulting commands directly in your console, to ensure the result is correct. You'll learn how to save your datapack directly in Minecraft below.

:::info
One day, Sandstone will have its own CLI, and manual saving won't be required anymore.
:::
