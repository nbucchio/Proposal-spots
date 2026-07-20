import { NextResponse } from "next/server";
import {
  renderBookingConfirmedEmailHtml,
  sendBookingConfirmed,
  SAMPLE_BOOKING,
} from "../../../lib/email";

// Preview / test-send harness for the Booking Confirmed email.
//
//   GET /api/preview-booking-confirmed
//       → renders the email as an HTML page using SAMPLE_BOOKING
//         (Jerome / Jungle Escape / 22–24 August 2026).
//
//   GET /api/preview-booking-confirmed?send=you@example.com
//       → also test-sends that sample to the given address via Resend
//         (requires RESEND_API_KEY in the environment).
//
// This is intentionally NOT wired to any Airtable trigger — it exists only
// to confirm the template renders correctly before that follow-up task.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sendTo = searchParams.get("send");

  const booking = { ...SAMPLE_BOOKING };
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
