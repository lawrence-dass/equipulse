# Equipulse Architecture: Auth-Free Public Access, Rate Limiting, and Cost Control

Status: Draft  
Date: 2026-03-31  
Project: Equipulse

## 1. Purpose

This document defines the recommended architecture for running Equipulse as a fully public portfolio project with no authentication requirement at all, while keeping infrastructure, third-party API usage, and LLM spend predictable.

The core design principle is:

- the product should be immediately accessible
- identity should not be part of the core experience
- expensive operations should be bounded by infrastructure controls, not gated by login

This is not a full system architecture for the entire product. It is a focused architecture decision document for access policy, state strategy, rate limiting, caching, and AI cost control in an auth-free model.

## 2. Problem Statement

Equipulse is a portfolio project. Requiring login reduces demo value and adds friction without providing corresponding value to the visitor.

At the same time, removing auth entirely changes the control model:

- there is no per-user trust boundary
- there is no authenticated quota identity
- any expensive feature becomes publicly triggerable unless intentionally constrained

That means protection must shift away from auth and toward:

- IP-based rate limiting
- aggressive caching
- shared outputs instead of per-visitor compute
- global cost ceilings
- graceful degradation when limits are reached

## 3. Current State Snapshot

### Existing Product Shape

- `app/(root)/page.tsx` already provides a public dashboard experience.
- `app/(root)/dashboard/page.tsx` and related auth flows currently exist for personalized access.
- `lib/actions/finnhub.actions.ts` powers cost-sensitive market/news retrieval.
- `lib/inngest/functions.ts` performs email workflows and AI summarization.
- `app/api/inngest/route.ts` exposes the Inngest execution surface.

### Architectural Implication

If the target product truly has no auth:

- the current authenticated dashboard path becomes unnecessary or must be repurposed
- persistence features need a new model
- any AI or email feature must be reconsidered because identity is no longer the primary control boundary

### Most Important Cost Risk

The largest structural risk remains `sendDailyNewsSummary`, which currently summarizes once per user. In an auth-free product, per-user AI is even less defensible. The cost model must become shared-output-based or the feature should be deferred.

## 4. Goals

- allow anyone to use the product immediately with no sign-in
- keep monthly operating cost low and predictable
- preserve a strong demo experience
- remove dependence on user accounts for core product value
- protect Finnhub and AI spend with infrastructure controls
- fail gracefully under abuse or budget exhaustion

## 5. Non-Goals

- building a multi-tenant SaaS product
- storing durable anonymous user profiles on the server
- offering unlimited live AI generation to the public
- supporting email automation at scale
- solving abuse perfectly

## 6. Architectural Position

### Decision A: No auth anywhere in the core portfolio experience

Equipulse should be fully usable without login, signup, or account creation.

That means:

- no required sign-in
- no required sign-up
- no auth-gated dashboard
- no auth dependency for core browsing or interaction

### Decision B: Personalization becomes browser-local by default

If users should be able to personalize the experience without accounts, that state should live in the browser.

Recommended browser-local features:

- watchlist stored in `localStorage`
- dashboard layout stored in `localStorage`
- dismissals, preferences, or UI choices stored in `localStorage`

This removes server-side persistence cost and identity complexity entirely.

### Decision C: Public AI must be shared, cached, or removed

Anonymous live AI generation is not appropriate for a fully public hobby project unless it is extremely constrained.

Public AI content, if retained at all, should be:

- pre-generated
- shared across visitors
- cached
- budget-capped

No visitor-specific AI synthesis should happen on demand in the public tier.

### Decision D: Email and alerts are optional, not foundational

Without auth, email digests and alerts become higher-risk features because they introduce:

- spam potential
- bot sign-up abuse
- recurring background cost
- complexity around verification and unsubscribe state

Recommendation:

- do not treat email workflows as part of the core portfolio MVP
- either defer them or reduce them to a lightweight, explicitly opt-in later phase

### Decision E: Low cost beats broad capability

Because this is a portfolio project, architecture should prefer:

- fewer moving parts
- managed services over custom infrastructure
- hard ceilings over soft policies
- shared content over personalized compute
- a stable demo over a broader but fragile feature set

## 6.1 Recommended Operating Model

| Area | Recommendation | Rationale |
|---|---|---|
| Public browsing | Fully open | Best portfolio UX |
| Watchlist | Browser-local only | No account required |
| Dashboard layout | Browser-local only | No account required |
| Search/news | Public, limited, cached | Good showcase value |
| Public AI | Shared summary only, if any | Avoid anonymous token burn |
| Email digests | Defer or heavily constrain | Complexity not justified early |
| Alerts | Defer or local-only demo | Server-side alerts need identity |
| Rate limiting store | Managed Redis | Simple and effective |
| Persistent server DB | Optional for MVP | Can be reduced if auth is removed |
| Kill switch | Environment-driven | Fast response to abuse |

## 7. Feature Access Model

| Feature | Public Anonymous | Notes |
|---|---|---|
| Homepage and dashboard | Yes | Core experience |
| TradingView market widgets | Yes | Low direct app cost |
| Stock search | Yes, limited | IP-limited and cached |
| News retrieval | Yes, limited | IP-limited and cached |
| Local watchlist | Yes | Stored in browser only |
| Local dashboard layout | Yes | Stored in browser only |
| On-demand personalized AI | No | Not compatible with cost goals |
| Shared AI market summary | Optional | Pre-generated and cached only |
| Email digests | Optional later | Only if explicit abuse controls exist |
| Server-driven alerts | No for MVP | Needs identity and abuse controls |

## 8. State Strategy Without Auth

### Principle

If there are no accounts, state should be either:

- ephemeral
- browser-local
- shared globally

Avoid creating anonymous server-side state unless it has clear product value.

### Recommended State Boundaries

#### Browser-local state

Use `localStorage` for:

- watchlist symbols
- dashboard widget layout
- selected view preferences
- dismissed UI states

#### Shared server-side state

Use server-side storage only for:

- shared cached summaries
- operational counters
- logs and metrics
- optional editorial content

#### Avoid for MVP

Do not build anonymous server-side user profiles just to mimic signed-in persistence. That complexity gives little return in a portfolio project.

## 9. Rate Limiting Strategy

### Principle

Without auth, the main control key becomes IP plus a global app budget.

Do not rate-limit page views first. Rate-limit the expensive operations behind them.

### Control Layers

#### Layer 1: IP-based request throttling

Apply IP-based rate limits to:

- public stock search
- public news fetches
- any future public API route that hits Finnhub or another paid dependency

Recommended starting limits:

- Search: 20 requests/minute/IP
- Search: 200 requests/day/IP
- News: 20 requests/minute/IP
- News: 200 requests/day/IP

#### Layer 2: IP-based AI throttling

If any public AI feature exists, apply stricter IP limits.

Recommended starting limits:

- Shared summary refresh endpoint: internal only if possible
- Any public AI-triggering endpoint: 1 request/minute/IP
- Any public AI-triggering endpoint: 5 requests/day/IP

In practice, the stronger recommendation is to avoid any public endpoint that directly triggers AI at request time.

#### Layer 3: Global circuit breaker

Add application-wide ceilings:

- daily AI request cap
- daily estimated token budget cap
- ability to disable AI entirely via environment flag

When the budget is exhausted, the system should stop generating and fall back to non-AI output.

### Suggested Starting Control Matrix

| Surface | Identity Key | Window | Limit | Notes |
|---|---|---|---|---|
| Public stock search | IP | 1 minute | 20 | Human-friendly |
| Public stock search | IP | 1 day | 200 | Scraper backstop |
| Public news fetch | IP | 1 minute | 20 | Matches search |
| Public news fetch | IP | 1 day | 200 | Scraper backstop |
| Public AI endpoint | IP | 1 minute | 1 | Only if such endpoint exists |
| Public AI endpoint | IP | 1 day | 5 | Strong ceiling |
| Any AI action | global | 1 day | configurable | App-wide safety ceiling |

### Why IP and Global Limits Matter

- IP limits reduce scraper and burst abuse.
- Global limits protect your budget even if IP-level controls are bypassed or traffic is distributed.

Without auth, these are the minimum viable controls.

## 10. Caching Strategy

### Principle

Caching is the cheapest protection mechanism because it prevents repeated upstream cost entirely.

### Public Data Caches

Use server-side caching for repeatable public read traffic.

Recommended cache windows:

- General news: 5 minutes
- Symbol-specific news: 5 minutes
- Stock search results for common queries: 15 to 30 minutes
- Popular stock profiles: 1 hour

The current code already uses `fetch(..., { next: { revalidate } })` patterns and React `cache` in `lib/actions/finnhub.actions.ts`. That should remain the first line of defense.

### Shared AI Outputs

If you keep AI visible in the product, generate once and reuse.

Examples:

- one shared daily market summary
- one shared summary per sector
- one editorial digest for all visitors

Do not generate one fresh summary per visitor.

### Cache Priority Order

Prefer this order:

1. serve existing cached/shared result
2. fetch cached upstream market/news data
3. compute new non-AI response
4. invoke AI only if explicitly allowed and within budget

This should become a standing project rule.

## 11. AI Cost Control Strategy

### Principle

LLM calls should be explicit, budgeted, and isolated from the core browsing experience.

### Required Controls

#### 1. No AI on first paint

No page should require an LLM call to produce its first meaningful user experience.

#### 2. Shared summaries over visitor-triggered summaries

If AI summaries are part of the public experience, the generation flow should be:

1. fetch relevant article set
2. normalize and deduplicate
3. generate one shared summary
4. cache it
5. serve it to everyone until expiry

#### 3. Graceful fallback

If AI is disabled, capped, or failing:

- show curated raw headlines
- show the last cached summary if available
- show a simple fallback message rather than throwing

#### 4. Hard budget ownership

Track:

- total AI calls/day
- estimated tokens/day
- failure count/day
- fallback count/day

This is essential in an auth-free model because spend is otherwise disconnected from identity.

### Strong Recommendation

Do not ship any public endpoint that triggers fresh AI generation per request in the portfolio MVP.

If you want AI in the demo, make it:

- scheduled
- shared
- cached
- optional behind a feature flag

## 12. Secrets and Trust Boundaries

### Principle

Paid or quota-sensitive upstream access must remain server-only.

### Decision

Remove reliance on `NEXT_PUBLIC_FINNHUB_API_KEY` for server-powered data operations.

Preferred boundary:

- server-only `FINNHUB_API_KEY`
- all paid data access routed through server-controlled code paths

### Inngest Route Protection

The Inngest route should be treated as an internal execution surface, not a public trigger surface.

Requirements:

- accept only signed or verified Inngest requests
- do not expose manual public triggering for expensive jobs
- keep cron and event execution idempotent where possible

## 12.1 Recommended Configuration Additions

The current `.env.example` covers the base app, but this architecture needs explicit runtime controls.

Recommended additions:

- `AI_ENABLED=true|false`
- `AI_DAILY_REQUEST_CAP=100`
- `AI_DAILY_TOKEN_BUDGET=...`
- `PUBLIC_SEARCH_RPM=20`
- `PUBLIC_SEARCH_RPD=200`
- `PUBLIC_NEWS_RPM=20`
- `PUBLIC_NEWS_RPD=200`
- `PUBLIC_AI_RPM=1`
- `PUBLIC_AI_RPD=5`
- `UPSTASH_REDIS_REST_URL=...`
- `UPSTASH_REDIS_REST_TOKEN=...`

These values do not need to be perfect on day one. They need to exist so tuning does not require code changes.

## 13. Recommended Infrastructure Choices

### Rate Limit Store

Use a small managed Redis-compatible store for:

- IP-based limiter counters
- short-lived cache metadata
- daily budget counters

For a serverless deployment, this is more reliable than process memory and simpler than building hot-path request limiting in MongoDB.

### Persistent Server Storage

If auth is removed from the project, MongoDB becomes optional for the public MVP.

Keep server-side persistence only if you need one of these:

- shared editorial content
- optional subscriber records
- long-lived analytics or operational records
- future authenticated features you intentionally keep on the roadmap

Otherwise, removing auth can justify reducing MongoDB’s importance in the runtime architecture.

### Minimal-Cost Deployment Shape

For this project, the target operating shape should be:

- Next.js app on a serverless platform
- managed Redis for rate limits and counters
- Finnhub through server-only access
- TradingView embeds for rich UI with low server burden
- optional shared AI summaries only
- optional MongoDB only if a retained feature truly needs persistence

This is intentionally conservative. Boring infrastructure is the right choice here.

## 14. Request Classification Model

| Request Type | Example | Identity | Cache | Rate Limit | Budget Cap | Fallback |
|---|---|---|---|---|---|---|
| Static/public UI | homepage, dashboard shell | none | CDN/browser | No | No | N/A |
| Public market widgets | TradingView embeds | none | external/shared | No direct app limit | No | external widget load |
| Public server read | stock search, news | IP | Yes | IP-based | optional | cached or empty state |
| Browser-local personalization | watchlist, layout | browser only | localStorage | No server limit | No | default UI state |
| Shared AI content | cached market summary | global | Yes | internal refresh only preferred | Yes | raw headlines / last cache |
| Scheduled AI jobs | shared digest refresh | internal only | reuse output | concurrency control | Yes | skip AI and keep cached output |

## 15. Implementation Sequence

### Phase 1: Simplify the Product Boundary

- remove auth as a core architectural dependency
- convert watchlist and layout persistence to `localStorage`
- decide whether `/dashboard` remains as a separate route or is merged into the public dashboard
- remove or hide login/signup CTAs if they no longer represent a real product path

### Phase 2: Protect Public Read Paths

- introduce Redis-backed rate limiting
- wrap public search/news paths with IP limits
- keep or improve existing caching windows
- remove public-key fallback for Finnhub

### Phase 3: Fix the AI Cost Model

- redesign any AI summary flow to generate shared summaries only
- add AI feature flags and daily budget caps
- remove any notion of user-specific AI in the public product

### Phase 4: Reassess Email and Alerts

- decide whether email digests should exist at all
- if retained, use strict opt-in, verification, and hard caps
- defer real alert infrastructure unless it clearly improves portfolio value

### Phase 5: Add Observability and Fallback UX

- log cache hits and misses
- log limiter denials
- log AI invocations and fallbacks
- track daily cost indicators
- polish UX messaging for rate-limited and AI-disabled states

## 15.1 Implementation Deliverables

The work should produce these concrete artifacts:

1. rate limit utility module with IP-based keys
2. Redis-backed limiter integration
3. localStorage-backed watchlist and layout persistence
4. server-only Finnhub access cleanup
5. shared-summary service or Inngest redesign
6. budget guard utility for AI paths
7. fallback UX copy for rate-limited and AI-disabled states
8. minimal observability dashboard or log conventions

## 16. Operational Rules

The app should always prefer bounded degradation over hard failure.

When limits are reached:

- do not crash the page
- do not throw unhandled errors to users
- show a friendly limited or temporarily unavailable state
- continue serving cached or non-AI data where possible

For a portfolio project, stability is more valuable than feature breadth.

## 17. Recommended Product Rules

- every visitor can explore immediately
- no core experience requires login
- browser-local state replaces account-backed persistence
- AI is never unlimited and anonymous
- cached or shared outputs are preferred over fresh compute
- paid third-party calls remain server-controlled and budget-aware
- any feature that implies identity must justify its complexity explicitly

## 18. Risks and Trade-Offs

### Trade-Off 1: No auth means weaker abuse attribution

True. The response is IP controls, caching, global budgets, and graceful degradation.

### Trade-Off 2: No accounts means no durable cross-device state

Also true. That is the correct trade for a portfolio demo unless cross-device persistence is part of the project story.

### Trade-Off 3: Alerts and digests become less natural

True again. Without identity, these features are either:

- deferred
- reduced to optional email capture
- or treated as demo-only concepts

That is acceptable if the core value is the public market dashboard experience.

### Trade-Off 4: Public AI is still risky even with controls

Correct. That is why the recommendation is shared AI or no public AI-triggered compute at all.

## 19. Open Questions

These are the main remaining product decisions:

1. Should `/dashboard` be merged into the homepage experience entirely?
2. Should watchlist and layout be strictly browser-local, with no server persistence at all?
3. Do you want any public AI content visible, or should AI be removed from the interactive product entirely?
4. Should email digests exist in the portfolio version, or should they be dropped to keep the architecture lean?
5. Is MongoDB still worth keeping in the public MVP if auth-driven persistence disappears?

## 19.1 Acceptance Criteria For This Architecture

This architecture can be considered successfully implemented when:

- a visitor can use the product meaningfully with no login anywhere
- the dashboard and core exploration features work publicly
- watchlist and layout persistence work locally in the browser
- public read paths are rate-limited and cached
- no visitor can trigger unlimited token spend
- daily AI spend is bounded by configuration
- the system degrades gracefully when limits are hit

## 20. Final Recommendation

Equipulse should adopt a fully public, auth-free, cost-guarded architecture:

- public for all core exploration
- browser-local state for personalization
- IP-based limits for paid read paths
- shared or disabled AI for the public experience
- budget caps and kill switches for safety

If only one product simplification is prioritized first, it should be this:

Remove auth from the core experience and move watchlist/layout persistence to `localStorage`.

If only one cost-control decision is prioritized first, it should be this:

Do not allow per-request anonymous AI generation. Use shared summaries or no public AI at all.

Those two decisions together define the cleanest architecture for an affordable portfolio project.

## 21. Suggested Next Implementation Order

1. remove auth dependency from the public product shape
2. convert watchlist and layout persistence to browser-local storage
3. lock Finnhub behind server-only secrets
4. add Redis-backed rate limiting for public search/news
5. add AI feature flags and daily budget caps
6. redesign or remove email digest and other identity-heavy flows
7. add monitoring and fallback UX
