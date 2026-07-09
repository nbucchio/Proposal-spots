"use client";

import { useEffect, useState } from "react";
import {
  TIER_SHADES,
  CURRENCY_SYMBOLS,
  formatPrice,
  tierPrefixFor,
  stripKnownPrefix,
  finalIncludesFor,
  tierPlusNote,
} from "../lib/reviewFormat";

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

// Exact Airtable single-select choice strings — trailing spaces on some
// Privacy choices are intentional and must be sent as-is.
const PRIVACY_OPTIONS = [
  "Private (No Crowds)",
  "Light Crowd ",
  "Moderate Crowd ",
  "Everyone will see",
];

const BEST_TIME_OPTIONS = ["Sunrise", "Sunset", "Mid-day", "Any"];

const PREFERRED_CONTACT_OPTIONS = ["Email", "WhatsApp"];

const TIER_NAMES = ["The Moment", "The Experience", "The Unforgettable"];

const PRICING_MODEL_INFO = [
  {
    value: "Single Price",
    description: "One flat price for the whole experience.",
  },
  {
    value: "Tiered",
    description:
      "Offer couples 2–3 packages at different price points — for example, a simple setup vs. a full luxury experience.",
  },
];

const TIERED_EXAMPLE_URL =
  "https://www.proposalspots.com/spots/private-island-proposal-faro-algarve";

const TIER_PRICE_EXAMPLES = [650, 1000, 1450];

function PriceInput({ value, onChange, placeholder, currency }) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink/45">
        {symbol}
      </span>
      <input
        type="number"
        className={inputClass}
        style={{ paddingLeft: `${2.25 + symbol.length * 0.55}rem` }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

const EMPTY_SPOT = {
  partnerName: "",
  preferredContact: "",
  partnerEmail: "",
  partnerWhatsapp: "",
  spotName: "",
  country: "",
  regionTown: "",
  fullSummary: "",
  vibe: "",
  vibeSecondary: [],
  otherVibe: "",
  privacy: "",
  bestTime: "",
  availabilityType: "All Year",
  availableMonths: [],
  rainCheck: "",
  pricingModel: "",
  priceCurrency: "USD",
  priceMoment: "",
  includedItems: "",
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
  sameAsMoment: false,
  sameAsExperience: false,
}));

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

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-line/60 pb-2 last:border-0 last:pb-0">
      <span className="text-ink/50">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-white/70 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-wine/60";

function Waypoints({ step, showPackages }) {
  const stepOrder = showPackages
    ? ["spot", "packages", "review", "done"]
    : ["spot", "review", "done"];
  const labels = showPackages
    ? ["Spot details", "Pricing tiers", "Review", "Done"]
    : ["Spot details", "Review", "Done"];
  const activeIndex = stepOrder.indexOf(step);

  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {labels.map((label, i) => (
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
          {i < labels.length - 1 && (
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [tiers, setTiers] = useState(EMPTY_TIERS);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

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

  const updateTierFlag = (index, key, value) => {
    setTiers((t) => {
      const next = [...t];
      const tier = { ...next[index], [key]: value };
      const prefix = tierPrefixFor(tier.sameAsMoment, tier.sameAsExperience);
      tier.includes = prefix + stripKnownPrefix(tier.includes);
      next[index] = tier;
      return next;
    });
  };

  function goPastSpotDetails(e) {
    e.preventDefault();
    setError("");

    if (!spot.spotName.trim() || !spot.country) {
      setError("Spot name and country are required.");
      return;
    }

    if (!spot.pricingModel) {
      setError("Choose a pricing model before continuing.");
      return;
    }

    setStep(spot.pricingModel === "Tiered" ? "packages" : "review");
  }

  const filledTiers = tiers.filter((t) => t.price);
  const filledAddons = spot.addons.filter((a) => a.name);

  function goPastTiers() {
    setError("");
    if (filledTiers.length < 2) {
      setError(
        "Add a price for at least two tiers before continuing (three is recommended)."
      );
      return;
    }

    const incomplete = tiers.find(
      (t) =>
        !t.price &&
        (finalIncludesFor(t) || t.sameAsMoment || t.sameAsExperience)
    );
    if (incomplete) {
      setError(
        `${incomplete.tierName} has notes but no price, so it won't be saved — add a price or clear its notes before continuing.`
      );
      return;
    }

    setStep("review");
  }

  async function doFinalSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spot),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const newSpotRecordId = data.id;

      if (spot.pricingModel === "Tiered") {
        const includedAddonsSummary = filledAddons
          .map((a) =>
            a.price
              ? `${a.name} (+${formatPrice(a.price, spot.priceCurrency)})`
              : a.name
          )
          .join(", ");

        for (let i = 0; i < filledTiers.length; i++) {
          const tier = filledTiers[i];
          const pRes = await fetch("/api/packages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spotRecordId: newSpotRecordId,
              spotName: spot.spotName,
              tierName: tier.tierName,
              price: tier.price,
              includes: finalIncludesFor(tier),
              sortOrder: i + 1,
              includedAddons: includedAddonsSummary,
            }),
          });
          const pData = await pRes.json();
          if (!pRes.ok)
            throw new Error(pData.error || `Could not save ${tier.tierName}.`);
        }
      }

      // Best-effort — the spot is already saved either way, so a failed
      // confirmation email should never block reaching the done step.
      fetch("/api/notify-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spot, tiers }),
      }).catch(() => {});

      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startAnotherSpot() {
    setSpot(EMPTY_SPOT);
    setTiers(EMPTY_TIERS);
    setError("");
    setStep("spot");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {step === "spot" && (
        <header className="mb-12 text-center">
          <img
            src="/logo/proposal-spots-logo-color.svg"
            alt="Proposal Spots"
            className="mx-auto h-32 w-auto"
          />
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-sage">
            For Partners: Add Your Proposal Spot
          </p>
          <p className="mt-2 text-xs text-ink/50">
            Please submit one form per spot — use "+ Add another spot" at
            the end if you have more than one.
          </p>
        </header>
      )}

      <Waypoints step={step} showPackages={spot.pricingModel === "Tiered"} />

      {error && (
        <div className="mb-6 rounded-md border border-wine/30 bg-wine/5 px-4 py-3 text-sm text-ink">
          {error}
        </div>
      )}

      {step === "spot" && (
        <form onSubmit={goPastSpotDetails} className="space-y-8">
          <section className="space-y-5">
            <h2 className="font-display text-xl italic text-ink">
              Partner Info
            </h2>

            <div>
              <Label>Partner Name</Label>
              <input
                className={inputClass}
                value={spot.partnerName}
                onChange={(e) => updateSpot({ partnerName: e.target.value })}
                placeholder="e.g. Maria Fernandez"
              />
            </div>

            <div>
              <Label>Preferred contact method</Label>
              <div className="flex gap-2">
                {PREFERRED_CONTACT_OPTIONS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    selected={spot.preferredContact === c}
                    onClick={() => updateSpot({ preferredContact: c })}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Your email</Label>
                <input
                  type="email"
                  className={inputClass}
                  value={spot.partnerEmail}
                  onChange={(e) =>
                    updateSpot({ partnerEmail: e.target.value })
                  }
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label>Your WhatsApp</Label>
                <input
                  type="tel"
                  className={inputClass}
                  value={spot.partnerWhatsapp}
                  onChange={(e) =>
                    updateSpot({ partnerWhatsapp: e.target.value })
                  }
                  placeholder="e.g. +1 555 123 4567"
                />
              </div>
            </div>
          </section>

          <hr className="border-line" />

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

            <div>
              <Label hint="if none of our Vibes fit, please create one">
                Other Vibe
              </Label>
              <input
                className={inputClass}
                value={spot.otherVibe}
                onChange={(e) => updateSpot({ otherVibe: e.target.value })}
                placeholder="e.g. Rooftop"
              />
            </div>
          </section>

          <hr className="border-line" />

          <section className="space-y-5">
            <div>
              <Label>Privacy</Label>
              <div className="flex flex-wrap gap-2">
                {PRIVACY_OPTIONS.map((p) => (
                  <Chip
                    key={p}
                    label={p.trim()}
                    selected={spot.privacy === p}
                    onClick={() => updateSpot({ privacy: p })}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Best time of day</Label>
              <div className="flex flex-wrap gap-2">
                {BEST_TIME_OPTIONS.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    selected={spot.bestTime === b}
                    onClick={() => updateSpot({ bestTime: b })}
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
              <Label>Pricing currency</Label>
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
              <Label hint="select one">Pricing model</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PRICING_MODEL_INFO.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSpot({ pricingModel: opt.value })}
                    className={
                      "rounded-lg border p-4 text-left transition-colors " +
                      (spot.pricingModel === opt.value
                        ? "border-wine bg-wine/5"
                        : "border-line bg-white/40 hover:border-wine/40")
                    }
                  >
                    <p className="text-sm font-medium text-ink">
                      {opt.value}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">
                      {opt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {spot.pricingModel === "Single Price" && (
              <div className="space-y-5 rounded-lg border border-line bg-white/40 p-5">
                <div>
                  <Label>Price</Label>
                  <PriceInput
                    currency={spot.priceCurrency}
                    value={spot.priceMoment}
                    onChange={(e) =>
                      updateSpot({ priceMoment: e.target.value })
                    }
                    placeholder="e.g. 450"
                  />
                </div>

                <div>
                  <Label hint="comma separated">What's included</Label>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={spot.includedItems}
                    onChange={(e) =>
                      updateSpot({ includedItems: e.target.value })
                    }
                    placeholder="e.g. Setup, photographer, champagne toast"
                  />
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
                        <PriceInput
                          currency={spot.priceCurrency}
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
            className="w-full rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90"
          >
            {spot.pricingModel === "Tiered"
              ? "Continue to pricing tiers"
              : spot.pricingModel === "Single Price"
              ? "Continue to review"
              : "Continue"}
          </button>
        </form>
      )}

      {step === "packages" && (
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-sm text-ink/60">
              Adding pricing tiers for{" "}
              <span className="font-medium text-ink">{spot.spotName}</span>
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

          <div className="space-y-2 rounded-lg border border-line bg-white/40 p-5">
            <Label hint="apply to every tier below, optional, up to 3">
              Add-ons
            </Label>
            <p className="text-xs text-ink/50">
              Fill these in first — whatever you add here will show as
              available extras in each tier below.
            </p>
            <div className="space-y-2">
              {spot.addons.slice(0, 3).map((addon, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input
                    className={inputClass + " col-span-2"}
                    placeholder={`Add-on ${i + 1} name`}
                    value={addon.name}
                    onChange={(e) =>
                      updateAddon(i, { name: e.target.value })
                    }
                  />
                  <PriceInput
                    currency={spot.priceCurrency}
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

          {tiers.map((tier, i) => (
            <div
              key={tier.tierName}
              className="space-y-4 rounded-lg border border-line p-5"
              style={{ backgroundColor: TIER_SHADES[i] }}
            >
              <p className="text-sm font-medium tracking-wide text-ink">
                {tier.tierName}
              </p>

              <div>
                <Label>Price</Label>
                <PriceInput
                  currency={spot.priceCurrency}
                  value={tier.price}
                  onChange={(e) =>
                    updateTier(i, { price: e.target.value })
                  }
                  placeholder={`e.g. ${TIER_PRICE_EXAMPLES[i]}`}
                />
              </div>

              {i === 1 && (
                <label className="flex items-center gap-2 text-xs text-ink/60">
                  <input
                    type="checkbox"
                    checked={tier.sameAsMoment}
                    onChange={(e) =>
                      updateTierFlag(i, "sameAsMoment", e.target.checked)
                    }
                  />
                  Include everything from The Moment
                </label>
              )}

              {i === 2 && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-ink/60">
                    <input
                      type="checkbox"
                      checked={tier.sameAsMoment}
                      onChange={(e) =>
                        updateTierFlag(i, "sameAsMoment", e.target.checked)
                      }
                    />
                    Include everything from The Moment
                  </label>
                  <label className="flex items-center gap-2 text-xs text-ink/60">
                    <input
                      type="checkbox"
                      checked={tier.sameAsExperience}
                      onChange={(e) =>
                        updateTierFlag(
                          i,
                          "sameAsExperience",
                          e.target.checked
                        )
                      }
                    />
                    Include everything from The Experience
                  </label>
                </div>
              )}

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

              {filledAddons.length > 0 && (
                <p className="text-xs text-ink/50">
                  Available add-ons:{" "}
                  {filledAddons
                    .map((a) =>
                      a.price
                        ? `${a.name} (+${formatPrice(a.price, spot.priceCurrency)})`
                        : a.name
                    )
                    .join(", ")}
                </p>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("spot")}
              className="w-1/3 rounded-md border border-line px-5 py-3 text-sm text-ink/70 transition-colors hover:border-wine/50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={goPastTiers}
              className="w-2/3 rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90"
            >
              Continue to review — {filledTiers.length} tier
              {filledTiers.length === 1 ? "" : "s"} added
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-8">
          <h2 className="text-center font-display text-2xl italic text-ink">
            Review before submitting
          </h2>

          <div className="space-y-3 rounded-lg border border-line bg-white/40 p-5 text-sm">
            <ReviewRow label="Partner Name" value={spot.partnerName} />
            <ReviewRow
              label="Preferred contact"
              value={spot.preferredContact}
            />
            <ReviewRow label="Spot name" value={spot.spotName} />
            <ReviewRow label="Your email" value={spot.partnerEmail} />
            <ReviewRow label="Your WhatsApp" value={spot.partnerWhatsapp} />
            <ReviewRow label="Country" value={spot.country} />
            <ReviewRow label="Region / town" value={spot.regionTown} />
            <ReviewRow label="Summary" value={spot.fullSummary} />
            <ReviewRow
              label="Vibe"
              value={[spot.vibe, ...spot.vibeSecondary]
                .filter(Boolean)
                .join(", ")}
            />
            <ReviewRow label="Other Vibe" value={spot.otherVibe} />
            <ReviewRow label="Privacy" value={spot.privacy.trim()} />
            <ReviewRow label="Best time" value={spot.bestTime} />
            <ReviewRow
              label="Availability"
              value={
                spot.availabilityType === "Seasonal"
                  ? `Seasonal (${spot.availableMonths.join(", ")})`
                  : "All Year"
              }
            />
            <ReviewRow label="Currency" value={spot.priceCurrency} />
            <ReviewRow label="Pricing model" value={spot.pricingModel} />
            {spot.pricingModel === "Single Price" && (
              <ReviewRow
                label="Price"
                value={
                  spot.priceMoment
                    ? formatPrice(spot.priceMoment, spot.priceCurrency)
                    : ""
                }
              />
            )}
            {spot.pricingModel === "Single Price" && (
              <ReviewRow label="What's included" value={spot.includedItems} />
            )}
            <ReviewRow
              label="Add-ons"
              value={filledAddons
                .map((a) =>
                  a.price
                    ? `${a.name} (${formatPrice(a.price, spot.priceCurrency)})`
                    : a.name
                )
                .join(", ")}
            />
          </div>

          {spot.pricingModel === "Tiered" && (
            <div className="space-y-3">
              {tiers.map((t, i) => {
                if (!t.price) return null;
                const includes = finalIncludesFor(t);
                const plusNote = tierPlusNote(t, i);
                return (
                  <div
                    key={t.tierName}
                    className="rounded-lg border border-line p-4 text-sm"
                    style={{ backgroundColor: TIER_SHADES[i] }}
                  >
                    <p className="font-medium text-ink">
                      {t.tierName} — {formatPrice(t.price, spot.priceCurrency)}
                    </p>
                    {plusNote && (
                      <p className="mt-1 text-xs text-ink/60">✓ {plusNote}</p>
                    )}
                    {includes && (
                      <p className="mt-1 text-ink/70">{includes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                setStep(spot.pricingModel === "Tiered" ? "packages" : "spot")
              }
              className="w-1/3 rounded-md border border-line px-5 py-3 text-sm text-ink/70 transition-colors hover:border-wine/50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={doFinalSubmit}
              disabled={submitting}
              className="w-2/3 rounded-md bg-wine px-5 py-3 text-sm font-medium tracking-wide text-parchment transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Confirm & submit"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-8 text-center">
          <div className="rounded-lg border border-line bg-white/50 px-6 py-10">
            <p className="font-display text-2xl italic text-ink">
              {spot.spotName} has been saved
            </p>
            <p className="mt-3 text-sm text-ink/60">
              It's marked as a Draft. Our team will review it before it goes
              live on Proposal Spots.
            </p>
            <p className="mt-5 border-t border-line pt-5 text-sm text-ink/60">
              If you haven't already sent us photos of this spot, please
              email them to{" "}
              <a
                href="mailto:hello@proposalspots.com"
                className="text-wine underline underline-offset-2"
              >
                hello@proposalspots.com
              </a>
              . We recommend at least 5 photos, up to 10 total.
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
