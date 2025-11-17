# Convex Code Generation Note

## Important: Generated Files

The files in `convex/_generated/` are auto-generated and should not be manually edited. They are created by running:

```bash
npx convex codegen
```

or when starting the development server:

```bash
npx convex dev
```

## When to Run Codegen

You **must** run codegen after:
- Adding or modifying any Convex functions (queries, mutations, actions)
- Changing the database schema in `convex/schema.ts`
- Adding new files to the `convex/` directory
- Configuring new Convex components (geospatial, autumn, auth, etc.)
- Updating environment variables that affect components

## Generated Files

Running codegen will regenerate:

- `api.d.ts` - API types for all public functions
- `api.js` - API exports
- `dataModel.d.ts` - Data model types for database tables
- `server.d.ts` - Server types for Convex functions
- `server.js` - Server exports

## Development Workflow

1. Make changes to Convex functions or schema
2. Run `npx convex dev` (auto-generates types) or `npx convex codegen` manually
3. TypeScript will now recognize your new functions and types
4. Import and use them in your React components

## Troubleshooting

### "Cannot find module 'convex/_generated/api'" error

**Fix:** Run `npx convex dev` to start the Convex development server and generate types.

### Types are outdated after schema changes

**Fix:** Run `npx convex codegen` to regenerate types.

### Component types not available (e.g., autumn, geospatial)

**Fix:** 
1. Ensure component is registered in `convex/convex.config.ts`
2. Ensure required environment variables are set (e.g., `AUTUMN_SECRET_KEY`)
3. Run `npx convex dev` or `npx convex codegen`
4. Restart your development server

## Note on Manual Edits

**Do NOT** manually edit files in `convex/_generated/`. Any manual changes will be overwritten when codegen runs. The Convex CLI generates these files based on your actual code and schema.
