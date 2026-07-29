// lib/pinterest.js
// ---------------------------------------------------------------------------
// Thin wrapper around the handful of Pinterest API v5 endpoints Proposal Spots
// needs. This file has ONE job: talk to Pinterest. It does not decide WHAT to
// publish (that's the `proposal-spots-pinterest` skill's job) — it only knows
// HOW to publish what it's given.
//
// Everything secret comes from environment variables (Vercel env vars). Nothing
// secret is ever written into this file or committed to the repo.
//
// Env vars used:
//   PINTEREST_APP_ID        Pinterest app / client ID  (public — App ID 1568781)
//   PINTEREST_APP_SECRET    Pinterest app secret       (SECRET — never commit)
//   PINTEREST_REDIRECT_URI  OAuth redirect, must exactly match the one
//                           registered in the Pinterest app settings, e.g.
//                           https://proposalspots.com/api/pinterest/callback
//   PINTEREST_ACCESS_TOKEN  Filled in after you complete the OAuth flow once
//   PINTEREST_REFRESH_TOKEN Filled in after you complete the OAuth flow once
//
// Pinterest API v5 facts this file relies on (verified against Pinterest's live
// docs + their official api-quickstart, July 2026):
//   - Authorize (user consent) page : https://www.pinterest.com/oauth/
//   - Token endpoint                : https://api.pinterest.com/v5/oauth/token
//   - Token auth                    : HTTP Basic, base64(client_id:client_secret)
//   - Refresh tokens                : "continuous", 60-day, refreshable forever
//   - Image pins                    : image is supplied by URL (no file upload)
// ---------------------------------------------------------------------------

const API_BASE = 'https://api.pinterest.com/v5';
const OAUTH_BASE = 'https://www.pinterest.com';

// The exact scopes Proposal Spots needs — and nothing more.
export const SCOPES = [
  'boards:read',
  'boards:write',
  'pins:read',
  'pins:write',
  'user_accounts:read',
];

// The App ID is public, so it's fine to fall back to the known value if the env
// var isn't set. The secret has no such fallback — it must come from the env.
export function getClientId() {
  return process.env.PINTEREST_APP_ID || '1568781';
}

function getClientSecret() {
  const secret = process.env.PINTEREST_APP_SECRET;
  if (!secret) {
    throw new Error(
      'PINTEREST_APP_SECRET is not set. Add it as a Vercel environment variable ' +
      '(get it from developers.pinterest.com → My apps → Proposal Spots → Manage).'
    );
  }
  return secret;
}

// The redirect URI must match what's registered in the Pinterest app EXACTLY.
// Prefer the explicit env var; otherwise derive it from the incoming request
// host so it "just works" on whatever domain is hit (as long as that domain is
// registered in Pinterest). Pass the request object in when you have one.
export function getRedirectUri(req) {
  if (process.env.PINTEREST_REDIRECT_URI) return process.env.PINTEREST_REDIRECT_URI;
  if (req && req.headers && req.headers.host) {
    // Vercel is always HTTPS in production and on preview URLs.
    return `https://${req.headers.host}/api/pinterest/callback`;
  }
  // Sensible production default.
  return 'https://proposalspots.com/api/pinterest/callback';
}

// ---------------------------------------------------------------------------
// STEP 1 — Build the URL we send the user to so they can approve access.
// ---------------------------------------------------------------------------
export function getAuthorizationUrl(req, state) {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(req),
    response_type: 'code',
    scope: SCOPES.join(','),
    state: state || '',
  });
  return `${OAUTH_BASE}/oauth/?${params.toString()}`;
}

// The Basic auth header used for every call to the token endpoint.
function tokenAuthHeader() {
  const raw = `${getClientId()}:${getClientSecret()}`;
  return 'Basic ' + Buffer.from(raw).toString('base64');
}

// ---------------------------------------------------------------------------
// STEP 2 — Exchange the ?code=... Pinterest sends back for real tokens.
// Returns Pinterest's raw token response, which includes:
//   access_token, refresh_token, token_type, expires_in,
//   refresh_token_expires_in, scope
// ---------------------------------------------------------------------------
export async function exchangeCodeForToken(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const resp = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': tokenAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Token exchange failed (${resp.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Refresh an expired access token using the stored refresh token.
// Access tokens are short-lived; the refresh token lasts 60 days and is
// refreshable indefinitely, so call this whenever an API call 401s.
// ---------------------------------------------------------------------------
export async function refreshAccessToken(refreshToken) {
  const token = refreshToken || process.env.PINTEREST_REFRESH_TOKEN;
  if (!token) throw new Error('No refresh token available (PINTEREST_REFRESH_TOKEN not set).');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: token,
  });

  const resp = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': tokenAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Token refresh failed (${resp.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Shared helper for authenticated API calls. Uses the access token from the
// env by default; if that token is expired and a refresh token is available,
// it transparently refreshes once and retries. The refreshed access token is
// only good for THIS process — persist it to Vercel env vars for reuse.
// ---------------------------------------------------------------------------
async function pinterestFetch(path, options = {}, accessToken) {
  let token = accessToken || process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'PINTEREST_ACCESS_TOKEN is not set. Complete the OAuth flow at ' +
      '/api/pinterest/connect, then paste the tokens into your Vercel env vars.'
    );
  }

  const doFetch = (bearer) => fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let resp = await doFetch(token);

  // If unauthorized and we can refresh, do it once and retry.
  if (resp.status === 401 && process.env.PINTEREST_REFRESH_TOKEN) {
    const refreshed = await refreshAccessToken();
    token = refreshed.access_token;
    resp = await doFetch(token);
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`Pinterest API ${options.method || 'GET'} ${path} failed (${resp.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// The account whose token we're holding — handy sanity check after OAuth.
// GET /v5/user_account
// ---------------------------------------------------------------------------
export async function getUserAccount(accessToken) {
  return pinterestFetch('/user_account', { method: 'GET' }, accessToken);
}

// ---------------------------------------------------------------------------
// List boards. GET /v5/boards
// Returns Pinterest's paginated shape: { items: [...], bookmark }.
// ---------------------------------------------------------------------------
export async function listBoards(accessToken, pageSize = 25) {
  return pinterestFetch(`/boards?page_size=${pageSize}`, { method: 'GET' }, accessToken);
}

// ---------------------------------------------------------------------------
// Create a board. POST /v5/boards
//   name        (required)
//   description (optional)
//   privacy     'PUBLIC' | 'PROTECTED' | 'SECRET'  (default PUBLIC)
// Returns the created board object, including its id.
// ---------------------------------------------------------------------------
export async function createBoard({ name, description = '', privacy = 'PUBLIC' }, accessToken) {
  if (!name) throw new Error('createBoard: "name" is required.');
  return pinterestFetch('/boards', {
    method: 'POST',
    body: JSON.stringify({ name, description, privacy }),
  }, accessToken);
}

// Convenience: find an existing board by name (case-insensitive) or return null.
// Lets the test/publish routes be idempotent instead of creating duplicates.
export async function findBoardByName(name, accessToken) {
  const target = name.trim().toLowerCase();
  let bookmark = null;
  do {
    const path = `/boards?page_size=100${bookmark ? `&bookmark=${encodeURIComponent(bookmark)}` : ''}`;
    const page = await pinterestFetch(path, { method: 'GET' }, accessToken);
    const hit = (page.items || []).find((b) => (b.name || '').trim().toLowerCase() === target);
    if (hit) return hit;
    bookmark = page.bookmark || null;
  } while (bookmark);
  return null;
}

// ---------------------------------------------------------------------------
// Create a pin. POST /v5/pins
//   board_id    (required) — which board to pin to
//   title       (optional but recommended)
//   description (optional but recommended)
//   link        (optional) — where the pin clicks through to (e.g. a spot page)
//   imageUrl    (required) — a publicly reachable image URL; Pinterest fetches it
//   altText     (optional) — accessibility text
//
// For IMAGE pins, Pinterest pulls the image from a URL via media_source
// (source_type: 'image_url'). No separate file upload step is needed — that's
// only required for video pins.
// Returns the created pin object, including its id.
// ---------------------------------------------------------------------------
export async function createPin({ boardId, title, description, link, imageUrl, altText }, accessToken) {
  if (!boardId) throw new Error('createPin: "boardId" is required.');
  if (!imageUrl) throw new Error('createPin: "imageUrl" is required.');

  const payload = {
    board_id: boardId,
    media_source: {
      source_type: 'image_url',
      url: imageUrl,
    },
  };
  if (title) payload.title = title;
  if (description) payload.description = description;
  if (link) payload.link = link;
  if (altText) payload.alt_text = altText;

  return pinterestFetch('/pins', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken);
}
