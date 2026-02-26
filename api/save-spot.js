export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, spotId, spotName, country } = req.body;
  if (!email || !spotId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = 'appN5GFcdPJvU1qff';
  const TABLE_NAME = 'Saved Spots';

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Email':      email,
            'Spot ID':    spotId,
            'Spot Name':  spotName || '',
            'Country':    country  || '',
            'Saved At':   new Date().toISOString().split('T')[0],
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Airtable error:', JSON.stringify(err));
      return res.status(500).json({ error: 'Airtable write failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
