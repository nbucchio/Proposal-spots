export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'Vibes';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN environment variable' });
  }

  try {
    const formula = encodeURIComponent('AND({Show on Homepage}=TRUE(),{Active}=TRUE())');
    const sort    = 'sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc';
    const url     = `https://api.airtable.com/v0/${BASE}/${TABLE}?filterByFormula=${formula}&${sort}&pageSize=100`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[vibes] Airtable error:', response.status, JSON.stringify(err));
      return res.status(response.status).json({ error: err.error || 'Airtable request failed' });
    }

    const data    = await response.json();
    const records = data.records || [];

    const vibes = records.reduce((acc, record) => {
      const f             = record.fields || {};
      const vibeName      = f['Vibe Name'];
      const displayLabel  = f['Display Label'];
      const orderNum      = Number(f['Order']);
      const heroImage     = Array.isArray(f['Hero Image']) ? f['Hero Image'][0] : null;
      const imageUrl      = heroImage && heroImage.url ? heroImage.url : null;

      if (!vibeName || !displayLabel || !imageUrl || !Number.isFinite(orderNum)) {
        return acc;
      }

      const number = String(orderNum).padStart(2, '0');
      acc.push({
        number,
        displayLabel,
        airtableValue: vibeName,
        image: imageUrl,
        href: `/search?vibe=${encodeURIComponent(vibeName)}`
      });
      return acc;
    }, []);

    return res.status(200).json({ vibes });
  } catch (err) {
    console.error('[vibes] exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
