---
id: installation
title: Installation
description: How to install Sandstone.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The first step is to install [Node.js](https://nodejs.org/en/). You will then need a code editor: I personnaly recommend [Visual Studio Code](https://code.visualstudio.com/Download).

Create an empty folder named "Sandstone Projects": it will contain all your future Sandstone projects. Inside this folder, open a terminal then run the following commands:

<Tabs
  groupId="package-manager"
  defaultValue="npm"
  values={[
    {label: 'Npm', value: 'npm'},
    {label: 'Yarn', value: 'yarn'},
  ]}>
  <TabItem value="npm">

    npm init
  </TabItem>
  <TabItem value="yarn">

    yarn init
  </TabItem>
</Tabs>

Answer the different questions. Then add the needed packages:

<Tabs
  groupId="package-manager"
  defaultValue="npm"
  values={[
    {label: 'Npm', value: 'npm'},
    {label: 'Yarn', value: 'yarn'},
  ]}>
  <TabItem value="npm">

    npm install typescript ts-node sandstone
    npx tsc --init
  </TabItem>
  <TabItem value="yarn">

    yarn add typescript ts-node sandstone
    npx tsc --init
  </TabItem>
</Tabs>

Open the newly created `tsconfig.json` file, and change `"target": "es5"` to `"target": "es2019"`.

You've now installed Sandstone, congratulations!
