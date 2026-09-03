// Server-only. Sends the partner confirmation email after a spot is
// submitted, using the exact same data (and formatting helpers) as the
// intake form's own Review step, so the email matches what the partner
// already saw before hitting submit.

import { Resend } from "resend";
import {
  TIER_SHADES,
  formatPrice,
  finalIncludesFor,
  tierPlusNote,
} from "./reviewFormat";

const FROM_ADDRESS = "Proposal Spots <hello@proposalspots.com>";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function row(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #D8D2C8;color:#1C1C1C99;font-size:14px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #D8D2C8;color:#1C1C1C;font-size:14px;text-align:right;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

function tierBlock(tier, index, currency) {
  if (!tier.price) return "";
  const includes = finalIncludesFor(tier);
  const plusNote = tierPlusNote(tier, index);
  return `
    <div style="background:${TIER_SHADES[index]};border:1px solid #D8D2C8;border-radius:8px;padding:16px;margin-bottom:12px;">
      <p style="margin:0;font-weight:600;color:#1C1C1C;font-size:14px;">
        ${escapeHtml(tier.tierName)} — ${escapeHtml(formatPrice(tier.price, currency))}
      </p>
      ${plusNote ? `<p style="margin:6px 0 0;font-size:12px;color:#1C1C1C99;">✓ ${escapeHtml(plusNote)}</p>` : ""}
      ${includes ? `<p style="margin:6px 0 0;font-size:13px;color:#1C1C1C;">${escapeHtml(includes)}</p>` : ""}
    </div>`;
}

// The stable production domain — not built from VERCEL_URL, which points
// at a deployment-specific hash URL that isn't reliably fetchable by
// email clients (that's what caused the broken image in testing).
const LOGO_URL =
  "https://proposal-spots-intake.vercel.app/logo/proposal-spots-logo-color.png";

export function renderConfirmationEmailHtml({ spot, tiers, logoUrl }) {
  const filledAddons = (spot.addons || []).filter((a) => a.name);
  const vibeValue = [spot.vibe, ...(spot.vibeSecondary || [])]
    .filter(Boolean)
    .join(", ");
  const availabilityValue =
    spot.availabilityType === "Seasonal"
      ? `Seasonal (${(spot.availableMonths || []).join(", ")})`
      : "All Year";
  const addonsValue = filledAddons
    .map((a) =>
      a.price ? `${a.name} (${formatPrice(a.price, spot.priceCurrency)})` : a.name
    )
    .join(", ");

  const detailRows = [
    row("Spot name", spot.spotName),
    row("Country", spot.country),
    row("Region / town", spot.regionTown),
    row("Summary", spot.fullSummary),
    row("Vibe", vibeValue),
    row("Other Vibe", spot.otherVibe),
    row("Privacy", (spot.privacy || "").trim()),
    row("Best time", spot.bestTime),
    row("Availability", availabilityValue),
    row("Currency", spot.priceCurrency),
    row("Pricing model", spot.pricingModel),
    row("Requires deposit", spot.requiresDeposit),
    spot.requiresDeposit === "Yes"
      ? row(
          "Deposit required",
          spot.depositPercent ? `${spot.depositPercent}% of total` : ""
        )
      : "",
    spot.requiresDeposit === "Yes"
      ? row(
          "Refundable up to",
          spot.refundWindowDays
            ? `${spot.refundWindowDays} days before the date`
            : ""
        )
      : "",
    spot.requiresDeposit === "Yes"
      ? row("Deposit notes", spot.depositNotes)
      : "",
    row("Balance collected", spot.balanceTiming),
    spot.balanceTiming === "A set time before the date"
      ? row(
          "Balance due",
          spot.balanceDueDaysBefore
            ? `${spot.balanceDueDaysBefore} days before the date`
            : ""
        )
      : "",
    row(
      "Balance payment methods",
      (spot.balancePaymentMethods || []).join(", ")
    ),
    row("Balance payment details", spot.balancePaymentDetails),
    spot.pricingModel === "Single Price"
      ? row(
          "Price",
          spot.priceMoment
            ? formatPrice(spot.priceMoment, spot.priceCurrency)
            : ""
        )
      : "",
    spot.pricingModel === "Single Price"
      ? row("What's included", spot.includedItems)
      : "",
    row("Add-ons", addonsValue),
  ].join("");

  const tiersHtml =
    spot.pricingModel === "Tiered"
      ? (tiers || [])
          .map((t, i) => tierBlock(t, i, spot.priceCurrency))
          .join("")
      : "";

  return `
  <div style="background:#F4F1EB;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D8D2C8;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin:0 0 24px;">
        <img src="${logoUrl || LOGO_URL}" alt="Proposal Spots" width="220" style="width:220px;max-width:60%;height:auto;" />
      </div>

      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1C1C1C;">
        Hi ${escapeHtml(spot.partnerName || "there")},
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1C1C1C;">
        Thanks for submitting <strong>${escapeHtml(spot.spotName)}</strong> to Proposal Spots!
        Here's a copy of everything you sent us:
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;margin:16px 0;">
        ${detailRows}
      </table>

      ${tiersHtml ? `<div style="font-family:Helvetica,Arial,sans-serif;margin:16px 0;">${tiersHtml}</div>` : ""}

      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;margin-top:24px;">
        Your spot has been saved as a <strong>Draft</strong>. Our team will review it and follow up
        before it goes live on proposalspots.com.
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;">
        If you haven't already, please also send us 5–10 photos of the spot to
        <a href="mailto:hello@proposalspots.com" style="color:#A55A4A;">hello@proposalspots.com</a>.
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;">
        Thanks again for partnering with us!<br />— The Proposal Spots Team
      </p>
    </div>
  </div>`;
}

// --- Booking Confirmed (customer-facing) -----------------------------------
// Reuses the exact same visual shell as the partner confirmation above:
// the cream #F4F1EB canvas, the white #FFFFFF card with the #D8D2C8 border
// and 12px radius, the centered 220px logo (LOGO_URL), the Helvetica body,
// #1C1C1C ink, and the #A55A4A terracotta accent. Only the copy differs.

// One emoji-labelled line inside the details card. Renders nothing when the
// value is empty so an optional field (e.g. special note) can be omitted.
// Pass `href` to render the value as a link (used for the spot name → live
// listing page).
function detailLine(emoji, label, value, href) {
  if (!value) return "";
  const shown = href
    ? `<a href="${escapeHtml(href)}" style="color:#A55A4A;text-decoration:none;">${escapeHtml(value)}</a>`
    : escapeHtml(value);
  return `
      <p style="margin:0 0 10px;font-size:14px;color:#1C1C1C;line-height:1.5;">
        ${emoji} <strong>${escapeHtml(label)}:</strong> ${shown}
      </p>`;
}

// True when the booking's partner is on the new "Deposit at Booking" payment
// model (Airtable value "New – Deposit at Booking"); false for legacy.
function isNewPaymentModel(paymentModel) {
  return String(paymentModel || "").trim().toLowerCase().startsWith("new");
}

// Numeric booking total in the spot's currency: package price + any priced
// add-ons.
function bookingTotal(booking) {
  let total = Number(booking.packagePrice) || 0;
  (booking.addonItems || []).forEach((a) => {
    if (a && a.price) total += Number(a.price) || 0;
  });
  return total;
}

// The deposit due now, as a number, for new-model bookings: total × the
// spot's Total Customer Deposit %. Returns 0 when not applicable.
function depositAmount(booking) {
  if (!isNewPaymentModel(booking.paymentModel)) return 0;
  const pct = Number(booking.totalDepositPercent) || 0;
  if (!pct) return 0;
  return Math.round(bookingTotal(booking) * pct) / 100;
}

// Bulleted list of what's included in the selected package. Accepts either an
// array of items or a comma-separated string (the format the Packages table
// stores). Renders nothing when empty.
function includesList(includedItems) {
  const items = Array.isArray(includedItems)
    ? includedItems
    : String(includedItems || "")
        .split(",")
        .map((s) => s.trim());
  const filled = items.filter(Boolean);
  if (!filled.length) return "";
  const lis = filled
    .map(
      (item) =>
        `<li style="margin:0 0 4px;">${escapeHtml(item)}</li>`
    )
    .join("");
  return `
      <ul style="margin:0 0 10px 22px;padding:0;font-size:14px;color:#1C1C1C;line-height:1.5;">
        ${lis}
      </ul>`;
}

// Itemised pricing: the package plus any booked add-ons, then a Total.
// Uses the same label-left / value-right hairline table as the partner
// confirmation email (see `row` above). Prices are numbers in the spot's
// currency (priceCurrency); formatPrice adds the right symbol. Renders
// nothing if there's no package price and no priced add-ons.
function pricingTable(booking) {
  const { packageName, packagePrice, addonItems, priceCurrency, totalDepositPercent } = booking;
  const cur = priceCurrency || "USD";
  const items = [];
  let total = 0;

  if (packagePrice) {
    total += Number(packagePrice) || 0;
    items.push({ label: packageName || "Package", amount: Number(packagePrice) });
  }
  (addonItems || []).forEach((a) => {
    if (!a || !a.name) return;
    const amt = Number(a.price) || 0;
    total += amt;
    items.push({ label: a.name, amount: a.price ? amt : null });
  });

  if (!items.length) return "";

  const rows = items
    .map(
      (li) => `
      <tr>
        <td style="padding:6px 0;color:#1C1C1C;font-size:14px;vertical-align:top;">${escapeHtml(li.label)}</td>
        <td style="padding:6px 0;color:#1C1C1C;font-size:14px;text-align:right;white-space:nowrap;vertical-align:top;">${li.amount != null ? escapeHtml(formatPrice(li.amount, cur)) : "—"}</td>
      </tr>`
    )
    .join("");

  // For new-model bookings, break the total into the deposit due now and the
  // balance due after, right under the Total.
  const deposit = depositAmount(booking);
  const pct = Number(totalDepositPercent) || 0;
  const depositRows =
    deposit > 0
      ? `
        <tr>
          <td style="padding:8px 0 0;color:#A55A4A;font-size:14px;font-weight:600;">Deposit to confirm today (${escapeHtml(pct)}%)</td>
          <td style="padding:8px 0 0;color:#A55A4A;font-size:14px;font-weight:600;text-align:right;white-space:nowrap;">${escapeHtml(formatPrice(deposit, cur))}</td>
        </tr>
        <tr>
          <td style="padding:4px 0 0;color:#1C1C1C99;font-size:13px;">Balance due after the experience</td>
          <td style="padding:4px 0 0;color:#1C1C1C99;font-size:13px;text-align:right;white-space:nowrap;">${escapeHtml(formatPrice(total - deposit, cur))}</td>
        </tr>`
      : "";

  return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 2px;border-top:1px solid #D8D2C8;font-family:Helvetica,Arial,sans-serif;">
        ${rows}
        <tr>
          <td style="padding:8px 0 0;border-top:1px solid #D8D2C8;color:#1C1C1C;font-size:14px;font-weight:600;">Total</td>
          <td style="padding:8px 0 0;border-top:1px solid #D8D2C8;color:#1C1C1C;font-size:14px;font-weight:600;text-align:right;white-space:nowrap;">${escapeHtml(formatPrice(total, cur))}</td>
        </tr>
        ${depositRows}
      </table>`;
}

// Payment section, driven by the spot's payment model (per Airtable).
//   New – Deposit at Booking → "Securing Your Date": the calculated deposit,
//     the spot's refund policy, the pay button, and how/when the balance is
//     paid afterwards (the spot's balanceNote).
//   Legacy – Invoice After Event → a short "Payment" note from balanceNote
//     only (no deposit, no pay button); nothing at all if there's no note.
// Uses the email's existing visual system — Helvetica body, #1C1C1C ink,
// #A55A4A accent, #D8D2C8 hairline, 8px radius — no new component.
function depositSection(booking) {
  const {
    spotName,
    confirmedDate,
    totalDepositPercent,
    refundDeadlineDays,
    partnerBusinessName,
    partnerName,
    paymentLink,
    priceCurrency,
    balanceNote,
    paymentModel,
  } = booking;

  // Legacy (invoice-after-event): just surface the balance/payment note, if any.
  if (!isNewPaymentModel(paymentModel)) {
    if (!balanceNote) return "";
    return `
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#1C1C1C;margin:24px 0 8px;">
        Payment
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 8px;">
        ${escapeHtml(balanceNote)}
      </p>`;
  }

  const cur = priceCurrency || "USD";
  const deposit = depositAmount(booking);
  const pct = Number(totalDepositPercent) || 0;

  const refundLine = refundDeadlineDays
    ? `
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 12px;">
        <strong>Refund policy:</strong> Fully refundable up to
        ${escapeHtml(refundDeadlineDays)} days before your proposal. After that,
        it's non-refundable, since we hold that date exclusively for you from
        this point on.
      </p>`
    : "";

  const balanceLine = balanceNote
    ? `
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 16px;">
        <strong>Remaining balance:</strong> ${escapeHtml(balanceNote)}
      </p>`
    : "";

  return `
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#1C1C1C;margin:24px 0 8px;">
        Securing Your Date
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 12px;">
        To officially lock in <strong>${escapeHtml(spotName)}</strong> for
        <strong>${escapeHtml(confirmedDate)}</strong>, we ask for a deposit of
        <strong>${escapeHtml(formatPrice(deposit, cur))}</strong>
        (${escapeHtml(pct)}% of your total).
      </p>
      ${refundLine}
      ${balanceLine}
      <p style="text-align:center;margin:0 0 16px;">
        <a href="${escapeHtml(paymentLink || "#")}" style="display:inline-block;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#A55A4A;text-decoration:none;border:1px solid #A55A4A;border-radius:8px;padding:12px 28px;">
          👉 Secure Your Date — Pay Deposit
        </a>
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 8px;">
        Once received, your date is 100% locked in and
        ${escapeHtml(partnerName || "your partner")} will reach out to finalize
        the details.
      </p>`;
}

// Practice-run sample: the real Ella Mountain Sunrise & Sunset Proposal
// listing (Sri Lanka, Published, currency USD). Its partner (Champika
// Rathnayaka Photography) is on the NEW – Deposit at Booking model, so the
// deposit section renders. All spot-side numbers are live from Airtable:
// The Moment = $350, Total Customer Deposit % = 50% ($175), Refund Window =
// 14 days, and the balance note is the spot's own "payment after" text. The
// customer/couple names and date are sample stand-ins; the Wise link is a
// placeholder until a real one is pasted per booking.
export const SAMPLE_BOOKING = {
  customerFirstName: "Sarah",
  spotName: "Ella Mountain Sunrise & Sunset Proposal",
  spotUrl:
    "https://www.proposalspots.com/spots/mountain-sunrise-sunset-proposal-ella",
  confirmedDate: "15 March 2027",
  packageName: "The Moment",
  includedItems: [
    "Professional photography — 1.5 hours capturing the proposal as it happens",
    "Planning & coordination — the surprise planned in advance with guidance to the best viewpoint",
    "Couple portraits — a relaxed session together after the proposal",
    "30 edited photos — high-resolution images delivered via Google Drive",
  ],
  specialRequest: "",
  priceCurrency: "USD",
  packagePrice: 350,
  addonItems: [],
  partnerName: "Champika",
  partnerBusinessName: "Champika Rathnayaka Photography",
  partnerMarket: "Sri Lanka",
  partnerFirstNameOfCouple: "James",
  paymentModel: "New – Deposit at Booking",
  totalDepositPercent: 50,
  refundDeadlineDays: 14,
  balanceNote:
    "The remaining balance is payable in cash immediately after the proposal experience.",
  paymentLink: "https://wise.com/pay/r/placeholder-ella-deposit",
  customerEmail: "",
};

// Legacy-model example (The Jungle Escape / Forever Promises, Bali) for
// previewing the invoice-after-event path: no deposit section, no pay button
// — just the spot's payment note, if it has one.
export const SAMPLE_BOOKING_LEGACY = {
  ...SAMPLE_BOOKING,
  customerFirstName: "Jerome",
  spotName: "The Jungle Escape",
  spotUrl: "",
  confirmedDate: "24 August 2026",
  includedItems: [
    "Private Dinner",
    "Setup & Styling",
    "Venue usage fee",
    "Professional photographer (full session + edited selection within 14 days)",
    "Flower Bouquet",
    "Candlelight ambiance",
    "Fairy lights",
  ],
  specialRequest: "This date is also my birthday",
  priceCurrency: "IDR",
  packagePrice: 17520000,
  partnerName: "Verena",
  partnerBusinessName: "Forever Promises, Bali",
  partnerMarket: "Bali, Indonesia",
  partnerFirstNameOfCouple: "Flora",
  paymentModel: "Legacy – Invoice After Event",
  totalDepositPercent: 0,
  refundDeadlineDays: 0,
  balanceNote: "",
  paymentLink: "",
};

export function renderBookingConfirmedEmailHtml(booking = {}) {
  const {
    customerFirstName,
    spotName,
    spotUrl,
    confirmedDate,
    packageName,
    includedItems,
    specialRequest,
    partnerName,
    partnerMarket,
    partnerFirstNameOfCouple,
    logoUrl,
  } = booking;

  const detailsCard = [
    detailLine("📍", "Proposal Spot", spotName, spotUrl),
    detailLine("💍", "Date", confirmedDate),
    detailLine("🎁", "Package", packageName),
    includesList(includedItems),
    detailLine("📝", "Special note", specialRequest),
    pricingTable(booking),
  ].join("");

  return `
  <div style="background:#F4F1EB;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D8D2C8;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin:0 0 24px;">
        <img src="${logoUrl || LOGO_URL}" alt="Proposal Spots" width="220" style="width:220px;max-width:60%;height:auto;" />
      </div>

      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1C1C1C;">
        Hi ${escapeHtml(customerFirstName || "there")},
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1C1C1C;">
        It's official — everything is locked in, and we could not be more thrilled for you.
      </p>

      <div style="background:#f5f0e8;border:1px solid #D8D2C8;border-radius:8px;padding:16px;margin:16px 0;font-family:Helvetica,Arial,sans-serif;">
        ${detailsCard}
      </div>
      ${depositSection(booking)}
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;">
        <strong>${escapeHtml(partnerName || "Your partner")}</strong> is our local
        partner${partnerMarket ? ` in ${escapeHtml(partnerMarket)}` : ""}, and will
        be overseeing everything on the ground to make sure the moment unfolds
        exactly as it should, and will reach out to you directly to coordinate
        the finer details.
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;">
        If anything at all comes up in the meantime, just reply to this email or
        reach us at
        <a href="mailto:hello@proposalspots.com" style="color:#A55A4A;">hello@proposalspots.com</a>.
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;margin-top:24px;">
        With so much excitement for what's ahead,<br />The Proposal Spots Team
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C99;margin-top:24px;">
        P.S. — ${escapeHtml(partnerFirstNameOfCouple || "they")} is going to say yes. 💍
      </p>
    </div>
  </div>`;
}

export async function sendBookingConfirmed(booking) {
  if (!booking?.customerEmail) return;
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY — skipping booking confirmed email.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: booking.customerEmail,
    subject: `Your proposal is confirmed at ${booking.spotName} 💍`,
    html: renderBookingConfirmedEmailHtml(booking),
  });
}

export async function sendPartnerConfirmation({ spot, tiers }) {
  if (!spot?.partnerEmail) return;
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY — skipping partner confirmation email.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: spot.partnerEmail,
    subject: `We've received your Proposal Spot: ${spot.spotName}`,
    html: renderConfirmationEmailHtml({ spot, tiers: tiers || [] }),
  });
}
