export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'tblqGbBHi9WmimksG';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN' });

  const {
    spotId, firstName, lastName, email, phone, contactPreference,
    partner, country, hotelCheckin, hotelCheckout,
    proposalDate, notes, addons,
  } = req.body || {};

  if (!firstName || !lastName || !email || !phone || !contactPreference) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const fields = {
    'Customer First Name': firstName,
    'Customer Last Name':  lastName,
    'Customer Email':      email,
    'Customer Phone':      phone,
    'Contact Preference':  contactPreference,
    'Partner Name':        partner || '',
    'Customer Country':    country || '',
    'Special Requests':    notes || '',
    'Add-ons Selected':    Array.isArray(addons) ? addons.join(', ') : (addons || ''),
    'Source':              'Website',
  };

  if (spotId) fields['Linked Spot'] = [spotId];
  if (hotelCheckin)  fields['Check In']       = hotelCheckin;
  if (hotelCheckout) fields['Check Out']      = hotelCheckout;
  if (proposalDate)  fields['Proposal Night'] = proposalDate;
  if (hotelCheckin)  fields['Package Selected'] = 'Moment + Hotel';
  else               fields['Package Selected'] = 'Moment';

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE}/${TABLE}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Airtable error:', response.status, JSON.stringify(err));
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.records[0].id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
