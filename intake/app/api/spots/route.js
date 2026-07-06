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
      [SPOT_FIELDS.STATUS]: "Draft",
    };

    if (body.availabilityType === "Seasonal") {
      fields[SPOT_FIELDS.AVAILABLE_MONTHS] = body.availableMonths || [];
    }

    if (body.pricingModel === "Single Price") {
      fields[SPOT_FIELDS.PRICE_CURRENCY] = body.priceCurrency;
      fields[SPOT_FIELDS.PRICE_MOMENT] = body.priceMoment
        ? Number(body.priceMoment)
        : undefined;

      (body.addons || []).slice(0, 4).forEach((addon, i) => {
        const n = i + 1;
        if (addon?.name) fields[`Addon ${n} Name`] = addon.name;
        if (addon?.price) fields[`Addon ${n} Price`] = Number(addon.price);
      });
    }

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
