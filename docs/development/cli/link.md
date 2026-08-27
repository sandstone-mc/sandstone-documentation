---
id: link
title: Link / Unlink
description: Wire a local library into a consumer without publishing to npm.
sidebar_position: 5
---

# `sand link` / `sand unlink`

`link` and `unlink` work in pairs: one side of the pair runs in the **library** directory, the other in the **consumer** directory. Together they replace a published tarball with a local one so that changes to the library propagate into the consumer on the next build.

## `sand link` — two modes

```bash
# In the library directory — packs the library into a tarball
sand link

# In the consumer directory — installs the tarball as a dependency
sand link ../path/to/library
```

### Library side (no `libraryPath`)

Runs `packLibrary` against the current directory. Detects the package manager from the lockfile, runs `<pm> pack`, moves the resulting tarball into `.sandstone/`, and writes a SHA-256 hash to `.sandstone/link_version`. The hash is what consumers compare against to know when the tarball has changed.

```text
.sandstone/
├── <basename>.tgz      # The packed tarball
└── link_version        # SHA-256 of the tarball
```

The presence of `link_version` is the opt-in signal — `sand watch --library` only repacks a library whose `link_version` exists. Delete it to stop participating in link sync.

### Consumer side (with `libraryPath`)

`linkConsumer` reads the library's `.sandstone/link_version`, removes any existing copy of the package from the consumer's `node_modules`, and installs the tarball via the consumer's package manager. State is recorded in `.sandstone/links.json` (per consumer):

```json
{
  "links": {
    "my-library": {
      "packageName": "my-library",
      "libraryPath": "/abs/path/to/library",
      "tarballPath": "/abs/path/to/library/.sandstone/my-library.tgz",
      "currentHash": "abc123…",
      "previousVersion": "^1.2.0"
    }
  }
}
```

`previousVersion` is captured the first time you link the library so that `sand unlink` can restore it.

Re-running `sand link` is idempotent: if the library hash hasn't changed and the package is already installed, it logs `is already linked and up to date.` and exits.

### Sync on every build

`build` and `watch` call `syncLinkedLibraries` before each build. If any linked library's `link_version` hash has changed since the last sync, the new tarball is reinstalled automatically. A library that was deleted (no `link_version`, no tarball) is dropped from `links.json` with a warning.

## `sand unlink` — two modes

```bash
# In the consumer directory — unlink by name or by path
sand unlink my-library
sand unlink /abs/path/to/library

# In the library directory — remove the local pack artifacts
sand unlink
```

### Consumer side (with `target`)

Removes the linked tarball dep and, if a `previousVersion` was captured, reinstalls the original version spec (e.g. `^1.2.0`). If no `previousVersion` was captured (the package was installed fresh as a tarball), the dep is removed entirely. The entry is deleted from `.sandstone/links.json`.

The target can be either the package name as recorded in `links.json` or the absolute library path.

### Library side (no `target`)

Removes `.sandstone/<basename>.tgz` and `.sandstone/link_version`. Use this when you're done with local development and want the library to act as if it was never linked.

## Limitations

- Linked libraries must be installed via a tarball path; `file:` / `link:` specs in `package.json` are intentionally not treated as previous versions (they can't be restored to).
- A library can be linked into multiple consumers, but each consumer tracks its own `previousVersion`. Restoring after `unlink` is per-consumer, not global.
- The library's `package.json#name` is the key. If you rename the library, run `sand link` again in the consumer to migrate the entry.
