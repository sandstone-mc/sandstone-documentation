---
id: config
title: Configuration
description: "How to configure Sandstone: everything you need to know about sandstone.config.ts."
---

## Introduction
Sandstone comes with a `sandstone.config.ts` file, used to configure the resulting datapack and, sometimes, resource pack.

Most fields are well documented by the JSDoc and/or self-explanatory, this provides some more detailed explanations.

### `onConflict`
The strategy to use when 2 resources of the same type (Advancement, MCFunctions...) have the same name.

For example:
```ts
{
  default: 'warn',

  tags: 'append', // Append contents of all colliding group tags
}
```

## Save Options
Under the `saveOptions` key, define details for the output of the packs.

### `customFileHandler`
A custom handler for saving all files. If specified, files won't be saved anymore, you will have to handle that yourself.

For example:
```ts
async (relativePath: string, content: any, contentSummary: string) => {
  if (relativePath.endsWith('.mcfunction')) {
    await fs.writeFile(path.join('.sandstone/output', relativePath), `# Bob's Pack @ 2023\n${content}`)
  } else {
    fs.writeFile(path.join('.sandstone/output', relativePath), content)
  }
}
```

## Scripts
Under the `scripts` key, define custom behavior during the output of packs.

For example:
```ts
scripts: {
  afterAll: async () => {
    await fs.writeFile('.sandstone/output/datapack/LICENSE', 'Bob\'s Pack @ 2023')
  }
}
```

## Handling resource contents without having write the files
```ts
resources: {
  handle: [{
    path: new RegExp(/.mcfunction$/)

    callback: async (contents) => new Buffer(`# Bob's Pack @ 2023\n${contents}`)
  }]
}
```