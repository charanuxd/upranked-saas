# Upranked SaaS — Project Instructions

## What this product is

A **private, invite-only** reputation management platform for HVAC businesses. There is no public signup. Users arrive via invite email only.

This is **not** the Upranked agency site. That lives at `/Users/charan/upranked/index.html` (upranked.co). Any marketing, agency positioning, or "learn about Upranked" content belongs there — not here.

---

## The two-product architecture

| Product | Repo | Purpose | Who sees it |
|---|---|---|---|
| Agency site | `/Users/charan/upranked` | Upranked's marketing + contact | Prospective clients, the public |
| SaaS app | `/Users/charan/upranked-saas` | The actual platform | Invited clients + admin only |

If a feature could live on the agency site, it does not belong in this repo.

---

## User journeys — memorize these before building anything

**Admin (Charan):**
`/login` → `/admin` → manages clients, views all data

**Client (HVAC business owner):**
invite email → `/invite` (set password) → `/dashboard`
They never browse to the root URL. They never see a marketing page.

**Review submitter (end customer of the HVAC business):**
SMS/email link → `/review/:slug` → rate → done
No account, no login, single-purpose page.

---

## Before adding any page, component, or feature — ask:

1. **Who reaches this?** Name the specific user type and how they navigate here. If you can't answer, don't build it.
2. **What path brings them here?** Is there a real entry point (link, redirect, button) or are you assuming someone browses?
3. **Does the agency site already handle this concern?** Marketing copy, pricing, testimonials, contact — agency site's job.
4. **What breaks if this doesn't exist?** If nothing breaks, it probably shouldn't exist.
5. **Is this duplicating something already in the product?** Check existing pages before adding.

---

## Tech constraints

- React 18 + Vite — no Next.js, no SSR
- Inline styles only — no Tailwind, no CSS modules, no component libraries
- Design tokens from `src/lib/theme.js` — always use `t.*` values, never hardcode colors
- Supabase for auth + data, but app must work fully in demo mode (`isConfigured` guard)
- Demo credentials: `admin@upranked.co` / `demo` (admin), any email / `demo` (client)

---

## What does NOT belong in this app

- Public marketing pages (belongs on upranked.co)
- Pricing pages (belongs on upranked.co)
- "About Upranked" content (belongs on upranked.co)
- Any page a non-invited person would meaningfully land on
- The root `/` route should redirect to `/login` — not render a landing page
