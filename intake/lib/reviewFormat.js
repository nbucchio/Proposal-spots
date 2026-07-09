// Shared between the intake form's Review step and the partner
// confirmation email, so both render the exact same summary from the
// exact same data — no duplicated/drifting logic between the two.

// Same subtle shades the live site already uses to tell tiers apart
// (see spot.html .sdp-tier-row:nth-child backgrounds).
export const TIER_SHADES = ["#f5f0e8", "#ede5d8", "#e4d9c8"];

export const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$", NZD: "$", CHF: "CHF",
  JPY: "¥", CNY: "¥", INR: "₹", MXN: "$", BRL: "R$", ARS: "$", CLP: "$",
  IDR: "Rp", THB: "฿", VND: "₫", PHP: "₱", MYR: "RM", SGD: "$", HKD: "$",
  KRW: "₩", AED: "AED", SAR: "SAR", ZAR: "R", EGP: "EGP", MAD: "DH",
  TRY: "₺", ISK: "kr", FJD: "FJ$", XPF: "₣",
};

export function formatPrice(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const num = Number(amount);
  return `${symbol}${Number.isFinite(num) ? num.toLocaleString() : amount}`;
}

export const TIER_PREFIXES = {
  moment: "Everything in The Moment, plus: ",
  experience: "Everything in The Experience, plus: ",
  both: "Everything in The Moment and The Experience, plus: ",
};

export function tierPrefixFor(sameAsMoment, sameAsExperience) {
  if (sameAsMoment && sameAsExperience) return TIER_PREFIXES.both;
  if (sameAsMoment) return TIER_PREFIXES.moment;
  if (sameAsExperience) return TIER_PREFIXES.experience;
  return "";
}

export function stripKnownPrefix(text) {
  for (const p of Object.values(TIER_PREFIXES)) {
    if (text.startsWith(p)) return text.slice(p.length);
  }
  return text;
}

// What actually gets saved to Airtable: just this tier's own incremental
// items, matching the existing CRM convention (the live site auto-shows
// "Includes everything in [previous tier]" itself — see spot.html
// renderTieredPackages). The "Everything in X, plus:" prefix is only
// ever shown to the partner while they're filling out the form.
export function finalIncludesFor(tier) {
  return stripKnownPrefix(tier.includes).trim();
}

export function tierPlusNote(tier, index) {
  if (index === 0 || (!tier.sameAsMoment && !tier.sameAsExperience)) return "";
  return (
    "Includes everything in " +
    [tier.sameAsMoment && "The Moment", tier.sameAsExperience && "The Experience"]
      .filter(Boolean)
      .join(" and ")
  );
}
