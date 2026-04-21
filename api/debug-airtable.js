// Temporary debug endpoint — reveals Airtable base schema (table + field names)
// Remove this file once the tiered pricing is confirmed working
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const BASE  = 'appN5GFcdPJvU1qff';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN' });
  }

  try {
    // 1. Fetch Airtable base schema to get exact table + field names
    const schemaResp = await fetch(
      `https://api.airtable.com/v0/meta/bases/${BASE}/tables`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const schema = await schemaResp.json();

    // 2. List all table names
    const tables = (schema.tables || []).map(t => ({
      id: t.id,
      name: t.name,
      fields: t.fields.map(f => ({ name: f.name, type: f.type }))
    }));

    // 3. Try fetching up to 3 raw records from every table whose name
    //    contains "package" (case-insensitive) so we can see real field values
    const packageTables = tables.filter(t =>
      t.name.toLowerCase().includes('package')
    );
    const sampleRows = {};
    for (const tbl of packageTables) {
      const r = await fetch(
        `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(tbl.name)}?pageSize=3`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      const d = await r.json();
      sampleRows[tbl.name] = (d.records || []).map(rec => ({
        id: rec.id,
        fields: rec.fields
      }));
    }

    // 4. Also grab 1 spot record to see exact field names incl. Pricing Model
    const spotResp = await fetch(
      `https://api.airtable.com/v0/${BASE}/tblgpEUkpph612Hw5?pageSize=1`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const spotData = await spotResp.json();
    const spotSample = (spotData.records || []).map(rec => ({
      id: rec.id,
      fieldNames: Object.keys(rec.fields),
      pricingModel: rec.fields['Pricing Model'],
    }));

    res.status(200).json({ tables, sampleRows, spotSample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
