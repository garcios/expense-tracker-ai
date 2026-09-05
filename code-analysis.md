# Data Export Feature — Comparative Code Analysis

Branches analyzed: `feature-data-export-v1`, `feature-data-export-v2`, `feature-data-export-v3` (all diffed against `main`, which already contains a baseline `ExportButton` doing single-format CSV export via `src/lib/csv.ts`).

Context recap (from `CLAUDE.md`): this is a 100% client-rendered Next.js 14 App Router app. There is **no backend, no API routes, and no database** — all state lives in `localStorage`. Any "cloud" or "server" behavior implemented in these branches is therefore necessarily simulated on the client; this is the single most important fact for evaluating v3.

---

## Summary Comparison

| | v1 — Simple CSV | v2 — Multi-format + Filtering | v3 — Cloud & Sharing |
|---|---|---|---|
| Files touched | 2 | 21 (19 new) | 19 (17 new) |
| Net lines | +14 / -10 | +1014 / -81 | +1889 / -45 |
| New dependencies | none | `jspdf`, `jspdf-autotable` | `qrcode`, `@types/qrcode` |
| New UI surface | 0 (reuses existing button) | 1 slide-over drawer | 1 tabbed slide-over hub (4 tabs) |
| Formats supported | CSV | CSV, JSON, PDF | CSV only (templates are cosmetic labels) |
| Filtering | none | date range + category multi-select | none (template picker only) |
| Real external I/O | none (Blob download) | none (Blob download) | **none** — everything claiming to be Google Sheets/Dropbox/OneDrive/email/share-link is a `setTimeout`-based simulation |
| State management | none (stateless function call) | local hook (`useExportBuilder`) | dedicated global React Context + its own `localStorage` key |
| Risk level | trivial | low | **misleading UX / fake functionality risk** |

---

## Version 1 — `feature-data-export-v1` (Simple CSV)

### Files created/modified
- `src/app/page.tsx` — wires the *existing* `ExportButton` (already on `main`) into the dashboard header next to "Add expense".
- `src/lib/csv.ts` — reorders CSV columns from `Date, Category, Description, Amount` to `Date, Category, Amount, Description`.

Note: `src/components/export-button.tsx` and the CSV-building/download logic already exist on `main`; v1 does not introduce a new export mechanism, it only surfaces the pre-existing one on the dashboard (previously it was only on the `/expenses` page) and tweaks column order.

### Architecture overview
There is effectively no new architecture. `ExportButton` is a single 30-line client component that takes `expenses: Expense[]` as a prop, calls `downloadExpensesCsv()` on click, and shows a toast via the existing `useToast()` context. `downloadExpensesCsv` builds a CSV string, wraps it in a `Blob`, and triggers a synthetic `<a download>` click — the same pattern documented for `src/lib/csv.ts` in `CLAUDE.md`.

### Key components and responsibilities
- `ExportButton` (pre-existing, now reused in two places): guards against empty state, calls the CSV builder, shows success/error toast.
- `expensesToCsv` / `downloadExpensesCsv` (`src/lib/csv.ts`): pure string building + DOM-based download side effect, unchanged in shape.

### Libraries and dependencies
None added. Uses only what's already in the app (`lucide-react` for the icon, native `Blob`/`URL.createObjectURL`).

### Implementation patterns
- Prop-drilling `expenses` from page state into a dumb button component.
- No new hooks, no new context, no new types.
- CSV escaping (quote/comma/newline) handled by a small regex-based `escapeCsvField` helper — correct for the common case, not RFC 4180-exhaustive but adequate.

### Code complexity assessment
Minimal. Cyclomatic complexity is essentially 1 per function. This is the lowest-risk, easiest-to-review branch by a wide margin — a 24-line diff.

### Error handling
- Empty-expenses guard shows a toast and returns early.
- No handling for `Blob`/DOM failures (extremely unlikely in a modern browser, so acceptable given `CLAUDE.md`'s "no test suite, fail soft" ethos elsewhere in the app).

### Security considerations
- CSV injection: fields starting with `=`, `+`, `-`, `@` (formula-injection triggers in Excel/Sheets) are **not neutralized** — only quotes/commas/newlines are escaped. Since `description`/`category` are user-supplied free text, a malicious or careless description like `=cmd|'/c calc'!A1` would be written verbatim into the CSV and could execute in a spreadsheet app that opens it. This exists in the CSV logic on `main` already and is simply carried forward unchanged — same latent issue reappears in v2's CSV formatter.
- No PII leaves the browser; download is local only.

### Performance implications
Negligible — synchronous string building over an in-memory array, no chunking needed at realistic personal-finance-app data volumes.

### Extensibility and maintainability
Very easy to reason about, but also has nowhere to grow: adding a second format or a filter would require restructuring the same way v2 already did. As a permanent end-state it's limiting; as a "ship something today" baseline it's ideal.

---

## Version 2 — `feature-data-export-v2` (Advanced multi-format + filtering)

### Files created/modified
New:
- `src/types/export.ts` — `ExportFormat`, `ExportFilters`, `ExportOptions` types.
- `src/lib/export/filter.ts` — date-range + category filtering, sorted output.
- `src/lib/export/filename.ts` — sanitization + extension mapping.
- `src/lib/export/download.ts` — generic `downloadBlob`.
- `src/lib/export/formatters/csv.ts`, `formatters/json.ts`, `formatters/pdf.ts` — one builder per format.
- `src/lib/export/run-export.ts` — orchestrates filter → format → download.
- `src/hooks/use-export-builder.ts` — stateful hook backing the drawer UI.
- `src/components/export/format-selector.tsx`, `category-filter-list.tsx`, `export-preview-table.tsx`, `export-drawer.tsx`, `export-trigger-button.tsx`.

Modified:
- `src/app/page.tsx`, `src/app/expenses/page.tsx` — swap old `ExportButton` for `ExportTriggerButton`.
- `src/app/globals.css` — drawer slide-in keyframes.
- `package.json` / `package-lock.json` — adds `jspdf` + `jspdf-autotable`.
- Deletes `src/components/export-button.tsx` and rewrites `src/lib/csv.ts` content into `formatters/csv.ts` (the old `csv.ts` exports are removed).

### Architecture overview
This is a clean, layered rewrite:
- **Types** (`types/export.ts`) define the contract.
- **Pure lib functions** (`lib/export/*`) do filtering, filename sanitization, and per-format blob building, with no React dependency — each is independently unit-testable (though no tests exist in the repo per `CLAUDE.md`).
- **Orchestration** (`run-export.ts`) composes the pure functions and performs the one side effect (download).
- **State** (`use-export-builder.ts`) is a single hook owning all drawer form state (format, dates, categories, filename, status) and derives `matchedExpenses`/`totalAmount` via `useMemo`, mirroring the app-wide convention described in `CLAUDE.md` ("pages derive everything locally via `useMemo`").
- **Presentation** (`components/export/*`) is fully decomposed: format picker, category chips, live preview table, and the drawer shell that composes them.

This is the most conventional, idiomatic React architecture of the three — it separates concerns the same way the rest of the codebase does (compare to `expense-context.tsx` + page-level `useMemo` derivation).

### Key components and responsibilities
- `useExportBuilder(expenses)` — single source of truth for the export form; exposes setters, derived `matchedExpenses`/`totalAmount`, `status` (`idle|exporting|success|error`), and `handleExport()`.
- `ExportDrawer` — modal/drawer shell: handles `Escape`-to-close, body scroll lock, resets form state on open (via an intentionally-lint-suppressed effect: `// eslint-disable-next-line react-hooks/exhaustive-deps`), renders sub-sections, and shows inline error state.
- `FormatSelector` — radiogroup (`role="radiogroup"`, `aria-checked`) for CSV/JSON/PDF.
- `CategoryFilterList` — multi-select chips sourced from the canonical `CATEGORIES`/`CATEGORY_META` (correctly reuses the app's category source of truth per `CLAUDE.md`).
- `ExportPreviewTable` — capped preview (`PREVIEW_LIMIT = 6`) with a "+N more rows" footer, avoiding rendering cost for large exports.
- `run-export.ts` → format-specific builders (`buildCsvBlob`, `buildJsonBlob`, `buildPdfBlob`).

### Libraries and dependencies
- `jspdf` + `jspdf-autotable` (new, ~250 lines of transitive lockfile diff) for client-side PDF generation with a formatted table, header/footer totals, and styling. This is a substantial dependency addition purely for one export format; `jspdf`'s PDF builder is `async` and dynamically `import()`-ed inside `buildPdfBlob`, which is a good choice — it keeps the heavy PDF library out of the main bundle until a user actually picks PDF (code-splitting via dynamic import).
- Everything else uses existing dependencies.

### Implementation patterns
- Discriminated union over `ExportFormat` (`"csv" | "json" | "pdf"`) with an exhaustive `switch` in `run-export.ts` (TypeScript will flag it if a new format is added without a case, since `blob` would be implicitly `any`/unassigned — decent structural safety, though there's no `never`-check `default` branch to force a compile error on missing cases).
- Filtering is centralized in one function (`filterExpensesForExport`) reused by both the hook and (implicitly) `run-export.ts`, avoiding duplicate filter logic.
- Filename sanitization strips filesystem-unsafe characters and re-derives the extension from format, so a user typing `"my export.pdf"` while CSV is selected still gets `.csv` (strips any trailing known extension via regex, then appends the correct one).

### Code complexity assessment
Moderate — the largest file is `export-drawer.tsx` (~223 lines), which is a fairly standard-sized composed form component. Logic is well distributed across single-responsibility modules; no function exceeds ~40 lines. This is more code than v1 but each unit is simple.

### Error handling
- `handleExport` wraps the async export in try/catch, distinguishes `Error` messages from unknown throws, and surfaces a dedicated error UI state (`AlertCircle` banner) rather than only a toast.
- Empty-filtered-results guard (distinct from v1's empty-*all*-expenses guard): if filters produce zero matches, the export is blocked with a specific message ("No expenses match these filters…") instead of silently downloading an empty file.
- Export button is disabled while `matchedExpenses.length === 0` or while exporting, preventing double-submission.

### Security considerations
- Same CSV-formula-injection gap as v1/`main` (only quotes/commas/newlines escaped in `formatters/csv.ts`) — carried forward, not introduced.
- JSON export embeds `filters` and full `expenses` verbatim — no injection risk there since it's not spreadsheet-interpreted, but note the JSON payload includes `generatedAt`, i.e., a machine-local timestamp of export, not sensitive by itself.
- PDF generation runs entirely client-side (no server round-trip of financial data), consistent with the app's local-only data model.
- `jspdf`/`jspdf-autotable` are third-party dependencies with their own supply-chain surface — pinned by exact-ish semver ranges (`^4.2.1`, `^5.0.8`); no lockfile pinning concerns beyond the normal npm audit hygiene.

### Performance implications
- PDF library is lazy-loaded only when needed (good — avoids bloating the initial bundle for CSV/JSON users).
- Filtering/sorting recomputes via `useMemo` keyed on `[expenses, startDate, endDate, categories]`, so it only re-runs when inputs actually change, consistent with the app's existing `useMemo`-heavy derivation pattern.
- Preview table caps rendering at 6 rows regardless of dataset size — good defensive UI performance choice.

### Extensibility and maintainability
This is the most maintainable of the three: adding a fourth format means adding one file under `formatters/`, one union member, and one `switch` case — no changes to filtering, filename, or drawer UI logic required. The separation between pure lib code and React state/UI is exactly the kind of layering that scales.

---

## Version 3 — `feature-data-export-v3` (Cloud integration, sharing, scheduling)

### Files created/modified
New:
- `src/types/cloud-export.ts` — templates, destinations, services, share links, history entries, schedules — the largest type surface of the three branches (133 lines).
- `src/lib/cloud-export-simulator.ts` — **simulates** connect/sync/export/share-link operations with `setTimeout` delays and fabricated data.
- `src/lib/cloud-export-storage.ts` — `localStorage` persistence for the cloud-export state (separate key: `expense-tracker:cloud-export:v1`).
- `src/context/cloud-export-context.tsx` — global `CloudExportProvider`/`useCloudExport`, mounted app-wide in `layout.tsx` (sibling to `ExpenseProvider`).
- `src/components/cloud-export/*` — `cloud-export-launcher.tsx`, `export-hub-panel.tsx` (4-tab shell), `export-tab.tsx`, `schedule-tab.tsx`, `integrations-tab.tsx`, `history-tab.tsx`, `share-link-card.tsx`, `status-pill.tsx`, `destination-icon.tsx`.

Modified:
- `src/app/layout.tsx` — adds `CloudExportProvider` to the provider tree (app-wide, not page-scoped).
- `src/app/expenses/page.tsx` — swaps `ExportButton` for `CloudExportLauncher` (dashboard `page.tsx` is **not** updated — the new hub only appears on `/expenses`, an inconsistency worth flagging).
- `package.json`/`package-lock.json` — adds `qrcode` + `@types/qrcode`.
- `src/app/globals.css` — same drawer keyframes as v2 (duplicated, not shared).
- Deletes `src/components/export-button.tsx`.

### Architecture overview
This is the most ambitious surface area (19 files, ~1900 lines) but architecturally it mirrors v2's shell pattern (provider + storage module + tabbed drawer) applied to a much larger feature set: a 4-tab "Export & Share Hub" (Export / Schedule / Integrations / History) backed by a dedicated global context and its own persisted state slice.

Critically, **none of the "cloud" behavior is real**:
- `simulateConnectService()` — `await delay(1400)` then returns a fake `connectedAt` timestamp. There is no OAuth redirect, no token exchange, no network request of any kind.
- `simulateSync()` — `await delay(700)`, fake `syncedAt`.
- `simulateRunExport()` — delay proportional to expense count, then returns a fabricated `ExportHistoryEntry`; for `download` destination, the *actual* download path reuses the pre-existing `downloadExpensesCsv` from `src/lib/csv.ts`, but for `google-sheets`/`dropbox`/`onedrive`/`email` **nothing is transmitted anywhere** — the UI just reports success.
- `simulateGenerateShareLink()` — fabricates a URL of the form `https://share.expensetracker.app/x/<random-slug>` (a domain that does not exist/is not owned by this app), rendered with a QR code and a "Copy link" button, presented with real access-control semantics ("Can view"/"Can edit", expiry dates, revoke).
- Schedules (`schedule-tab.tsx` + `computeNextRun`) compute and store a `nextRunAt` timestamp, but **no code anywhere polls or checks it** (`git grep` confirms no `setInterval`/scheduler logic references `nextRunAt` outside of its computation and display) — a schedule is inert configuration that will never fire, even if the tab is left open indefinitely.

Since `CLAUDE.md` establishes there is no backend/API/database in this app, none of this could be made real without introducing a server, real OAuth apps for Google/Dropbox/Microsoft, and a scheduling worker — this branch essentially ships a high-fidelity *prototype/mockup* of a cloud feature, styled and interactive enough to be mistaken for a working one.

### Key components and responsibilities
- `CloudExportProvider` — largest new piece of state management in the app: owns `services` (3 fake integrations), `history` (append-only log), `schedules`, persists all of it to `localStorage`, and exposes 9 action functions (`connectService`, `runExport`, `generateShareLink`, `createSchedule`, etc.).
- `ExportHubPanel` — tabbed drawer shell (reuses the `drawer-enter` CSS animation, duplicated from v2 rather than shared).
- `ExportTab` — template + destination picker; on "Export now", calls context `runExport`, and only for `destination === "download"` does it also call the real `downloadExpensesCsv`.
- `ShareLinkCard` — generates the fake share link, renders a **real QR code** (via the `qrcode` npm package) encoding that fake URL, and offers copy/revoke actions.
- `IntegrationsTab` — connect/disconnect/sync UI for 3 services, entirely simulated.
- `ScheduleTab` — CRUD for recurring export configs that are never executed.
- `HistoryTab` — expandable log of past "exports," including their (fake) share links.

### Libraries and dependencies
- `qrcode` (+ `@types/qrcode`) — legitimate, small, well-known library; used correctly (`QRCode.toDataURL`, cleanup via a `cancelled` flag in the `useEffect` to avoid setting state after unmount).
- No real cloud SDKs (no `googleapis`, no Dropbox/Microsoft SDKs) — confirming there is no actual integration attempt, just UI.

### Implementation patterns
- Context + reducer-like `setState` updater pattern (consistent with `ExpenseProvider`'s style per `CLAUDE.md`), including an `isLoaded` flag and a `hasLoadedRef` guard to avoid writing back to `localStorage` before the initial load completes — this mirrors good practice seen elsewhere in the codebase.
- IDs generated via `crypto.randomUUID()` with a fallback (`Date.now()-random`) — reasonable, though this fallback ID scheme is duplicated verbatim in both `cloud-export-simulator.ts` and `cloud-export-context.tsx` instead of being shared from one utility (the project already has a `uuid` dependency in `package.json` that could have been used consistently instead of hand-rolled ID generation).
- Optimistic UI: `runExport` immediately pushes a `"processing"` history entry, then replaces it with the resolved result — good UX pattern even though the underlying work is fake.

### Code complexity assessment
Highest of the three. `cloud-export-context.tsx` (295 lines) and `schedule-tab.tsx` (229 lines) are the largest files across all branches. Complexity comes from breadth (4 tabs × several CRUD flows) rather than depth — no individual function is especially complex, but the sheer number of moving parts (services × destinations × templates × schedules × share links) raises the surface area to review and maintain substantially compared to v1/v2.

### Error handling
- `runExport` does model a failure path (`status: "failed"` when a service destination isn't connected) and surfaces `errorMessage` in both `ExportTab` and `HistoryTab`.
- No handling for `QRCode.toDataURL` other than swallowing the error into a `null` fallback icon — acceptable given it's decorative.
- `localStorage` read/write wrapped in try/catch with `console.error`, consistent with `src/lib/storage.ts`'s "fail soft" convention noted in `CLAUDE.md`.
- No validation that `dayOfMonth`/`dayOfWeek` stay in range beyond what the `<select>` UI constrains (acceptable since there's no untrusted input path).

### Security considerations
This branch's primary issue is **not** a traditional vulnerability (no injection, no XSS — user data never leaves the browser, and `dangerouslySetInnerHTML` is not used) but a **trust/honesty problem**:
- The UI presents fully-formed cloud integrations ("Connect to Google Sheets," "Sync now," expiring/revocable share links with view/edit permissions, a real-looking domain `share.expensetracker.app`) that do nothing. A user could reasonably believe they've shared their financial data externally, generated a link a third party can open, or connected a real Google/Dropbox account, when none of that has happened. If this ever shipped to real users, that's a significant UX-honesty risk — worse than a missing feature, because it actively signals success (`showToast("Connected to Google Sheets.")`, a working QR code, a plausible-looking URL) for something that doesn't exist server-side.
- The share link's fake domain is at least clearly fictional if inspected (`share.expensetracker.app` isn't a registered/live domain as far as this analysis can determine), so no active navigation hazard, but the QR code will happily encode and let someone scan/visit a dead link.
- Because everything is `localStorage`-backed and client-only, there is no actual new data-exposure surface (no new attack surface for exfiltration) — ironically this branch is "secure" only because it doesn't do what it claims to do.
- Carries the same CSV-injection non-issue as the other branches (reuses `downloadExpensesCsv` from `lib/csv.ts` unchanged for the one real download path).

### Performance implications
- Artificial `delay()` calls (700–1400ms+) are pure UX theater and add no real work, but they do block perceived responsiveness for actions that could otherwise be instant (e.g., "connecting" to a service takes 1.4s for literally nothing).
- `cloud-export-context.tsx`'s `useMemo`'d context value depends on nearly every field, so most state changes cause all consumers to re-render — acceptable at this scale (a handful of tabs) but a heavier pattern than v2's narrowly-scoped hook.
- Two separate `localStorage` blobs now exist (`expense-tracker:expenses:v1` and `expense-tracker:cloud-export:v1`), each read/written independently — fine at current scale, but a second persistence key doubles the storage surface `CLAUDE.md`'s architecture section will need to document going forward.

### Extensibility and maintainability
- Reasonably well factored internally (one file per tab, one file per concern), but the feature as a whole is built on a foundation (`cloud-export-simulator.ts`) that would need to be entirely replaced — not extended — to become real, since real integrations would require server-side OAuth token storage, actual API calls to Google/Dropbox/Microsoft Graph, a real link-shortening/hosting backend, and a cron/worker for schedules. None of the current abstractions (simulator functions returning canned promises) map onto what real implementations would need beyond the type shapes in `cloud-export.ts`, which are a reasonable enough contract to keep.
- The duplicated `drawer-enter` CSS animation and duplicated fallback-ID generation (also seen between v2 and v3 independently reinventing similar drawer/trigger-button shells) suggest that if v2 and v3 were ever merged, a shared `ExportDrawerShell` and shared ID-generation utility should be extracted first.

---

## Technical Deep Dive

### How does the export functionality work technically, across versions?
- **v1**: `onClick` → `expensesToCsv(expenses)` (string builder) → `Blob` → object URL → synthetic `<a download>` click → revoke URL. Fully synchronous except for the DOM click.
- **v2**: `onClick` → `useExportBuilder.handleExport()` → `runExport(expenses, options)` → `filterExpensesForExport` → format-specific builder (`buildCsvBlob`/`buildJsonBlob`/sync; `buildPdfBlob` is `async` and dynamically imports `jspdf`) → `downloadBlob` (same Blob/object-URL/`<a download>` pattern as v1, extracted into a shared helper).
- **v3**: `onClick` → `CloudExportContext.runExport()` → pushes an optimistic "processing" entry → `simulateRunExport()` (fake delay + fake result, no real file is generated for non-CSV/non-download paths — there's no PDF/JSON/Sheets-format builder at all in v3, only the reused `downloadExpensesCsv`) → context state update → UI reacts via `StatusPill`/`HistoryTab`/`ShareLinkCard`.

### What file generation approach is used?
All three use the same terminal primitive when a real file is produced: `Blob` + `URL.createObjectURL` + a temporary `<a download>` element (documented in `CLAUDE.md` as the established pattern). v2 is the only branch that generates more than one real file format (CSV via string building, JSON via `JSON.stringify`, PDF via the `jspdf`/`jspdf-autotable` client-side rendering pipeline). v3 does not generate new file formats — its "templates" (Tax Report, Monthly Summary, etc.) are purely cosmetic labels attached to the same underlying CSV download; none of them actually change the exported content's structure.

### How is user interaction handled?
- v1: a single button, no modal.
- v2: a slide-over drawer (`role="dialog"`, `aria-modal`, Escape-to-close, body-scroll lock) with a multi-section form (format radiogroup, date range, category chips, filename input, live-filtered preview table) and a footer action bar with disabled/loading states.
- v3: a larger tabbed drawer with the same dialog/Escape/scroll-lock pattern, but four independent sub-views (Export/Schedule/Integrations/History) each with their own local `useState`, coordinated through the shared `CloudExportContext` for anything persisted.

### What state management patterns are used?
- v1: none — fully stateless, derives nothing.
- v2: a single custom hook (`useExportBuilder`) scoped to the drawer's lifetime; not lifted to context since nothing outside the drawer needs it — appropriately minimal scope.
- v3: a full React Context provider mounted at the root layout (alongside `ExpenseProvider`/`ToastProvider`), because export history/schedules/integration state needs to persist and be visible across the History/Integrations tabs even after the drawer closes and reopens. This is the correct call given the feature's requirements (v2's local-hook approach wouldn't work here since history must survive drawer close), but it does mean cloud-export state loads/mounts globally on every page even when the hub is never opened.

### How are edge cases handled?
- Empty expense list: all three guard against exporting zero rows (v1/v3 via a toast before starting; v2 via a disabled button plus an explicit "no expenses match these filters" message when filters — not the full dataset — produce zero rows, which is the most precise of the three).
- Unconnected destination (v3 only, since only v3 has "destinations" requiring connection): correctly blocked both proactively (button/label shows "Not connected" and a warning line) and defensively (the simulator itself re-checks and returns a `"failed"` entry even if the UI check were bypassed).
- Filename collisions/invalid characters (v2 only, since v1/v3 don't expose a filename field): sanitized via regex stripping `\/:*?"<>|`.
- Schedule "next run" computation (v3 only) handles all three frequencies and correctly rolls to the next day/week/month when the naive computed time has already passed today — but this correctness is moot since nothing ever reads `nextRunAt` to actually trigger anything.

---

## Recommendation Basis (facts for the decision, not a directive)

- **v1** is the right shape only if the requirement truly is "one CSV button" — it's the least risky, smallest diff, but has nowhere to grow without becoming v2.
- **v2** is the most solid, idiomatic, and honestly-scoped implementation: it does exactly what it visually promises (multi-format, filtered, real files), with clean separation between pure logic and UI, lazy-loads its one heavy dependency, and its architecture is the easiest of the three to extend or to merge into `main` incrementally (e.g., could adopt v1's dashboard placement change plus v2's drawer without conflict).
- **v3** delivers the most polished-looking feature set but implements almost none of what it visually claims — the "Cloud Integrations," "Share Links," and "Scheduled Exports" are all client-side simulations with no backend counterpart possible in this app's current architecture (per `CLAUDE.md`: no API routes, no database). Before considering v3 for adoption, the "cloud" claims would need to either (a) be built out with a real backend, real OAuth apps, and a real scheduler/link-hosting service, or (b) be re-labeled/re-scoped as a prototype so users aren't misled into believing they've shared or scheduled something that will never happen.
