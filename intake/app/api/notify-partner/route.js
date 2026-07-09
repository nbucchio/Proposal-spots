import { NextResponse } from "next/server";
import { sendPartnerConfirmation } from "../../../lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    await sendPartnerConfirmation(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // A failed confirmation email should never block a submission that's
    // already saved to Airtable — log it and move on.
    console.error("Failed to send partner confirmation email:", err);
    return NextResponse.json({ ok: false });
  }
}
