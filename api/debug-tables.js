export default async function handler(req, res) {
  const BASE  = 'appN5GFcdPJvU1qff';
  const TOKEN = process.env.AIRTABLE_TOKEN;
  if (!TOKEN) return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN' });

  const r = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE}/tables`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const data = await r.json();
  return res.status(r.status).json(data);
}
