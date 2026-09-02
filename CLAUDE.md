# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # next lint (eslint-config-next: next/core-web-vitals, next/typescript)
```

There is no test suite configured in this repo (no Jest/Vitest, no `*.test.*`/`*.spec.*` files).

## Architecture

This is a Next.js 14 App Router app, entirely client-rendered — nearly every file under `src/` is a `"use client"` component. There is no backend, no API routes, and no database. All state lives in the browser.

**Data flow:**
- `src/context/expense-context.tsx` (`ExpenseProvider`/`useExpenses`) is the single source of truth for expense data. It loads expenses from `localStorage` on mount, then persists on every change to `expenses`.
- `src/lib/storage.ts` does the actual `localStorage` read/write under key `expense-tracker:expenses:v1`. It fails soft (returns `[]` / no-ops) if storage is unavailable or corrupt.
- `src/context/toast-context.tsx` (`ToastProvider`/`useToast`) is a separate, independent context for transient notifications.
- Both providers wrap the whole app in `src/app/layout.tsx` (`ToastProvider` > `ExpenseProvider` > `Navbar` + page content).
- Pages (`src/app/page.tsx` dashboard, `src/app/expenses/page.tsx` full list) read `expenses` from `useExpenses()` and derive everything else — totals, filters, sorting — locally via `useMemo`. There is no server-side computation or caching layer.

**Categories** are centralized in two places that must stay in sync:
- `CATEGORIES`/`Category` type in `src/types/expense.ts` — the source of truth for which categories exist.
- `CATEGORY_META` in `src/lib/categories.ts` — per-category icon, chart color, and Tailwind badge/dot classes, keyed by `Category`. Adding/renaming a category means updating both files.

**Analytics** (`src/lib/analytics.ts`) are pure functions over an `Expense[]` array (totals, per-category breakdowns, monthly trend, daily average) — no memoization or persistence beyond what the calling component does with `useMemo`.

**CSV export** (`src/lib/csv.ts`) builds a CSV string client-side and triggers a download via a `Blob` + temporary `<a download>` element — no server round-trip.

**Path alias:** `@/*` maps to `src/*` (see `tsconfig.json`).

**Styling:** Tailwind CSS with a minimal theme extension (`background`/`foreground` CSS vars in `tailwind.config.ts`); most styling is done with inline utility classes rather than shared style modules. Icons are from `lucide-react`, charts from `recharts`.
