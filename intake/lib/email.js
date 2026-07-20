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

// Sample data for previewing / test-sending. This first send is a real
// booking: The Jungle Escape (Bali) / 24 August 2026 / The Moment package,
// with that package's actual included-items list. Add-ons and special note
// are left blank here (they auto-hide when empty). Customer name, partner
// name, and the P.S. couple name are placeholders to confirm before sending.
export const SAMPLE_BOOKING = {
  customerFirstName: "Alex",
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
  addons: "",
  specialRequest: "",
  partnerName: "Jerome",
  partnerFirstNameOfCouple: "Sam",
  customerEmail: "",
};

export function renderBookingConfirmedEmailHtml(booking = {}) {
  const {
    customerFirstName,
    spotName,
    confirmedDate,
    packageName,
    includedItems,
    addons,
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
    detailLine("✨", "Add-ons", addons),
    detailLine("📝", "Special note", specialRequest),
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
