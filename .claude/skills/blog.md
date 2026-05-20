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
- 3 to 5 internal links to relevant destination pages or other blog posts
- **Destination link mapping — Amalfi Coast:** Any mention of the Amalfi Coast that becomes a hyperlink must point to `https://www.proposalspots.com/destinations/italy`. Never link to `/destinations/amalfi-coast`.
- 2 to 3 external links to authoritative sources (open in new tab)
- One humour moment max (see humour.md)
- One story reference max (see stories.md)
- One strong opinion max (see opinions.md)
- No AI-tell phrases (see voice.md, "Tells that it's AI-written")
- No exclamation marks
- No emojis
- **No em-dashes or en-dashes ("—" or "–") anywhere in customer-facing content.** They read as AI-written. Use periods, commas, colons, or parentheses instead. Apply this to titles, meta descriptions, OG/Twitter descriptions, JSON-LD headlines and answers, body copy, FAQ Q&A, pull-quotes, and BLOG_POSTS card descriptions. Regular hyphens in compound words (e.g. "high-tide", "twenty-four") are fine.

---

## Step 4b — Select hero image from Unsplash

Find a high-quality landscape photo of the location or topic the post covers using only **public Unsplash pages via WebFetch**. No API, no key, no `.env`.

### Find the photo

1. WebFetch `https://unsplash.com/s/photos/[topic]?orientation=landscape` (replace `[topic]` with a 2–3 word URL-encoded search relevant to the post — e.g. `proposal-abroad-travel`, `romantic-coastal-landscape`, `ring-jewelry-travel`).
2. From the response, identify the first photo that meets all of these:
   - Real location or topic photo — not people, not staged studio shots
   - Landscape orientation
   - Editorial-quality (clear, well-composed, not a stock thumbnail)
3. Capture the photo's permalink (looks like `https://unsplash.com/photos/<slug>-<photoId>`) and the photo's CDN ID (the part after `photo-` in `images.unsplash.com/photo-<id>`).
4. WebFetch that permalink. Read the photographer's display name and the URL of their Unsplash profile (linked from the page, format `https://unsplash.com/@<username>`).

### Build the URLs

Both URLs MUST pin width AND height with `&fit=crop` so Unsplash delivers a pre-cropped file. Without an explicit `&h=`, the image arrives at its natural DSLR aspect (often 3:2) and renders elongated on the hero.

- `heroImage`. Blog page hero (16:9, 1920x1080). The hero is rendered inside a `.post-hero-frame` wrapper using a `padding-top: 56.25%` aspect-ratio trick (NOT the CSS `aspect-ratio` property — that rule was unreliable across browsers and would fall back to the image's natural aspect, rendering portrait sources tall). The image is absolutely positioned to fill the wrapper with `object-fit: cover`. Do NOT use 21:9 cinematic since it crops too aggressively on portrait-source photos.
  `https://images.unsplash.com/photo-<id>?q=80&w=1920&h=1080&fit=crop&auto=format`

  **Required markup pattern for the hero block:**

  ```html
  <div class="post-hero">
    <div class="post-hero-frame">
      <img src="[heroImage url]" alt="[heroAlt]" width="1920" height="1080" loading="eager" referrerpolicy="no-referrer">
    </div>
  </div>
  ```

  The `referrerpolicy="no-referrer"` is required. Unsplash CDN blocks requests from non-allowlisted referrers, which breaks every image on the live site. Removing the referrer header on the image request bypasses the block.

  **Required CSS pattern (already present in `blog/template.html`):**

  ```css
  .post-hero { max-width: 720px; margin: 0 auto; padding: 40px 40px 0; }
  .post-hero-frame { position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; border-radius: 2px; background: var(--bg2); }
  .post-hero-frame img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  ```

  Never strip the `.post-hero-frame` wrapper or replace the CSS with the bare `aspect-ratio` rule.
- `heroImageOg` — Open Graph / Twitter (1200×630):
  `https://images.unsplash.com/photo-<id>?w=1200&h=630&fit=crop&q=80`
- `cardImage` — inspiration thumbnail (16:9, 1920×1080) — used in the `BLOG_POSTS` `imageUrl` field:
  `https://images.unsplash.com/photo-<id>?q=80&w=1920&h=1080&fit=crop&auto=format`
- `heroAlt` — short description of the location or topic
- `photographerName` — visible name from the photo's permalink page
- `photographerUrl` — full URL to their Unsplash profile

### Apply to the rendered file

`blog/template.html` already scaffolds the hero block, the og:image / twitter:image meta tags, and the photo credit footer. You only fill placeholders:
- `{{heroImage}}` → `heroImage` URL
- `{{heroImageOg}}` → `heroImageOg` URL
- `{{heroAlt}}` → `heroAlt`
- `{{photographerName}}` → `photographerName`
- `{{photographerUrl}}` → `photographerUrl`

Never remove the `.post-hero` block, the og:image/twitter:image meta tags, or the `.post-photo-credit` paragraph from a rendered post.

### Graceful fallback if WebFetch fails or no photo qualifies

- Remove the `.post-hero` div from the rendered file
- Remove the `og:image` and `twitter:image` meta tags
- Replace the `.post-photo-credit` paragraph with `<!-- TODO: hero image — Unsplash search failed for query "[topic]" -->`
- Set `imageUrl: ""` in the BLOG_POSTS entry (the inspiration card will fall back to the hairline placeholder)
- Flag the gap in the Step 12 completion report

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

Every new HTML file created must include the Google Analytics tag immediately after the opening `<head>` tag:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4P287X7WZB"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-4P287X7WZB');
</script>
```

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
  readTime: "[N min read]",
  imageUrl: "[Step 4b cardImage URL (16:9, 1920x1080) — empty string if Unsplash lookup failed]"
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
- Hero image: Unsplash URL + photographer name and profile URL (or "TODO — lookup failed" if it did)
- `used-keywords.md` updated confirmation
- `inspiration.html` BLOG_POSTS array updated confirmation (incl. `imageUrl`)
- `seo/keywords.csv` row updated (Status = Published, Date Published = today)

Do not say "done" until the build would pass — correct HTML structure, no broken links, voice check passed.