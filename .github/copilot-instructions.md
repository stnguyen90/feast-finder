# Feast Finder - Copilot Instructions

## Overview

Full-stack web app using React 19, TanStack Start (SSR framework), Convex (serverless backend), and Tailwind CSS v4. ~24 files, ~1,870 LOC, TypeScript only, Node.js v22, Vite 7, deployed to Netlify.

## Project Structure

```
.github/workflows/copilot-setup-steps.yml  # CI: runs lint + build
convex/                  # Backend serverless functions
  myFunctions.ts         # Queries, mutations, actions
  schema.ts              # Database schema
  _generated/            # Auto-generated (DON'T EDIT)
src/
  routes/                # File-based routing
    __root.tsx           # Root layout
    index.tsx            # Homepage (/)
    anotherPage.tsx      # /anotherPage
  styles/app.css         # Global Tailwind styles
  router.tsx             # Router + Convex config
  routeTree.gen.ts       # Auto-generated (DON'T EDIT)
dist/                    # Build output
eslint.config.mjs        # ESLint (TanStack + Convex)
tsconfig.json            # TS config (root + convex/)
vite.config.ts           # Vite config
.prettierrc              # no semicolons, single quotes, trailing commas
```

## Commands (Node.js v22 required)

### Installation

```bash
npm ci  # ALWAYS use in CI for reproducibility
# Note: CI uses 'npm ci --force' to handle platform-specific optional dependencies
```

### Critical Pre-PR Commands (MUST pass)

```bash
npm run lint   # tsc + eslint (~5-10s)
npm run build  # vite build + tsc --noEmit (~10-15s)
```

**Output:** `dist/client/`, `dist/server/`, `.netlify/v1/functions/server.mjs`

### Formatting

```bash
npm run format  # prettier --write . (if lint fails on style)
```

### Development

```bash
npm run dev    # Convex dev + Vite (port 3000)
```

**Note:** Requires Convex setup (first run: `npx convex dev`, creates `.env.local` with `VITE_CONVEX_URL`). Will fail if not configured (expected).

### Production Server

```bash
npm run start  # netlify dev (runs local Netlify dev server)
```

**Note:** Runs the Netlify dev server locally. Requires build to be completed first.

## CI/CD (GitHub Actions)

**File:** `.github/workflows/copilot-setup-steps.yml`

1. Checkout
2. Setup Node.js v22 + npm cache
3. `npm ci --force` (uses --force to handle platform-specific Rollup dependencies)
4. `npm run lint`
5. `npm run build`

**Your PR must pass lint + build.**

## Architecture

### Frontend

- React 19 + TanStack Router (file-based routing)
- TanStack Query + Convex React Query adapter
- Tailwind CSS v4 (utility-first, configured via Vite plugin)
- Path alias: `~/` → `./src/`

### Backend (Convex)

- Functions in `convex/` directory
- **Queries**: Read data (`useSuspenseQuery(convexQuery(api.myFunctions.listNumbers, {...}))`)
- **Mutations**: Write data (`useMutation(api.myFunctions.addNumber)`)
- **Actions**: External APIs (`useAction(api.myFunctions.myAction)`)
- Schema: `convex/schema.ts`
- Auto-generated types: `convex/_generated/api`

### Key Patterns

1. **File-based routing**: Files in `src/routes/` → auto-discovered routes
2. **Real-time sync**: Convex queries auto-update across all clients
3. **SSR**: TanStack Start handles server-side rendering
4. **Deployment**: Netlify serverless functions

## TypeScript Config

- **Root** (`tsconfig.json`): ES2022, strict, noEmit, path aliases
- **Convex** (`convex/tsconfig.json`): ESNext, DOM libs, separate config

## Common Issues & Solutions

### "Cannot find module 'convex/\_generated/api'"

**Fix:** Run `npx convex dev` once to generate types. Or ensure Convex is configured in CI.

### Lint failures

**Fix:** Run `npm run format` first, then `npm run lint`. Address remaining type errors manually.

### Build fails with TS errors

**Fix:** Check error messages. Common: missing return types, incorrect props, avoid `any` type.

### Dev server hangs

**Fix:** Run `npx convex dev` interactively once. Creates `.env.local` with Convex credentials.

## Working with Code

### Add New Route

1. Create `src/routes/myPage.tsx`
2. Export route: `export const Route = createFileRoute('/myPage')({ component: MyPage })`
3. Build auto-regenerates `routeTree.gen.ts`
4. Link: `<Link to="/myPage">...</Link>`

### Add Convex Function

1. Add to `convex/myFunctions.ts` as `query()`, `mutation()`, or `action()`
2. Run `npx convex dev` to regen types
3. Use: `api.myFunctions.functionName`

### Modify Styles

- Global: Edit `src/styles/app.css`
- Components: Use Tailwind utility classes
- No `tailwind.config.js` needed (v4 via Vite plugin)

## Pre-Completion Checklist

Before marking task complete:

1. ✅ `npm run format` - Auto-format code
2. ✅ `npm run lint` - Must exit 0
3. ✅ `npm run build` - Must exit 0
4. ✅ No manual edits to `routeTree.gen.ts` or `convex/_generated/*`
5. ✅ Don't commit: `node_modules/`, `.netlify/`, `.env.local`
6. ✅ **Take screenshots**: For any UI changes, take screenshots and include them in the PR description

## Files You Should Never Edit

- `src/routeTree.gen.ts` (TanStack Router auto-gen)
- `convex/_generated/*` (Convex auto-gen)

## Gitignored (Build Artifacts)

`node_modules/`, `dist/`, `.netlify/`, `.output/`, `.tanstack/`, `.env.local`

## Troubleshooting Quick Reference

| Issue                  | Solution                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| Lint style errors      | `npm run format` then `npm run lint`                                     |
| Missing Convex types   | `npx convex dev` (once)                                                  |
| Build TS errors        | Fix types, check return types, avoid `any`                               |
| Dev server won't start | Setup Convex: `npx convex dev` → creates `.env.local`                    |
| CI failing             | Ensure passes locally: `npm ci --force && npm run lint && npm run build` |

## Trust These Instructions

These instructions are validated by running all commands. Follow them precisely. Only search codebase if info is incomplete or incorrect. Don't waste time exploring what's documented here.
