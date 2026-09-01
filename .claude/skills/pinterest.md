# Skill: Pinterest content engine

Triggered by: any request to create Pinterest pins, plan Pinterest content, review Pinterest performance, build board strategy, or run the weekly content batch. Always use this for Pinterest work — do not improvise generic Pinterest advice, this account has specific proven data that overrides generic best practice.

This is the durable, git-tracked source of truth for this skill. A copy also lives in the assistant's personal skill store (`~/.claude/skills/proposal-spots-pinterest/`) for day-to-day invocation, but that copy is **not** guaranteed to survive a container restart (it has been lost once already). If the two ever disagree, or the personal copy is missing, **this file wins** — restore the personal copy from this one, not the other way around.

---

Pinterest is a visual search engine, not a social platform. Content compounds over months (avg pin lifespan 13+ months), so the strategy is patient and keyword-driven, not viral-chasing. Everything below is calibrated to this account's actual data, not generic Pinterest advice — where the two conflict, this account's data wins.

## The one thing to know before anything else

As of the July 2026 audit: 7.7K impressions / 90 days, but only **13 outbound clicks**. The account has a reach problem solved and a conversion problem unsolved. Three generic "Couple Goals" pins carry 60%+ of all impressions and **zero** outbound clicks between them. Every outbound click came from specific, keyword-titled, decision-stage content ("Best Places to Propose in the United States — 9 Spots Worth Knowing," "Unique Proposal Ideas For Her — Volcano View at Golden Hour," "Helicopter Proposal," "Picnic Proposal: How to Do It Well").

**Default bias for every new pin: utility and planning content over generic discovery content.** Broad, pretty, no-title "vibes" pins are not the priority right now — this account already has plenty of reach, it needs more decision-stage content that earns the click. See "Content types" below.

## Board strategy

Current boards (audited July 2026) — treat as living, don't delete or merge. Renaming a board reindexes it and costs the pin history it's built, so grow thin boards with fresh pins rather than restructuring them.

**Destination boards** (map 1:1 to target markets/SEO pages): Costa Rica, Nicaragua, Tulum, Bali, Algarve/Portugal, South of France, Switzerland, Santorini, Maldives, Italy, Spain, Paris, Hawaii. Note: verify the exact live board name before pinning — e.g. the real Paris board is named **"Paris proposal"**, not just "Paris." Always check `/api/pinterest/boards` or ask if unsure rather than assume the destination name matches the board name exactly.

**Vibe/cross-cutting boards** (draw photos from any destination): Cliffside Proposals, Castle Proposals, Private Beach Proposals, Jungle Proposal Ideas, Mountain Proposal, Cold Proposals, Romance, Couple Goals, Lake Proposal, Volcano Proposal, Proposal Guide, Proposal Photos.

Rules for boards:
- New board needs 10–20 pins to be "healthy" before it'll index well. Thin boards (under ~10) aren't broken, they just need dedicated pin runs — flag them for priority in weekly batches, don't restructure them.
- One photo/spot can and should become **multiple pins across time** — a strong Santorini cliffside shot can be a "Santorini proposal" destination pin now and, as a different crop/text-overlay variant later, a "cliffside proposal ideas" vibe pin. Pinterest indexes each *pin* (image), not the URL — this is not duplication, it's distribution.
- Never force a pin onto every board it could technically fit. Match pin to board topic tightly; off-topic pins on a board confuse the algorithm.
- Don't delete pins or boards, ever, even dead ones — archive to secret instead. Old pins keep earning traffic for years. (Exception: throwaway sandbox/test boards created during development, which were never real content — those are fine to delete, and we did.)
- Don't chase group boards or repin others' content to pad board counts. Minor exception: curating a genuinely relevant partner's or press feature's content is fine in small amounts, not a filler strategy.
- Ignore follower count entirely — Pinterest doesn't require a follow to serve your content, and it's not tracked as a success metric on the platform itself.

## Content types — build a mix, but bias utility right now

Every pin does one of three jobs. Judge each pin by the metric that matches its job, not a single blanket metric:

- **Discovery** (high impressions, low clicks) — broad, pretty, top-of-funnel. This account already has this covered.
- **Planning** (high saves) — the native Pinterest use case for this exact customer: someone saving proposal ideas for months before acting. Treat "save-worthy" as a first-class goal, not an afterthought.
- **Utility** (high outbound clicks) — specific, answers one question right now ("Best Places to Propose in X," "Helicopter Proposal: An Honest Take," pricing/cost guides). **This is what's underbuilt and what's proven to convert on this account.**

Weekly batches should skew toward utility and planning pins, pulling from real existing content (see next section) before generating anything net-new.

## Mining existing content first — before creating anything new

The account already has unused inventory. Before generating new pin concepts, check the site's existing blog/spot pages for content that has zero or thin Pinterest presence — pages like cost guides, "how to propose in X," honest-take format posts, and destination pages are exactly the utility content proven to convert. One blog post or spot can support 10–30 pins over time by breaking it into angles:
- Each major sub-topic in the piece → its own pin (e.g., a Switzerland post → "what to do," "where to eat," "family activities," individual photo themes)
- Each distinct keyword variation people search for the same topic → its own pin with a different title/description, same link
- Do keyword research per piece using Pinterest's own search bar autocomplete and trends.pinterest.com — **never Google or ChatGPT for Pinterest keywords**, Pinterest search behavior is genuinely different from Google's.

## Pin production specs

- **Source photo orientation**: **prioritize portrait-oriented photos** when a spot has multiple to choose from (Cover Photo / Spot Card Photo / Gallery Photos). Reasoning: the final pin canvas is portrait (2:3, see below) — a portrait source photo maps onto that shape with minimal, natural cropping, while a landscape source gets forced into a narrow vertical sliver, losing most of the original composition. Only fall back to a landscape source photo when a spot genuinely has no portrait option, and crop thoughtfully rather than just squeezing the wide frame in. (This reverses an earlier version of this rule that prioritized landscape — that was backwards relative to Pinterest's own best practice and got corrected on Sep 1, 2026.)
- **Ratio**: 1000×1500px (2:3) for the final pin canvas. Never square — it takes less feed space and underperforms. Video pins can use 1080×1920 (also portrait/vertical).
- **Text overlay**: minimal, matches brand guide — photography leads, text steps back. Pinterest's algorithm reads the image itself via computer vision, so a clean uncluttered photo can rank on visual relevance alone; this happens to be exactly this brand's aesthetic already.
- **Title + description**: pack with real keywords found via Pinterest's own tools, written as natural sentences, not keyword-stuffed. Descriptions can run up to 800 characters — use the room. Board descriptions cap at 500 characters, ~5 keywords, natural sentences.
- **Design system**: Canva, using the Proposal Spots brand kit — Cormorant (headlines) / Jost (body/UI), cream/terracotta/taupe/gold palette, thin hairline elements, no bold color-flip CTAs. Pull from ProposalSpotsBrandGuide.pdf.
- **Batch build**: for a weekly run of 5–8+ pins, use Canva's Bulk Create app — prep a simple sheet (title / description / image reference per row), map once to a brand template, generate the whole batch in one pass rather than building pins one at a time.
- **File naming**: rename downloaded files with real keywords before upload — Pinterest reads the filename too. Small thing, real signal.

## Cadence and scheduling

- Target: **5–8 new pins/week**, spread across the week, not dropped in one batch-day. Steady beats bursty even at identical total volume.
- Use Pinterest's free native scheduler for anything up to ~5 pins/day. It's free, does the job, and there's no reason to pay for more until volume outgrows it.
- **Do not add Tailwind yet.** It was restructured in 2026 — free tier is now only 5 posts/month, real usage starts around $18–20/month. Revisit only if pin volume consistently exceeds 5/day for a month straight and manual scheduling becomes an actual bottleneck. Canva Pro (already in use) can auto-publish static pins directly, no second tool needed at current volume.
- Canva's native scheduler cannot publish Reels, Stories, or carousels — static image pins only. Not a blocker for Pinterest (it's mostly static pins here), but don't expect it to cover Instagram video.

## Publishing automation — the pipeline (LIVE — Standard access approved, production verified)

The programmatic publish path is built (Pinterest v5 API, App ID 1568781, code in the site repo under `api/pinterest/` and `lib/pinterest.js`) and **is now live on production**, as of Sep 1, 2026 — Pinterest approved Standard access, `PINTEREST_MODE=production` is set with fresh production tokens, `PINTEREST_PUBLISH_SECRET` is set, and `/api/pinterest/boards` was verified to be pulling the real account's real boards. This is no longer sandbox-only. It runs as a clean three-part chain — each part has one job, don't blur them:

- **Airtable = the facts.** The Spot's real cover photo, summary, and public URL live on the **Proposal Spots** table.
- **This skill = the brain.** It picks the board, writes the title/description in-voice with real Pinterest keywords, and decides how many pins.
- **`/api/pinterest/publish` = the hands.** It takes what the skill produced and creates the pin — for real, publicly, now.

### IDs you need
- Base **Proposal Spots**: `appN5GFcdPJvU1qff`
- Table **Proposal Spots** (the listings): `tblgpEUkpph612Hw5` — read `Slug`, a summary field, and every available image (`Cover Photo`, `Spot Card Photo`, `Gallery Photos` — all `multipleAttachments`; most spots have 5–8+ real photos across these three fields).
- Table **Social Posts** (the content hub): `tblWM7w6enxsOloBt` — channel-agnostic log, linked to Proposal Spots. Fields: `Post Name`, `Spot` (link), `Channel` (Pinterest/Instagram/TikTok/Facebook), `Title / Copy`, `Description`, `Board / Placement`, `Image URL`, `Link`, `Status` (Draft/Scheduled/Published/Failed), `Post URL`, `Posted`.
- Public spot page URL pattern: `https://www.proposalspots.com/spots/<Slug>`
- Publish endpoint: `POST https://www.proposalspots.com/api/pinterest/publish` — now requires the `x-publish-secret` header (or `?secret=`) matching `PINTEREST_PUBLISH_SECRET`, since this posts for real.

### The chain — run this when asked to "make/post pins for <spot>"
1. **Read the Spot from Airtable** (`search_records` on `tblgpEUkpph612Hw5` by name). Pull `Slug`, a summary field for context, and **every available image** — `Cover Photo`, `Spot Card Photo`, and `Gallery Photos`. Airtable attachment URLs are **time-limited signed links** — always re-fetch fresh URLs from the source record right before use rather than reusing URLs seen earlier in a conversation or in an old Social Posts row; they expire (roughly on the order of weeks).
2. **Check for double-posting first.** Search `Social Posts` (`tblWM7w6enxsOloBt`) for existing rows where `Spot` = this listing and `Channel` = Pinterest with a non-empty `Post URL`. Don't recreate a pin that already went out — make a *different-angle* pin instead (see "Mining existing content"), or stop and say what already exists. Note: rows with a `Post URL` pointing at a since-deleted sandbox board are stale, not real posts — treat those as available to redo for real, not as already-posted.
3. **Generate the pin(s)** — apply everything above this section: bias utility/planning, keyword-titled, board matched tightly to topic (verify the real board name — see "Board strategy" above), description up to 800 chars. Default to 1–2 pins unless asked for more. Two hard image rules: (a) **prefer a portrait-oriented source photo** per "Pin production specs" above; (b) **every pin in the batch must use a different photo** — pull from across Cover Photo/Spot Card Photo/Gallery Photos, never the same attachment twice. If genuinely only one photo exists for a spot, say so and stop rather than duplicating it across pins (a distinct crop/text-overlay counts as different; the identical file does not).
4. **Log each pin as a `Draft` row in Social Posts** before posting: `Channel` = Pinterest, `Spot` = linked, `Title / Copy`, `Description`, `Board / Placement`, `Image URL` = that pin's chosen photo, `Link` = `https://www.proposalspots.com/spots/<Slug>`, `Status` = Draft.
5. **Stop and show Nicholas the drafts before posting anything.** List each pin's title, description, board, and image (link the Airtable Draft row or the image URL so he can actually see it) and wait for explicit go-ahead — "post these," "yes," or similar. Do not proceed to step 6 on an assumption that the request to "make pins" already implied permission to publish them. If he asks for changes, edit the Draft row(s) and re-show before publishing. **This gate matters even more now that publishing is real and public — there is no sandbox safety net anymore.**
6. **Publish** — only after approval, and only for the rows he confirmed. For each, `POST /api/pinterest/publish` with JSON `{ board, title, description, image, link }` and the `x-publish-secret` header/param set to the value of `PINTEREST_PUBLISH_SECRET` (ask Nicholas for it if not already known — never guess or reuse an old sandbox-era assumption that it's unset). Response: `{ success, pin_id, pin_url, board_id, board_name }`.
7. **Write back** onto that Social Posts row: `Status` = Published, `Post URL` = `pin_url`, `Posted` = today. On error, set `Status` = Failed and keep the error in mind — don't silently retry into a duplicate.

## Seasonal planning

Use Pinterest Trends' "Moments" feature to find predicted peak dates for seasonal content (holiday proposals, Valentine's, New Year's engagement season) and start pinning **~90 days ahead of the predicted peak** — Pinterest search behavior runs well ahead of the actual date because pinners are in planning mode, not last-minute mode.

Worth checking (unconfirmed as of this writing): a real Pinterest Trends API endpoint exists — `GET /trends/keywords/{region}/top/{trend_type}` — returning trending keywords with WoW/MoM/YoY growth and normalized search volume. Worth wiring into `lib/pinterest.js` as a genuine next step, to pull real trending keywords instead of manually browsing trends.pinterest.com.

## Weekly review — outbound clicks are the north star

Check Pinterest Analytics weekly, filtered to **outbound clicks**, not impressions or saves alone — impressions prove reach exists, outbound clicks prove the content is doing its job of sending people to the site. Cross-reference against Google Analytics session data when available. If a pin earns a click or a save, that's a signal to expand it — make more pins in that same topic/keyword family, not to repin the same asset elsewhere.

Worth checking (unconfirmed as of this writing): a Pinterest Pin Analytics endpoint exists — `GET /pins/{pin_id}/analytics` — which could automate this weekly check by pulling impressions/saves/outbound-clicks per pin and writing them back into the Social Posts table, rather than relying on manually reading Pinterest's own dashboard. Worth building once the core publish loop has been running smoothly for a while.

## What NOT to do

- Don't repin your own old pins to new boards hoping for a second life — make a fresh pin instead (new image, at minimum a new crop/overlay).
- Don't delete pins, boards, or old content — archive to secret instead. (Sandbox/test boards created during development are the one exception — those aren't real content.)
- Don't let Instagram content autopublish raw to Pinterest — it arrives with no title, the IG caption as description, and a link back to Instagram instead of the website, dumped into an unoptimized "Social" board. Every Pinterest pin needs a Pinterest-native title, keyword description, and direct site link, built for Pinterest first — not IG content reformatted after the fact. Also: editing a pin's title/description *after* publishing resets its stats and forces reindexing, so get it right the first time rather than publish-then-fix.
- Don't use ChatGPT/Google keyword tools for Pinterest keyword research — use Pinterest's own search bar, trends.pinterest.com, and Ads Manager keyword finder.
- Don't publish without Nicholas's explicit sign-off on the drafts first (see chain step 5). Now that this is live/production, a mistake here is genuinely public, not sandbox-contained.

## Audience note

Current Pinterest audience skews 70% female / 24% male, broader lifestyle-affinity (Vehicles, Wedding, Architecture, Sport) rather than pure proposal-intent — likely a byproduct of high-reach generic "Couple Goals" content. Not necessarily a problem (partners researching together, future engaged couples sharing content are legitimate secondary audiences) but worth knowing this skews further from the "men planning a proposal" target customer than the utility-content strategy above should naturally correct for over time, since utility/planning pins attract higher-intent searchers.
