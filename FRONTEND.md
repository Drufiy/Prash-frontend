# Prash by Drufiy — Frontend Reference

> Internal engineering reference. Product: Prash by Drufiy — autonomous CI/CD repair agent.
> Tagline: "Your CI never breaks twice."

---

## 1. Tech Stack

| Package | Version | Role |
|---|---|---|
| react | 19.2.5 | UI framework |
| react-dom | 19.2.5 | DOM renderer |
| vite | 8.0.10 | Build tool and dev server |
| typescript | 6.0.2 | Type checker |
| tailwindcss | 4.2.4 | Utility CSS (v4, CSS-first config) |
| @tailwindcss/vite | 4.2.4 | Vite plugin for Tailwind v4 |
| @vitejs/plugin-react | 6.0.1 | JSX transform |
| react-router-dom | 7.14.2 | Client-side routing |
| @tanstack/react-query | 5.100.5 | Server state and caching |
| @supabase/supabase-js | 2.104.1 | Supabase client (Realtime only) |
| date-fns | 4.1.0 | Date formatting |
| lucide-react | 1.11.0 | Icon library |
| sonner | 2.0.7 | Toast notifications |
| react-syntax-highlighter | 16.1.1 | Code highlighting in RunDetail |
| class-variance-authority | 0.7.1 | shadcn/ui component variants |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.5.0 | Merge Tailwind classes without conflicts |
| cmdk | 1.1.1 | Command palette primitive (installed, not visibly used in pages) |
| radix-ui | 1.4.3 | Radix UI meta-package |
| @radix-ui/react-alert-dialog | 1.1.15 | Alert Dialog primitive |
| @radix-ui/react-avatar | 1.1.11 | Avatar primitive |
| @radix-ui/react-dialog | 1.1.15 | Dialog primitive |
| @radix-ui/react-dropdown-menu | 2.1.16 | Dropdown primitive |
| @radix-ui/react-label | 2.1.8 | Label primitive |
| @radix-ui/react-separator | 1.1.8 | Separator primitive |
| @radix-ui/react-slot | 1.2.4 | Slot primitive (Button `asChild`) |
| @radix-ui/react-tabs | 1.1.13 | Tabs primitive |
| @radix-ui/react-tooltip | 1.2.8 | Tooltip primitive |
| autoprefixer | 10.5.0 | PostCSS autoprefixer (devDep) |
| postcss | 8.5.10 | PostCSS (devDep, present but Tailwind v4 uses Vite plugin path) |

---

## 2. Project Structure

```
d:/Drufiy/Prash-frontend/
├── index.html                  # SPA entry point
├── vite.config.ts              # Vite config (react + tailwindcss plugins, @ alias)
├── tailwind.config.js          # Effectively empty — v4 uses CSS @import
├── vercel.json                 # SPA rewrite rule
├── package.json
├── src/
│   ├── main.tsx                # App entry: QueryClient, TooltipProvider, Toaster
│   ├── App.tsx                 # Router tree, AuthProvider wrapper
│   ├── index.css               # Tailwind @import, CSS variables (dark theme), custom utilities
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state (user, jwt, login, logout)
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Login.tsx
│   │   ├── AuthCallback.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Repos.tsx
│   │   ├── Failures.tsx
│   │   ├── History.tsx
│   │   ├── RunDetail.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── AppLayout.tsx       # Sidebar + Outlet wrapper for protected routes
│   │   ├── ProtectedRoute.tsx  # Auth guard component
│   │   └── ui/                 # shadcn/ui components (Radix + CVA wrappers)
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   └── lib/
│       ├── api.ts              # HTTP client with JWT injection and demo-mode bypass
│       ├── supabase.ts         # Supabase client (real or stub, depending on demo mode)
│       ├── utils.ts            # `cn()` helper
│       ├── statusBadge.ts      # Status → display label + Tailwind class mapping
│       └── demoMode.ts         # Demo mode detection, mock data, mock API router
```

### src/pages/ — Routes and Descriptions

| File | Route | Description |
|---|---|---|
| Landing.tsx | `/` | Public marketing page: hero, agents overview, how-it-works preview, CTA, footer. Redirects authenticated users to `/dashboard`. |
| HowItWorks.tsx | `/how-it-works` | Static deep-dive: 5-step pipeline walkthrough, architecture diagram, capabilities grid, FAQ. No auth required. |
| Login.tsx | `/login` | GitHub OAuth entry point. Constructs the authorization URL and renders a single "Continue with GitHub" button. Redirects authenticated users to `/dashboard`. |
| AuthCallback.tsx | `/auth/callback` | Exchanges the `?code=` from GitHub for a JWT by POSTing to the backend. Stores token and navigates to `/dashboard`. |
| Dashboard.tsx | `/dashboard` | Summary stat cards (engineering hours saved, failures diagnosed, PRs created, verified fixes) plus a 5-row recent activity feed. Realtime updates from Supabase. |
| Repos.tsx | `/repos` | Grid of connected repos with last-run status. Dialog for connecting new repos from the authenticated GitHub account. Disconnect via dropdown. |
| Failures.tsx | `/failures` | Live-updating table of all CI runs with status/filter/search. New rows animate in; status updates flash in-place. Filter: all / active / verified / failed. |
| History.tsx | `/history` | Read-only table of up to 50 completed runs: status, problem summary, branch, fix type, PR link, time. No Realtime. |
| RunDetail.tsx | `/runs/:id` | Full detail for a single CI run: status stepper, AI diagnosis, root cause, proposed fix, file-level diffs with syntax highlighting. Sticky footer with Dry Run / Apply Fix actions. Polls while status is active. |
| NotFound.tsx | `*` | 404 fallback with a "Go home" button. |

### src/components/ — Component Descriptions

| File | What it renders |
|---|---|
| AppLayout.tsx | 240px fixed sidebar (wordmark, nav links, user avatar + logout dropdown) + scrollable `<Outlet />` for page content. Shows a "DEMO MODE" banner when demo mode is active. |
| ProtectedRoute.tsx | Wraps children; shows a skeleton during auth loading, redirects to `/login` if no user. |
| ui/alert.tsx | Alert box with optional icon slot, based on CVA. |
| ui/avatar.tsx | Radix Avatar with AvatarFallback for initials. |
| ui/badge.tsx | Inline pill with `outline` and `default` variants. |
| ui/button.tsx | Button with variants (default, outline, ghost, link) and sizes (sm, default, lg, icon). Supports `asChild` via Radix Slot. |
| ui/card.tsx | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter. |
| ui/dialog.tsx | Radix Dialog primitives wrapped with consistent dark styling. |
| ui/dropdown-menu.tsx | Radix DropdownMenu wrappers. |
| ui/input.tsx | Styled input element. |
| ui/label.tsx | Radix Label wrapper. |
| ui/separator.tsx | Radix Separator. |
| ui/sheet.tsx | Radix Dialog-based slide-over (Sheet) — installed but not used in current pages. |
| ui/skeleton.tsx | Animated gray pulse placeholder. |
| ui/tabs.tsx | Radix Tabs: TabsList, TabsTrigger, TabsContent. Used in RunDetail dry-run diff view. |
| ui/tooltip.tsx | Radix Tooltip. Used in RunDetail file risk badges. |

### src/lib/ — Utility Files

| File | Purpose |
|---|---|
| api.ts | HTTP client. Reads `VITE_API_URL` as base URL. Injects `Authorization: Bearer <jwt>` from `localStorage.drufiy_jwt` on every request. Throws `ApiError` on non-2xx. On 401, clears JWT and hard-redirects to `/login`. In demo mode, delegates to `mockApi()`. |
| supabase.ts | Creates the Supabase client from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. In demo mode, exports a `stubClient` whose `.channel()` and `.removeChannel()` are no-ops, preventing any network calls. |
| utils.ts | Single export: `cn(...inputs)` — composes `clsx` and `tailwind-merge`. Used everywhere to conditionally combine Tailwind classes. |
| statusBadge.ts | Maps a CI run `status` string to a `{ label, className }` object for badge rendering. Also exports `POLLING_STATUSES` — the set of statuses that require active polling or Realtime: `pending`, `diagnosing`, `applying`, `fixed`, `waiting_verification`, `iteration_2`. |
| demoMode.ts | Detects demo mode via `?demo=true` URL param or `localStorage.drufiy_demo`. Exports `isDemoMode()`, `exitDemoMode()`, and `mockApi()`. The mock API is a route dispatcher that returns static fixture data for all backend endpoints, simulating ~500–800ms latency. |

---

## 3. Routing

React Router v7 is configured as `BrowserRouter` in `App.tsx`.

```
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/"                 element={<Landing />} />
      <Route path="/how-it-works"     element={<HowItWorks />} />
      <Route path="/login"            element={<Login />} />
      <Route path="/auth/callback"    element={<AuthCallback />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/repos"          element={<Repos />} />
        <Route path="/failures"       element={<Failures />} />
        <Route path="/history"        element={<History />} />
        <Route path="/runs/:id"       element={<RunDetail />} />
      </Route>

      <Route path="*"                 element={<NotFound />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### Auth Guard

`ProtectedRoute` wraps `AppLayout` as a layout route. The five app routes are children of this layout route, so they all inherit the auth check.

`ProtectedRoute` logic:
1. Reads `{ user, loading }` from `AuthContext`.
2. While `loading === true` (auth rehydration in progress), renders a full-screen skeleton — prevents a flash of the login redirect on page refresh.
3. If `loading === false && user === null`, renders `<Navigate to="/login" replace />`.
4. If user is present, renders `{children}` (which is `<AppLayout />`), and `<AppLayout />` renders `<Outlet />` for the matched child route.

---

## 4. Auth Flow

### Step 1 — Login page

`Login.tsx` constructs the GitHub OAuth authorization URL:

```
https://github.com/login/oauth/authorize
  ?client_id=<VITE_GITHUB_CLIENT_ID>
  &scope=read:user%20user:email%20repo%20admin:repo_hook
  &redirect_uri=<window.location.origin>/auth/callback
```

The "Continue with GitHub" button is an `<a href={githubUrl}>` (not a JS redirect), so the browser navigates directly and GitHub handles the OAuth flow.

**Requested scopes:** `read:user`, `user:email`, `repo`, `admin:repo_hook`.

### Step 2 — AuthCallback page

GitHub redirects to `/auth/callback?code=<code>`. `AuthCallback.tsx`:

1. Extracts `code` from `window.location.search`.
2. POSTs `{ code }` to `POST /auth/github/callback` via `api()`.
3. Backend returns `{ token: string, user: { id, github_username, email } }`.
4. Calls `login(token, user)` from `AuthContext`, which writes the JWT to `localStorage.drufiy_jwt` and sets React state.
5. Navigates to `/dashboard` with `replace: true`.

A `useRef(false)` guard (`ran.current`) prevents the effect from firing twice in React StrictMode.

### Step 3 — JWT storage and attachment

The JWT lives in `localStorage` under the key `drufiy_jwt`. Every call through `api()` reads it and injects it as `Authorization: Bearer <token>`.

### Step 4 — Session rehydration

`AuthProvider` runs on every app load. If `drufiy_jwt` is present in localStorage, it immediately calls `GET /auth/me` to verify the token and restore the `user` object. If `/auth/me` fails (any error), the token is removed. The `loading` flag is `true` until this completes.

### Step 5 — Logout

`logout()` in `AuthContext`:
1. Removes `drufiy_jwt` from `localStorage`.
2. Clears `jwt` and `user` state.
3. Hard-navigates to `/` via `window.location.href = '/'`. This is intentional — a full reload ensures no stale TanStack Query cache or React state survives.

### 401 handling

If any `api()` call returns HTTP 401, the client removes the JWT from localStorage and hard-redirects to `/login`. This also covers token expiry.

---

## 5. API Layer

**File:** `src/lib/api.ts`

```typescript
const BASE = import.meta.env.VITE_API_URL  // e.g. "https://api.drufiy.dev"

export async function api<T>(path: string, init: RequestInit = {}): Promise<T>
```

**Request construction:**
- Base URL: `VITE_API_URL` + `path` (e.g. `VITE_API_URL + "/runs/dashboard/stats"`).
- `Content-Type: application/json` is always set.
- If `drufiy_jwt` exists in localStorage, `Authorization: Bearer <jwt>` is added.
- Caller-provided headers in `init.headers` are merged on top (can override Content-Type if needed).

**Response handling:**
- Non-2xx response: parses JSON body for `error` (error code) and `message` (human string), throws `ApiError(status, code, message)`.
- HTTP 401 specifically: removes JWT, hard-redirects to `/login`.
- 2xx: returns `res.json()` typed as `T`.

**Demo mode bypass:**
- If `isDemoMode()`, the function immediately delegates to `mockApi(path, init)` without any fetch call. `mockApi` applies a random 500–800ms delay and returns static fixture data.

**Integration with TanStack Query:**
All `useQuery` `queryFn` values are `() => api<SomeType>('/endpoint')`. Since `api()` throws `ApiError` on non-2xx, TanStack Query catches it and sets `isError: true`. No additional error wrapping is needed.

---

## 6. Supabase Realtime

Supabase is used **only** for Realtime — no Supabase auth, no Supabase database queries. All data fetching goes through the custom REST API (`api()`).

The client is created with the anon key in `src/lib/supabase.ts`. The anon key is required to authenticate the Realtime WebSocket connection even for read-only subscriptions.

### Dashboard — channel `dashboard_ci_runs`

Table: `ci_runs`, schema: `public`

| Event | Action |
|---|---|
| `INSERT` | Optimistically increments `stats.failures_diagnosed` in Query cache. Invalidates `['recent-runs']` query. Triggers 1-second flash animation on the "Failures Diagnosed" stat card. |
| `UPDATE` | If `payload.new.status === 'verified'`: increments `stats.verified_fixes`, flashes "Verified Fixes" card. If `payload.new.status === 'fixed'`: increments `stats.prs_created`, flashes "PRs Created" card. Invalidates `['recent-runs']` query regardless. |

The flash is implemented via `useState<keyof Stats | null>(flashCard)` with a 1-second `setTimeout` to clear it. `ring-1 ring-emerald-500/60` is applied to the card while flash is active.

### Failures — channel `failures_ci_runs`

Table: `ci_runs`, schema: `public`

| Event | Action |
|---|---|
| `INSERT` | Prepends new run to local `runs` state. Adds the run ID to `newIds` Set — applies `animate-in fade-in slide-in-from-top-2 border-l-2 border-l-emerald-500` to the row for 1.5 seconds. |
| `UPDATE` | Replaces the matching run in `runs` state. Adds the run ID to `updatedIds` Set — applies `bg-violet-950/10` for 800ms. |

Both pages subscribe in `useEffect` and call `supabase.removeChannel(channel)` on cleanup.

Both pages show a `toast.error` if channel status is `CHANNEL_ERROR`.

**Demo mode:** The Supabase client is replaced by a `stubClient` — `channel()` returns a no-op chainable object. No WebSocket is opened.

---

## 7. State Management

### Auth state

Held in React Context (`src/contexts/AuthContext.tsx`). State fields:
- `user: User | null` — `{ id, github_username, email }`
- `jwt: string | null` — mirrors localStorage, kept in sync
- `loading: boolean` — true until initial session rehydration completes

No external state library (no Zustand, no Redux). The context is read via `useAuth()` which throws if called outside `AuthProvider`.

### Server state

TanStack Query v5. `QueryClient` is configured in `src/main.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,        // one automatic retry on failure
      staleTime: 30_000, // 30 seconds before data is considered stale
    },
  },
})
```

The `QueryClientProvider` wraps the entire app. There is no custom `QueryCache` or `MutationCache` configuration.

Individual overrides:
- Dashboard stats: `refetchInterval: 60_000` (1 minute background polling)
- Recent runs: `refetchInterval: 30_000` (30 second background polling)
- RunDetail: `refetchInterval: (query) => POLLING_STATUSES.has(query.state.data?.status ?? '') ? 4000 : false` — polls every 4 seconds only while run is in an active/transitional state

### UI-only state

Local `useState` within components (filter selection in Failures, dialog open/close in Repos, dry-run result in RunDetail, flash card tracking in Dashboard).

---

## 8. Component Library

### shadcn/ui pattern

There is no `shadcn/ui` package. Instead, the project follows the shadcn/ui pattern: Radix UI primitives wrapped with CVA variants and styled with Tailwind, committed directly into `src/components/ui/`. This means components can be modified freely without bumping a package.

### shadcn/ui components in use

`alert`, `avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `separator`, `sheet`, `skeleton`, `tabs`, `tooltip`.

`sheet` is installed but not referenced in any current page.

### Tailwind v4 configuration

Tailwind v4 fundamentally changes how configuration works vs. v3.

**No content scanning config is needed.** Tailwind v4 auto-detects template files when using the Vite plugin. The `tailwind.config.js` file exists with empty `content: []` and `theme: { extend: {} }` — it has no effect on v4 behavior.

**CSS-first configuration.** `src/index.css` contains:
```css
@import "tailwindcss";
```
This single line activates the full Tailwind utility set.

**CSS variables (dark theme):** Defined in `@layer base :root {}` in `index.css`. These are HSL values (without the `hsl()` wrapper) consumed by shadcn/ui components. All variables are dark-mode values — there is no light mode variant:

| Variable | Value |
|---|---|
| `--background` | `240 10% 3.9%` (near black) |
| `--foreground` | `0 0% 98%` (near white) |
| `--card` | `240 3.7% 7%` |
| `--border` | `240 3.7% 15.9%` |
| `--primary` | `0 0% 98%` |
| `--radius` | `0.5rem` |
| etc. | (full list in `src/index.css`) |

**Custom utilities** defined in `index.css` (not via `@layer utilities`):
- `.bg-grid-pattern` — 64px line grid overlay used on Landing and HowItWorks
- `.bg-dot-pattern` — 24px dot grid
- `.glow-violet`, `.glow-violet-sm` — box-shadow glows
- `.text-gradient-violet` — clip-path text gradient
- `.border-white/8`, `.border-white/12` — Tailwind v4 does not generate fractional opacity borders by default; these are manually defined

---

## 9. Page-by-Page Breakdown

### Landing (`/`)

**Data fetching:** None.

**Key behavior:**
- Reads `{ user, loading }` from `useAuth()`. If `!loading && user`, redirects to `/dashboard` via `useEffect`. This handles returning visitors who land on `/`.
- Entirely static JSX. All content is hardcoded in the component.

**UI states:** Single state (render). No loading, error, or empty states.

**API endpoints:** None.

**Supabase channels:** None.

---

### HowItWorks (`/how-it-works`)

**Data fetching:** None.

**UI states:** Single state.

**API endpoints:** None.

**Supabase channels:** None.

---

### Login (`/login`)

**Data fetching:** None.

**Key behavior:**
- Reads `?error=` query param on mount. Recognized values: `auth_failed` (backend OAuth exchange failed), `no_code` (GitHub redirected without `?code=`), `session_expired`.
- Constructs GitHub OAuth URL using `VITE_GITHUB_CLIENT_ID`. Scopes: `read:user user:email repo admin:repo_hook`.
- Redirects to `/dashboard` if user is already authenticated.

**API endpoints:** None (link out to GitHub).

**Supabase channels:** None.

---

### AuthCallback (`/auth/callback`)

**Data fetching:** One mutation-style call on mount.

**Key behavior:**
- Extracts `?code=` from the URL.
- `useRef(false)` guard prevents the effect body from running more than once (StrictMode double-invoke protection).
- POSTs to `/auth/github/callback` with `{ code }`.
- On success: stores JWT, navigates to `/dashboard`.
- On failure or missing code: navigates to `/login?error=auth_failed` or `/login?error=no_code`.

**API endpoints:** `POST /auth/github/callback` → `{ token: string, user: { id, github_username, email } }`

**Supabase channels:** None.

**UI states:** Single loading state (skeleton bar + "Signing in with GitHub…").

---

### Dashboard (`/dashboard`)

**Data fetching:**

| Query key | Endpoint | Interval |
|---|---|---|
| `['dashboard-stats']` | `GET /runs/dashboard/stats` | 60s |
| `['recent-runs']` | `GET /runs/history?limit=5` | 30s |

**Stats response shape:** `{ repos_connected, failures_diagnosed, prs_created, verified_fixes }` (all numbers).

**Layout:**
- Hero card: "Engineering hours saved" = `verified_fixes * 2.5` (hardcoded multiplier, displayed in `hrs`).
- Three smaller stat cards: Failures Diagnosed, PRs Created, Verified Fixes.
- Recent activity feed: 5 rows linking to `/runs/:id`.

**Supabase channels:** `dashboard_ci_runs` on `ci_runs` table. See section 6 for details.

**UI states:**
- Loading: skeleton placeholders for stat card layout
- Error: `<Alert>` under the header
- Empty (no recent runs): "All quiet." message
- Populated: stat cards + activity rows

---

### Repos (`/repos`)

**Data fetching:**

| Query key | Endpoint | Notes |
|---|---|---|
| `['connected-repos']` | `GET /repos/` | Main list |
| `['repo-runs', repo.id]` | `GET /repos/{id}/runs?limit=1` | Per-card, latest run only |
| `['github-repos']` | `GET /repos/github-list` | ConnectRepoDialog only; `enabled: open` |

**Mutations:**

| Action | Endpoint |
|---|---|
| Connect repo | `POST /repos/connect` with `{ repo_full_name, github_repo_id, repo_name, default_branch }` |
| Disconnect repo | `DELETE /repos/{id}` |

**Supabase channels:** None.

**UI states:**
- Loading: skeleton grid
- Error: alert
- Empty: "No repos connected" with CTA button
- Populated: repo card grid

**ConnectRepoDialog:** Fetches the user's GitHub repos (`/repos/github-list`), allows search by `full_name`, shows private indicator. Query only fires when the dialog is open (`enabled: open`).

---

### Failures (`/failures`)

**Data fetching:**

| Query key | Endpoint |
|---|---|
| `['failures-list']` | `GET /runs/history?limit=100` |

Initial data loads once from the query. Subsequent updates come entirely from Supabase Realtime (section 6) — the query result is seeded into local `useState<CiRun[]>` via `useEffect`.

**Supabase channels:** `failures_ci_runs` on `ci_runs` table. INSERT prepends + green flash 1.5s; UPDATE in-place update + violet flash 800ms.

**Client-side filtering:** Filter state is `useState<FilterOption>('all')`. Options: `all`, `active` (pending/diagnosing/applying/iteration_2/fixed/waiting_verification/diagnosed), `verified`, `failed` (diagnosis_failed/exhausted). Filtering happens on the local `runs` array, not by re-fetching.

**Status badges:** Active statuses (`POLLING_STATUSES`) have `animate-pulse` applied to their badge.

**UI states:**
- Loading: row skeletons
- Error: alert
- Empty (no runs): "Nothing's broken — yet." message
- Empty (filter): "No runs match this filter." with clear filter link
- Populated: scrollable table with live indicator dot

---

### History (`/history`)

**Data fetching:**

| Query key | Endpoint |
|---|---|
| `['history']` | `GET /runs/history?limit=50&offset=0` |

**Supabase channels:** None. This page is a static snapshot.

**Response shape:** Array of `HistoryRun` objects. Each has an optional `diagnosis` field with `problem_summary`, `fix_type`, `confidence`, `github_pr_url`, `github_pr_number`, `verification_status`.

**UI states:**
- Loading: row skeletons
- Error: alert
- Empty: "No history to show." with explanation
- Populated: table with clickable rows → `/runs/:id`

---

### RunDetail (`/runs/:id`)

**Data fetching:**

| Query key | Endpoint | Interval |
|---|---|---|
| `['run', id]` | `GET /runs/{id}` | 4000ms if status in `POLLING_STATUSES`, else `false` |

**Mutations:**

| Action | Endpoint | Notes |
|---|---|---|
| Dry run | `POST /runs/{id}/dry-run` | Returns `DryRunResult` with file-level diff previews |
| Apply fix | `POST /runs/{id}/apply-fix` | Returns `{ pr_url, pr_number }` |

**Supabase channels:** None. Polling via `refetchInterval` is used instead.

**Key types:**
- `RunDetail` — top-level run with `diagnosis: Diagnosis | null`
- `Diagnosis` — `{ problem_summary, root_cause, fix_description, fix_type, confidence, is_flaky_test, category, logs_truncated_warning, files_changed, github_pr_url, github_pr_number, verification_status, iteration }`
- `FileChange` — `{ path, new_content, explanation, diff_risk? }`
- `DryRunResult` — `{ run_id, diff_preview: DiffPreviewFile[], overall_recommendation }`

**Status stepper:** Maps `run.status` to one of 5 steps: Detected → Diagnosing → Fix Ready → Applying → Verified. Displays green checkmarks for completed steps.

**Fix actions (sticky footer):**
- `fix_type === 'manual_required'` or `is_flaky_test === true`: shows "Manual review required" text, no buttons.
- Otherwise: "Dry Run" button (opens `DryRunDialog`) and "Apply Fix" button.
- Once `isApplied` (status is fixed/waiting_verification/verified): shows PR link and progress/success indicator.
- Terminal states (verified/diagnosis_failed/exhausted/skipped): footer hidden.

**DryRunDialog:** Shows a tab-based current/proposed diff per file using `react-syntax-highlighter` with `vscDarkPlus` theme. File extension → language mapping handled by `langFromPath()`.

**Confidence color coding:** ≥ 0.9 = emerald, 0.7–0.9 = amber, < 0.7 = zinc/neutral.

**UI states:**
- Loading: skeleton
- Error: alert
- Polling (no diagnosis yet): spinner with "Prash is working…"
- iteration_2 active: amber alert "Initial fix didn't pass CI. Prash is running a second analysis…"
- diagnosis_failed / exhausted: red alert with `error_message` or fallback text
- Populated with diagnosis: full card layout

---

### NotFound (`*`)

No data fetching. Renders "404" with a "Go home" button that navigates to `/`.

---

## 10. Environment Variables

All variables are `VITE_*` and therefore baked into the JS bundle at build time by Vite. They are not available at runtime — changing them requires a rebuild.

| Variable | Required | Used in | Purpose |
|---|---|---|---|
| `VITE_API_URL` | Yes | `src/lib/api.ts` | Base URL for all backend API requests. E.g. `https://api.drufiy.dev`. No trailing slash. |
| `VITE_GITHUB_CLIENT_ID` | Yes | `src/pages/Login.tsx` | GitHub OAuth app client ID. Used to construct the authorization URL on the login page. |
| `VITE_SUPABASE_URL` | Yes | `src/lib/supabase.ts` | Supabase project URL. Required to establish the Realtime WebSocket connection. |
| `VITE_SUPABASE_ANON_KEY` | Yes | `src/lib/supabase.ts` | Supabase anon (public) key. Required to authenticate the Realtime channel subscription even for read-only access. |

In demo mode (`?demo=true`), `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are effectively unused — all network calls are intercepted.

---

## 11. Build and Deploy

### Build

```
tsc -b && vite build
```

`tsc -b` runs TypeScript type-checking with project references before Vite bundles. If type errors exist, the build fails before Vite runs.

Vite config (`vite.config.ts`):
- `@vitejs/plugin-react` — Babel-based JSX transform and React Fast Refresh in dev.
- `@tailwindcss/vite` — Tailwind v4 Vite plugin. Scans source files, generates CSS, integrates with Vite's asset pipeline. Replaces the separate PostCSS/autoprefixer step used in Tailwind v3. (`autoprefixer` is still in devDependencies but is not configured in a `postcss.config.*` file.)
- `resolve.alias: { '@': './src' }` — enables `@/components/...` imports throughout.

### Vercel deployment

`vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Why this is required:** Vite builds a single-page application. All route resolution happens in the browser. Without this rule, a direct navigation to `/dashboard` (or any route other than `/`) would cause Vercel's CDN to look for a file at that path, find nothing, and return 404. The rewrite rule sends every request to `index.html`, where the React Router client handles routing.

**Env vars at build time:** In Vercel, `VITE_*` variables must be set in the project's Environment Variables settings (not in a `.env` file committed to git). They are injected at build time by Vite via `import.meta.env`.

### Dev

```
vite
```

Dev server starts with HMR. The `@` alias works identically in dev and production.

---

## 12. Known Issues and Gotchas

### TanStack Query v5 API changes

v5 (used here) dropped several v4 APIs:

- `useQuery` no longer accepts positional arguments — only the object form `useQuery({ queryKey, queryFn, ... })`.
- `refetchInterval` as a function receives `(query: Query) => number | false` — the function argument is the full Query object, not the data directly. RunDetail uses `query.state.data?.status` to access the current data.
- `onSuccess`/`onError` callbacks were removed from `useQuery`. Per-mutation callbacks on `useMutation` still work (`onSuccess`, `onError`).
- `cacheTime` was renamed `gcTime`. Not configured here, uses default.

### Tailwind v4 differences from v3

- No `content` array required — v4 auto-scans files via the Vite plugin.
- CSS `@import "tailwindcss"` replaces `@tailwind base/components/utilities` directives.
- `tailwind.config.js` is largely vestigial in v4 — the empty file here is a leftover. Theme extensions in v4 are done with CSS variables or `@theme` blocks in CSS, not in the config object.
- Some fractional opacity utilities (e.g. `border-white/8`) are not generated by default in v4; `.border-white\/8` and `.border-white\/12` are manually defined in `index.css` as a workaround.

### SPA routing on Vercel

Without `vercel.json`, all routes except `/` return 404 on Vercel. The rewrite rule is load-bearing.

### Supabase anon key for Realtime

The anon key is technically public (it's in the client bundle). Supabase row-level security (RLS) on the `ci_runs` table is what controls what data the Realtime subscription can receive. If RLS is not configured, any browser can subscribe and receive all rows. This is not a frontend concern but is worth noting when auditing security.

### React StrictMode double-invoke

`main.tsx` wraps the app in `<StrictMode>`. In development, `useEffect` fires twice. `AuthCallback.tsx` guards against this with `const ran = useRef(false)` — the second effect invocation sees `ran.current === true` and exits early. Without this guard, two OAuth exchange requests would fire, and the second would likely fail (the `code` is one-time-use).

### Demo mode

Demo mode activates via `?demo=true` on any URL or a persisted `localStorage.drufiy_demo` key. Once the key is in localStorage, demo mode stays active across navigation. It is cleared by `exitDemoMode()` (called by the "DEMO MODE ×" button in AppLayout), which removes the localStorage key and hard-navigates to `/`.

In demo mode:
- `api()` is bypassed entirely (no fetch).
- `supabase` is a stub object (no WebSocket).
- `AuthContext` bootstraps a hardcoded demo user without calling `/auth/me`.
- The mock API covers all endpoints that the current pages use.

### Logout causes full page reload

`logout()` in `AuthContext` uses `window.location.href = '/'` rather than React Router's `navigate('/')`. This is intentional: the hard reload clears the TanStack Query cache (all in-memory server state), prevents stale data from being visible if another user logs in on the same browser, and avoids the complexity of manually resetting query state.

The same approach is used for 401 errors in `api.ts` (`window.location.href = '/login'`).

### `VITE_API_URL` must not have a trailing slash

`api.ts` constructs requests as `${BASE}${path}` where `path` always starts with `/` (e.g. `/runs/history`). A trailing slash on `VITE_API_URL` would produce double slashes.
