# Skill: /location

Triggered by: `/location`

Generates a fully optimized destination/location SEO page for Proposal Spots, consistent with existing destination pages.

---

## Before doing anything

Read these files in this order:
1. `CONTEXT.md` — site rules and architecture
2. `references/voice.md` — how to write
3. `references/humour.md` — how to use humour
4. `references/stats.md` — what numbers to use
5. `references/stories.md` — the one story you can reference
6. `references/opinions.md` — strong positions to draw from
7. `references/on-page-seo.md` — every SEO requirement
8. `references/used-keywords.md` — keywords already used (never repeat as primary)

Do not write a single word of content until you have read all eight files.

---

## Step 1 — Select keyword

Open `seo/keywords.csv`.

Filter to rows where:
- `Page type` = `Location Page`
- `Status` = blank or `Not Started`

Sort by `Priority` column descending (highest ratio first).

Select the top keyword that does NOT appear in `references/used-keywords.md`.

Identify which destination this maps to (e.g. "santorini proposal" → Santorini, "proposal in bali" → Bali).

Check whether a destination page already exists for this destination at `/destinations/[slug].html`.

If the destination page exists: this keyword becomes SEO content added to the existing page's metadata and content — do not create a duplicate page.

If the destination page does not exist: create a new one following the pattern of existing destination pages exactly.

---

## Step 2 — Build keyword cluster

From the same CSV, find all Location Page keywords for the same destination that are NOT yet used. These all feed into the same destination page.

Example: for Santorini, cluster all these together:
- "santorini proposal"
- "santorini marriage proposal"
- "best places to propose in santorini"
- "where to propose in santorini"
- "santorini proposal packages"

All of these should be addressed naturally within one destination page.

---

## Step 3 — Research the SERP

Search Google for the primary keyword.

Analyze the top 3 ranking pages (skip Reddit, Quora, forums):
- What sections do they all cover?
- What specific locations or spots do they mention?
- What practical information (best time of year, weather, access) do they include?
- What do they miss?

Your page must cover everything they cover plus at least one angle they missed.

---

## Step 4 — Write the destination page content

Following voice.md exactly.

Every destination page must include:

**Hero section:** destination name, one-line description (specific, not generic)

**Why propose here:** 2–3 paragraphs. Specific. Name the actual qualities — the light, the privacy, the landscape. Not "romantic atmosphere."

**Best spots section:** If spots are live in Airtable for this destination, reference them. If not, describe the types of locations that make this destination exceptional for proposals (cliffside terraces, private beach access, etc.)

**Best time to visit:** Specific months. Crowd patterns. Golden hour timing. Weather considerations.

**Practical information:** How to get there. What to book in advance. What to avoid.

**Who this destination is NOT right for:** Always include this. It builds trust.

**FAQ section:** 4–8 questions from "People Also Ask" for the primary keyword.

**CTA:** Link to view available spots (if live) or email capture (if destination not yet launched).

Content rules — same as /blog:
- Primary keyword in first 100 words
- 3–5 internal links to related blog posts or other destination pages
- 2–3 external links to authoritative sources
- No AI-tell phrases
- No exclamation marks
- No emojis
- One humour moment max
- One opinion max

---

## Step 5 — Add SEO elements

Apply every applicable item from `references/on-page-seo.md`:

- Title tag: "[Primary Keyword] — Proposal Spots" (50–60 chars)
- Meta description (150–160 chars, emotional + specific)
- Canonical URL: `/destinations/[slug]`
- Open Graph tags
- Twitter Card tags
- JSON-LD schema: TouristAttraction + FAQPage + BreadcrumbList
- Place schema with destination name and region

---

## Step 6 — Save or update the file

If new destination:
```
/destinations/[slug].html
```

Match existing destination page structure exactly. Use same nav, CSS variables, components. Do not invent anything new.

If adding to existing destination page:
Update the existing file's metadata, title tag, and content to incorporate the new keyword cluster naturally.

---

## Step 7 — Update homepage destination cards

If this is a new destination page, add a destination card to `index.html` with:
- `href="/destinations/[slug]"`
- Same card style as all existing cards
- Hero image (use Unsplash URL for now if no image is available — note this as a TODO)

---

## Step 8 — Update vercel.json

Add the route if it is a new page.

---

## Step 9 — Update keyword tracker

Add the primary keyword (and all clustered keywords used) to `references/used-keywords.md`:
```
[keyword] | [date] | /destinations/[slug]
```

---

## Step 10 — Update keyword tracker CSV

Open `seo/keywords.csv`. For the primary keyword row (and every clustered keyword row that was addressed by this page), update:
- `Status ` (note: column header has a trailing space) → `Published`
- `Date Published` → today's date in `YYYY-MM-DD` format

Do not modify any other row. Save the file.

---

## Step 11 — Confirm completion

Report:
- Primary keyword and all cluster keywords used
- Destination slug and URL
- Whether new page or updated existing
- Internal links added
- Schema types applied
- File saved location
- `used-keywords.md` updated confirmation
- `seo/keywords.csv` rows updated (Status = Published, Date Published = today)
- Any TODOs flagged (e.g. missing hero image)

Do not say "done" until the build would pass.