# Pinterest publishing integration

Internal plumbing that lets Proposal Spots create **boards** and **pins** through
the Pinterest API (v5). It publishes what it's given — it does **not** decide
what to publish (that's the `proposal-spots-pinterest` skill's job).

Two phases:

- **Phase 1 – Sandbox proof (now).** Get OAuth + pin creation working end-to-end
  on the Trial-access app, so you can record the demo video Pinterest requires
  for Standard access.
- **Phase 2 – Real publishing (after Standard approval).** The exact same code
  publishes real public pins via `/api/pinterest/publish`.

---

## Files

| File | What it is |
|------|------------|
| `lib/pinterest.js` | The reusable wrapper — OAuth + board/pin helpers. The only file that talks to Pinterest. |
| `api/pinterest/[action].js` | **One** serverless function handling all the routes below, dispatched by the URL's last path segment. It's a single file because Vercel's free plan caps a deployment at 12 serverless functions. |

The routes it serves (URLs are unchanged — each maps to the `[action]` segment):

| URL | What it does |
|-----|--------------|
| `/api/pinterest/connect` | Start OAuth. Redirects to Pinterest's consent screen. |
| `/api/pinterest/callback` | OAuth redirect target. Exchanges the code for tokens and shows them to paste into Vercel. |
| `/api/pinterest/test` | **The proof route.** Creates a "Bali" board + one pin. This is what the demo video shows. |
| `/api/pinterest/boards` | Lists your boards as JSON (sanity check / grab a board_id). |
| `/api/pinterest/publish` | Phase 2. Parametric publish: give it title/description/image/link/board. |

---

## Environment variables (set in Vercel → Settings → Environment Variables)

| Var | Secret? | Notes |
|-----|:---:|-------|
| `PINTEREST_APP_ID` | no | Client ID. Defaults to `1568781` if unset. |
| `PINTEREST_APP_SECRET` | **YES** | From developers.pinterest.com → My apps → Proposal Spots → Manage. **Never commit.** |
| `PINTEREST_REDIRECT_URI` | no | Must exactly match the redirect registered in the Pinterest app, e.g. `https://www.proposalspots.com/api/pinterest/callback` (www is the canonical domain). If unset, it's derived from the request host. |
| `PINTEREST_ACCESS_TOKEN` | **YES** | Filled in after the OAuth flow (see below). |
| `PINTEREST_REFRESH_TOKEN` | **YES** | Filled in after the OAuth flow. Lasts 60 days, refreshable indefinitely; the wrapper auto-refreshes on 401. |
| `PINTEREST_MODE` | no | `sandbox` (default) or `production`. See below. |
| `PINTEREST_PUBLISH_SECRET` | optional | If set, `/api/pinterest/publish` requires it via `?secret=` or `x-publish-secret` header. |

See `.env.example` in the repo root for the full list.

---

## Sandbox vs. production (IMPORTANT while on Trial access)

Pinterest has two API environments, and Trial-access apps can only use one:

- **Sandbox** (`api-sandbox.pinterest.com`) — required while the app is on
  **Trial access**. Boards/pins created here are private test data. If a
  Trial-access app calls production it gets `403 code 29: "Apps with Trial
  access may not create Pins in production ... use API Sandbox instead."`
- **Production** (`api.pinterest.com`) — only usable once Pinterest approves
  **Standard access**. This is where real, public pins get created.

`PINTEREST_MODE` selects which one (default `sandbox`). The consent screen is on
`www.pinterest.com` either way — only the API host changes.

**Tokens are environment-specific.** A token minted against the sandbox works
only on the sandbox, and a production token only on production. So whenever you
change `PINTEREST_MODE`, you must re-run the OAuth connect flow and replace the
stored tokens. (When Standard access is approved: set `PINTEREST_MODE=production`,
redeploy, reconnect, paste the new tokens, redeploy.)

---

## One-time setup

1. **Register the redirect URI** in the Pinterest app settings
   (developers.pinterest.com → Proposal Spots → configure OAuth): add
   `https://www.proposalspots.com/api/pinterest/callback` (and any preview domain you
   want to test from).
2. In Vercel, set `PINTEREST_APP_SECRET` (and `PINTEREST_REDIRECT_URI` if you
   want to pin it explicitly). Redeploy.
3. Visit **`/api/pinterest/connect`** → approve on Pinterest → you land back on
   the callback page.
4. Copy `PINTEREST_ACCESS_TOKEN` and `PINTEREST_REFRESH_TOKEN` from that page into
   Vercel env vars. **Redeploy** (env changes only apply on the next deploy).
5. Visit **`/api/pinterest/test`** → it creates the "Bali" board + a pin and links
   you straight to the live pin.

---

## Recording the Standard-access demo video

Pinterest's reviewers want to clearly see the **whole** OAuth flow *and* a pin
being created. Community reports say videos get rejected when steps go by too
fast or aren't obviously shown — so go slowly and show every step:

1. Start on a page and click through to **`/api/pinterest/connect`**.
2. Show **Pinterest's consent screen** (the "Give access" page) clearly — pause
   on it so the scopes are visible.
3. Click approve and show the **redirect back** to our callback page.
4. Go to **`/api/pinterest/test`** and show the confirmation page.
5. Click **"Open the pin"** and show the **real pin live on Pinterest.com** as
   confirmation.

Tip: don't screen-record the raw tokens on the callback page — scroll past or
blur them. Reviewers only need to see consent → redirect → created pin.

> Requirements can change — re-check Pinterest's current developer docs for the
> demo/review criteria before recording.

---

## Phase 2 — real publishing (after approval)

`/api/pinterest/publish` takes the content and publishes it. JSON POST:

```bash
curl -X POST https://proposalspots.com/api/pinterest/publish \
  -H 'Content-Type: application/json' \
  -H 'x-publish-secret: YOUR_SECRET' \
  -d '{
    "board": "Bali",
    "title": "How to Propose in Bali",
    "description": "The most romantic proposal spots in Bali...",
    "image": "https://.../cover.jpg",
    "link": "https://proposalspots.com/spots/uluwatu-clifftop"
  }'
```

Response: `{ success, pin_id, pin_url, board_id, board_name }`.

This is the endpoint the weekly Pinterest batch (from the
`proposal-spots-pinterest` skill) calls. Images are supplied by **URL** —
Pinterest fetches them — so point `image` at the spot's public cover photo
(Airtable is the source of truth for that data).

### Worth evaluating later
Wrapping `lib/pinterest.js` as a small custom **MCP server** would let Claude
call `create_pin` directly from a chat session instead of hitting this route.
Not required — worth it only once the publish mechanism is proven in production.

---

## Notes on the API (verified against Pinterest's live docs, July 2026)

- Authorize page: `https://www.pinterest.com/oauth/`
- Token endpoint: `POST https://api.pinterest.com/v5/oauth/token`, HTTP Basic
  auth with `base64(client_id:client_secret)`.
- Image pins take the image via a URL (`media_source.source_type = "image_url"`).
  Only **video** pins need the multi-step `/v5/media` upload.
- Scopes requested are the minimum needed:
  `boards:read, boards:write, pins:read, pins:write, user_accounts:read`.
