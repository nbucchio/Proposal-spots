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

export function renderConfirmationEmailHtml({ spot, tiers }) {
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
      <p style="text-align:center;margin:0 0 24px;font-style:italic;font-size:26px;color:#1C1C1C;">Proposal Spots</p>

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
