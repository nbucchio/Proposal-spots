import { NextResponse } from "next/server";
import {
  renderBookingConfirmedEmailHtml,
  sendBookingConfirmed,
  SAMPLE_BOOKING,
  SAMPLE_BOOKING_LEGACY,
} from "../../../lib/email";

// Preview / test-send harness for the Booking Confirmed email.
//
//   GET /api/preview-booking-confirmed
//       → renders the email using SAMPLE_BOOKING (Ella Mountain Sunrise &
//         Sunset Proposal / The Moment — a NEW-payment-model spot, so the
//         spot-name link + deposit section + balance note all show). Deposit
//         is calculated live ($175 = 50% of $350); the Wise link is a
//         placeholder.
//
//   GET /api/preview-booking-confirmed?model=legacy
//       → renders the LEGACY-payment-model variant (SAMPLE_BOOKING_LEGACY /
//         The Jungle Escape): no deposit section, no pay button.
//
//   GET /api/preview-booking-confirmed?send=you@example.com
//       → also test-sends the chosen sample to the given address via Resend
//         (requires RESEND_API_KEY in the environment). Combine with
//         ?model=legacy to test-send the legacy variant.
//
// This is intentionally NOT wired to any Airtable trigger — it exists only
// to confirm the template renders correctly before that follow-up task.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sendTo = searchParams.get("send");
  const useLegacyVariant = searchParams.get("model") === "legacy";

  const booking = {
    ...(useLegacyVariant ? SAMPLE_BOOKING_LEGACY : SAMPLE_BOOKING),
  };
  if (sendTo) booking.customerEmail = sendTo;

  const html = renderBookingConfirmedEmailHtml(booking);

  if (sendTo) {
    try {
      await sendBookingConfirmed(booking);
      return NextResponse.json({ ok: true, sentTo: sendTo });
    } catch (err) {
      console.error("Failed to test-send booking confirmed email:", err);
      return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
