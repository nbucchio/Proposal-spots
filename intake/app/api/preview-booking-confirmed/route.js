import { NextResponse } from "next/server";
import {
  renderBookingConfirmedEmailHtml,
  sendBookingConfirmed,
  SAMPLE_BOOKING,
  SAMPLE_BOOKING_DEPOSIT,
} from "../../../lib/email";

// Preview / test-send harness for the Booking Confirmed email.
//
//   GET /api/preview-booking-confirmed
//       → renders the email using SAMPLE_BOOKING (Jerome / The Jungle
//         Escape / The Moment — a LEGACY-payment-model partner, so no
//         deposit section).
//
//   GET /api/preview-booking-confirmed?model=new
//       → renders the NEW-payment-model variant (SAMPLE_BOOKING_DEPOSIT)
//         so the "Securing Your Date" deposit section can be previewed.
//         Deposit amount / link in that sample are placeholders.
//
//   GET /api/preview-booking-confirmed?send=you@example.com
//       → also test-sends the chosen sample to the given address via Resend
//         (requires RESEND_API_KEY in the environment). Combine with
//         ?model=new to test-send the deposit variant.
//
// This is intentionally NOT wired to any Airtable trigger — it exists only
// to confirm the template renders correctly before that follow-up task.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sendTo = searchParams.get("send");
  const useDepositVariant = searchParams.get("model") === "new";

  const booking = {
    ...(useDepositVariant ? SAMPLE_BOOKING_DEPOSIT : SAMPLE_BOOKING),
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
