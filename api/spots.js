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
    const formula = encodeURIComponent(`{Status}="Published"`);
    const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?filterByFormula=${formula}&pageSize=100`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
