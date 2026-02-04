---
id: installation
title: Installation
description: How to install Sandstone.
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Locally

:::note
All snippets of this documentation can be edited, and you can preview the resulting data pack. If you want to quickly see what Sandstone can offer, **there is no need to install anything.** Just edit the snippets, and see the results in live.

If you want to use Sandstone to create data packs, a local installation will be necessary.
:::

The first step is to install [Bun](https://bun.com/). Node.js is not officially supported anymore.

You will then need a code editor: I personally recommend [Visual Studio Code](https://code.visualstudio.com/Download).

Create an empty folder named "Sandstone Projects": it will contain all your future Sandstone projects. Inside this folder, open a terminal then run the following command:

```batch
bun i -g sandstone-cli
sand create <my-project>
```

:::note
Replace `<my-project>` with your project's name. It will only be the name of the project folder, not the name of the data pack.

Example: `sand create my-first-sandstone-project`
:::

Answer the different questions. Congratulations, you created your first Sandstone project!

To build the data pack, run the following command:
<Tabs
  groupId="package-manager"
  defaultValue="bun"
  values={[
    {label: 'Bun', value: 'bun'},
    {label: 'Sand', value: 'sand'},
    {label: 'Pnpm', value: 'pnpm'},
    {label: 'Npm', value: 'npm'},
]}>
<TabItem value="bun">

```batch
bun dev:build
```
</TabItem>
<TabItem value="sand">

```batch
sand build
```
</TabItem>
<TabItem value="pnpm">

```batch
pnpm dev:build
```
</TabItem>
<TabItem value="npm">

```batch
npm run dev:build
```
</TabItem>
</Tabs>

The downside of `build` is that it only builds your data pack once. To build then rebuild on each change, run `watch` instead:
<Tabs
  groupId="package-manager"
  defaultValue="bun"
  values={[
    {label: 'Bun', value: 'bun'},
    {label: 'Sand', value: 'sand'},
    {label: 'Pnpm', value: 'pnpm'},
    {label: 'Npm', value: 'npm'},
]}>
<TabItem value="bun">

```batch
bun dev:watch
```
</TabItem>
<TabItem value="sand">

```batch
sand watch
```
</TabItem>
<TabItem value="pnpm">

```batch
pnpm dev:watch
```
</TabItem>
<TabItem value="npm">

```batch
npm run dev:watch
```
</TabItem>
</Tabs>
