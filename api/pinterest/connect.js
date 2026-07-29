// api/pinterest/connect.js
// ---------------------------------------------------------------------------
// STEP 1 of the OAuth flow. Visiting /api/pinterest/connect sends the user to
// Pinterest's consent screen with the right client_id, redirect_uri and scopes.
// After they click "Give access", Pinterest sends them back to
// /api/pinterest/callback with a ?code=... that we exchange for tokens.
//
// This is the first thing you'll show in the Standard-access demo video:
// clicking "connect" and landing on Pinterest's consent screen.
// ---------------------------------------------------------------------------

import { getAuthorizationUrl } from '../../lib/pinterest.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // A random state value guards against CSRF. We echo it into a short-lived
  // cookie and verify it in the callback.
  const state = crypto.randomBytes(16).toString('hex');

  res.setHeader(
    'Set-Cookie',
    `pinterest_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  const url = getAuthorizationUrl(req, state);
  res.writeHead(302, { Location: url });
  res.end();
}
