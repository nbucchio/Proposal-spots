// api/pinterest/[action].js
// ---------------------------------------------------------------------------
// All Pinterest routes live in this ONE serverless function. Vercel's free plan
// caps a deployment at 12 serverless functions, and the site was already using
// several — so instead of one file per route (connect/callback/test/boards/
// publish = 5 functions), this single dynamic route handles all of them and
// counts as just 1 function.
//
// The URL path decides what runs, via the [action] segment:
//   /api/pinterest/connect   -> startConnect   (Step 1 of OAuth)
//   /api/pinterest/callback  -> handleCallback  (Step 2 of OAuth)
//   /api/pinterest/test      -> runSandboxTest  (the proof route)
//   /api/pinterest/boards    -> listBoardsRoute (JSON board list)
//   /api/pinterest/publish   -> publishRoute    (Phase 2 real publishing)
//
// The actual Pinterest calls live in lib/pinterest.js. This file is just the
// web layer: routing, HTML pages, and request/response handling.
// ---------------------------------------------------------------------------

import crypto from 'crypto';
import {
  getAuthorizationUrl,
  getRedirectUri,
  exchangeCodeForToken,
  getUserAccount,
  listBoards,
  findBoardByName,
  createBoard,
  createPin,
} from '../../lib/pinterest.js';

// --- tiny shared helpers ---------------------------------------------------

// Minimal HTML escaping so token/JSON values can't break the page markup.
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function page(title, bodyHtml) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
         max-width: 720px; margin: 40px auto; padding: 0 20px; color: #222; line-height: 1.5; }
  h1 { font-size: 22px; } h2 { font-size: 15px; margin-top: 24px; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background: #f5f5f5; border: 1px solid #e2e2e2; border-radius: 8px;
        padding: 12px; overflow-x: auto; font-size: 13px; }
  .warn { background: #fff6e5; border: 1px solid #f2d69a; border-radius: 8px; padding: 12px 14px; }
  .ok   { background: #e9f7ee; border: 1px solid #b7e2c4; border-radius: 8px; padding: 12px 14px; }
  .err  { background: #fdecec; border: 1px solid #f3b5b5; border-radius: 8px; padding: 12px 14px; }
  img.preview { max-width: 260px; border-radius: 10px; margin-top: 8px; }
  a.btn { display: inline-block; background: #c26e5a; color: #fff; text-decoration: none;
          padding: 10px 16px; border-radius: 8px; margin-top: 12px; }
  label { font-weight: 600; display: block; margin-top: 14px; }
</style></head><body>${bodyHtml}</body></html>`;
}

function sendHtml(res, status, html) {
  res.status(status).setHeader('Content-Type', 'text/html');
  res.end(html);
}

// ---------------------------------------------------------------------------
// STEP 1 — /api/pinterest/connect
// Redirect the user to Pinterest's consent screen. Sets a short-lived state
// cookie (CSRF guard) that the callback verifies.
// ---------------------------------------------------------------------------
function startConnect(req, res) {
  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader(
    'Set-Cookie',
    `pinterest_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );
  const url = getAuthorizationUrl(req, state);
  res.writeHead(302, { Location: url });
  res.end();
}

// ---------------------------------------------------------------------------
// STEP 2 — /api/pinterest/callback
// Pinterest redirects here with ?code=... We verify state, exchange the code
// for tokens, and show them so you can paste them into Vercel env vars.
// ---------------------------------------------------------------------------
async function handleCallback(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return sendHtml(res, 400, page('Pinterest connection failed', `
      <h1>Pinterest connection failed</h1>
      <div class="err"><strong>${esc(error)}</strong><br>${esc(error_description || '')}</div>
      <a class="btn" href="/api/pinterest/connect">Try again</a>`));
  }

  if (!code) {
    return sendHtml(res, 400, page('Missing code', `
      <h1>Missing authorization code</h1>
      <p>This page is the OAuth redirect target. Start the flow instead:</p>
      <a class="btn" href="/api/pinterest/connect">Connect Pinterest</a>`));
  }

  // CSRF check: the state we set in the connect step must come back unchanged.
  const cookie = req.headers.cookie || '';
  const savedState = (cookie.match(/pinterest_oauth_state=([^;]+)/) || [])[1];
  if (!savedState || savedState !== state) {
    return sendHtml(res, 400, page('State mismatch', `
      <h1>Security check failed (state mismatch)</h1>
      <p>The request couldn't be verified. Please start over.</p>
      <a class="btn" href="/api/pinterest/connect">Connect Pinterest</a>`));
  }

  try {
    const redirectUri = getRedirectUri(req);
    const tokens = await exchangeCodeForToken(code, redirectUri);

    // Sanity-check: who did we just connect as?
    let who = '';
    try {
      const account = await getUserAccount(tokens.access_token);
      who = account.username ? `@${account.username}` : (account.account_type || 'connected');
    } catch (_) {
      who = '(token issued, account lookup skipped)';
    }

    // Clear the state cookie now that we're done with it.
    res.setHeader('Set-Cookie', 'pinterest_oauth_state=; Path=/; HttpOnly; Max-Age=0');
    return sendHtml(res, 200, page('Pinterest connected', `
      <h1>✅ Pinterest connected — ${esc(who)}</h1>
      <div class="ok">Access &amp; refresh tokens were issued successfully.</div>

      <div class="warn" style="margin-top:16px">
        <strong>Treat the values below like passwords.</strong> Don't screen-share this
        page. Copy them into Vercel and redeploy — then this integration can publish.
      </div>

      <h2>1. Add these to Vercel</h2>
      <p>Vercel → your project → <em>Settings → Environment Variables</em>:</p>
      <label>PINTEREST_ACCESS_TOKEN</label>
      <pre>${esc(tokens.access_token || '')}</pre>
      <label>PINTEREST_REFRESH_TOKEN</label>
      <pre>${esc(tokens.refresh_token || '')}</pre>

      <h2>2. Redeploy</h2>
      <p>Env-var changes only take effect on the next deploy.</p>

      <h2>3. Test it</h2>
      <p>Hit the proof route to create a sandbox board + pin:</p>
      <a class="btn" href="/api/pinterest/test">Run the sandbox test</a>

      <h2>Token details (for reference)</h2>
      <pre>${esc(JSON.stringify({
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
        refresh_token_expires_in: tokens.refresh_token_expires_in,
        scope: tokens.scope,
      }, null, 2))}</pre>`));
  } catch (err) {
    console.error('[pinterest/callback]', err.message);
    return sendHtml(res, 500, page('Token exchange failed', `
      <h1>Token exchange failed</h1>
      <div class="err">${esc(err.message)}</div>
      <p>Common causes: the redirect URI doesn't exactly match the one registered
      in the Pinterest app, or <code>PINTEREST_APP_SECRET</code> isn't set in Vercel.</p>
      <a class="btn" href="/api/pinterest/connect">Try again</a>`));
  }
}

// ---------------------------------------------------------------------------
// /api/pinterest/test — THE PROOF ROUTE
// Finds or creates a "Bali" board and creates one realistic pin in it. This is
// what the Standard-access demo video shows.
// ---------------------------------------------------------------------------
const TEST_DEFAULTS = {
  board: 'Bali',
  boardDescription: 'Dreamy proposal spots in Bali — curated by Proposal Spots.',
  title: 'How to Propose in Bali: Clifftop & Beach Spots',
  description:
    'Planning a Bali proposal? From Uluwatu clifftops to hidden beach coves, ' +
    'here are the most romantic spots to pop the question in Bali. ' +
    'Curated proposal locations at proposalspots.com.',
  image:
    'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1000&auto=format&fit=crop',
  link: 'https://www.proposalspots.com/destinations/bali',
};

async function runSandboxTest(req, res) {
  const q = req.query || {};
  const board = q.board || TEST_DEFAULTS.board;
  const title = q.title || TEST_DEFAULTS.title;
  const description = q.description || TEST_DEFAULTS.description;
  const image = q.image || TEST_DEFAULTS.image;
  const link = q.link || TEST_DEFAULTS.link;

  try {
    // Find or create the board.
    // Note: the Pinterest SANDBOX is unreliable at listing boards (GET /boards
    // often returns nothing even when boards exist), so findBoardByName can come
    // back empty and we then try to create a board that's actually already there.
    // Pinterest rejects that with code 58 ("You already have a board with this
    // name!"). When that happens we can't look the existing board up, so we retry
    // once with a unique suffix — that keeps the demo producing a fresh board+pin
    // no matter how many times it's run.
    let boardObj = await findBoardByName(board, null);
    let boardCreated = false;
    if (!boardObj) {
      try {
        boardObj = await createBoard(
          { name: board, description: TEST_DEFAULTS.boardDescription, privacy: 'PUBLIC' },
          null
        );
      } catch (err) {
        if (/"code":\s*58|already have a board with this name/i.test(err.message)) {
          const uniqueName = `${board} ${Math.random().toString(36).slice(2, 6)}`;
          boardObj = await createBoard(
            { name: uniqueName, description: TEST_DEFAULTS.boardDescription, privacy: 'PUBLIC' },
            null
          );
        } else {
          throw err;
        }
      }
      boardCreated = true;
    }

    const pin = await createPin({
      boardId: boardObj.id,
      title,
      description,
      link,
      imageUrl: image,
      altText: title,
    }, null);

    const pinUrl = `https://www.pinterest.com/pin/${pin.id}/`;
    return sendHtml(res, 200, page('Sandbox pin created', `
      <h1>✅ Pin created successfully</h1>
      <div class="ok">
        Board <strong>"${esc(boardObj.name)}"</strong> ${boardCreated ? 'created' : 'reused'}
        (id <code>${esc(boardObj.id)}</code>) and a pin was published to it.
      </div>

      <h2>Your live pin on Pinterest</h2>
      <p><a class="btn" href="${esc(pinUrl)}" target="_blank" rel="noopener">Open the pin ↗</a></p>
      <img class="preview" src="${esc(image)}" alt="pin image preview">

      <h2>What was published</h2>
      <pre>${esc(JSON.stringify({
        board_id: boardObj.id,
        pin_id: pin.id,
        title, description, link, image,
      }, null, 2))}</pre>

      <p style="color:#666;font-size:13px">
        Re-run any time. Override the content with query params, e.g.
        <code>?board=Bali&amp;title=...&amp;image=...&amp;link=...</code>
      </p>`));
  } catch (err) {
    console.error('[pinterest/test]', err.message);
    return sendHtml(res, 500, page('Test failed', `
      <h1>Sandbox test failed</h1>
      <div class="err">${esc(err.message)}</div>
      <p>If this mentions a missing/invalid token, reconnect and repaste the tokens
      into Vercel (remember: sandbox and production use different tokens). Otherwise
      the message above from Pinterest explains what went wrong.</p>
      <a class="btn" href="/api/pinterest/connect">Reconnect Pinterest</a>
      &nbsp; <a class="btn" href="/api/pinterest/test?board=Bali%20Proposals">Retry with a fresh board name</a>`));
  }
}

// ---------------------------------------------------------------------------
// /api/pinterest/boards — JSON list of the connected account's boards.
// ---------------------------------------------------------------------------
async function listBoardsRoute(req, res) {
  try {
    const data = await listBoards(null, 100);
    const boards = (data.items || []).map((b) => ({
      id: b.id, name: b.name, privacy: b.privacy, pin_count: b.pin_count,
    }));
    return res.status(200).json({ count: boards.length, boards });
  } catch (err) {
    console.error('[pinterest/boards]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// /api/pinterest/publish — PHASE 2 parametric publishing.
// Give it title/description/image/link/board (JSON POST or query params) and it
// creates the pin. Optionally gated by PINTEREST_PUBLISH_SECRET.
// ---------------------------------------------------------------------------
async function publishRoute(req, res) {
  const src = { ...(req.query || {}), ...(req.body || {}) };

  const required = process.env.PINTEREST_PUBLISH_SECRET;
  if (required) {
    const provided = src.secret || req.headers['x-publish-secret'];
    if (provided !== required) {
      return res.status(401).json({ error: 'Unauthorized: missing or wrong publish secret.' });
    }
  }

  const { board, boardId, title, description, link, image, imageUrl } = src;
  const finalImage = imageUrl || image;

  if (!finalImage) {
    return res.status(400).json({ error: 'Missing required field: image (a public image URL).' });
  }
  if (!boardId && !board) {
    return res.status(400).json({ error: 'Provide either boardId or board (board name).' });
  }

  try {
    let targetBoardId = boardId;
    let boardName = board;
    if (!targetBoardId) {
      let boardObj = await findBoardByName(board, null);
      if (!boardObj) boardObj = await createBoard({ name: board, privacy: 'PUBLIC' }, null);
      targetBoardId = boardObj.id;
      boardName = boardObj.name;
    }

    const pin = await createPin({
      boardId: targetBoardId,
      title, description, link,
      imageUrl: finalImage,
      altText: title,
    }, null);

    return res.status(200).json({
      success: true,
      pin_id: pin.id,
      pin_url: `https://www.pinterest.com/pin/${pin.id}/`,
      board_id: targetBoardId,
      board_name: boardName,
    });
  } catch (err) {
    console.error('[pinterest/publish]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ---------------------------------------------------------------------------
// Router — dispatch on the [action] path segment.
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  const action = req.query.action;
  switch (action) {
    case 'connect':  return startConnect(req, res);
    case 'callback': return handleCallback(req, res);
    case 'test':     return runSandboxTest(req, res);
    case 'boards':   return listBoardsRoute(req, res);
    case 'publish':  return publishRoute(req, res);
    default:
      return sendHtml(res, 404, page('Pinterest integration', `
        <h1>Proposal Spots — Pinterest integration</h1>
        <p>Unknown action "<code>${esc(action || '')}</code>". Available routes:</p>
        <ul>
          <li><a href="/api/pinterest/connect">/api/pinterest/connect</a> — start the OAuth flow</li>
          <li><code>/api/pinterest/callback</code> — OAuth redirect target</li>
          <li><a href="/api/pinterest/test">/api/pinterest/test</a> — create a sandbox board + pin</li>
          <li><a href="/api/pinterest/boards">/api/pinterest/boards</a> — list boards (JSON)</li>
          <li><code>/api/pinterest/publish</code> — publish real content (Phase 2)</li>
        </ul>`));
  }
}
