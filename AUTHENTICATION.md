# Authentication Implementation

Feast Finder uses [Convex Auth](https://labs.convex.dev/auth) for secure user authentication with email and password.

## Overview

The authentication system provides:
- User registration (sign-up) with email, password, and name
- User login (sign-in) with email and password
- User logout (sign-out)
- Persistent authentication state across sessions
- Real-time authentication state updates across all pages

## Architecture

### Backend (Convex)

#### Auth Configuration (`convex/auth.config.ts`)
- Provider configuration file required by Convex Auth manual setup
- Contains provider settings (domain, applicationID)

#### Auth Initialization (`convex/auth.ts`)
- Initializes Convex Auth with Password provider
- Exports auth utilities: `auth`, `signIn`, `signOut`, `store`, `isAuthenticated`

#### HTTP Routes (`convex/http.ts`)
- Sets up HTTP endpoints for authentication
- Handles auth callbacks and session management

#### Schema (`convex/schema.ts`)
- Includes auth tables from `@convex-dev/auth/server`
- Stores user credentials and session data

#### User Queries (`convex/users.ts`)
- `getCurrentUser`: Query to get the currently authenticated user
- Returns user info including name and email

### Frontend (React)

#### Provider Setup (`src/router.tsx`)
- Wraps app with `ConvexAuthProvider`
- Provides authentication context to all components

#### Components

##### SignInModal (`src/components/SignInModal.tsx`)
- Modal dialog for authentication
- Switches between sign-in and sign-up modes
- Form validation and error handling
- Integration with Convex Auth actions

##### UserMenu (`src/components/UserMenu.tsx`)
- Dropdown menu for authenticated users
- Displays user name
- Provides sign-out functionality

##### AuthenticatedHeader (in route files)
- Conditionally renders based on auth state
- Shows "Sign In" button when not authenticated
- Shows user menu when authenticated

## User Flow

### Sign Up
1. User clicks "Sign In" button in header
2. Modal opens in sign-in mode
3. User clicks "Don't have an account? Sign up"
4. User enters name, email, and password
5. User clicks "Create Account"
6. System creates user account and signs in
7. Modal closes, user menu appears in header

### Sign In
1. User clicks "Sign In" button in header
2. Modal opens in sign-in mode
3. User enters email and password
4. User clicks "Sign In"
5. System authenticates credentials
6. Modal closes, user menu appears in header

### Sign Out
1. User clicks on their name in header
2. Dropdown menu appears
3. User clicks "Sign Out"
4. System clears session
5. User menu replaced with "Sign In" button

## Implementation Details

### Authentication State Management

The app uses Convex's built-in authentication state management:
- `Authenticated` component: Renders children only when user is signed in
- `Unauthenticated` component: Renders children only when user is signed out
- `useQuery(api.users.getCurrentUser)`: Gets current user data

### Security

- Passwords are hashed using secure algorithms (handled by Convex Auth)
- Sessions are managed securely by Convex
- AUTH_SECRET environment variable must be set in Convex dashboard
- No sensitive data is stored in localStorage or client-side

### Error Handling

The SignInModal component handles:
- Invalid credentials
- Network errors
- Validation errors
- User-friendly error messages

## Setup Instructions

### 1. Install Dependencies

Already included in package.json:
```json
"@convex-dev/auth": "latest",
"@auth/core": "latest"
```

### 2. Generate JWT Keys

Run the following script to generate private and public keys:

```bash
node generateKeys.mjs
```

Create `generateKeys.mjs` with:

```js
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", {
  extractable: true,
});
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

process.stdout.write(
  `JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, " ")}"`,
);
process.stdout.write("\n");
process.stdout.write(`JWKS=${jwks}`);
process.stdout.write("\n");
```

Copy the entire output.

### 3. Configure Convex Dashboard

1. Go to Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add the following variables:
   - `JWT_PRIVATE_KEY` - Paste from script output
   - `JWKS` - Paste from script output
   - `SITE_URL` (optional, only needed for OAuth, not passwords)

### 4. Regenerate Types

After setting up environment variables:
```bash
npx convex codegen
```

This will generate proper TypeScript types for auth-related functions.

### 5. Test Authentication

1. Start the dev server: `npm run dev`
2. Click "Sign In" button
3. Switch to "Sign up" mode
4. Create a test account
5. Verify user menu appears
6. Test sign out

## Extending Authentication

### Adding OAuth Providers

To add OAuth (Google, GitHub, etc.):

1. Install provider package:
   ```bash
   npm install @auth/core
   ```

2. Update `convex/auth.ts`:
   ```typescript
   import { GitHub } from '@convex-dev/auth/providers/GitHub'
   
   export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
     providers: [Password, GitHub],
   })
   ```

3. Configure OAuth credentials in Convex dashboard

### Adding User Profile Data

To store additional user data:

1. Update the user query in `convex/users.ts`:
   ```typescript
   export const getCurrentUser = query({
     args: {},
     returns: v.union(
       v.object({
         _id: v.id('users'),
         name: v.optional(v.string()),
         email: v.optional(v.string()),
         // Add custom fields
         avatar: v.optional(v.string()),
         bio: v.optional(v.string()),
       }),
       v.null(),
     ),
     handler: async (ctx) => {
       const userId = await auth.getUserId(ctx)
       if (!userId) return null
       return await ctx.db.get(userId)
     },
   })
   ```

2. Update signup to include custom fields

### Protecting Routes

To require authentication for specific pages:

1. Add auth check in route loader:
   ```typescript
   export const Route = createFileRoute('/protected')({
     beforeLoad: async ({ context }) => {
       const user = await context.queryClient.ensureQueryData(
         convexQuery(api.users.getCurrentUser, {})
       )
       if (!user) {
         throw redirect({ to: '/', search: { signIn: true } })
       }
     },
     component: ProtectedPage,
   })
   ```

## Troubleshooting

### "AUTH_SECRET is not set" Error

**Solution**: Set AUTH_SECRET in Convex Dashboard → Settings → Environment Variables

### User data not loading

**Solution**: 
1. Check Convex dashboard for errors
2. Run `npx convex codegen`
3. Verify `api.users.getCurrentUser` exists in generated API

### Sign-in not working

**Checklist**:
- [ ] AUTH_SECRET is set in Convex dashboard
- [ ] Convex dev server is running
- [ ] No console errors in browser
- [ ] Network tab shows successful auth requests

### Types not working

**Solution**: Run `npx convex codegen` to regenerate TypeScript types

## Resources

- [Convex Auth Documentation](https://docs.convex.dev/auth/convex-auth)
- [Convex Labs: Password Auth](https://labs.convex.dev/auth/config/passwords)
- [Convex Auth GitHub](https://github.com/get-convex/convex-auth)
