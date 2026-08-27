---
id: watch
title: sand watch
description: Build once, then rebuild automatically on file change.
---

# `sand watch`

Like `sand build`, but rebuilds on file change. Provides a terminal UI (Ink + React) showing build status, changed files, and recent logs.

```bash
sand watch
```

## Options

Inherits all [`build` options](./build), plus:

| Flag | Env var | Description |
|------|---------|-------------|
| `-m, --manual` | `WATCH_MANUAL` | Don't rebuild on change. Press `r` or `Enter` to rebuild when ready. |
| `-l, --library` | `WATCH_LIBRARY` | Library mode — watches a library workspace under `test/`, repacks the library on change, and triggers re-link in any consumer that has linked it. |
| `-i, --ignore <globs...>` | `WATCH_IGNORE_PATTERNS` | Extra glob patterns to ignore. Comma-separated values are split. |

## Default ignore patterns

The watcher already ignores:

- `**/.git/**/*`
- `**/.sandstone/**/*`
- `**/resources/cache/**/*`
- `**/*tmp*`
- `**/*.swp`
- `lib/**/*`

Add your own with `--ignore`.

## Triggers

A change rebuilds the pack when the changed file is under `src/`, `resources/`, or ends in `.js`/`.json`/`.ts` (excluding `*.test.ts`).

Changes to these files **restart the process** instead of triggering a hot rebuild (the cached config/sandstone version is no longer valid):

- Any lockfile (`*.lock`, `*-lock.yml`, `*-lock.json`)
- Anything under `node_modules/`
- `sandstone.config.ts`

The debounce window is 200ms; rapid bursts of edits coalesce into a single rebuild.

## Library mode (`--library`)

Designed for the [library template](https://github.com/sandstone-mc/sandstone-template). The CLI watches a `test/` workspace (a small consumer datapack). When source under `test/src/` changes, the library is rebuilt via `bun dev:build` and the test datapack is rebuilt against the new output.

If the library is also linked into another project (via `sand link`), the link tarball is repacked automatically. Consumers running `sand watch` will see their linked library's `link_version` mtime change and trigger their own rebuild.

## Manual mode (`--manual`)

Changes are accumulated and shown in the UI, but no rebuild happens until you press `r` or `Enter`. Useful when a single edit would trigger a large rebuild cascade and you want to batch changes.

## Linked library rebuild

`sand watch` also watches each linked library's `.sandstone/link_version` file. When the library is re-packed (and the file's mtime changes), the consumer rebuild runs and `syncLinkedLibraries` reinstalls the new tarball. The watch on `link_version` is in addition to the parcel watcher, not a replacement for it.

## Recovery

If a build fails because of a parse error in your code, Bun's module cache may need a full reset. The UI surfaces a "Parse error - restart required" state — stop watch and restart it. The CLI cannot recover from this on its own.
