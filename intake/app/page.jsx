"use client";

import { useState } from "react";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
  "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "French Polynesia", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama",
  "Papua New Guinea", "Paraguay", "Patagonia (Chile/Argentina)", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "USA", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
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

const CURRENCIES = [
  "USD", "EUR", "GBP", "CAD", "AUD", "NZD", "CHF", "JPY", "CNY", "INR",
  "MXN", "BRL", "ARS", "CLP", "IDR", "THB", "VND", "PHP", "MYR", "SGD",
  "HKD", "KRW", "AED", "SAR", "ZAR", "EGP", "MAD", "TRY", "ISK", "FJD",
  "XPF",
];

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

const EMPTY_TIERS = TIER_NAMES.map((name) => ({
  tierName: name,
  price: "",
  includes: "",
}));

const TIERED_EXAMPLE_URL =
  "https://www.proposalspots.com/spots/private-island-proposal-faro-algarve";

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

  const [tiers, setTiers] = useState(EMPTY_TIERS);
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

  const updateTier = (index, patch) => {
    setTiers((t) => {
      const next = [...t];
      next[index] = { ...next[index], ...patch };
      return next;
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

  const filledTiers = tiers.filter((t) => t.price);

  async function submitTiers() {
    setError("");
    if (filledTiers.length < 2) {
      setError(
        "Add a price for at least two tiers before finishing (three is recommended)."
      );
      return;
    }
    setTierSubmitting(true);
    try {
      for (let i = 0; i < filledTiers.length; i++) {
        const tier = filledTiers[i];
        const res = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spotRecordId,
            spotName: savedSpotName,
            tierName: tier.tierName,
            price: tier.price,
            includes: tier.includes,
            sortOrder: i + 1,
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || `Could not save ${tier.tierName}.`);
      }
      setStep("done");
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
    setTiers(EMPTY_TIERS);
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
                  ? "One flat price for the whole experience."
                  : "Offer couples 2–3 packages at different price points — for example, a simple setup vs. a full luxury experience."}
              </p>
            </div>

            {spot.pricingModel === "Single Price" && (
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-white/40 p-5">
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
            )}

            <div className="space-y-2 rounded-lg border border-line bg-white/40 p-5">
              <Label
                hint={
                  spot.pricingModel === "Tiered"
                    ? "apply on top of any tier the couple picks, optional, up to 4"
                    : "optional, up to 4"
                }
              >
                Add-ons
              </Label>
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
          <div className="space-y-2 text-center">
            <p className="text-sm text-ink/60">
              Adding pricing tiers for{" "}
              <span className="font-medium text-ink">{savedSpotName}</span>
            </p>
            <p className="text-xs text-ink/50">
              We recommend filling out all three tiers below, but it's okay
              to leave one blank if you only want to offer two.
            </p>
            <a
              href={TIERED_EXAMPLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-wine underline underline-offset-2 hover:opacity-80"
            >
              See an example listing with tiered pricing →
            </a>
          </div>

          {tiers.map((tier, i) => (
            <div
              key={tier.tierName}
              className="space-y-4 rounded-lg border border-line bg-white/40 p-5"
            >
              <p className="text-sm font-medium tracking-wide text-ink">
                {tier.tierName}
              </p>

              <div>
                <Label>Price</Label>
                <input
                  type="number"
                  className={inputClass}
                  value={tier.price}
                  onChange={(e) =>
                    updateTier(i, { price: e.target.value })
                  }
                  placeholder="e.g. 650"
                />
              </div>

              <div>
                <Label hint="comma separated">Includes</Label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={tier.includes}
                  onChange={(e) =>
                    updateTier(i, { includes: e.target.value })
                  }
                  placeholder="e.g. Setup, photographer, champagne toast"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={submitTiers}
            disabled={tierSubmitting || filledTiers.length < 2}
            className="w-full rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {tierSubmitting
              ? "Saving tiers…"
              : `Finish — save ${filledTiers.length} tier${
                  filledTiers.length === 1 ? "" : "s"
                }`}
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
