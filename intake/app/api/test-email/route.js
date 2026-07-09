import { NextResponse } from "next/server";
import { sendPartnerConfirmation } from "../../../lib/email";

// Temporary testing helper — sends the confirmation email with sample
// data to whatever address you pass, without going through the form.
// Visit /api/test-email?to=you@example.com in a browser.
// Remove this route before sharing the form link publicly.
export async function GET(request) {
  const to = request.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.json(
      { error: "Add ?to=you@example.com to the URL." },
      { status: 400 }
    );
  }

  const spot = {
    partnerName: "Maria Fernandez",
    partnerEmail: to,
    spotName: "Private Island Sunset Proposal",
    country: "Portugal",
    regionTown: "Faro",
    fullSummary:
      "A tiny private island reachable only by boat, set up for sunset.",
    vibe: "Beach",
    vibeSecondary: ["Ocean", "Luxury"],
    otherVibe: "",
    privacy: "Private (No Crowds) ",
    bestTime: "Sunset",
    availabilityType: "All Year",
    availableMonths: [],
    priceCurrency: "EUR",
    pricingModel: "Tiered",
    priceMoment: "",
    addons: [
      { name: "Champagne toast", price: "150" },
      { name: "Live violinist", price: "400" },
      { name: "", price: "" },
      { name: "", price: "" },
    ],
  };

  const tiers = [
    {
      tierName: "The Moment",
      price: "1926",
      includes:
        "Private boat departure, Vintage parasol island setup, Professional photography",
      sameAsMoment: false,
      sameAsExperience: false,
    },
    {
      tierName: "The Experience",
      price: "3200",
      includes: "Moët champagne, Bouquet of flowers",
      sameAsMoment: true,
      sameAsExperience: false,
    },
    {
      tierName: "The Unforgettable",
      price: "4650",
      includes: "Live violin (4 songs), Edited proposal video + drone",
      sameAsMoment: true,
      sameAsExperience: true,
    },
  ];

  try {
    await sendPartnerConfirmation({ spot, tiers });
    return NextResponse.json({ ok: true, sentTo: to });
  } catch (err) {
    console.error("test-email failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
