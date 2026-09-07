// Secret-gated preview feed for DRAFT (unpublished) spots.
//
// Returns spot records regardless of {Status}, so a draft listing can be
// viewed at /spots/<slug>?preview=<key> exactly as it will look once
// published — without appearing in the public browse grid, search, or
// sitemap (those all go through /api/spots, which stays Published-only).
//
// The repo is public, so the key MUST come from the PREVIEW_SECRET
// environment variable (Vercel → Settings → Environment Variables), never
// hardcoded here. Anyone holding the full ?preview= link can view drafts,
// so treat it as a private link.
//
// Same response shape as /api/spots ({ records: [...] } with a packages
// array attached to each), so spot.html can consume it with no other change.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Never let a preview response get cached or indexed.
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'tblgpEUkpph612Hw5';
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const SECRET = process.env.PREVIEW_SECRET;

  if (!SECRET) {
    return res.status(500).json({ error: 'Preview is not configured (missing PREVIEW_SECRET).' });
  }

  const key = (req.query && req.query.key) ? String(req.query.key) : '';
  if (key !== SECRET) {
    // Same generic 404 whether the key is wrong or missing — don't confirm
    // that a preview system exists to someone guessing.
    return res.status(404).json({ error: 'Not found' });
  }

  if (!TOKEN) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN environment variable' });
  }

  try {
    // Fetch ALL spots (no Status filter — drafts included).
    let allRecords = [];
    let offset = null;

    do {
      const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?pageSize=100${offset ? '&offset=' + encodeURIComponent(offset) : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (!response.ok) {
        const err = await response.json();
        return res.status(response.status).json(err);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    // Fetch all packages (mirrors /api/spots — same field-name quirks).
    const packagesBySpot = {};
    try {
      let allPackages = [];
      let pkgOffset = null;

      do {
        const pkgUrl = `https://api.airtable.com/v0/${BASE}/Packages?pageSize=100${pkgOffset ? '&offset=' + encodeURIComponent(pkgOffset) : ''}`;
        const pkgResp = await fetch(pkgUrl, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });

        if (!pkgResp.ok) {
          const pkgErr = await pkgResp.json().catch(() => ({}));
          console.error('[spot-preview] Packages fetch failed:', pkgResp.status, JSON.stringify(pkgErr));
          break;
        }

        const pkgData = await pkgResp.json();
        allPackages = allPackages.concat(pkgData.records || []);
        pkgOffset = pkgData.offset || null;
      } while (pkgOffset);

      allPackages
        .filter(pkg => pkg.fields['Is Active'])
        .sort((a, b) => ((a.fields['Sort Order'] || 0) - (b.fields['Sort Order'] || 0)))
        .forEach(pkg => {
          const spotIds = Array.isArray(pkg.fields['Spot ']) ? pkg.fields['Spot '] : [];
          spotIds.forEach(spotId => {
            if (!packagesBySpot[spotId]) packagesBySpot[spotId] = [];
            packagesBySpot[spotId].push({
              'Tier Name':       pkg.fields['Tier Name']       || '',
              'Price':           pkg.fields['Price ']          || null,
              'Includes':        pkg.fields['Includes ']       || '',
              'Included Addons': pkg.fields['Included Addons'] || '',
              'Sort Order':      pkg.fields['Sort Order']      || 0,
              'Is Active':       pkg.fields['Is Active']       || false,
            });
          });
        });
    } catch (pkgErr) {
      console.error('[spot-preview] Packages fetch exception:', pkgErr.message);
    }

    const records = allRecords.map(record => ({
      ...record,
      packages: packagesBySpot[record.id] || [],
    }));

    res.status(200).json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
