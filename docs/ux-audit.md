# UX audit — Voyager Cloud ERP

**System:** `erp.linhlongengineering.com` · React + Vite + KendoReact on an Azure .NET backend
**Date:** 19 August 2026
**Method:** authenticated walkthrough with DOM instrumentation (column widths, clip and empty
ratios measured from the rendered grid) plus analysis of the `/api/account/get/menus` payload and
the published Vite manifest.

The machine-readable version — with effort and value ratings per finding — is
[`src/data/findings.ts`](../src/data/findings.ts), rendered on the **UX Audit** page.

## Summary

17 findings. **7 are low-effort / high-value** and could ship independently of the wider revamp:
T1, T2, T3, N2, N3, C1, C3.

| Area | Findings | Headline |
| --- | --- | --- |
| Tables | 5 | Uniform 108px columns clip the primary identifier in 85% of rows |
| Navigation | 6 | All 51 destinations behind a hamburger, with no breadcrumb |
| Content | 3 | One screen has three different names; demo data is live on the dashboard |
| Layout | 1 | The header collapses into itself below ~1000px |
| System | 2 | i18n keys and icons are stubbed for all 51 menu nodes |

## The learning-curve argument

The brief calls for drastically reducing the learning curve. Four findings account for most of it:

1. **N1 — nothing is visible.** Navigation is a collapsed drawer, so a user can only ever see one
   part of the structure. There is no way to build a mental model of a system you cannot see.
2. **N2 — labels do not discriminate.** "Configuration" appears five times, "Reporting" three.
   The user must already know the structure to disambiguate them, which is exactly what a newcomer
   does not have.
3. **C1 — names are not stable.** Nav, page heading, browser title and URL disagree on what a
   screen is called, so training material and the UI diverge immediately.
4. **N3 — the URL lies.** Seven screens resolve into a module they do not belong to, so the one
   piece of orientation a user could rely on contradicts the menu.

The proposal addresses these with a persistent sidebar, a breadcrumb, deduplicated labels, and
⌘K search that matches on the **former** name — so retraining is additive rather than a reset.

## Quick wins, in the order I would take them

| # | Finding | Effort | Why first |
| --- | --- | --- | --- |
| 1 | C3 — remove the "World Population" demo chart | Hours | It is on the login landing page of a production system |
| 2 | T1 — per-column widths | 1–2 days | Fixes the single most damaging defect; no data model change |
| 3 | T2 — hide empty columns | Hours | Frees ~25% of grid width; pairs with T1 |
| 4 | T3 — density and header hierarchy | 1–2 days | Roughly 60% more rows per screen |
| 5 | C1 — one name per screen | 1–2 days | Content-only; unblocks documentation and training |
| 6 | N2 — consolidate Configuration and Reporting | ~1 week | Removes 6 of 51 nav entries |
| 7 | N3 — align routes, redirect the old ones | ~1 week | Makes URLs trustworthy; old bookmarks keep working |

## Not examined

RMA, PCB Viewer, the Accounting module, What-If, and the BoM import wizard were not opened in
depth. The record/detail pattern was only partially observed. A second pass should cover the
create-and-edit flows, which is where a standardised form pattern would matter most.
