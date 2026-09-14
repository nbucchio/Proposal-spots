// GA4 Measurement Protocol — server-side conversion send. Fires the same
// "qualify_lead" event from the server (not the browser), so ad blockers and
// tracking protection can't suppress it. The API secret lives ONLY in the
// GA4_MP_API_SECRET env var — never hardcode it (this is a public repo).
async function sendGa4Lead({ clientId, value, spotName, destination }) {
  const MEASUREMENT_ID = 'G-4P287X7WZB';
  const API_SECRET = process.env.GA4_MP_API_SECRET;
  if (!API_SECRET) return; // not configured — skip quietly

  const params = {
    currency: 'USD',
    spot_name: spotName || '',
    destination: destination || '',
    // Marks the event as engaged so GA4 counts it in reports and attribution.
    engagement_time_msec: 1,
  };
  const numericValue = typeof value === 'number'
    ? value
    : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (Number.isFinite(numericValue)) params.value = numericValue;

  const payload = {
    // Reuse the browser's GA client_id (passed from the page) so this event
    // stitches to the same GA4 user/session for campaign attribution. Fall back
    // to a synthetic id so a blocked-cookie booking still records the conversion.
    client_id: clientId || `${Date.now()}.${Math.floor(Math.random() * 1e10)}`,
    events: [{ name: 'qualify_lead', params }],
  };

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${encodeURIComponent(API_SECRET)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  } catch (err) {
    // Analytics must never break a confirmed booking.
    console.error('[enquiry] GA4 Measurement Protocol send failed:', err.message);
  }
}

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
    proposalDates, proposalDatePref, interestedDates, notes, addons, selectedTier, packageSelected, packageDisplay, pricingModel, contactPreference, photographyQuote,
    spotId, hotelIds,
    gaClientId, gaValue, gaDestination,
  } = req.body || {};

  // "Package Selected" feeds the confirmation email. Tiered listings send a tier
  // name; single-price listings send "The Moment — <price>". Fall back to the tier
  // name for older clients that don't send packageSelected.
  const packageLabel = packageSelected || selectedTier || '';

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
          // typecast lets Airtable create the single-select option for a new
          // "Package Selected" value (e.g. "The Moment") instead of rejecting the
          // whole record — otherwise a booking could fail to save.
          typecast: true,
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
              // Proposal Night is left blank on submission — filled manually once
              // availability is confirmed with the partner. Customer's requested
              // date(s) live in Interested Dates.
              ...(interestedDates ? { 'Interested Dates': interestedDates } : {}),
              ...(contactPreference ? { 'Contact Preference': contactPreference } : {}),
              'Special Requests':    notes || '',
              'Add-ons Selected':    Array.isArray(addons) ? addons.join(', ') : (addons || ''),
              'Pricing Model':       pricingModel || 'Single Price',
              ...(packageLabel ? { 'Package Selected': packageLabel } : {}),
              ...(packageDisplay ? { 'Package Display': packageDisplay } : {}),
              ...(photographyQuote && photographyQuote !== 'No' ? { 'Photography Quote Request': photographyQuote } : {}),
              ...(spotId ? { 'Linked Spot': [spotId] } : {}),
              ...(Array.isArray(hotelIds) && hotelIds.length ? { 'Linked Hotel': hotelIds } : {}),
              'Source':              'Website',
              'Internal Notes':      [
                spotName     ? `Spot: ${spotName}`           : '',
                packageLabel ? `Package: ${packageLabel}`    : '',
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

    // Server-side GA4 conversion — sent only after the Airtable write confirms,
    // so it counts a real enquiry, never a form load or a failed attempt. Awaited
    // (not fire-and-forget) because the serverless function may otherwise exit
    // before the request completes; it never throws, so a booking still succeeds
    // even if GA is unreachable.
    await sendGa4Lead({
      clientId:    gaClientId,
      value:       gaValue,
      spotName:    spotName,
      destination: gaDestination,
    });

    return res.status(200).json({ success: true, id: data.records[0].id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
