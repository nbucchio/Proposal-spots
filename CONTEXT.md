# Proposal Spots — Claude Code Context
Read this entire file before touching any code.

---

## Stack
- Single `index.html` (~10,500 lines), static HTML/CSS/JS, no framework
- Vercel hosting, GitHub source: `nbucchio/Proposal-spots`
- Airtable backend for spot listings
- Shared nav via `nav.js`

---

## Design System — Follow Exactly

**Fonts**
- Headings: Cormorant, serif — weight 300 or 400 only, letter-spacing 0.05–0.1em
- Body/UI: Jost, sans-serif — weight 300 or 400 only
- Never use font-weight 600, 700, or 800 anywhere

**Colors**
- --bg: off-white cream background
- --ink: near-black text
- --accent: warm gold/terracotta
- Muted text: var(--ink) at opacity 0.5 — never a grey hex

**Spacing**
- Section padding: 60px vertical desktop, 40px mobile
- Card gaps: 24–32px
- Border radius: match existing .spot-card values — do not invent new ones

**Buttons**
- Outlined only — thin border, no fill, Jost font
- Hover: opacity shift only — no color flip, no fill appearing
- No box shadows ever

**Cards**
- Large image on top, 2–3 lines of text below
- No drop shadows, no heavy borders
- Clean white space between elements

---

## Aesthetic Rules — Non-Negotiable

This site feels like a high-end travel editorial meets Airbnb.
Quiet, romantic, confident. It does not shout.

NEVER build:
- Solid filled colored buttons
- Bold or heavy typography
- Drop shadows or thick borders
- Bright white high-contrast SaaS-style UI
- Dashboard or booking-engine layouts
- Busy grids with visible dividing lines

ALWAYS build:
- Generous white space
- Thin, delicate UI elements
- Soft, understated interactions
- Photography-first layouts
- Text that steps back, never competes with imagery

---

## Rules for Every Session

1. Before writing new HTML/CSS — find the nearest existing component 
   in index.html and match its structure and class names exactly
2. Use straight quotes only in JS — never smart quotes (' " ' ")
3. Do not redesign — extend and match only
4. Verify JS syntax before finishing
5. Deliver the final file at the end without being asked

---

## Key Patterns
- Airtable field names are exact strings — never rename or remap
- Spot detail pages render dynamically from Airtable data via JS
- CSS variables --bg, --ink, --accent used throughout — never hardcode colors
- URL routing plan exists but not yet built: /spots/[slug], /destinations/[name]

---

## GitHub Deploy
- Upload: Add file → Upload files → drag and drop only
- NEVER use the pencil/edit button — corrupts large files
- Vercel auto-deploys ~60s after push to main
```
