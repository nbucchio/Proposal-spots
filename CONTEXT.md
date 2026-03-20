# Proposal Spots — Claude Code Context

## Stack
- Single `index.html` (~10,500 lines), static HTML/CSS/JS
- Hosted on Vercel, source on GitHub: `nbucchio/Proposal-spots`
- Airtable backend for spot listings (API connected, working)
- No build system. No frameworks. Vanilla JS.

## Design System (NEVER override these)
- Fonts: Cormorant (headings) + Jost (body)
- CSS variables: `--bg`, `--ink`, `--accent`
- Shared nav loaded via `nav.js`
- Aesthetic: elegant, romantic, minimal — think Airbnb meets luxury travel editorial
- Hero images: ALWAYS bright and vivid. Never dark or moody.
- No crowds, no faces on destination cards

## Rules for Every Session
1. Read this file before touching any code
2. Run `node --check index.html` — no, run it on extracted JS: verify no syntax errors
3. No smart quotes (`'` `"`) in any JS strings — use straight quotes only
4. Do NOT redesign. Match existing styles exactly.
5. Data plumbing only — extend, never replace
6. Deliver the final file explicitly at the end. Do not wait to be asked.

## Key Patterns
- Airtable field names are exact strings — don't rename or remap
- Spot detail pages rendered dynamically via JS from Airtable data
- `openStoryPage()` handles Inspiration stories
- URL routing plan: `/spots/[slug]`, `/destinations/[name]` (not yet built)

## GitHub Deploy
- Upload via: Add file → Upload files → drag and drop (NEVER use the pencil/edit button — it corrupts large files)
- Vercel auto-deploys ~60s after push to main
```
