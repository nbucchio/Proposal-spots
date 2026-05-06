# Skill: /blog

Triggered by: `/blog`

Generates a fully optimized, voice-consistent blog post for Proposal Spots and saves it as a static HTML file in the correct location.

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
- `Page type` = `Blog`
- `Status` = blank or `Not Started`

Sort by `Priority` column descending (highest ratio first).

Select the top keyword that does NOT appear in `references/used-keywords.md`.

Extract:
- Primary keyword
- Volume
- KD
- Intent

---

## Step 2 — Build keyword cluster

From the same CSV, find 4–6 related Blog keywords that share semantic meaning with the primary keyword. These become your secondary keywords to weave naturally into the content.

If no close matches exist in the CSV, generate logical semantic variants.

---

## Step 3 — Research the SERP

Search Google for the primary keyword.

Analyze the top 3 ranking pages (skip Reddit, Quora, and forum results):
- Note the format (listicle, guide, comparison, narrative)
- Note the approximate word count
- Note every topic they cover
- Note the H2 structure
- Note any FAQ questions from "People Also Ask"

Your post must:
- Match the dominant format of the top 3
- Be within 20% of the average word count
- Cover every topic all three cover
- Add 1–2 topics or angles they missed
- Answer the main query directly in the first paragraph

---

## Step 4 — Write the post

Write the full blog post following voice.md exactly.

Structure:
- H1: contains primary keyword, written as a human would — not keyword-stuffed
- Introduction: answer the query directly in the first 2–3 sentences. No build-up.
- Body: H2 sections following the researched structure
- FAQ section: 4–8 questions from "People Also Ask" + SEMrush Questions tab equivalent
- Conclusion: one clear next step or CTA linking to a relevant destination page

Content rules:
- Primary keyword in first 100 words
- 3–5 internal links to relevant destination pages or other blog posts
- 2–3 external links to authoritative sources (open in new tab)
- One humour moment max (see humour.md)
- One story reference max (see stories.md)
- One strong opinion max (see opinions.md)
- No AI-tell phrases (see voice.md — "Tells that it's AI-written")
- No exclamation marks
- No emojis

---

## Step 5 — Add SEO elements

Apply every applicable item from `references/on-page-seo.md`:

- Title tag (50–60 chars, primary keyword near start)
- Meta description (150–160 chars)
- Canonical URL: `/blog/[slug]`
- Open Graph tags
- Twitter Card tags
- JSON-LD schema: Article + FAQPage + BreadcrumbList
- Image alt text, filenames, width/height attributes
- Slug: lowercase, hyphens, primary keyword, under 60 chars

---

## Step 6 — Save the file

Save the completed post as:
```
/blog/[slug].html
```

Use `/blog/template.html` as the starting point. Replace every `{{...}}` placeholder. The file must use the same nav, CSS variables, and design patterns as existing pages. Do not invent new components or classes.

---

## Step 7 — Update keyword tracker

Add the primary keyword to `references/used-keywords.md`:
```
[keyword] | [date] | /blog/[slug]
```

---

## Step 8 — Update vercel.json

The generic `/blog/:slug` rewrite already exists in `vercel.json`. No change needed unless the slug requires a custom route.

---

## Step 9 — Register the post on the inspiration page

Open `inspiration.html`, locate `const BLOG_POSTS = [`, and prepend the new entry at the top of the array:

```
{
  title: "[post title — same as <h1>]",
  slug: "[slug — same as filename]",
  description: "[one-line description, ~110 chars max, no smart quotes]",
  tag: "[Planning | Location | Logistics | Etiquette | Budget | Stories]",
  readTime: "[N min read]"
}
```

Use straight quotes only.

**Then remove the closest-matching placeholder** so the page never shows two near-duplicate cards. The original placeholders are:

- `how-to-plan-a-proposal-abroad`
- `where-to-propose-choosing-the-right-place`
- `how-to-hide-the-ring-while-travelling`

If the new post overlaps in topic with any of those (planning steps, location choice, ring logistics, etc.), delete that placeholder entry from the array. If no clear topical overlap exists and there are still 3+ entries in the array, delete the last placeholder so the array stays at 3 items until you have published 3 real posts.

Once all 3 original placeholders have been replaced, simply prepend without removing anything.

Save the file.

---

## Step 10 — Update keyword tracker CSV

Open `seo/keywords.csv`. Find the row whose `Keyword` column matches the primary keyword used. Update that row:
- `Status ` (note: column header has a trailing space) → `Published`
- `Date Published` → today's date in `YYYY-MM-DD` format

Do not modify any other row. Save the file.

---

## Step 11 — Confirm completion

Report:
- Primary keyword used
- Word count
- Slug and URL
- Internal links added (list them)
- Schema types applied
- File saved location
- `used-keywords.md` updated confirmation
- `inspiration.html` BLOG_POSTS array updated confirmation
- `seo/keywords.csv` row updated (Status = Published, Date Published = today)

Do not say "done" until the build would pass — correct HTML structure, no broken links, voice check passed.