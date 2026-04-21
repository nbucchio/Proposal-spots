export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'Bookings';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN' });

  const {
    spotName, firstName, lastName, email, phone,
    partner, country, hotelCheckin, hotelCheckout,
    proposalDate, backupDate, notes, addons, selectedTier, contactPreference, photographyQuote,
    spotId, hotelIds,
  } = req.body || {};

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Customer First Name': firstName,
              'Customer Last Name':  lastName,
              'Customer Email':      email,
              'Customer Phone':      phone,
              'Customer Country':    country || '',
              'Partner Name':        partner || '',
              ...(hotelCheckin  ? { 'Check In':       hotelCheckin  } : {}),
              ...(hotelCheckout ? { 'Check Out':      hotelCheckout } : {}),
              ...(proposalDate  ? { 'Proposal Night': proposalDate  } : {}),
              ...(contactPreference ? { 'Contact Preference': contactPreference } : {}),
              'Special Requests':    notes || '',
              'Add-ons Selected':    Array.isArray(addons) ? addons.join(', ') : (addons || ''),
              ...(photographyQuote && photographyQuote !== 'No' ? { 'Photography Quote Request': photographyQuote } : {}),
              ...(spotId ? { 'Linked Spot': [spotId] } : {}),
              ...(Array.isArray(hotelIds) && hotelIds.length ? { 'Linked Hotel': hotelIds } : {}),
              'Source':              'Website',
              'Internal Notes':      [
                spotName     ? `Spot: ${spotName}`           : '',
                selectedTier ? `Package: ${selectedTier}`    : '',
                backupDate   ? `Backup Date: ${backupDate}`  : '',
              ].filter(Boolean).join('\n') || '',
            },
          }],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.records[0].id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
