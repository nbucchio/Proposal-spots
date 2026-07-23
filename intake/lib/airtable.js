// Server-only helper. Never import this from a client component.
// All table/field IDs below were confirmed identical across the sandbox
// copy and the production base (Airtable preserved IDs on duplication),
// so switching environments later is just an AIRTABLE_BASE_ID env change.

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const API_KEY = process.env.AIRTABLE_API_KEY;

export const TABLES = {
  PROPOSAL_SPOTS: "tblgpEUkpph612Hw5",
  PACKAGES: "tbljzMmHhof06TDuD",
};

// Exact Airtable field names, including trailing spaces where the base
// actually has them ("Spot ", "Price ", "Includes "). Do not trim these.
export const SPOT_FIELDS = {
  // "Name" is the table's primary field; "Spot Name" is a separate
  // regular field. Both get set to whatever the partner types.
  PRIMARY_NAME: "Name",
  NAME: "Spot Name",
  COUNTRY: "Country",
  REGION_TOWN: "Region / Town",
  FULL_SUMMARY: "Full Summary",
  VIBE: "Vibe",
  VIBE_SECONDARY: "Vibe Secondary",
  OTHER_VIBE: "Other Vibe",
  AVAILABILITY_TYPE: "Availability Type",
  AVAILABLE_MONTHS: "Available Months",
  RAIN_CHECK: "Rain Check",
  PRICING_MODEL: "Pricing Model",
  DEPOSIT_REQUIRED: "Partner Deposit Required",
  DEPOSIT_PERCENT: "Partner's Required Deposit %",
  REFUND_WINDOW_DAYS: "Refund Window (Days)",
  PRICE_CURRENCY: "Price Currency",
  PRICE_MOMENT: "Price Moment",
  INCLUDED_ITEMS: "Included Items",
  ADDON_1_NAME: "Addon 1 Name",
  ADDON_1_PRICE: "Addon 1 Price",
  ADDON_2_NAME: "Addon 2 Name",
  ADDON_2_PRICE: "Addon 2 Price",
  ADDON_3_NAME: "Addon 3 Name",
  ADDON_3_PRICE: "Addon 3 Price",
  ADDON_4_NAME: "Addon 4 Name",
  ADDON_4_PRICE: "Addon 4 Price",
  PRIVACY: "Privacy",
  BEST_TIME: "Best Time",
  PARTNER_NAME: "Partner Name",
  PREFERRED_CONTACT: "Preferred Contact Method",
  PARTNER_EMAIL: "Partner Email",
  PARTNER_WHATSAPP: "Partner WhatsApp",
  STATUS: "Status",
};

// Exact Airtable single-select choice strings, including trailing spaces
// where the base actually has them. Do not trim before sending — typecast
// would otherwise create near-duplicate choices in Airtable.
export const PRIVACY_CHOICES = [
  "Private (No Crowds)",
  "Light Crowd ",
  "Moderate Crowd ",
  "Everyone will see",
];

export const BEST_TIME_CHOICES = ["Sunrise", "Sunset", "Mid-day", "Any"];

export const PREFERRED_CONTACT_CHOICES = ["Email", "WhatsApp"];

export const PACKAGE_FIELDS = {
  NAME: "Name",
  SPOT_LINK: "Spot ", // trailing space is intentional, matches Airtable field name
  TIER_NAME: "Tier Name",
  PRICE: "Price ", // trailing space is intentional
  INCLUDES: "Includes ", // trailing space is intentional
  SORT_ORDER: "Sort Order",
  IS_ACTIVE: "Is Active",
  INCLUDED_ADDONS: "Included Addons",
};

async function airtableRequest(path, options = {}) {
  if (!BASE_ID || !API_KEY) {
    throw new Error(
      "Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY environment variables."
    );
  }

  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message || res.statusText;
    throw new Error(`Airtable error (${res.status}): ${message}`);
  }

  return data;
}

export async function createRecord(tableId, fields) {
  const data = await airtableRequest(`${tableId}`, {
    method: "POST",
    body: JSON.stringify({
      records: [{ fields }],
      typecast: true,
    }),
  });
  return data.records[0];
}
