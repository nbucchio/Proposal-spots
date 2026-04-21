export default async function handler(req, res) {
  // Allow CORS from your site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'tblgpEUkpph612Hw5';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN environment variable' });
  }

  try {
    // Fetch all published spots
    const formula = encodeURIComponent(`{Status}="Published"`);
    let allRecords = [];
    let offset = null;

    do {
      const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?filterByFormula=${formula}&pageSize=100${offset ? '&offset=' + encodeURIComponent(offset) : ''}`;
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

    // Fetch all packages (no server-side filter/sort — done in JS below for resilience)
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
          console.error('[spots] Packages fetch failed:', pkgResp.status, JSON.stringify(pkgErr));
          break;
        }

        const pkgData = await pkgResp.json();
        allPackages = allPackages.concat(pkgData.records || []);
        pkgOffset = pkgData.offset || null;
      } while (pkgOffset);

      console.log('[spots] Packages fetched:', allPackages.length);

      // Keep only active packages, sort by Sort Order, group by linked spot ID
      allPackages
        .filter(pkg => pkg.fields['Is Active'])
        .sort((a, b) => ((a.fields['Sort Order'] || 0) - (b.fields['Sort Order'] || 0)))
        .forEach(pkg => {
          const spotIds = Array.isArray(pkg.fields['Spot']) ? pkg.fields['Spot'] : [];
          spotIds.forEach(spotId => {
            if (!packagesBySpot[spotId]) packagesBySpot[spotId] = [];
            packagesBySpot[spotId].push({
              'Tier Name':  pkg.fields['Tier Name']  || '',
              'Price':      pkg.fields['Price']       || null,
              'Includes':   pkg.fields['Includes']    || '',
              'Sort Order': pkg.fields['Sort Order']  || 0,
              'Is Active':  pkg.fields['Is Active']   || false,
            });
          });
        });
    } catch (pkgErr) {
      console.error('[spots] Packages fetch exception:', pkgErr.message);
    }

    // Attach packages array to each spot record
    const records = allRecords.map(record => ({
      ...record,
      packages: packagesBySpot[record.id] || [],
    }));

    res.status(200).json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
