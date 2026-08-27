---
id: install
title: sand install / uninstall / refresh
description: Add official Sandstone libraries or Smithed datapack libraries.
---

# `sand install`

## `sand install native [libs...]` (alias `add native` / `i native`)

Adds a library from the official [sandstone-libraries](https://github.com/sandstone-mc/sandstone-libraries) catalog.

```bash
# Interactive picker
sand install native

# Or specify by catalog name
sand install native block
```

The chosen packages are installed via your package manager (`bun i …`).
