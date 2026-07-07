import { NextResponse } from "next/server";
import { createRecord, TABLES, PACKAGE_FIELDS } from "../../../lib/airtable";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      spotRecordId,
      spotName,
      tierName,
      price,
      includes,
      sortOrder,
      includedAddons,
    } = body;

    if (!spotRecordId) {
      throw new Error("Missing spotRecordId — cannot link this package.");
    }

    const fields = {
      [PACKAGE_FIELDS.NAME]: `${spotName || "Spot"} — ${tierName}`,
      [PACKAGE_FIELDS.SPOT_LINK]: [spotRecordId],
      [PACKAGE_FIELDS.TIER_NAME]: tierName,
      [PACKAGE_FIELDS.PRICE]: price ? Number(price) : undefined,
      [PACKAGE_FIELDS.INCLUDES]: includes || "",
      [PACKAGE_FIELDS.SORT_ORDER]: sortOrder,
      [PACKAGE_FIELDS.IS_ACTIVE]: true,
    };

    if (includedAddons) fields[PACKAGE_FIELDS.INCLUDED_ADDONS] = includedAddons;

    const record = await createRecord(TABLES.PACKAGES, fields);

    return NextResponse.json({ id: record.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create package" },
      { status: 500 }
    );
  }
}
