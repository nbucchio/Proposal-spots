export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { first, last, email, phone } = req.body;

  // Basic server-side validation
  if (!first || !last || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const BASE_ID = 'appN5GFcdPJvU1qff';
  const TABLE_NAME = 'Email List';

  // Log key prefix so we can verify it's loading (never log full key)
  console.log('API Key loaded:', AIRTABLE_API_KEY ? AIRTABLE_API_KEY.substring(0, 10) + '...' : 'MISSING');
  console.log('Base ID:', BASE_ID);
  console.log('Table:', TABLE_NAME);

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
            'First Name': first,
            'Last Name':  last,
            'Email':      email,
            'Phone #':    phone || '',
            'Signed Up':  new Date().toISOString().split('T')[0],
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Airtable error status:', response.status);
      console.error('Airtable error body:', JSON.stringify(err));
      return res.status(500).json({ error: 'Airtable write failed', detail: err });
    }

    const data = await response.json();
    console.log('Success, record ID:', data.id);
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
