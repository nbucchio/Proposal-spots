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
function detailLine(emoji, label, value) {
  if (!value) return "";
  return `
      <p style="margin:0 0 10px;font-size:14px;color:#1C1C1C;line-height:1.5;">
        ${emoji} <strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}
      </p>`;
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
  const { packageName, packagePrice, addonItems, priceCurrency } = booking;
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

  return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 2px;border-top:1px solid #D8D2C8;font-family:Helvetica,Arial,sans-serif;">
        ${rows}
        <tr>
          <td style="padding:8px 0 0;border-top:1px solid #D8D2C8;color:#1C1C1C;font-size:14px;font-weight:600;">Total</td>
          <td style="padding:8px 0 0;border-top:1px solid #D8D2C8;color:#1C1C1C;font-size:14px;font-weight:600;text-align:right;white-space:nowrap;">${escapeHtml(formatPrice(total, cur))}</td>
        </tr>
      </table>`;
}

// "Securing Your Date" deposit section. Rendered ONLY for bookings whose
// partner is on the new "Deposit at Booking" payment model; legacy
// (invoice-after-event) partners get nothing here at all. Uses the email's
// existing visual system — Helvetica body, #1C1C1C ink, #A55A4A accent,
// #D8D2C8 hairline, 8px radius — rather than introducing a new component.
function depositSection(booking) {
  const {
    spotName,
    confirmedDate,
    totalDepositAmount,
    totalDepositPercent,
    refundDeadlineDays,
    partnerBusinessName,
    partnerName,
    paymentLink,
    paymentModel,
  } = booking;

  // Gate: show only for the new payment model (Airtable value
  // "New – Deposit at Booking"); omit for "Legacy – Invoice After Event".
  const isNewPaymentModel = String(paymentModel || "")
    .trim()
    .toLowerCase()
    .startsWith("new");
  if (!isNewPaymentModel) return "";

  return `
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#1C1C1C;margin:24px 0 8px;">
        Securing Your Date
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 12px;">
        To officially lock in <strong>${escapeHtml(spotName)}</strong> for
        <strong>${escapeHtml(confirmedDate)}</strong>, we ask for a deposit of
        <strong>${escapeHtml(totalDepositAmount)}</strong>
        (${escapeHtml(totalDepositPercent)}% of your package). This one payment
        goes directly to Proposal Spots — no separate charge from the venue at
        this stage.
      </p>
      <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1C1C1C;line-height:1.5;margin:0 0 16px;">
        <strong>Refund policy:</strong> Fully refundable up to
        ${escapeHtml(refundDeadlineDays)} days before your proposal. After that,
        it's non-refundable, since we and
        ${escapeHtml(partnerBusinessName || "our partner")} hold that date
        exclusively for you from this point on.
      </p>
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

// Sample data for the first practice send. Customer details are the real
// booking (Jerome / partner Flora / birthday note); the spot, date and
// package are set to The Jungle Escape / 24 August 2026 / The Moment (the
// original booking's date wasn't available and will be updated later), with
// that package's actual included-items list. Add-ons auto-hide when blank.
// This spot's partner (Forever Promises, Bali) is on the LEGACY payment
// model, so the deposit section is correctly omitted for this booking.
export const SAMPLE_BOOKING = {
  customerFirstName: "Jerome",
  spotName: "The Jungle Escape",
  confirmedDate: "24 August 2026",
  packageName: "The Moment",
  includedItems: [
    "Private Dinner",
    "Setup & Styling",
    "Venue usage fee",
    "Professional photographer (full session + edited selection within 14 days)",
    "Flower Bouquet",
    "Floral décor (fresh rose petals & mixed roses)",
    "Candlelight ambiance",
    "Fairy lights",
    "Teardown & cleaning",
    "On-site assistant",
    "Music (personalized playlist)",
  ],
  specialRequest: "This date is also my birthday",
  priceCurrency: "IDR",
  packagePrice: 17520000,
  addonItems: [],
  partnerName: "Verena",
  partnerBusinessName: "Forever Promises, Bali",
  partnerFirstNameOfCouple: "Flora",
  paymentModel: "Legacy – Invoice After Event",
  customerEmail: "",
};

// Illustrative preview of the NEW payment-model variant, so the deposit
// section can be previewed before a real new-model booking exists. The
// deposit amount/percent, refund window and payment link below are
// PLACEHOLDERS — the real values come from Airtable (percent, refund window)
// or still need wiring (deposit amount = price × %, and the Wise link).
// Two real Jungle Escape add-ons are shown as "booked" here to demonstrate
// add-on pricing rows. Package Rp17,520,000 + Rp5,400,000 + Rp3,480,000 =
// Rp26,400,000 total; the 30% deposit = Rp7,920,000.
export const SAMPLE_BOOKING_DEPOSIT = {
  ...SAMPLE_BOOKING,
  addonItems: [
    { name: "Live Singer, Guitarist or Violinist", price: 5400000 },
    { name: "Pyrotechnics (6 shots)", price: 3480000 },
  ],
  paymentModel: "New – Deposit at Booking",
  totalDepositAmount: "Rp7,920,000",
  totalDepositPercent: 30,
  refundDeadlineDays: 14,
  paymentLink: "https://wise.com/pay/r/placeholder-example",
};

export function renderBookingConfirmedEmailHtml(booking = {}) {
  const {
    customerFirstName,
    spotName,
    confirmedDate,
    packageName,
    includedItems,
    specialRequest,
    partnerName,
    partnerFirstNameOfCouple,
    logoUrl,
  } = booking;

  const detailsCard = [
    detailLine("📍", "Proposal Spot", spotName),
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
        <strong>${escapeHtml(partnerName || "Your partner")}</strong>
        will be overseeing everything on the ground to make sure the moment
        unfolds exactly as it should, and will reach out to you directly to
        coordinate the finer details.
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
