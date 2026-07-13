export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'tblgpEUkpph612Hw5';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN' });

  const formula = encodeURIComponent(`AND({Status}="Published",{Spot Name}="Arenal Panorama Proposal")`);
  const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?filterByFormula=${formula}&pageSize=1`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const data = await r.json();
  const record = (data.records || [])[0];
  if (!record) return res.status(404).json({ error: 'Spot not found' });

  const f = record.fields;
  const gallery = (f['Gallery Photos'] || [])
    .map(p => (typeof p === 'string' ? p : (p && p.url) || ''))
    .filter(Boolean);

  res.status(200).json({ photos: gallery });
}
