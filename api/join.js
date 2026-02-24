export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { first, last, email, phone } = req.body;

  if (!first || !last || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = 'appN5GFcdPJvU1qff';
  const TABLE_NAME = 'Email List';

  try {
    const fields = {
      'First Name': first,
      'Last Name':  last,
      'Email':      email,
    };

    // Only add phone if provided
    if (phone) fields['Phone #'] = phone;

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Airtable error:', JSON.stringify(err));
      return res.status(500).json({ error: 'Airtable write failed', detail: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
