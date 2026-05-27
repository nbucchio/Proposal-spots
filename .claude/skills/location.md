# Skill: /location

Triggered by: `/location [destination-slug] [primary-keyword]`

Example: `/location hawaii "full service proposal hawaii"`

Injects a fully optimized SEO content block into an existing destination page for Proposal Spots. This skill never creates a new destination page — it only enriches one that already exists.

---

## Step 1 — Read all reference files first

Read these files in this order:
1. `references/voice.md`
2. `references/humour.md`
3. `references/stats.md`
4. `references/stories.md`
5. `references/opinions.md`
6. `references/on-page-seo.md`
7. `references/used-keywords.md`

Do not write anything until all 7 are read.

---

## Step 2 — Select keyword

If a primary keyword is passed in the trigger, use that.

If not, open `seo/keywords.csv`, filter to rows where:
- `Page type` = `Location Page`
- `Status` = blank or `Not Started`

Sort by `Priority` column descending and pick the highest unused keyword that does not appear in `references/used-keywords.md`.

Identify which destination slug this maps to (e.g. "santorini proposal" → `santorini`, "proposal in bali" → `bali`).

---

## Step 3 — Build keyword cluster

From `seo/keywords.csv`, find all Location Page keywords for the same destination that are not yet used. All of these keywords get targeted on the same page and should be addressed naturally within the SEO content block.

---

## Step 4 — Find the existing destination page

Look for `/destinations/[slug].html`.

If it does not exist, flag it and stop — do not create a new page. Tell the user:

> "No destination page found for [slug]. Please build the destination page first, then run /location again."

---

## Step 5 — Research the SERP

Search Google for the primary keyword.

Analyze the top 3 ranking pages (skip Reddit, Quora, forums):
- What sections do they cover
- Approximate word count
- H2 structure
- People Also Ask questions

Your content must cover everything they cover plus add at least one angle they missed.

---

## Step 6 — Write the SEO content block

Write a self-contained SEO content section following `voice.md` exactly.

This content block must include:

- **TL;DR answer block** at the very top, right after the first H2. Two to three sentences that directly answer "where should I propose in [Destination] and what does it cost", naming the top 2–3 spots and the price range. AI engines (ChatGPT, Claude, Perplexity, Gemini) quote the first direct answer they find, so lead with it.
- **H2: "Why Propose in [Destination]"** — 2–3 paragraphs, specific, no generic travel language. Primary keyword used naturally in the first 100 words.
- **H2: "Best Times to Propose in [Destination]"** — specific months, crowd patterns, golden hour timing.
- **H2: "What to Know Before You Go"** — practical specifics: access, what to book, what to avoid.
- **H2: "Who This Destination Is NOT Right For"** — always include. Builds trust.
- **FAQ section** — 4–8 questions from People Also Ask + keyword research, with direct answers.
- **3–5 internal links** to related blog posts or other destination pages.
- **2–3 external links** to authoritative sources.
- **One Unsplash hero image** if the page doesn't already have one — use the same API approach as the blog skill.
- **Photo credit at bottom** if image added.

### AI search / generative engine optimization (always do this)

AI assistants increasingly mediate "where should I propose in [Destination]" queries, and no competitor has structured content for them. Build the page to be the cleanest source to extract from:

- **Name specific spots** in every FAQ answer and in the body — the actual cove, cliff, cenote, vineyard, or neighbourhood, pulled from the existing spot grid on the page plus well-known public ones. The question "Where is the most romantic place to propose in [Destination]?" must be answered with named places, not adjectives.
- **One comparison table** the AI can ingest cleanly: a plain HTML `<table>` comparing the destination's settings/regions across columns like Best for, Privacy, Best time of day, Rough cost. Match the existing budget-table styling on the page (thin hairlines, no heavy borders, on-brand).
- **Self-contained answers** — the TL;DR and every FAQ answer must make sense lifted out of context. No "as mentioned above".

Content rules — same as blog skill:
- **No em-dashes or en-dashes ("—" or "–") in any new customer-facing content.** Use periods, commas, colons, or parentheses. Number ranges: write "6 to 8 weeks", not "6–8". Leave any em-dashes already on the page; just do not add new ones.
- No AI-tell phrases (see `voice.md`)
- No exclamation marks
- No emojis
- One humour moment max
- One opinion max
- Start with the answer, never build to it

Show a summary of all changes before writing any code.

---

## Step 7 — Inject content into existing destination page

Open `/destinations/[slug].html`.

Find the best insertion point — after the hero section and existing spot grid, before the footer.

Insert the full SEO content block there.

- Do not remove or change any existing content on the page.
- Do not change the hero, nav, spot cards, or any existing sections.
- Do not change any CSS.

---

## Step 8 — Update SEO metadata on the destination page

Update only these fields in the existing page:

- **Title tag:** `[Primary Keyword] — Proposal Spots` (50–60 chars)
- **Meta description:** 150–160 chars, emotional + specific, includes primary keyword
- **og:title** and **og:description** to match
- Add **FAQPage JSON-LD schema** for the FAQ section
- Add **BreadcrumbList JSON-LD schema** if not already present
- Add **TouristDestination (or Place) JSON-LD schema** for the destination itself, with `name`, `description`, and `geo` coordinates if known. This is what AI engines read to confirm the page is authoritatively about that place.
- Add **ItemList JSON-LD schema** listing the named proposal spots covered on the page (the spot grid plus any well-known public spots named in the body), each as a `ListItem` with `name` and `position`. This makes the "best spots in [Destination]" list machine-extractable.
- **Canonical URL:** `/destinations/[slug]`

Do not change anything else in the `<head>`.

---

## Step 9 — Add the closing CTA block

If the page does not already have a bottom CTA, add one at the very end of the content, just before the footer. Two buttons side by side, matching the on-brand outlined button style already used on the page:

- **Primary button:** `Find my [Destination] proposal spot →` — scrolls smoothly to the existing spot grid. Use the same scroll target the page already uses (e.g. `.dest-landing-spots-wrap`):

```html
<section style="background:var(--bg);padding:0 40px 96px;text-align:center;">
  <div style="max-width:720px;margin:0 auto;border-top:1px solid var(--hairline);padding-top:64px;">
    <span style="display:block;font-family:'Jost',sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:var(--accent);margin-bottom:18px;">Start here</span>
    <h2 style="font-family:'Cormorant',serif;font-weight:300;font-size:34px;line-height:1.2;margin:0 0 32px;color:var(--ink);">Your [Destination] proposal starts with the right spot.</h2>
    <div style="display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;">
      <a href="#spots" onclick="document.querySelector('.dest-landing-spots-wrap').scrollIntoView({behavior:'smooth'}); return false;" class="pg-cta-btn" style="background:#A55A4A;font-size:12px;padding:16px 44px;margin-top:0;">Find my [Destination] proposal spot →</a>
      <a href="/destinations" class="pg-cta-btn" style="background:transparent;color:var(--ink);border:1px solid var(--ink);font-size:12px;padding:16px 44px;margin-top:0;">Browse by destination →</a>
    </div>
  </div>
</section>
```

- **Secondary button:** `Browse by destination →` — links to `/destinations`, transparent background, thin ink border.
- Match the page's existing scroll target and button class. Do not invent new CSS classes; reuse `pg-cta-btn` and inline styles as above.

---

## Step 10 — Update keyword tracker

Add the primary keyword and all cluster keywords used to `references/used-keywords.md`:

```
[keyword] | [date] | /destinations/[slug]
```

Update `seo/keywords.csv` — set `Status` = `Published` and `Date Published` = today (YYYY-MM-DD) for all keywords used.

---

## Step 11 — Confirm completion

Report:
- Destination page updated: `/destinations/[slug]`
- Primary keyword and all cluster keywords used
- Word count of content added
- Sections added (list them)
- TL;DR block and comparison table added (yes/no)
- Internal links added
- Schema types added (FAQPage, BreadcrumbList, TouristDestination/Place, ItemList)
- Closing CTA block added (yes/no)
- Image added or skipped
- `used-keywords.md` updated
- `seo/keywords.csv` updated
- Any issues or TODOs flagged

---

## Hard rules

- Never create a new destination page.
- Never remove existing content.
- Never change nav, hero, spot cards, or existing CSS.
- Never remove or alter the spot-card carousel script (`spot-card-carousel.js`) or the `<meta name="referrer" content="no-referrer">` tag (Unsplash images 403 without it).
- Always show a summary of changes before writing any code.
- List every file touched when done.
