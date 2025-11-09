# Convex Code Generation Note

## Important: Generated Files

The file `convex/_generated/api.d.ts` is an auto-generated file that should be created by running:

```bash
npx convex codegen
```

or

```bash
npx convex dev --local --once
```

## Current State

Due to the sandboxed development environment limitations (no network access and no authentication), the Convex codegen commands cannot be executed automatically. The `convex/_generated/api.d.ts` file has been manually updated to include the `seedData` module to allow the code to compile.

## Action Required

When you pull this PR and work with it locally, please run:

```bash
npx convex dev --local --once
```

This will properly regenerate all files in `convex/_generated/` including:

- `api.d.ts` - API types
- `dataModel.d.ts` - Data model types
- `server.d.ts` - Server types

The manually updated file should match what Convex generates, but running the official codegen ensures everything is properly synchronized.

## Files Affected

- `convex/_generated/api.d.ts` - Manually updated to include seedData module
- `convex/seedData.ts` - New file with seedRestaurants mutation
- `convex/myFunctions.ts` - Removed seedRestaurants (moved to seedData.ts)
- `src/routes/index.tsx` - Updated to use api.seedData.seedRestaurants
