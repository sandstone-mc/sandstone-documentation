---
id: dependencies
title: Dependencies
description: How to use Smithed or Sandstone libraries in your projects.
---

To minimize boilerplate & compatibility concerns, pack authors will often want to use others code in their projects.

This is well supported in Sandstone, via the CLI command, `sand install`

```bash
# Lists top 25 Smithed libraries to select ones to install.
sand i vanilla
sand add vanilla
sand install vanilla

# Installs the crafter library from Smithed
sand i vanilla crafter
sand add vanilla crafter
sand install vanilla crafter

# Lists all installed Smithed libraries to select ones to remove.
sand remove
sand uninstall

# Removes the crafter library
sand remove crafter
sand uninstall crafter

# Installs the official Block library from the Sandstone library repository
sand install native block
pnpm i @sandstone-mc/block

# Removes the library
pnpm uninstall @sandstone-mc/block
```

Smithed dependencies will be stored in `resources/cache/`, the list of which in `resources/smithed.json`.