// api/pinterest/callback.js
// ---------------------------------------------------------------------------
// STEP 2 of the OAuth flow. Pinterest redirects here with ?code=... after the
// user approves access. We:
//   1. verify the state cookie (CSRF guard),
//   2. exchange the code for an access token + refresh token,
//   3. sanity-check the token by fetching the connected account,
//   4. show the tokens ON SCREEN so you can paste them into Vercel env vars.
//
// Why show them on screen? This is internal plumbing with no database. Storing
// tokens = copying two values into Vercel → Settings → Environment Variables:
//     PINTEREST_ACCESS_TOKEN   and   PINTEREST_REFRESH_TOKEN
// Then redeploy, and the test/publish routes can use them.
//
// NOTE: tokens are shown once, here, over HTTPS. Treat this page like a
// password — don't screen-share it. (When you record the demo video, stop
// before this page or blur it; Pinterest only needs to see the consent +
// redirect + a created pin, not your raw tokens.)
// ---------------------------------------------------------------------------

import { exchangeCodeForToken, getUserAccount, getRedirectUri } from '../../lib/pinterest.js';

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
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
         max-width: 720px; margin: 40px auto; padding: 0 20px; color: #222; line-height: 1.5; }
  h1 { font-size: 22px; } h2 { font-size: 16px; margin-top: 28px; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre { background: #f5f5f5; border: 1px solid #e2e2e2; border-radius: 8px;
        padding: 12px; overflow-x: auto; font-size: 13px; }
  .warn { background: #fff6e5; border: 1px solid #f2d69a; border-radius: 8px; padding: 12px 14px; }
  .ok   { background: #e9f7ee; border: 1px solid #b7e2c4; border-radius: 8px; padding: 12px 14px; }
  .err  { background: #fdecec; border: 1px solid #f3b5b5; border-radius: 8px; padding: 12px 14px; }
  a.btn { display: inline-block; background: #c26e5a; color: #fff; text-decoration: none;
          padding: 10px 16px; border-radius: 8px; margin-top: 10px; }
  label { font-weight: 600; display: block; margin-top: 14px; }
</style></head><body>${bodyHtml}</body></html>`;
}

export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  // Pinterest can redirect back with an error if the user declined.
  if (error) {
    res.status(400).setHeader('Content-Type', 'text/html');
    return res.end(page('Pinterest connection failed', `
      <h1>Pinterest connection failed</h1>
      <div class="err"><strong>${esc(error)}</strong><br>${esc(error_description || '')}</div>
      <a class="btn" href="/api/pinterest/connect">Try again</a>`));
  }

  if (!code) {
    res.status(400).setHeader('Content-Type', 'text/html');
    return res.end(page('Missing code', `
      <h1>Missing authorization code</h1>
      <p>This page is the OAuth redirect target. Start the flow instead:</p>
      <a class="btn" href="/api/pinterest/connect">Connect Pinterest</a>`));
  }

  // CSRF check: the state we set in the connect step must come back unchanged.
  const cookie = req.headers.cookie || '';
  const savedState = (cookie.match(/pinterest_oauth_state=([^;]+)/) || [])[1];
  if (!savedState || savedState !== state) {
    res.status(400).setHeader('Content-Type', 'text/html');
    return res.end(page('State mismatch', `
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
    res.status(200).setHeader('Content-Type', 'text/html');
    return res.end(page('Pinterest connected', `
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
    res.status(500).setHeader('Content-Type', 'text/html');
    return res.end(page('Token exchange failed', `
      <h1>Token exchange failed</h1>
      <div class="err">${esc(err.message)}</div>
      <p>Common causes: the redirect URI doesn't exactly match the one registered
      in the Pinterest app, or <code>PINTEREST_APP_SECRET</code> isn't set in Vercel.</p>
      <a class="btn" href="/api/pinterest/connect">Try again</a>`));
  }
}
