# Sandstone Documentation

Docusaurus-based documentation site for the Sandstone library with interactive code snippets.

## Build Commands

```bash
npm start      # Dev server with hot reload
npm run build  # Production build
npm run serve  # Serve production build locally
```

## Code Snippets

### Regular Snippets (Static)

Standard markdown code blocks - syntax highlighted but not executed:

````md
```ts
import { MCFunction } from 'sandstone'
```
````

Import paths don't need to resolve since the code is never run.

### Interactive Snippets (Live)

Code blocks with the `sandstone` language identifier render as live editors:

````md
```ts sandstone height=200
MCFunction('hello', () => {
  say('Hello world!')
})
```
````

**Important rules for interactive snippets:**
- Do NOT include import statements - they're auto-generated based on detected usage
- Can only use exports from the main `'sandstone'` entry point
- Cannot use subpath imports like `'sandstone/pack'` or deep imports
- The `height` attribute sets the editor height in pixels

## Architecture

### Interactive Snippet Flow

1. `InteractiveSnippet.tsx` wraps the snippet (handles SSR)
2. `InteractiveSnippetClient.tsx` renders when visible (lazy loading)
3. `Editor.tsx` provides Monaco editor with sandstone intellisense
4. On code change (debounced), `detectUsedExports()` finds sandstone identifiers
5. Import statement is auto-generated and prepended
6. `compiler.ts` calls the playground's `compilePack()`
7. `CodeOutput.tsx` displays the generated mcfunction files

### Key Files

| File | Purpose |
|------|---------|
| `src/components/InteractiveSnippet.tsx` | SSR wrapper, lazy loads client component |
| `src/components/InteractiveSnippetClient.tsx` | Editor + output, handles compilation |
| `src/components/Editor.tsx` | Monaco editor with sandstone types |
| `src/components/CodeOutput.tsx` | Displays generated files |
| `src/utils/compiler.ts` | Loads playground and calls `compilePack()` |
| `plugins/get-sandstone-files/` | Loads `.d.ts` files for Monaco intellisense |

### Static Playground Files

The `static/playground/` directory contains pre-built bundles:

| File | Source | Purpose |
|------|--------|---------|
| `main.js` | `sandstone-playground/dist/main.js` | Playground runtime (~15MB) |
| `sandstone.esm.js` | `sandstone/dist/browser/sandstone.esm.js` | Sandstone bundle (~2MB) |

**These files must NOT be processed by any bundler.** The compiler loads them via:
```ts
import(/* webpackIgnore: true */ "/playground/main.js")
```

## Plugin: get-sandstone-files

Located at `plugins/get-sandstone-files/index.js`, this plugin loads sandstone type definitions for Monaco editor intellisense.

**In development:** Reads from local `../sandstone/dist/` if available.

**In production:** Fetches from unpkg using the `@beta` tag:
- Uses `?meta` endpoint to list all `.d.ts` files
- Includes `package.json` files for proper module boundary resolution
- Creates a synthetic root `package.json` with exports field for Monaco

The plugin exposes data via `usePluginData('get-sandstone-files')`:
- `sandstoneFiles`: Array of `[content, fileName]` tuples for Monaco
- `sandstoneExports`: Array of export names for auto-import detection

## Updating Playground Files

When sandstone or playground changes:

```bash
# From workspace root after building sandstone and playground:
cp sandstone/dist/browser/sandstone.esm.js sandstone-documentation/static/playground/
cp sandstone-playground/dist/main.js sandstone-documentation/static/playground/
```

The documentation dev server will hot-reload when these files change.

## Boilerplate Filtering

Interactive snippets filter out boilerplate files from output:
- `load` and `__sandstone__` namespaces
- `__init__` functions
- `minecraft:load` tag

This keeps the output focused on user-created resources.

## Rate Limiting

Compilation is debounced (500ms) and rate-limited (5s between builds) to avoid overwhelming the browser with rapid rebuilds while typing.

## Monaco Recovery

The `MonacoRecoveryContext` handles Monaco editor crashes gracefully, allowing users to continue editing without page reload.
