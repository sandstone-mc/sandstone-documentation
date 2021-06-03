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

The first step is to install [Node.js](https://nodejs.org/en/). You will then need a code editor: I personnaly recommend [Visual Studio Code](https://code.visualstudio.com/Download).

Create an empty folder named "Sandstone Projects": it will contain all your future Sandstone projects. Inside this folder, open a terminal then run the following commands:

```batch
npx sandstone-cli@latest create <my-project>
```

:::note
Replace `<my-project>` with your project's name. It will only be the name of the project folder, not the name of the data pack.

Example: `npx sandstone-cli@latest create my-first-sandstone-project`
:::

Answer the different questions. Congratulations, you created your first Sandstone project!

To build the data pack, run the following command:
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
npm run build
```
</TabItem>
<TabItem value="yarn">

```batch
yarn build
```
</TabItem>

<TabItem value="sand">

```batch
sand build
```
</TabItem>
</Tabs>

The downside of `build` is that it only builds your data pack once. To build then rebuild on each change, run `watch` instead:
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
npm run watch
```
</TabItem>
<TabItem value="yarn">

```batch
yarn watch
```
</TabItem>

<TabItem value="sand">

```batch
sand watch
```
</TabItem>
</Tabs>
