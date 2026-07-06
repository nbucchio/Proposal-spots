"use client";

import { useState } from "react";

const COUNTRIES = [
  "Nicaragua",
  "Costa Rica",
  "Mexico",
  "Italy",
  "France",
  "Greece",
  "Indonesia",
  "Portugal",
  "Maldives",
  "Switzerland",
  "USA",
  "Patagonia (Chile/Argentina)",
];

const VIBES = [
  "Beach",
  "Mountain",
  "Cliff",
  "Lake",
  "Volcano",
  "Ocean",
  "City",
  "Jungle",
  "Rural",
  "Boat",
  "Desert",
  "Waterfall",
];

const VIBE_SECONDARY_OPTIONS = [
  "Beach",
  "Mountain",
  "Cliff",
  "Lake",
  "Volcano",
  "Ocean",
  "City",
  "Jungle",
  "Luxury",
  "Hiking",
  "Rural",
  "Boat",
  "Desert",
  "Cenote",
  "Villa",
];

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "IDR", "CHF", "BRL", "MXN", "Rp"];

const TIER_NAMES = ["The Moment", "The Experience", "The Unforgettable"];

const EMPTY_SPOT = {
  spotName: "",
  country: "",
  regionTown: "",
  fullSummary: "",
  vibe: "",
  vibeSecondary: [],
  availabilityType: "All Year",
  availableMonths: [],
  rainCheck: "",
  pricingModel: "Single Price",
  priceCurrency: "USD",
  priceMoment: "",
  addons: [
    { name: "", price: "" },
    { name: "", price: "" },
    { name: "", price: "" },
    { name: "", price: "" },
  ],
};

const EMPTY_TIER = { tierName: "The Moment", price: "", includes: "" };

function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
        (selected
          ? "border-wine bg-wine text-parchment"
          : "border-line bg-white/60 text-ink hover:border-wine/50")
      }
    >
      {label}
    </button>
  );
}

function Label({ children, hint }) {
  return (
    <label className="mb-2 block text-sm font-medium tracking-wide text-ink">
      {children}
      {hint && (
        <span className="ml-2 font-normal text-ink/50">({hint})</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-white/70 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-wine/60";

function Waypoints({ step, showPackages }) {
  const steps = showPackages
    ? ["Spot details", "Pricing tiers", "Done"]
    : ["Spot details", "Done"];
  const activeIndex = { spot: 0, packages: 1, done: steps.length - 1 }[step];

  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={
                "h-2.5 w-2.5 rounded-full border " +
                (i <= activeIndex
                  ? "border-wine bg-wine"
                  : "border-line bg-transparent")
              }
            />
            <span
              className={
                "text-[11px] tracking-wide " +
                (i <= activeIndex ? "text-wine" : "text-ink/40")
              }
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={
                "mb-4 h-px w-10 " + (i < activeIndex ? "bg-wine" : "bg-line")
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const [step, setStep] = useState("spot");
  const [spot, setSpot] = useState(EMPTY_SPOT);
  const [spotRecordId, setSpotRecordId] = useState(null);
  const [savedSpotName, setSavedSpotName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [tierDraft, setTierDraft] = useState(EMPTY_TIER);
  const [tiersAdded, setTiersAdded] = useState([]);
  const [tierSubmitting, setTierSubmitting] = useState(false);

  const updateSpot = (patch) => setSpot((s) => ({ ...s, ...patch }));

  const toggleArrayValue = (key, value) => {
    setSpot((s) => {
      const arr = s[key];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { ...s, [key]: next };
    });
  };

  const updateAddon = (index, patch) => {
    setSpot((s) => {
      const addons = [...s.addons];
      addons[index] = { ...addons[index], ...patch };
      return { ...s, addons };
    });
  };

  async function submitSpot(e) {
    e.preventDefault();
    setError("");

    if (!spot.spotName.trim() || !spot.country || !spot.vibe) {
      setError("Spot name, country, and vibe are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spot),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setSpotRecordId(data.id);
      setSavedSpotName(spot.spotName);

      if (spot.pricingModel === "Tiered") {
        setStep("packages");
      } else {
        setStep("done");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function addTier() {
    setError("");
    if (!tierDraft.price) {
      setError("Add a price for this tier before saving it.");
      return;
    }
    setTierSubmitting(true);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotRecordId,
          spotName: savedSpotName,
          tierName: tierDraft.tierName,
          price: tierDraft.price,
          includes: tierDraft.includes,
          sortOrder: tiersAdded.length + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save that tier.");

      setTiersAdded((t) => [...t, tierDraft]);
      setTierDraft(EMPTY_TIER);
    } catch (err) {
      setError(err.message);
    } finally {
      setTierSubmitting(false);
    }
  }

  function startAnotherSpot() {
    setSpot(EMPTY_SPOT);
    setSpotRecordId(null);
    setSavedSpotName("");
    setTiersAdded([]);
    setTierDraft(EMPTY_TIER);
    setError("");
    setStep("spot");
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <header className="mb-12 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-sage">
          Partner Listing
        </p>
        <h1 className="font-display text-4xl italic text-ink">
          Proposal Spots
        </h1>
      </header>

      <Waypoints step={step} showPackages={spot.pricingModel === "Tiered"} />

      {error && (
        <div className="mb-6 rounded-md border border-wine/30 bg-wine/5 px-4 py-3 text-sm text-wineDark">
          {error}
        </div>
      )}

      {step === "spot" && (
        <form onSubmit={submitSpot} className="space-y-8">
          <section className="space-y-5">
            <div>
              <Label>Spot name</Label>
              <input
                className={inputClass}
                value={spot.spotName}
                onChange={(e) => updateSpot({ spotName: e.target.value })}
                placeholder="e.g. Private Jungle Cenote"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <select
                  className={inputClass}
                  value={spot.country}
                  onChange={(e) => updateSpot({ country: e.target.value })}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Region / town</Label>
                <input
                  className={inputClass}
                  value={spot.regionTown}
                  onChange={(e) =>
                    updateSpot({ regionTown: e.target.value })
                  }
                  placeholder="e.g. Tulum"
                />
              </div>
            </div>

            <div>
              <Label>Full summary</Label>
              <textarea
                className={inputClass}
                rows={4}
                value={spot.fullSummary}
                onChange={(e) =>
                  updateSpot({ fullSummary: e.target.value })
                }
                placeholder="Describe the setting, what makes it special, and what a couple can expect."
              />
            </div>
          </section>

          <hr className="border-line" />

          <section className="space-y-5">
            <div>
              <Label>Vibe</Label>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    selected={spot.vibe === v}
                    onClick={() => updateSpot({ vibe: v })}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label hint="optional, pick any that also apply">
                Vibe secondary
              </Label>
              <div className="flex flex-wrap gap-2">
                {VIBE_SECONDARY_OPTIONS.map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    selected={spot.vibeSecondary.includes(v)}
                    onClick={() => toggleArrayValue("vibeSecondary", v)}
                  />
                ))}
              </div>
            </div>
          </section>

          <hr className="border-line" />

          <section className="space-y-5">
            <div>
              <Label>Availability</Label>
              <div className="flex gap-2">
                {["All Year", "Seasonal"].map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    selected={spot.availabilityType === a}
                    onClick={() => updateSpot({ availabilityType: a })}
                  />
                ))}
              </div>
            </div>

            {spot.availabilityType === "Seasonal" && (
              <div>
                <Label>Available months</Label>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      selected={spot.availableMonths.includes(m)}
                      onClick={() => toggleArrayValue("availableMonths", m)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label hint="what happens if weather doesn't cooperate">
                Rain check policy
              </Label>
              <textarea
                className={inputClass}
                rows={3}
                value={spot.rainCheck}
                onChange={(e) => updateSpot({ rainCheck: e.target.value })}
                placeholder="e.g. Free reschedule within 48 hours, indoor backup location available."
              />
            </div>
          </section>

          <hr className="border-line" />

          <section className="space-y-5">
            <div>
              <Label>Pricing model</Label>
              <div className="flex gap-2">
                {["Single Price", "Tiered"].map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    selected={spot.pricingModel === p}
                    onClick={() => updateSpot({ pricingModel: p })}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-ink/50">
                {spot.pricingModel === "Single Price"
                  ? "One flat price for this spot."
                  : "You'll add pricing tiers (Moment / Experience / Unforgettable) on the next step."}
              </p>
            </div>

            {spot.pricingModel === "Single Price" && (
              <div className="space-y-5 rounded-lg border border-line bg-white/40 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <select
                      className={inputClass}
                      value={spot.priceCurrency}
                      onChange={(e) =>
                        updateSpot({ priceCurrency: e.target.value })
                      }
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <input
                      type="number"
                      className={inputClass}
                      value={spot.priceMoment}
                      onChange={(e) =>
                        updateSpot({ priceMoment: e.target.value })
                      }
                      placeholder="e.g. 450"
                    />
                  </div>
                </div>

                <div>
                  <Label hint="optional, up to 4">Add-ons</Label>
                  <div className="space-y-2">
                    {spot.addons.map((addon, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        <input
                          className={inputClass + " col-span-2"}
                          placeholder={`Add-on ${i + 1} name`}
                          value={addon.name}
                          onChange={(e) =>
                            updateAddon(i, { name: e.target.value })
                          }
                        />
                        <input
                          type="number"
                          className={inputClass}
                          placeholder="Price"
                          value={addon.price}
                          onChange={(e) =>
                            updateAddon(i, { price: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting
              ? "Saving…"
              : spot.pricingModel === "Tiered"
              ? "Continue to pricing tiers"
              : "Save spot"}
          </button>
        </form>
      )}

      {step === "packages" && (
        <div className="space-y-8">
          <p className="text-center text-sm text-ink/60">
            Adding pricing tiers for{" "}
            <span className="font-medium text-ink">{savedSpotName}</span>
          </p>

          {tiersAdded.length > 0 && (
            <ul className="space-y-2">
              {tiersAdded.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-line bg-white/50 px-4 py-3 text-sm"
                >
                  <span className="font-medium">{t.tierName}</span>
                  <span className="text-ink/60">{t.price}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-5 rounded-lg border border-line bg-white/40 p-5">
            <div>
              <Label>Tier</Label>
              <div className="flex flex-wrap gap-2">
                {TIER_NAMES.filter(
                  (t) => !tiersAdded.some((a) => a.tierName === t)
                ).map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    selected={tierDraft.tierName === t}
                    onClick={() =>
                      setTierDraft((d) => ({ ...d, tierName: t }))
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Price</Label>
              <input
                type="number"
                className={inputClass}
                value={tierDraft.price}
                onChange={(e) =>
                  setTierDraft((d) => ({ ...d, price: e.target.value }))
                }
                placeholder="e.g. 650"
              />
            </div>

            <div>
              <Label hint="comma separated">Includes</Label>
              <textarea
                className={inputClass}
                rows={2}
                value={tierDraft.includes}
                onChange={(e) =>
                  setTierDraft((d) => ({ ...d, includes: e.target.value }))
                }
                placeholder="e.g. Setup, photographer, champagne toast"
              />
            </div>

            <button
              type="button"
              onClick={addTier}
              disabled={
                tierSubmitting || tiersAdded.length >= TIER_NAMES.length
              }
              className="w-full rounded-md border border-wine px-5 py-2.5 text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-parchment disabled:opacity-40"
            >
              {tierSubmitting ? "Saving tier…" : "+ Add this tier"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep("done")}
            disabled={tiersAdded.length === 0}
            className="w-full rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Finish — {tiersAdded.length} tier
            {tiersAdded.length === 1 ? "" : "s"} saved
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-8 text-center">
          <div className="rounded-lg border border-line bg-white/50 px-6 py-10">
            <p className="font-display text-2xl italic text-ink">
              {savedSpotName} has been saved
            </p>
            <p className="mt-3 text-sm text-ink/60">
              It's marked as a Draft. Our team will review it before it goes
              live on Proposal Spots.
            </p>
          </div>

          <button
            type="button"
            onClick={startAnotherSpot}
            className="w-full rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90"
          >
            + Add another spot
          </button>
        </div>
      )}
    </main>
  );
}
