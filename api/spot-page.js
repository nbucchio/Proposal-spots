import fs from 'fs';
import path from 'path';

const BASE  = 'appN5GFcdPJvU1qff';
const TABLE = 'tblgpEUkpph612Hw5';

function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Mirror the client-side toSlug() in spot.html so the server-rendered canonical
// matches exactly what the page would set at runtime.
function toSlug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function serveOriginal(res, html) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}

export default async function handler(req, res) {
  // Read spot.html first — if this fails we can't do anything useful
  let html;
  try {
    html = fs.readFileSync(path.join(process.cwd(), 'spot.html'), 'utf8');
  } catch (err) {
    console.error('[spot-page] Failed to read spot.html:', err.message);
    res.status(500).send('Internal Server Error');
    return;
  }

  // Extract slug from query param (set by the Vercel rewrite) or from the URL path
  const urlSlug = (req.query && req.query.slug)
    ? req.query.slug
    : (req.url || '').replace(/^\/spots\//, '').split('?')[0];

  const slug = urlSlug ? urlSlug.trim() : '';

  if (!slug) {
    return serveOriginal(res, html);
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  if (!TOKEN) {
    console.error('[spot-page] Missing AIRTABLE_TOKEN — serving original HTML');
    return serveOriginal(res, html);
  }

  try {
    const fields = ['Name', 'Slug', 'Meta Title', 'Meta Description', 'Cover Photo', 'Spot Card Photo', 'Full Summary'];
    const formula = encodeURIComponent(
      `AND({Status}="Published",{Slug}="${slug.replace(/"/g, '\\"')}")`
    );
    const fieldsParam = fields.map(f => `fields[]=${encodeURIComponent(f)}`).join('&');
    const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?filterByFormula=${formula}&${fieldsParam}&pageSize=1`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error('[spot-page] Airtable responded', response.status, 'for slug:', slug);
      return serveOriginal(res, html);
    }

    const data = await response.json();
    const record = data.records && data.records[0];

    if (!record) {
      return serveOriginal(res, html);
    }

    const f = record.fields;
    const name    = f['Name']             || '';
    const metaTit = f['Meta Title']       || '';
    const metaDesc= f['Meta Description'] || '';
    const summary = f['Full Summary']     || '';

    const coverArr  = Array.isArray(f['Cover Photo']) ? f['Cover Photo'] : [];
    const cardArr   = Array.isArray(f['Spot Card Photo']) ? f['Spot Card Photo'] : [];
    const rawImgUrl = (coverArr[0] && coverArr[0].url) || (cardArr[0] && cardArr[0].url) || '';
    // Proxy through Cloudflare so the og:image URL never expires (Airtable signed URLs last ~2h)
    const coverUrl  = rawImgUrl
      ? `https://www.proposalspots.com/cdn-cgi/image/width=1200,format=auto/${rawImgUrl}`
      : '';

    const title = metaTit  || name  || 'Proposal Spot — Proposal Spots';
    const desc  = metaDesc || (summary ? summary.slice(0, 155) : 'Discover this stunning proposal location at Proposal Spots.');

    // Self-referencing canonical for this specific spot. Without this the raw HTML
    // ships the hardcoded default (/spots/) and Googlebot — which doesn't wait for
    // the client-side JS that patches it — treats every spot as a duplicate of the
    // listing page. Prefer the record's Slug, fall back to the Name, matching spot.html.
    const canonicalSlug = toSlug(f['Slug'] || name);
    const canonicalUrl  = 'https://www.proposalspots.com/spots/' + canonicalSlug;

    const eTitle    = escape(title);
    const eDesc     = escape(desc);
    const eCoverUrl = escape(coverUrl);
    const eCanonical= escape(canonicalUrl);

    // Replace <title>
    html = html.replace(
      /<title[^>]*>[\s\S]*?<\/title>/i,
      `<title>${eTitle}</title>`
    );

    // Replace the canonical link (id="canonical-link") with this spot's own URL
    html = html.replace(
      /<link[^>]+id=["']canonical-link["'][^>]*>/i,
      `<link id="canonical-link" rel="canonical" href="${eCanonical}">`
    );

    // Replace og:url (id="og-url") to match the canonical
    html = html.replace(
      /<meta[^>]+id=["']og-url["'][^>]*>/i,
      `<meta id="og-url" property="og:url" content="${eCanonical}">`
    );

    // Replace <meta name="description">
    html = html.replace(
      /<meta[^>]+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${eDesc}">`
    );

    // Replace og:title
    html = html.replace(
      /<meta[^>]+property=["']og:title["'][^>]*>/i,
      `<meta property="og:title" content="${eTitle}">`
    );

    // Replace og:description
    html = html.replace(
      /<meta[^>]+property=["']og:description["'][^>]*>/i,
      `<meta property="og:description" content="${eDesc}">`
    );

    // Replace og:image (only if we have a real cover photo)
    if (eCoverUrl) {
      html = html.replace(
        /<meta[^>]+property=["']og:image["'][^>]*>/i,
        `<meta property="og:image" content="${eCoverUrl}">`
      );
    }

    // Replace twitter:title
    html = html.replace(
      /<meta[^>]+name=["']twitter:title["'][^>]*>/i,
      `<meta name="twitter:title" content="${eTitle}">`
    );

    // Replace twitter:description
    html = html.replace(
      /<meta[^>]+name=["']twitter:description["'][^>]*>/i,
      `<meta name="twitter:description" content="${eDesc}">`
    );

    // Replace twitter:image (only if we have a real cover photo)
    if (eCoverUrl) {
      html = html.replace(
        /<meta[^>]+name=["']twitter:image["'][^>]*>/i,
        `<meta name="twitter:image" content="${eCoverUrl}">`
      );
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    console.error('[spot-page] Error fetching spot data for slug:', slug, err.message);
    return serveOriginal(res, html);
  }
}
