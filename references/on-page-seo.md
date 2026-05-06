# On-Page SEO Checklist — Proposal Spots

Every blog post and location page must satisfy every applicable item below before it is published.

---

## HEAD / METADATA

- **Title tag**: 50–60 chars, primary keyword near the start
- **Meta description**: 150–160 chars, primary keyword + emotional benefit + soft CTA
- **Canonical URL** set to prevent duplicates
- **Open Graph tags**: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`
- **Twitter Card tags**: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- **Language attribute** on `<html>` (`lang="en"`)
- **Viewport meta tag**
- **Charset meta** (`utf-8`)

---

## URL STRUCTURE

- Short slug, under 60 chars
- Primary keyword in slug
- Hyphens only, no underscores
- Lowercase only
- Pattern: `/blog/[post-slug]` or `/destinations/[destination-slug]`

---

## HEADINGS

- Exactly one H1 per page, contains primary keyword
- Logical H2 → H3 hierarchy, never skip levels
- H2s use supporting keywords and questions from the cluster
- No keyword stuffing

---

## COPY / BODY

- Primary keyword in the first 100 words
- Direct answer to the query in the first paragraph — no build-up
- Length within 20% of SERP top-3 average word count for the target keyword
- Short paragraphs (1–3 sentences)
- Active voice
- Bold used sparingly for key phrases only
- No AI-tell phrases (see voice.md)

---

## FAQ SECTION (every blog post)

- 4–8 questions drawn from SEMrush Questions tab + Google "People Also Ask"
- Direct answers, 2–4 sentences each
- FAQPage schema (JSON-LD) applied

---

## IMAGES

- Alt text describes the image + keyword where natural
- Descriptive filenames with hyphens (e.g. `santorini-proposal-spot-oia.webp`)
- WebP format preferred, compressed under 200KB
- Width and height attributes specified (prevents CLS)
- `loading="lazy"` for below-fold images
- One featured/hero image for social sharing (1200×630)

---

## INTERNAL LINKS

- 3–5 internal links per post
- Link to related destination pages and other relevant blog posts
- Descriptive anchor text — never "click here" or "read more"
- Contextually placed in body copy, not forced at the end

---

## EXTERNAL LINKS

- 2–3 external links to authoritative sources
- Open in new tab with `rel="noopener"`
- Relevant to the topic — not generic "learn more" links

---

## SCHEMA MARKUP (JSON-LD in `<head>`)

- **Article** schema on all blog posts
- **FAQPage** schema wherever FAQ section exists
- **BreadcrumbList** schema on every page
- **Place** or **TouristAttraction** schema on location pages
- **Organization** schema site-wide

---

## E-E-A-T SIGNALS

- Author byline on every blog post (Nicholas Bucchio, Founder)
- Published date displayed
- Real specifics: exact locations, times of day, crowd patterns — not vague gestures
- Founder story used where relevant (see stories.md — one use per post max)
- Cite any external stats with source name and year

---

## PROPOSAL SPOTS SPECIFIC

- Every location page must include: best time of day, crowd level, privacy rating, accessibility, and what the person will actually see
- Never recommend a spot without stating who it is NOT right for
- Include at least one internal link to a relevant destination page from every blog post
- Include at least one internal link back to homepage search from every page

---

## LONG-FORM CONTENT (1500+ words)

- Table of contents with anchor links at the top
- Back-to-top functionality

---

## How to use this file

1. Read this file before generating any page.
2. Every page must satisfy every applicable item.
3. Place schema in `<head>` as JSON-LD.
4. Run a voice check after writing: re-read voice.md → "Tells that it's AI-written" and delete any matches.