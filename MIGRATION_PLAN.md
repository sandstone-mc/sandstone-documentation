# Documentation & Playground Migration Plan (Beta 5)

Once sandstone beta 5 is published with the browser bundle (`sandstone.esm.js`), follow these steps to migrate from vendored files to the published packages.

## Published Packages

Both packages are published to npm and available via unpkg:

| Package | npm | Current Version | Local Version |
|---------|-----|-----------------|---------------|
| `sandstone` | `sandstone@beta` | 1.0.0-beta.4 | 1.0.0-beta.5 (pending) |
| `@sandstone-mc/playground` | `@sandstone-mc/playground` | 0.2.2 | 0.3.0 (pending) |

## Current State (Vendored)

The interactive snippets currently use vendored files in `static/playground/`:
- `sandstone.esm.js` - Browser bundle built from sandstone with fix-esm-init-order
- `main.js` - Playground runtime that loads sandstone externally

These were necessary because:
- Beta 4 didn't include the browser bundle
- Playground 0.2.2 doesn't have the external sandstone loading feature

## Prerequisites

Before migration, publish both packages:

### 1. Publish Sandstone Beta 5

```bash
cd sandstone
# Ensure browser bundle is built
bun run build
# Verify dist/browser/sandstone.esm.js exists
ls -la dist/browser/
# Publish
npm publish --tag beta
```

Verify on unpkg: `https://unpkg.com/sandstone@beta/dist/browser/sandstone.esm.js`

### 2. Publish Playground 0.3.0

```bash
cd sandstone-playground
# Update sandstone dependency
bun install sandstone@1.0.0-beta.5
# Build
bun run build
# Publish
npm publish
```

Verify on unpkg: `https://unpkg.com/@sandstone-mc/playground@0.3.0/dist/main.js`

## Migration Steps

### 1. Update get-sandstone-files Plugin

Edit `plugins/get-sandstone-files/index.js`:

**Current behavior:** Fetches `.d.ts` files from unpkg for Monaco intellisense.

**Add:** Also expose URLs for the runtime bundles.

```js
// In the plugin's loadContent():
const playgroundUrl = 'https://unpkg.com/@sandstone-mc/playground@latest/dist/main.js'
const browserBundleUrl = 'https://unpkg.com/sandstone@beta/dist/browser/sandstone.esm.js'

return {
  sandstoneFiles,
  sandstoneExports,
  playgroundUrl,      // NEW
  browserBundleUrl,   // NEW
}
```

### 2. Update Compiler to Use Published Bundles

Edit `src/utils/compiler.ts`:

**Current:** Loads from `/playground/main.js` and `/playground/sandstone.esm.js`

**Change to:** Load from unpkg URLs (passed from plugin data)

```ts
// Get URLs from plugin data
const { playgroundUrl, browserBundleUrl } = usePluginData('get-sandstone-files')

// Load playground from unpkg
const lib = await import(/* webpackIgnore: true */ playgroundUrl)

// Configure sandstone path
lib.configure({ sandstonePath: browserBundleUrl })
```

### 3. Remove Vendored Files

Once the above changes work:

```bash
rm -rf sandstone-documentation/static/playground/
```

The entire `static/playground/` directory can be removed since both bundles are fetched from unpkg.

### 4. Update CLAUDE.md

Edit `sandstone-documentation/CLAUDE.md`:

- Remove "Static Playground Files" section
- Document that bundles are fetched from unpkg
- Update architecture diagram

### 5. Update docusaurus.config.ts (if needed)

Ensure the static directory isn't required for the build to succeed.

## Testing Checklist

- [ ] Interactive snippets load without errors
- [ ] Monaco intellisense shows sandstone types
- [ ] Code compilation works (generates mcfunction output)
- [ ] TypeScript errors block compilation correctly
- [ ] Multiple snippets on same page work independently
- [ ] Dev server works (`npm start`)
- [ ] Production build works (`npm run build && npm run serve`)
- [ ] No console errors about missing modules
- [ ] First load performance is acceptable (unpkg cold start)

## Version Pinning Strategy

For production stability:

| Package | Recommended Tag | Why |
|---------|-----------------|-----|
| `sandstone` | `@beta` or specific version | `@beta` auto-updates, specific version is stable |
| `@sandstone-mc/playground` | `@latest` or specific version | Playground changes less frequently |

Example pinned URLs:
```
https://unpkg.com/sandstone@1.0.0-beta.5/dist/browser/sandstone.esm.js
https://unpkg.com/@sandstone-mc/playground@0.3.0/dist/main.js
```

## Rollback Plan

If issues arise after migration:

1. Re-create `static/playground/` directory
2. Copy vendored files back:
   ```bash
   cp sandstone/dist/browser/sandstone.esm.js sandstone-documentation/static/playground/
   cp sandstone-playground/dist/main.js sandstone-documentation/static/playground/
   ```
3. Revert compiler.ts to use local paths
4. Investigate and fix before trying again

## Future Considerations

- **Service Worker caching:** Could cache unpkg responses for offline/faster loads
- **Build-time bundling:** Could fetch and embed during `npm run build` for zero runtime fetches
- **Fallback strategy:** Load from unpkg, fall back to vendored if CDN fails
