---
id: first-function
title: Your First Function
description: Write your first Sandstone function.
hide_table_of_contents: true
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { InteractiveSnippet } from '../../src/components'

Let's write your first Minecraft function. Start VSCode, and open the project folder. In the `src` directory, create a new file named `helloworld.ts`, with the following content:

<InteractiveSnippet height={140} filename="helloworld.ts" baseImports={['MCFunction', 'say']} code={`
MCFunction('hello', () => {
  say('Hello world!')
})
`} />

:::note Hints
• You can delete the `display.ts` file.<br />
• You can change the above code, and see the result in live.
:::

## Building the data pack

To build the data pack, type the following command in your terminal:

<Tabs
  groupId="package-manager"
  defaultValue="npm"
  values={[
    {label: 'Npm', value: 'npm'},
    {label: 'Yarn', value: 'yarn'},
    {label: 'Sand', value: 'sand'},
]}>
<TabItem value="npm">

```batch
npm run watch -- --verbose
```
</TabItem>
<TabItem value="yarn">

```batch
yarn watch --verbose
```
</TabItem>

<TabItem value="sand">

```batch
sand watch --verbose
```
</TabItem>
</Tabs>


This will build the data pack, rebuild on each change, and will log the results each time the data pack is built. The `--verbose` option logs the result in your console.

First, you should see the following output in your console:
```mcfunction
## Function default:hello
say Hello world!
```

You can check the resulting data pack, which will be built in the folder you specified when creating the project. As you can see, it is a valid data pack. Try opening a world and run your first function!

:::note
If you forgot where you saved your data pack, or want to change the location, you can modify the `saveOptions` specified in `sandstone.config.ts`.
:::


## Explanation
Let's do a line-by-line explanation.

```ts
import { say, MCFunction } from 'sandstone'
```
This line tells Sandstone what we need to use. Here, we need one command, `say`, and one Sandstone resource, `MCFunction`.


```ts
MCFunction('hello', () => {...})
```
This line tells Sandstone we want to create a new MCFunction, called `hello`. We do not have to specify the namespace: here, the default namespace will be used. If you want, you can specify the namespace yourself, like you would in Minecraft: `mynamespace:hello`.
Inside the curly brackets `{...}`, we will specify the commands we want to write inside this MCFunction.

```ts
  say('Hello world!')
```
This line tells Sandstone that we want to write the `/say` command in the current MCFunction, with the `Hello world!` argument. It will result in the command `say Hello world!`.


