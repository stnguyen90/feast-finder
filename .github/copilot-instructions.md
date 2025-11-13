# Feast Finder - Copilot Instructions

## Overview

Full-stack restaurant discovery app using React 19, TanStack Start (SSR framework), Convex (serverless backend), React Leaflet (maps), and Tailwind CSS v4. TypeScript only, Node.js v22, Vite 7, deployed to Netlify.

**App Purpose:** Interactive map-based restaurant explorer showing 10 SF Bay Area restaurants with detailed views.

## Project Structure

```
.github/workflows/copilot-setup-steps.yml  # CI: runs lint + build
convex/                  # Backend serverless functions
  myFunctions.ts         # Restaurant queries and mutations
  seedData.ts            # Sample restaurant data seeding
  schema.ts              # Database schema (restaurants table)
  _generated/            # Auto-generated (DON'T EDIT - use npx convex codegen)
src/
  components/            # React components
    RestaurantMap.tsx    # Interactive Leaflet map (client-only)
    RestaurantDetail.tsx # Restaurant detail modal
  routes/                # File-based routing
    __root.tsx           # Root layout
    index.tsx            # Homepage with map
  styles/app.css         # Global Tailwind styles
  router.tsx             # Router + Convex config
  routeTree.gen.ts       # Auto-generated (DON'T EDIT)
README.md                # Project overview and setup
IMPLEMENTATION.md        # Technical implementation details
UI-DESIGN.md             # UI/UX design specification
CODEGEN_NOTE.md          # Convex codegen instructions
dist/                    # Build output
```

## Documentation Files

**For Developers:**

- **README.md** - User-facing: features, setup, tech stack, sample data
- **IMPLEMENTATION.md** - Technical details: components, backend, user flow
- **UI-DESIGN.md** - Design spec: layout, colors, typography, interactions
- **CODEGEN_NOTE.md** - Important note about regenerating Convex types

**CRITICAL: When making ANY code changes, you MUST update the relevant documentation files:**

- Features/tech stack changes → README.md
- Component architecture changes → IMPLEMENTATION.md
- UI/styling changes → UI-DESIGN.md
- Convex schema/functions changes → may need CODEGEN_NOTE.md updates
- Authentication changes → AUTHENTICATION.md
- Geospatial/location changes → GEOSPATIAL.md

**Documentation is NOT optional. It MUST be kept synchronized with code at all times.**

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
- React Leaflet for interactive maps (client-only rendering)
- Tailwind CSS v4 (utility-first, configured via Vite plugin)
- Path alias: `~/` → `./src/`

### Backend (Convex)

- Functions in `convex/` directory
- **Queries**: Read data (`useSuspenseQuery(convexQuery(api.myFunctions.listRestaurants, {}))`)
- **Mutations**: Write data (`useMutation(api.seedData.seedRestaurants)`)
- **Schema**: `convex/schema.ts` defines `restaurants` table with rating, coordinates, categories, meal times, prices
- Auto-generated types: `convex/_generated/api` (regenerate with `npx convex codegen`)

### Key Patterns

1. **File-based routing**: Files in `src/routes/` → auto-discovered routes
2. **Real-time sync**: Convex queries auto-update across all clients
3. **SSR**: TanStack Start handles server-side rendering
4. **Client-only maps**: Leaflet loaded dynamically in `useEffect` to avoid SSR issues
5. **Auto-seeding**: Homepage auto-seeds restaurant data on first load if DB is empty
6. **Deployment**: Netlify serverless functions

## Restaurant App Specifics

**Data Flow:**

1. User visits homepage → `index.tsx`
2. Query `api.myFunctions.listRestaurants` via Convex
3. If empty, auto-trigger `api.seedData.seedRestaurants` mutation
4. Render `RestaurantMap` with markers (client-only)
5. Click marker → open `RestaurantDetail` modal

**Important Notes:**

- Map only renders client-side (SSR would crash with Leaflet)
- Sample data: 10 SF Bay Area restaurants with full details
- Schema includes: rating, coordinates, URLs, categories, meal times, prices

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

### SSR/Window errors with Leaflet

**Fix:** Map component already handles SSR. Ensure Leaflet imports stay inside `useEffect` with dynamic imports. See `RestaurantMap.tsx` for reference.

## Working with Code

### Current App Structure

**Feast Finder** displays restaurants on an interactive map. Key files:

- `convex/schema.ts` - Restaurant data model with all required fields
- `convex/myFunctions.ts` - Restaurant queries (list, get, add)
- `convex/seedData.ts` - Sample SF Bay Area restaurant data
- `src/components/RestaurantMap.tsx` - Client-only map with markers
- `src/components/RestaurantDetail.tsx` - Restaurant info modal
- `src/routes/index.tsx` - Homepage with map and auto-seeding

### Add New Route

1. Create `src/routes/myPage.tsx`
2. Export route: `export const Route = createFileRoute('/myPage')({ component: MyPage })`
3. Build auto-regenerates `routeTree.gen.ts`
4. Link: `<Link to="/myPage">...</Link>`

### Add Convex Function

1. Add to `convex/myFunctions.ts` or new file as `query()`, `mutation()`, or `action()`
2. Run `npx convex codegen` to regenerate types (see CODEGEN_NOTE.md)
3. Use: `api.myFunctions.functionName`

### Modify Styles

- Global: Edit `src/styles/app.css`
- Components: Use Tailwind utility classes
- No `tailwind.config.js` needed (v4 via Vite plugin)
- **ALWAYS ensure text is readable in BOTH dark mode AND light mode**
  - Test color contrast in both modes
  - Use semantic color tokens that adapt (e.g., `text-gray-900 dark:text-gray-100`)
  - Avoid hardcoded colors that only work in one mode

## Pre-Completion Checklist

Before marking task complete:

1. ✅ `npm run format` - Auto-format code
2. ✅ `npm run lint` - Must exit 0
3. ✅ `npm run build` - Must exit 0
4. ✅ No manual edits to `routeTree.gen.ts` or `convex/_generated/*`
5. ✅ Run `npx convex codegen` after Convex changes (if possible)
6. ✅ Don't commit: `node_modules/`, `.netlify/`, `.env.local`
7. ✅ **Take screenshots**: For any UI changes, take screenshots and include them in the PR description
8. ✅ **ALWAYS update ALL relevant markdown files** when code changes:
   - README.md: Features, tech stack, setup instructions, sample data
   - IMPLEMENTATION.md: Components, backend functions, user flow, technical details
   - UI-DESIGN.md: Layout, colors, typography, interactions, visual design
   - AUTHENTICATION.md: Auth setup, configuration, user flow (if auth changes)
   - GEOSPATIAL.md: Geospatial queries, indexing (if location features change)
   - Other relevant docs: Keep all documentation synchronized with code changes
9. ✅ **Verify dark/light mode**: Ensure all text and UI elements are readable in both color modes

## Files You Should Never Edit

- `src/routeTree.gen.ts` (TanStack Router auto-gen)
- `convex/_generated/*` (Convex auto-gen - use `npx convex codegen` instead)

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
