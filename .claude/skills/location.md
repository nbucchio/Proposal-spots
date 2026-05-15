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

- **H2: "Why Propose in [Destination]"** — 2–3 paragraphs, specific, no generic travel language. Primary keyword used naturally in the first 100 words.
- **H2: "Best Times to Propose in [Destination]"** — specific months, crowd patterns, golden hour timing.
- **H2: "What to Know Before You Go"** — practical specifics: access, what to book, what to avoid.
- **H2: "Who This Destination Is NOT Right For"** — always include. Builds trust.
- **FAQ section** — 4–8 questions from People Also Ask + keyword research, with direct answers.
- **3–5 internal links** to related blog posts or other destination pages.
- **2–3 external links** to authoritative sources.
- **One Unsplash hero image** if the page doesn't already have one — use the same API approach as the blog skill.
- **Photo credit at bottom** if image added.

Content rules — same as blog skill:
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
- **Canonical URL:** `/destinations/[slug]`

Do not change anything else in the `<head>`.

---

## Step 9 — Update keyword tracker

Add the primary keyword and all cluster keywords used to `references/used-keywords.md`:

```
[keyword] | [date] | /destinations/[slug]
```

Update `seo/keywords.csv` — set `Status` = `Published` and `Date Published` = today (YYYY-MM-DD) for all keywords used.

---

## Step 10 — Confirm completion

Report:
- Destination page updated: `/destinations/[slug]`
- Primary keyword and all cluster keywords used
- Word count of content added
- Sections added (list them)
- Internal links added
- Schema types added
- Image added or skipped
- `used-keywords.md` updated
- `seo/keywords.csv` updated
- Any issues or TODOs flagged

---

## Hard rules

- Never create a new destination page.
- Never remove existing content.
- Never change nav, hero, spot cards, or existing CSS.
- Always show a summary of changes before writing any code.
- List every file touched when done.
