import { NextResponse } from "next/server";
import { createRecord, TABLES, SPOT_FIELDS } from "../../../lib/airtable";

export async function POST(request) {
  try {
    const body = await request.json();

    const fields = {
      [SPOT_FIELDS.NAME]: body.spotName,
      [SPOT_FIELDS.COUNTRY]: body.country,
      [SPOT_FIELDS.REGION_TOWN]: body.regionTown,
      [SPOT_FIELDS.FULL_SUMMARY]: body.fullSummary,
      [SPOT_FIELDS.VIBE]: body.vibe,
      [SPOT_FIELDS.VIBE_SECONDARY]: body.vibeSecondary || [],
      [SPOT_FIELDS.AVAILABILITY_TYPE]: body.availabilityType,
      [SPOT_FIELDS.RAIN_CHECK]: body.rainCheck,
      [SPOT_FIELDS.PRICING_MODEL]: body.pricingModel,
      [SPOT_FIELDS.PRICE_CURRENCY]: body.priceCurrency,
      [SPOT_FIELDS.STATUS]: "Draft",
    };

    if (body.availabilityType === "Seasonal") {
      fields[SPOT_FIELDS.AVAILABLE_MONTHS] = body.availableMonths || [];
    }

    if (body.otherVibe) fields[SPOT_FIELDS.OTHER_VIBE] = body.otherVibe;
    if (body.privacy) fields[SPOT_FIELDS.PRIVACY] = body.privacy;
    if (body.bestTime) fields[SPOT_FIELDS.BEST_TIME] = body.bestTime;

    if (body.pricingModel === "Single Price" && body.priceMoment) {
      fields[SPOT_FIELDS.PRICE_MOMENT] = Number(body.priceMoment);
    }

    // Add-ons apply to both pricing models — for Tiered spots they're
    // available on top of whichever tier the couple picks.
    (body.addons || []).slice(0, 4).forEach((addon, i) => {
      const n = i + 1;
      if (addon?.name) fields[`Addon ${n} Name`] = addon.name;
      if (addon?.price) fields[`Addon ${n} Price`] = Number(addon.price);
    });

    const record = await createRecord(TABLES.PROPOSAL_SPOTS, fields);

    return NextResponse.json({ id: record.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create spot" },
      { status: 500 }
    );
  }
}
