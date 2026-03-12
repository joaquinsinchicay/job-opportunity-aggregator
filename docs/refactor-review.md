# Next.js v0 Project Review

## Architectural problems

1. **Data layer fragmentation and no single source of truth**
   - The app currently mixes three data access patterns: direct context state (`OpportunitiesProvider`), direct `mock-data` imports in pages, and a separate `services/opportunities.ts` API-like layer.
   - Example: the opportunity detail page reads activities straight from `lib/mock-data.ts`, while opportunity entities come from context. This means related data is fetched through different paths and cannot evolve consistently.

2. **Client-heavy routing/layout architecture**
   - The dashboard layout wraps all routes in a client provider (`OpportunitiesProvider`) and most pages are `"use client"`, preventing server components from handling read-heavy rendering and limiting future SSR/data-cache benefits.

3. **Dead/duplicated foundational modules**
   - There are duplicated hook implementations in both `hooks/` and `components/ui/` (`use-mobile`, `use-toast`).
   - Navigation config exists in `lib/constants.ts` but the sidebar uses a separate local navigation array.
   - There are two global CSS files (`app/globals.css` and `styles/globals.css`) with different design-token sets, increasing drift risk.

4. **Partially integrated app infrastructure**
   - `ThemeProvider` and toaster utilities exist but are not wired in root layout, so styling/theme/toast foundations are incomplete.

## Component duplication

1. **Duplicated hooks**
   - `hooks/use-mobile.ts` and `components/ui/use-mobile.tsx` are identical.
   - `hooks/use-toast.ts` and `components/ui/use-toast.ts` are identical.

2. **Duplicate config sources**
   - Navigation is declared both in `lib/constants.ts` (`NAVIGATION_ITEMS`) and locally in `components/app-sidebar.tsx`.

3. **Repeated filter and stats logic**
   - Filtering logic is implemented inline in `opportunities/page.tsx` while similar filter behavior also exists in `lib/services/opportunities.ts`.
   - Status counts and status iteration are repeated across dashboard cards, pipeline, and detail select mapping.

## Incorrect state management

1. **Unsynced entity/activity state**
   - Opportunity detail reads activity timeline from static mock data (`getActivitiesByOpportunityId` from `lib/mock-data.ts`) rather than from the same source that updates opportunity status.
   - Changing status updates only the context opportunity list; no activity event is appended, so timeline becomes stale.

2. **Provider stores unused loading/error state**
   - Context exposes `isLoading` and `error`, but no real async fetch path sets meaningful error handling.

3. **UI-level simulation instead of service orchestration**
   - New opportunity page simulates API latency with a local timeout before directly mutating context. This bypasses service abstraction and makes side effects hard to standardize.

## Missing or weak TypeScript typing

1. **Loose function types in mock layer**
   - `getOpportunitiesByStatus` in `lib/mock-data.ts` accepts `status: string` instead of `OpportunityStatus`.

2. **Unsafe cast-heavy event handling**
   - Status/work-mode select handlers rely on casts (`as OpportunityStatus`, `as WorkMode | 'all'`) instead of strongly typed helper wrappers/components.

3. **Untyped icon/config records**
   - `ACTIVITY_ICONS` in detail page is inferred loosely; should be typed as `Record<ActivityType, LucideIcon>` for compile-time coverage when activity types evolve.

4. **Compiler config allows JavaScript**
   - `allowJs: true` weakens TS enforcement in a TS-first codebase.

## UI consistency problems

1. **Design tokens are not centralized at runtime**
   - Two separate global CSS token definitions risk different visual systems depending on which stylesheet is imported.

2. **Hardcoded visual semantics outside config**
   - Dashboard stat card icon colors are hardcoded inline instead of deriving from centralized status token config.

3. **Interaction patterns vary by page**
   - Some cards expose dropdown actions that are placeholders, while detail page has separate action buttons for related behavior; action affordances are not unified.

---

## Refactor plan

### Phase 1 — Stabilize foundations (low-risk)
1. **Pick canonical shared modules and delete duplicates**
   - Keep `hooks/*` as source of truth and remove duplicated `components/ui/use-mobile.tsx` and `components/ui/use-toast.ts`.
   - Replace local sidebar navigation array with `NAVIGATION_ITEMS` from `lib/constants.ts`.

2. **Consolidate global styles**
   - Keep one global stylesheet (`app/globals.css`) as canonical token source.
   - Remove or archive `styles/globals.css` and verify imports.

3. **Wire missing shell infrastructure**
   - Add `ThemeProvider` and a toaster (`components/ui/toaster` or sonner) to root layout.

### Phase 2 — Unify data architecture
1. **Define a typed repository boundary**
   - Create `lib/repositories/opportunities-repository.ts` interface (get/list/create/update/delete/listActivities).
   - Implement `mock` repository adapter first; keep future Supabase adapter behind same interface.

2. **Refactor context into a thin client cache/store**
   - Context should consume repository methods, not raw mock imports.
   - Move all filters/sorts/selectors to memoized selector utilities (`lib/selectors/opportunities.ts`).

3. **Unify activity + opportunity writes**
   - `updateOpportunityStatus` should also create an activity event via repository, ensuring detail timeline and board updates stay consistent.

### Phase 3 — Type tightening and API ergonomics
1. **Strengthen domain types**
   - Replace `string` status args with `OpportunityStatus` in mock helpers.
   - Add shared `StatusOption`/`WorkModeOption` types for selects.

2. **Reduce casting in UI**
   - Create typed select wrappers/components for `OpportunityStatus` and `WorkMode`.
   - Type `ACTIVITY_ICONS` as `Record<ActivityType, LucideIcon>`.

3. **Harden TS settings**
   - Turn `allowJs` to `false` after cleanup and ensure `pnpm tsc --noEmit` passes.

### Phase 4 — Page/component composition cleanup
1. **Extract reusable sections**
   - Break detail page into `OpportunityHeaderCard`, `OpportunityDetailsCard`, `OpportunityActivityTimeline`, and `OpportunityActionsPanel`.

2. **Normalize visual tokens and status rendering**
   - Generate dashboard stats from `STATUS_CONFIG` + one metadata map rather than hardcoded color classes.

3. **Adopt progressive server/client split**
   - Keep interactive boards/forms as client components, but move read-only shells/lists to server components with serialized data props.

### Phase 5 — Quality gates
1. Add project lint config compatible with ESLint v9 (`eslint.config.mjs`).
2. Add lightweight tests for selectors and repository adapters.
3. Add a CI check sequence:
   - `pnpm lint`
   - `pnpm tsc --noEmit`
   - `pnpm build`

