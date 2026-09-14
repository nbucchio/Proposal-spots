// Generic server-side GA4 event endpoint (Measurement Protocol).
//
// The browser POSTs here (a first-party call to our own domain, which ad
// blockers and tracking protection do NOT block), and this function forwards
// the event to GA4 server-to-server — which also can't be blocked. That's why
// conversions tracked this way survive ad blockers, unlike a client-side gtag
// call.
//
// Used for:
//   - qualify_lead     (homepage enquiry form success)
//   - contact_whatsapp (a visitor tapped a WhatsApp link)
//
// The spot-page enquiry flow fires its own qualify_lead from /api/enquiry.

// Only these event names are accepted — this endpoint is public, so the
// allow-list stops it being abused to inject arbitrary events into GA4.
const ALLOWED_EVENTS = new Set(['qualify_lead', 'contact_whatsapp']);

async function sendGa4Event({ eventName, clientId, value, spotName, destination, source, pagePath }) {
  const MEASUREMENT_ID = 'G-4P287X7WZB';
  const API_SECRET = process.env.GA4_MP_API_SECRET;
  if (!API_SECRET) return; // not configured — skip quietly

  const params = {
    // Marks the event as engaged so GA4 counts it in reports and attribution.
    engagement_time_msec: 1,
  };
  if (source)      params.source = source;
  if (spotName)    params.spot_name = spotName;
  if (destination) params.destination = destination;
  if (pagePath)    params.page_path = pagePath;

  // Only the lead conversion carries a monetary value/currency.
  if (eventName === 'qualify_lead') {
    params.currency = 'USD';
    const numericValue = typeof value === 'number'
      ? value
      : parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
    if (Number.isFinite(numericValue)) params.value = numericValue;
  }

  const payload = {
    // Reuse the browser's GA client_id (passed from the page) so the event
    // stitches to the same GA4 user/session for campaign attribution. Fall back
    // to a synthetic id so a blocked-cookie visitor is still counted.
    client_id: clientId || `${Date.now()}.${Math.floor(Math.random() * 1e10)}`,
    events: [{ name: eventName, params }],
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
    // Analytics must never break anything downstream for the visitor.
    console.error('[track-lead] GA4 Measurement Protocol send failed:', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { event, clientId, value, spotName, destination, source, pagePath } = req.body || {};

  if (!ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ error: 'Unsupported event' });
  }

  await sendGa4Event({
    eventName:   event,
    clientId,
    value,
    spotName,
    destination,
    source,
    pagePath,
  });

  return res.status(200).json({ success: true });
}
