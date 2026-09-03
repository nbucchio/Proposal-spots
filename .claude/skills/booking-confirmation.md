# Skill: /booking-confirmation

Triggered by: `/booking-confirmation`, or any natural request like
"send the booking confirmation for [customer] at [spot]", "confirm the
booking for …", "send [customer] their booking / confirmation email".

Sends a customer the **Booking Confirmed** email for a confirmed proposal
booking, using the live listing data in Airtable. Always renders a draft
for Nico to approve **before** anything is sent.

> This skill is the how-to. The email markup itself is the single source of
> truth in `intake/lib/email.js` (`renderBookingConfirmedEmailHtml`) — do
> **not** rewrite the HTML or restyle it; render that template with real
> data. If the design needs to change, change it there, not here.

---

## When to use / not use
- **Use** after a date has been confirmed with both the partner and the
  customer, and the booking exists in the Airtable Bookings table.
- **Do not** invent bookings, dates, prices, or a payment link. Everything
  comes from Airtable (or is confirmed by Nico). If a required piece is
  missing, ask — don't guess.

---

## Step 1 — Find the booking and its spot (Airtable)
Base: **Proposal Spots** — `appN5GFcdPJvU1qff` (production).
Always confirm current field IDs with `list_tables_for_base` /
`get_table_schema` before relying on the IDs below (schema can change).

1. **Bookings** table `tblqGbBHi9WmimksG` — find the booking (by customer
   name or the record Nico gives you). Read:
   - Customer First Name, Customer Last Name, Customer Email
   - Proposal Night (the confirmed date), Package Selected / Package Display
   - Add-ons Selected, Special Requests
   - **Partner Name** (`fldjM0kKcvWKDvgKP`) — this is the **couple's other
     person** (the one being proposed to → the P.S. line), NOT our partner
   - **Payment Model (from Spot)** (`fldpgNCQIvXPaZblH`)
   - **Wise Payment Link** (`fldnfzHpUXMArAgUE`)
   - Linked Spot
2. **Proposal Spots** table `tblgpEUkpph612Hw5` — read the linked spot:
   - Spot Name (`fldSGLl49tpvzWjV9`), Slug (`fldqXQIMBG9ijxBuv`),
     Status (`fldmmeWsO7XCEyx3R` — must be **Published** to link it)
   - Country (`flda6iB8ozHudRRRR`) → the partner's market
   - Partner Name (`fldOGH6J57WyIzvzz`) → **our on-the-ground partner**
   - Price Currency (`fldmyQf68HQd13yJM`), Pricing Model (`fldKI4FVKUMEfSu18`)
   - Packages (`fldGAnneDDWPk9RoP`)
   - Partner Payment Model (`fld7mjdDAHiTkvJE8`) —
     `New – Deposit at Booking` or `Legacy – Invoice After Event`
   - Total Customer Deposit % (`fldbVQqEDtLBb1Bfa`)
   - Refund Window (Days) (`fldA9hGXui08sz2I9`)
   - Balance/payment-after note (`fldVBFCc8TygWsvqQ`) — free-text sentence
     e.g. "The remaining balance is payable in cash immediately after the
     proposal experience."
3. **Packages** table `tbljzMmHhof06TDuD` — for the selected tier read
   Tier Name, Price, and Includes (comma-separated → the bullet list).

---

## Step 2 — Build the booking object
Assemble exactly the shape `renderBookingConfirmedEmailHtml` expects (see
`SAMPLE_BOOKING` in `intake/lib/email.js`). Mapping:

| field | source |
|---|---|
| `customerFirstName` | Bookings → Customer First Name |
| `customerEmail` | Bookings → Customer Email |
| `spotName` | Spot → Spot Name |
| `spotUrl` | `https://www.proposalspots.com/spots/{Slug}` — **only if Status = Published**, else "" |
| `confirmedDate` | Bookings → Proposal Night, formatted like "15 March 2027" |
| `packageName` | selected Tier Name |
| `packagePrice` | selected tier Price (number) |
| `priceCurrency` | Spot → Price Currency (e.g. "USD", "IDR") |
| `includedItems` | selected tier Includes (split on commas → array) |
| `addonItems` | `[{name, price}]` for booked add-ons; `[]` if none |
| `specialRequest` | Bookings → Special Requests ("" if none) |
| `partnerName` | Spot → Partner Name, **first name only** (e.g. "Champika") |
| `partnerMarket` | Spot → Country (e.g. "Sri Lanka") |
| `partnerFirstNameOfCouple` | Bookings → Partner Name (couple's other person) |
| `paymentModel` | Bookings → Payment Model (from Spot) |
| `totalDepositPercent` | Spot → Total Customer Deposit % (as a whole number, e.g. 50) |
| `refundDeadlineDays` | Spot → Refund Window (Days) |
| `balanceNote` | Spot → balance/payment-after note |
| `paymentLink` | Bookings → Wise Payment Link |

The template **auto-calculates** the deposit (percent × total) and the
balance — never hand-compute those into the copy.

**New vs Legacy behaviour (handled by the template):**
- `New – Deposit at Booking` → shows the deposit breakdown, "Securing Your
  Date" section, refund policy, balance note, and the Pay Deposit button.
- `Legacy – Invoice After Event` → no deposit section / no pay button; just
  a short payment note if the spot has one.

---

## Step 3 — Guardrails before sending
- **New-model booking with an empty `Wise Payment Link` → STOP.** Do not
  send; the Pay Deposit button would be broken. Ask Nico to create the Wise
  request and paste the link into the Bookings "Wise Payment Link" field
  (or give it to you), then continue.
- Confirm the recipient email is the customer's, not a test address.

---

## Step 4 — Render the draft and get approval
Render the real email with `renderBookingConfirmedEmailHtml(booking)` (run
it via node against `intake/lib/email.js` so it matches the template
exactly), show Nico the result, and **wait for explicit "send it."**
Never send a customer email without that approval — it is outward-facing.

---

## Step 5 — Send
Sending customer email is not yet wired to an automated hello@ endpoint, so
for now:
- **Preferred (branded sender):** if a `hello@proposalspots.com` Resend send
  path is available (a preview/prod endpoint that accepts the real booking),
  use it so the email comes from Proposal Spots.
- **Interim:** send via Gmail. Note it will come **from Nico's Gmail**, and
  Gmail hides remote images until "Display images" is tapped — fine for a
  pinch, not ideal for a real customer.
- Subject: `Your proposal is confirmed at {spotName} 💍`.
- After sending, tell Nico it's done and (optionally) set a "confirmation
  sent" marker on the booking.

---

## Future automation (refine this skill, don't rewrite the flow)
The intended end state: setting a Booking's Status/checkbox in Airtable
fires an automation → a send endpoint reads the booking by ID, injects the
Wise link, and Resend sends from hello@. When that endpoint exists, Steps
4–5 become "hit the preview URL to check, then trigger the send" — the
Airtable mappings above stay identical. Update this file as it evolves.
