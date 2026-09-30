# PenForge

## Product and implementation specification

**Status:** Proposed build specification, not a description of a finished application.  
**Product:** An immersive pen configurator embedded in a Shopify storefront.  
**Core promise:** One pen, continuously present, that becomes yours through cinematic, manufacturable choices.

PenForge turns a finite catalog of approved pens into an unusually personal buying experience. Customers explore silhouette, surface, color, details, and identity on one persistent hero pen. The system resolves their choices to a real factory offering and a supported order route.

The feeling of freedom comes from presentation, thoughtful curation, and tactile feedback. Product claims, available choices, proportions, decoration areas, and checkout must remain accurate. A component that cannot change independently must never appear independently configurable.

This document defines proposed defaults. Factory capabilities, merchant policies, artwork tolerances, and Shopify store capabilities require verification before launch. All sample SKUs, prices, limits, and quantities below are illustrative.

## 1. The product decisions that matter

| Decision                     | Required behavior                                                                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One persistent product       | A single main pen stays in the same scene through configuration, quantity changes, and review. Options live in controls; no orbiting product gallery.                 |
| Immediate usefulness         | Open directly on a valid, priced pen with available controls. An entrance animation never gates interaction behind Start.                                             |
| Five chapters                | Form, Surface, Details, Identity, Review. Only expose meaningful choices for the current offering.                                                                    |
| Two purchasing intents       | Default to Personal. Offer Team / bulk beside quantity; do not force a business flow merely because someone uploads a logo.                                           |
| Honest component editing     | A fixed grip remains inspectable. It is not a selectable grip option. Changing it through another body is explicitly a body change.                                   |
| Deliberate conflict handling | Preserve compatible selections. Show and confirm consequential changes before applying them. Never silently replace selected color, ink, artwork, or personalization. |
| Separate readiness states    | Manufacturing compatibility, price certainty, artwork approval, availability, and checkout eligibility are separate facts.                                            |
| One trustworthy price        | Display a server-derived breakdown and reconcile it with Shopify. A browser price is never an instruction to charge that amount.                                      |
| Operational completion       | A purchased item must become a traceable production ticket, with the correct artwork revision and payment/proof gates.                                                |
| Accessible by construction   | Every purchase task works through ordinary HTML controls and a verified 2D representation, without manipulating the canvas.                                           |

### Success definition

A first-time personal buyer should be able to select and buy a pen in about two minutes without waiting through mandatory cinematics. A team buyer with prepared artwork should be able to submit a complete quote request in about five minutes. These are usability hypotheses to test, not promised production metrics.

Launch success requires zero accepted impossible configurations, zero unnoticed substitutions, and zero production releases against unapproved artwork. Conversion, contribution margin, quote completion, and production correction rate should improve together.

### Non-goals for the first release

- Arbitrary CAD editing, dimensions, part mixing between factories, or freeform colors.
- Photorealistic simulation of handwriting, ink flow, or every manufacturing process.
- A public marketplace of factories.
- Automatic production approval from a 3D preview.
- Live factory procurement, automated supplier switching, or globally guaranteed delivery dates.
- Spreadsheet imports for individually named pens, split shipments, and multiple artworks per order.

## 2. Buying experience

### First screen

The hero pen is already visible as a poster while 3D loads. Show the merchant brand, selected pen name, actual price or explicitly labeled estimate, Personal / Team intent, and Form options. Use an approved default offering available at quantity one for the personal entry route.

The first screen must answer: What is this pen? What can I change? What does it cost? Can I buy one?

A desktop pen occupies roughly 65-80% of the unobstructed stage width. On phones it runs diagonally or vertically to preserve readable proportions. Surrounding UI stays restrained: a neutral studio stage, dark graphite text, real material swatches, and one merchant accent for selected controls. Avoid darkness that makes black products unreadable.

No explanatory hero page, compulsory tutorial, login wall, or mandatory full assembly sequence. Returning configurations restore directly into their last chapter after revalidation.

### Chapter structure

| Chapter  | Controls                                                       | Camera focus                      | Exit condition                                   |
| -------- | -------------------------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| Form     | 3-5 approved body families; dimensions, weight, mechanism      | Entire silhouette                 | A body family is selected                        |
| Surface  | Supported finish and physical color swatches                   | Barrel, then a three-quarter view | A compatible surface is committed                |
| Details  | Only editable grip, trim, clip, refill, and packaging options  | Active detail                     | Defaults are acceptable; no forced changes       |
| Identity | None, text, logo; eligible process and decoration zone         | Print or engraving area           | Identity is valid, omitted, or marked for review |
| Review   | Quantity, specification, price breakdown, timing, proof status | Whole pen, artwork facing forward | Checkout or quote eligibility is established     |

Show all chapters in a compact navigation rail. Users can jump freely; validation concerns appear beside the affected field. Do not create empty steps for fixed components or make users press Next through one-option choices.

A small product facts view provides length, barrel diameter, weight, mechanism, refill specification, included packaging, and verified material information. These facts follow the resolved physical product. Claims such as recycled content require supplier evidence.

### Selection semantics

- **Inspect:** Rotate, focus, or zoom without changing the order.
- **Preview:** Desktop hover temporarily changes appearance after a 150 ms dwell. Price and summary remain committed, with a clear Preview label.
- **Commit:** Click, tap, or keyboard activation requests resolution. Show immediate control feedback, then the accepted visual state.
- **Undo:** Undo the last committed edit, including its dependent changes. Keep a session history of at least 20 edits.
- **Compare:** Temporarily show the previous committed state on the same hero pen using a press-and-hold control or keyboard toggle. Label both states; no second hero model.
- **Reset view:** Restore chapter framing without changing configuration.
- **Reset design:** Confirm before discarding personalization or uploaded artwork.

Pointer exit or Escape cancels a hover preview. Touch selection commits directly; never require a hover-equivalent gesture. User orbit suspends the camera director until the next explicit chapter or focus action.

### Constraint communication

Show currently usable options first. Keep an intentionally discovered but incompatible option visible with a concise reason and an actionable change proposal. Avoid filling the screen with disabled catalog options.

Example: choosing a satin body that only supports chrome trim opens an inline proposal:

> Satin requires chrome trim. Change finish and trim?

The current pen and price remain committed until acceptance. Cancel restores the prior controls. An accepted proposal is one undoable transaction. If branding would be removed or its zone changed, that consequence must be stated before acceptance.

## 3. Cinematic direction

### Continuity rules

The pen's center, general orientation, and apparent scale should remain recognizable during ordinary choices. Change one perceptual axis at a time: geometry, material, or camera. Do not simultaneously fly the camera, replace the body, and flash the lights.

Body transitions use authored crossfades or masked replacements around a shared anchor. Avoid visibly impossible intermediate geometry. Morph targets are optional only where the artist has authored compatible topology. Two meshes may overlap briefly inside a transition, but the viewer perceives one pen.

Use small axial separations only for physically meaningful parts, and only when the action explains a real choice. A fixed grip must not detach to imply interchangeability. An optional construction reveal can exist under Inspect; it is not the opening requirement.

### Camera shot contract

Each model has artist-authored focus anchors and component bounds. The director fits those bounds into the available stage rectangle after accounting for UI, rather than copying fixed world positions between pens.

Use a perspective camera with a restrained product-photography lens, initially 45-60 mm on a 36 mm sensor equivalent. Author changes deliberately; avoid wide-angle distortion. Store distance, target, orientation, roll, and framing margin per shot and responsive layout.

| Shot        | Composition and movement                                         | Default duration      | Reduced motion        |
| ----------- | ---------------------------------------------------------------- | --------------------- | --------------------- |
| Entry       | Full pen at a slight diagonal; a small settling rotation         | 650 ms, interruptible | Static fitted pose    |
| Form        | Full silhouette; preserve screen center during replacement       | 300-450 ms            | Immediate replacement |
| Surface     | Three-quarter barrel; small roll exposes the reflection          | 450 ms                | Static material view  |
| Grip / tip  | Focus front third with enough barrel for context                 | 450-600 ms            | Direct reframe        |
| Clip / trim | Rotate clip toward viewer without rolling UI                     | 450-600 ms            | Direct reframe        |
| Identity    | Artwork zone faces viewer, near orthographic appearance          | 400-550 ms            | Direct reframe        |
| Review      | Full pen with artwork visible; optional user-triggered turntable | 550 ms                | Static whole pen      |

Design timing is a budget, not a delay enforced before selection. If a customer chooses another step mid-flight, retarget from the current transform and cancel the old timeline. Never queue camera animations. Controls remain usable during movement.

Render while moving; settle when idle. Do not run an endless idle spin. After the entrance, the scene stops unless the user requests rotation or makes a change.

### Framing and interaction boundaries

Keep the active subject inside a safe rectangle with at least 24 px of clearance from control overlays. For detail shots, non-active parts may leave the frame; the active zone may not. The review shot always contains the entire pen.

Orbit has model-defined polar limits; zoom cannot enter the mesh or make the product unreadably small. Hit targets for small components use expanded invisible pick volumes, while visible selection remains on the real component. No camera motion is triggered by merely passing a pointer across the stage.

### Lighting and material direction

Use one neutral studio environment with a broad soft key above/front, a narrow strip reflection along the barrel, a low fill, and restrained contact shadow. A starting key-to-fill intensity ratio of roughly 3:1 is an art-direction reference, not a physical requirement.

- Metal: long controlled reflections reveal curvature and brushing direction.
- Matte coating: broad highlights and physically plausible roughness; do not fake matte by darkening color.
- Gloss: retain a readable highlight without clipping the selected color.
- Transparent parts: only use transmission where the real pen is transparent; offer a cheaper mobile material.
- Identity: roll the object and soften distracting reflection so artwork stays legible.
- Review: return to the same neutral inspection light used for approval.

Keep exposure, tone mapping, and color management consistent across colors. Brief reflection movement may explain a finish, but it must settle into comparable inspection lighting. Do not sell a hue using theatrical colored light.

Match renders against physical samples or approved factory references. Record model-specific material settings, scale, and reference photographs. Screen previews cannot certify Pantone matching, engraving contrast, or print color; show this limitation beside the relevant artwork/color decision.

### Sound direction

Sound is off by default and starts only after explicit opt-in. Persist the preference locally. Use a mute icon with a tooltip and accessible state. Audio adds texture but carries no required information.

| Event                        | Sound                            | Limits                                             |
| ---------------------------- | -------------------------------- | -------------------------------------------------- |
| Accepted option              | Soft mechanical click            | 40-90 ms; once per committed selection             |
| Real component assembly      | Muted seating sound              | 100-180 ms; no exaggerated impact                  |
| Chapter change               | Very soft air movement, optional | 150-250 ms; skip during rapid navigation           |
| Text engraving demonstration | Short dry texture                | At most once after editing ends; not per character |
| Cart or quote confirmed      | Restrained confirmation          | Only after server success                          |

No hover sounds, background music, autoplay, or repeated error alarms. Normalize assets together, leave headroom, cap simultaneous voices at two, and throttle selection audio to one cue per 150 ms. Suspend audio in background tabs. Browser audio failure is non-blocking. Reduced motion and sound are independent settings; do not assume a universal browser reduced-sound API.

## 4. Responsive behavior and accessibility

### Desktop

At stage widths of 1024 px and above, use an unframed stage with a 320-380 px controls column and compact chapter navigation. Keep price and primary action in the controls column. Constrain the overall content width on ultrawide monitors while allowing the stage to extend.

Drag rotates; wheel zoom operates only when the viewer has explicit focus so page scrolling remains predictable. Component clicks are shortcuts to equivalent HTML controls. Keyboard users never have to manipulate the canvas.

### Mobile and narrow layouts

Below 768 px, use a top stage and bottom controls area. Between 768 and 1023 px, choose the layout based on usable stage width, not device detection.

- Use dynamic viewport units and safe-area insets.
- Default stage height is approximately 42-50% of the usable viewport.
- Expanding controls shrinks and refits the stage instead of covering the pen.
- On short landscape screens, switch to side-by-side or normal document scrolling.
- A focused text field brings its editor into view above the software keyboard.
- Single-finger stage drag rotates only when started inside the stage; scrolling elsewhere remains normal.
- Provide accessible zoom controls; pinch is optional.
- In compact branding mode, offer size and position fields alongside direct handles.
- Keep the primary action visible without overlapping operating-system controls.

Verify at 320, 390, 768, 1024, and 1440 CSS px widths, in portrait and landscape, with long translated labels and 200% zoom. Page sections must expand rather than clipping content.

### Accessible commerce

Target WCAG 2.2 AA as a release requirement, verified with automated and manual checks. The canvas is supplemental to a semantic HTML configurator.

Use radio groups for single-choice options, labeled swatches with color names, visible focus, 44 px minimum touch targets, and readable contrast. Announce committed configuration changes and errors through a polite live region; do not announce animation frames or every hover.

Dialogs and expanded editors have predictable focus restoration. Reduced-motion mode disables camera travel, spins, explosive motion, and material sweeps. Provide a persistent motion preference in addition to honoring the OS setting.

A 2D mode offers the same selections, price, identity form, summary, and ordering paths. Where exact decorated imagery cannot be generated, show an accurate base-product view plus a dimensioned flat artwork layout, explicitly identified as separate views. Never display an approximate decorated pen as the approved result.

## 5. Personal purchase

1. Land on a valid quantity-one pen with price.
2. Change Form or accept the default; explore Surface and Details.
3. Add optional engraving, with physical size and glyph limits enforced.
4. Review exact text, product specification, quantity, price, and dispatch estimate.
5. Add to the existing Shopify cart and continue ordinary checkout.

Skip Identity freely. Do not require an account to experiment or add to cart. A gift recipient's name remains private and is not placed in share URLs or analytics.

Quantity one requires a verified fulfillment route: stock blank plus local personalization, or a supplier that genuinely supports one-off orders. A bulk-only factory SKU must not be offered as an immediately purchasable single pen.

Paid text personalization must map to a supported Shopify-priced offer. If that route is unavailable, offer the plain pen or a clear quote path; never collect an engraving fee only in metadata.

## 6. Team and bulk purchase

Team intent reveals quantity, artwork, decoration method, pricing tiers, and deadline fields early. A quantity change may suggest Team mode but must preserve the design and may be declined. Mode labels personalize the interface; actual quantity and manufacturing rules determine eligibility.

1. Select quantity and optionally destination country/postcode and required-by date.
2. Choose a body and surface compatible with that quantity.
3. Add artwork and select an approved zone and process.
4. Review item cost, setup fees, proof requirements, and timing.
5. Submit a complete quote request, or use supported instant checkout.

Show quantity tiers as a compact table with the current tier highlighted. MOQ and pack increments are separate rules. At 101 units with a pack size of 25, propose 125; do not round silently. Do not increase quantity automatically to hit a cheaper unit price.

One configuration represents one physical specification and one artwork treatment at one quantity. Multiple colors or designs become separate configurations and order lines. Setup charges are shared only when an explicit production rule permits it.

### Quote, proof, and payment policy

For the first release, custom logo work uses a quote-led route:

1. Customer submits a configuration and source artwork.
2. Operations checks manufacturability, files, stock, price, and timing.
3. Operations supplies a versioned quote and a production proof.
4. Customer accepts the quote and approves the exact proof revision.
5. A Shopify draft-order invoice collects payment.
6. Production is released only when the financial and proof gates pass.

The commercial policy may later allow payment before proof approval, but the production gate remains mandatory. Quote expiry, stock reservation policy, revision allowance, deposit terms, and rush rules must be merchant-configured before enabling that alternative.

Sending a quote request does not create a paid order or guarantee a delivery date. Confirmation shows a request ID, submitted design, next action, and a response target only if the team has committed to it.

Offer sample ordering only when an actual sample SKU and fulfillment policy exist. A future preproduction sample is a separate quote line and approval step.

## 7. Identity and artwork production

### Physical coordinate system

Store decoration in millimeters, relative to an authored factory zone, never in viewport pixels. Each zone declares:

- Process eligibility and usable polygon.
- Local origin, axial direction, circumferential direction, and outward normal.
- Seam, clip, curvature, and keep-out boundaries.
- Width/height limits, minimum line weight, minimum text height, and placement tolerance.
- Maximum imprint colors and supported physical color references.

Persist position, physical width/height, rotation, process, and source asset revision. UV/decal projection is only the display representation of these coordinates.

A body change revalidates the zone. A similar-looking barrel does not justify carrying over production coordinates without an approved mapping and customer confirmation.

### Text

Offer only licensed, production-approved fonts and supported glyphs. Enforce both character policy and measured physical bounds. Preserve entered text exactly; do not silently truncate, transliterate, or remove unsupported characters.

The editor shows text content, font, physical size, alignment, and eligible zone. A server-side typesetting step generates reproducible production outlines. Pin font versions so saved proofs do not change after a font update.

### Logo upload

Proposed launch formats: SVG, single-page PDF, PNG, and JPEG; maximum 20 MB and a documented decoded-image limit. Enforce size, type, page count, and complexity on the server. Reject or route ambiguous PDFs to review.

Store the original privately. Validate file signatures, scan uploads, strip executable SVG content and external references, and generate previews in an isolated worker. Never insert arbitrary uploaded SVG into storefront HTML.

Track processing as uploaded -> processing -> ready or rejected. A successful upload is not production approval. Avoid blocking the rest of configuration while processing.

Evaluate raster quality at actual print size:

```text
effective_dpi = pixel_width / (print_width_mm / 25.4)
```

A provisional 300 DPI threshold is a warning baseline; each process needs factory-specific limits. Validate line thickness, transparent areas, color count, and contrast. Do not auto-remove a background, simplify a mark, or convert it to one color without explicit acceptance.

HEX values and extracted logo colors are visual references. Pantone references are a production request; availability, matching fees, MOQ, and sample approval must be confirmed. Never imply that an arbitrary HEX entry is an available barrel color.

### Proof contract

A production proof contains the configuration revision, exact artwork checksum, process, physical dimensions, position, imprint colors, product finish, quantity, and tolerance note. Present a dimensioned flat layout and a product mockup.

Approval records the approver, timestamp, proof version, and checksum. Changes to artwork, zone, process, physical product, or any proof-governed field invalidate approval. Quantity changes always require commercial revalidation and may require a revised proof according to process rules.

Keep these statuses distinct:

| Status              | Meaning                                                        |
| ------------------- | -------------------------------------------------------------- |
| Preview             | Customer-facing visualization only                             |
| Preflight passed    | Automated checks passed; human review may still be required    |
| Proof pending       | Production proof has not been approved                         |
| Proof approved      | The identified revision is approved                            |
| Quote required      | Price or production terms require confirmation                 |
| Production eligible | All manufacturing, commercial, artwork, and payment gates pass |

## 8. Catalog and compatibility model

### Model real offerings first

Use an approved offering as the atomic manufacturable record: a specific base pen SKU, supported decoration recipe, packaging route, quantity rules, and fulfillment source. Factory components are not assumed interchangeable.

The compatibility graph is a way to discover these offerings. It can initially be implemented using relational tables and indexed candidate filtering; a graph database is not required.

| Entity                 | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| Body family            | Customer-facing silhouette and product facts                                   |
| Factory SKU            | Exact physical blank or finished pen specification                             |
| Offering               | Approved combination of SKU, decoration route, packaging, and commercial rules |
| Attribute              | Finish, color, grip, trim, mechanism, refill; fixed or selectable              |
| Decoration recipe      | Zone, method, tolerances, artwork limits, setup requirements                   |
| Asset manifest         | Approved geometry/material/anchor versions for the physical product            |
| Price book             | Currency, market, tiers, setup fees, effective dates                           |
| Availability record    | Stock/capacity, source, timestamp, expiry                                      |
| Shopify mapping        | Sellable variant or reviewed draft-order route                                 |
| Configuration revision | Customer choices and authoritative resolved result                             |

Pairwise compatibility is insufficient: finish A may work with trim B and body C independently without the three-way combination existing. Every accepted complete selection must resolve to at least one approved offering.

### Resolution algorithm

1. Load a published catalog version and normalize the request.
2. Filter offerings by market, channel, publication, quantity, and applicable production rules.
3. Match all committed product attributes and artwork/process constraints.
4. For each editable facet, compute candidate options while holding the other committed facets fixed.
5. If the requested edit produces no candidates, return conflict reasons and minimal-change proposals.
6. Rank valid candidates deterministically using approved merchant policy: fidelity, availability freshness, then fulfillment priority.
7. Return a selected offering, available facets, pricing status, timing, requirements, and asset manifest.
8. At submission, revalidate against current catalog and commerce data and freeze the accepted revision.

The frontend does not reconstruct compatibility rules from option names. Shared client rules may make feedback faster, but the server is authoritative.

If several suppliers make apparently equivalent pens, substitution still needs an approved equivalence definition covering geometry, finish, refill, decoration, packaging, and customer claims. Once an order snapshot is accepted, do not silently reroute it to a materially different product.

### Illustrative fixture

| Offering | Body / surface            | Trim             | Identity                         | Quantity rule     |
| -------- | ------------------------- | ---------------- | -------------------------------- | ----------------- |
| A1       | Slim metal / matte black  | Chrome           | None or verified local engraving | 1+                |
| A2       | Slim metal / matte black  | Gold             | None or verified local engraving | 1+                |
| B1       | Slim metal / satin silver | Chrome           | One-color pad print              | 100+, packs of 25 |
| C1       | Recycled resin / white    | Fixed white clip | One-color pad print              | 250+, packs of 50 |

From A2, selecting satin silver requires a chrome-trim change and moves to a bulk-only offering. The interface must propose both consequences. At quantity one, it should explain why that selection cannot be purchased and retain A2 until a supported alternative is chosen.

## 9. Pricing, availability, and timing

Use decimal-safe monetary arithmetic and explicit currencies. Internal integer minor units require a currency exponent; never assume every currency has two decimals.

```text
merchandise_subtotal =
  quantity * (base_unit + decoration_unit + packaging_unit)
  + setup_fees + approved_one_time_fees
  - applicable_discounts
```

Display unit merchandise cost, quantity, setup fees, other charges, discounts, and subtotal separately. Effective per-pen cost may be shown as an additional figure, with setup allocation labeled. Taxes and shipping are identified as included, estimated, or calculated at checkout.

Pricing states are exact, estimated, quote_required, or unavailable. Only exact, unexpired, commerce-reconciled prices qualify for direct checkout. Quantity tiers apply per eligible configuration unless the price book explicitly supports aggregation.

Keep proof duration, production time, and transit time separate. The manufacturing clock begins after required approval and payment. Estimated arrival needs a destination, business calendars, production cutoff, proof assumptions, and carrier transit data. Otherwise show estimated dispatch after approval, not a delivery promise.

Each resolution records availability age and expiry. Stale stock/capacity may force reconfirmation or quoting. A saved design is not a stock reservation. Shopify and factory inventory need an explicit source-of-truth policy per offering.

## 10. Shopify integration

### Launch architecture

Embed a storefront app through a theme app extension. Load the experience only where mounted and integrate with the theme's existing cart. Use a backend service for configuration, private artwork, pricing, quotes, and order processing. Keep Admin API credentials on the server.

Use the storefront Ajax Cart API for theme carts. It accepts variant IDs, quantities, and properties; it does not make a custom amount in a property into a price. Use locale-aware cart URLs. See the [official Cart API reference](https://shopify.dev/docs/api/ajax/reference/cart).

For a future headless storefront, use the Storefront Cart API and its checkout URL; implement that as a separate adapter rather than mixing cart identities.

### Price representation

Select one supported commercial route for every offering:

| Route                       | Use                                                                             |
| --------------------------- | ------------------------------------------------------------------------------- |
| Pre-priced Shopify variant  | Stock pen or approved personalization offer with a representable price          |
| Verified discount mechanism | Supported quantity reduction; eligibility and cart-edit behavior must be tested |
| Reviewed draft order        | Custom logo work, setup charges, nonstandard pricing, or sales-approved terms   |

Do not create a variant for each engraving string. Do not assume line properties enforce charges, and do not rely on removable fee products without enforcement. If the target store cannot securely represent the full price, use the draft-order route.

Draft orders support reviewed order construction and invoicing. Their pricing, inventory, shipping, and tax behavior must be tested for the chosen line types. See [draftOrderCreate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderCreate).

### Checkout eligibility and trust

An app-side validation before adding to cart can be bypassed by later cart edits. The implementation must establish checkout-level enforcement for custom items on the target store, or route them through a reviewed draft order.

Investigate the [Cart and Checkout Validation Function API](https://shopify.dev/docs/api/functions/latest/cart-and-checkout-validation) for the store's plan, distribution model, and supported validation data. Do not assume access to remote resolver calls or unsupported capabilities. A paid-order review hold is a final safeguard, not a replacement for accurate checkout.

Before launch, test quantity edits, accelerated checkout, direct cart requests, deleted properties, expired configurations, discounts, currency changes, and mixed carts. Personalized direct checkout remains disabled until the supported path passes these cases.

### Cart transaction

1. Create a server-owned immutable configuration revision with accepted pricing.
2. Revalidate current availability, artwork eligibility, and Shopify mapping.
3. Produce a cart intent with the exact variant, quantity, configuration reference, and expiry.
4. Add through the chosen storefront adapter.
5. Read the resulting cart and reconcile variant, quantity, reference, and price.
6. Show success only after confirmed cart state; return unresolved discrepancies for correction.

Use a mutation ID to prevent repeated button presses from creating duplicate intents. Shopify Ajax calls are not made idempotent by an app request header: after a timeout, read and reconcile the cart before retrying. Distinct personalizations of the same variant must remain distinct lines.

Customer-visible properties contain concise product and personalization details. Private properties may carry an opaque configuration reference, but are not secrets or trustworthy input. Keep supplier IDs, costs, source artwork URLs, and internal approval controls in the backend. A signature alone does not enforce anything unless a trusted component verifies it.

### Order-to-production handoff

Receive Shopify order/payment/cancellation updates; verify delivery signatures against the raw request body, durably enqueue, and process idempotently. Shopify documents HTTPS signature verification in [Verify webhook deliveries](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries).

Maintain a unique production job per merchant, order line, and accepted configuration revision. Reconcile missed updates periodically. Handle duplicate and out-of-order events by checking current order state before irreversible production release.

Release requires the exact purchased specification, sufficient payment under merchant policy, approved artwork when required, confirmed supply, and no cancellation/hold. Missing or altered configuration references create an operations hold.

The production ticket includes factory SKU, configuration revision, quantity, process, dimensions, source and approved artwork references, proof checksum, packaging, ship-to reference, and production timing. Preview images are supporting evidence, never the production master.

## 11. State and API contracts

### Separate four kinds of state

| State              | Owner                    | Examples                                                            |
| ------------------ | ------------------------ | ------------------------------------------------------------------- |
| Presentation       | Browser                  | Active chapter, camera pose, hover preview, expanded sheet, sound   |
| Editable draft     | Browser plus saved draft | Selected IDs, text, asset revision, quantity, intent                |
| Resolution         | Server                   | Candidate offering, price, reasons, availability, checkout route    |
| Submitted revision | Server, immutable        | Accepted choices, catalog/assets/pricing versions, proof references |

Presentation state must not affect price or manufacturing. A hover preview never overwrites the draft. A submitted revision is immutable; editing it forks a new draft.

### Illustrative resolution

```json
{
  "schemaVersion": 1,
  "requestId": "req_104",
  "draftRevision": 12,
  "catalogVersion": "catalog_7",
  "configurationRevisionId": null,
  "selection": {
    "bodyFamilyId": "slim_metal",
    "surfaceId": "matte_black",
    "trimId": "chrome",
    "refillId": "black_ballpoint",
    "identity": { "type": "none" },
    "quantity": 1,
    "marketId": "market_us"
  },
  "resolution": {
    "offeringId": "offer_A1_plain",
    "manufacturing": "compatible",
    "artwork": "not_required",
    "availability": "confirmed",
    "pricing": {
      "status": "exact",
      "currency": "USD",
      "minorUnitExponent": 2,
      "unitMinor": 2400,
      "setupMinor": 0,
      "merchandiseSubtotalMinor": 2400,
      "tax": "checkout",
      "shipping": "checkout",
      "priceBookVersion": "prices_3"
    },
    "commerce": { "route": "variant_cart", "eligible": true },
    "assetManifestVersion": "assets_A1_4",
    "expiresAt": "2026-10-01T12:00:00Z",
    "reasons": [],
    "proposedChanges": [],
    "availableFacets": []
  }
}
```

This simplified response omits server-only supplier routing and Shopify mapping details. Real responses populate facet options and use machine-readable reason codes such as MOQ_NOT_MET, ARTWORK_PENDING, PRICE_EXPIRED, and NO_APPROVED_OFFERING.

### Async behavior

Increment draftRevision for every committed edit. Each request carries that revision and a request ID. Apply a response only if it matches the latest draft; abort obsolete requests where possible and ignore late ones.

On timeout retain the last confirmed render and clearly mark the current draft as unresolved. Disable submission, not editing. Do not show an old price as current while a new quantity or product selection resolves.

Cart eligibility requires matching draft/resolution revisions, current pricing, accepted dependencies, and a valid route. Animation completion is never a prerequisite.

### Endpoints

| Endpoint                     | Contract                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| GET /api/bootstrap           | Published catalog summary, default resolved offering, asset manifest, feature flags |
| POST /api/resolve            | Draft + revision + market -> resolution or explicit conflict proposals              |
| POST /api/assets             | Validated upload initiation; returns private upload target and asset ID             |
| GET /api/assets/:id          | Authorized processing and preflight status                                          |
| POST /api/configurations     | Revalidate and create immutable revision; reject stale accepted terms               |
| POST /api/cart-intents       | Create/retrieve intent using mutation ID; no browser price authority                |
| POST /api/quotes             | Idempotent request tied to a configuration revision                                 |
| POST /api/proofs/:id/approve | Authenticated approval of exact checksum/version                                    |
| GET /api/designs/:token      | Authorized or deliberately public saved design; never source artwork by default     |

Use 409 for stale revisions or changed commercial terms, 422 for field-level invalidity, and retryable server errors for temporary failures. Responses include field paths, reason codes, and human-readable messages. Retries with the same mutation ID return the same application result.

Save non-sensitive draft preferences locally. Server save/share links use revocable opaque tokens and explicit sharing intent. Shared public views exclude personal text and artwork unless the owner deliberately includes them. Reopening old designs revalidates availability and shows changes before purchase.

## 12. Implementation architecture and assets

Use TypeScript and Three.js, with React Three Fiber when the host UI uses React. Use the existing application framework where possible; keep the renderer separate from the commerce adapter. Choose one animation owner for camera/object timelines to prevent competing writes.

Suggested module boundaries:

```text
storefront/
  configurator/      HTML controls and chapter flow
  scene/             hero pen, materials, camera director, picking
  state/             draft history, previews, revision reconciliation
  commerce/          Shopify theme-cart adapter
server/
  catalog/           published offering records and manifests
  resolver/          candidate filtering and conflict proposals
  pricing/           price books and eligibility
  artwork/           processing jobs and versioned proofs
  orders/            quotes, cart intents, Shopify events, production gates
shared/
  contracts/         request schemas, IDs, reason codes
assets/
  manifests/         versioned product/component/zone mappings
```

### 3D production contract

Use glTF/GLB with documented real-world scale. Suggested convention: meters, pen axis along +Y from tip to rear, clip facing +Z, origin at the product center. Every asset must declare its convention and pass import validation.

The manifest contains component nodes, material slots, focus anchors, assembly pivots, bounds, decoration zone transforms, LODs, poster images, and content hashes. Missing nodes fail catalog publication, rather than producing broken storefront controls.

Author clean UVs, accurate normals, consistent tangents, and real proportions. Engraving is a material/normal treatment matched to the process; a deep geometric cut is inappropriate unless physically correct. Test decals across rotation for seams, clipping, and z-fighting.

Assets load from versioned CDN paths. Preload the active pen first and likely alternatives only after interaction is usable. Dispose unused GPU resources. Catalog publication must not point to assets that have not finished uploading and validation.

### Work to prove first

Before building elaborate transitions, ship one complete vertical slice: approved physical pen -> resolved selection -> accurate render -> Shopify cart -> test paid order -> production ticket.

That slice validates the most expensive assumptions: accurate product data, single-unit fulfillment, personalization pricing, and reliable order identity.

## 13. Performance and fallback budgets

These are proposed release budgets, measured on an agreed midrange Android phone and iPhone Safari over a throttled 10 Mbps / 100 ms RTT connection, plus a current desktop browser. Record exact devices and test versions.

| Measure                      | Initial target                                               |
| ---------------------------- | ------------------------------------------------------------ |
| Visible default poster / LCP | <= 2.5 seconds at p75                                        |
| Usable default controls      | <= 3 seconds in the test profile                             |
| Interactive 3D               | <= 4 seconds in the test profile                             |
| Local selection feedback     | <= 100 ms                                                    |
| Warm resolver latency        | <= 300 ms p95, measured separately from network              |
| Frame time                   | <= 33 ms mobile; <= 17 ms desktop during ordinary motion     |
| Initial experience transfer  | <= 3 MB compressed, including default model/textures/runtime |
| Visible geometry             | Target <= 80k triangles on mobile                            |
| Draw calls                   | Target <= 60 for the default mobile scene                    |
| Texture/GPU budget           | Target <= 96 MB estimated allocation                         |

Asset budgets are starting constraints to validate against real appearance. Use Meshopt or Draco as appropriate, KTX2 textures with tested fallbacks, practical mipmaps, and mobile texture sizes initially capped at 2048 px. Cap mobile device pixel ratio initially at 1.5; tune with measurements.

Adapt quality based on observed frame time: reduce pixel ratio, contact shadows, transmission, and secondary effects before sacrificing accurate materials or artwork. Render on demand when settled; pause hidden tabs.

Keep the poster until the first complete 3D frame. Handle load failures, context loss, and decoder failure. After a bounded retry, offer 2D mode with the same draft intact. Ordering must not depend on canvas screenshot generation.

## 14. Operations, privacy, and catalog ownership

### Catalog publication

A product owner curates customer-facing families. Factory operations owns manufacturing records and tolerances. A 3D artist owns representation accuracy. Commerce owns sellable mappings and prices. Production operations owns proof approval and release.

Publish catalog versions atomically after checks for orphan options, zero-candidate defaults, missing assets, missing prices/routes, invalid zones, and quantity gaps. Test each offering through at least one valid path. Keep rollback versions available.

Catalog changes do not mutate submitted order revisions. Archived offerings remain readable for historical orders. Customer reorders fork and revalidate.

### Operations console

Required launch screens: quote inbox, artwork processing failures, proof revisions, orders on hold, production-ready jobs, and catalog mapping errors. Each item shows owner, status, next action, and audit history.

Quote and proof links require scoped access. Artwork originals live in private storage with short-lived authorized retrieval. Tenant boundaries apply to files, configurations, and orders. Rate-limit uploads and costly rendering jobs.

Set explicit draft/artwork retention and deletion policies before launch; separate abandoned uploads from production records that must be retained. Do not log raw personal text, source artwork, addresses, or signed download links. Merchant support access is audited.

## 15. Analytics and experiments

Measure commerce outcomes and experience quality separately. Event names and stable IDs should survive UI redesigns.

| Event                         | When                         | Useful fields                              |
| ----------------------------- | ---------------------------- | ------------------------------------------ |
| configurator_opened           | Usable controls shown        | Entry source, intent, device class         |
| scene_ready / scene_failed    | First valid frame or failure | Asset version, load duration, error class  |
| chapter_viewed                | Explicit chapter navigation  | Chapter, prior chapter                     |
| option_committed              | Accepted selection           | Facet ID, option ID, draft revision        |
| conflict_presented / accepted | Proposal shown / accepted    | Reason code, affected facet IDs            |
| resolution_completed          | Current response applied     | Latency, candidate count, readiness states |
| artwork_processed             | Processing finishes          | Format, result, reason code; no content    |
| quote_submitted               | Server confirms              | Request ID, quantity band, offering ID     |
| cart_confirmed                | Cart reconciles              | Configuration revision, route              |
| order_paid                    | Trusted commerce event       | Order reference, revenue/currency          |
| production_rework             | Operations correction        | Reason category, offering version          |

Deduplicate events using event IDs and distinguish client observations from server confirmations. Honor applicable merchant consent settings. Never send artwork, engraving strings, contact information, or share tokens to behavioral analytics.

Dashboards: personal start-to-cart and paid conversion; team start-to-quote, quote-to-paid, and time-to-proof; gross/contribution margin; mobile rendering failure; conflict abandonment; price mismatch; production correction rate.

Start experiments with chapter count, default preset, or transition duration. Set a primary outcome and guardrails for revenue, performance, and rework before launch. Do not optimize for time spent rotating the pen.

## 16. Required failure behavior

| Situation                   | Customer experience                                | System behavior                                             |
| --------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| Unsupported option change   | Explain required changes and offer cancel          | Keep committed state until acceptance                       |
| Resolver unavailable        | Editing remains possible; price marked unconfirmed | Block purchase, retain draft, retry                         |
| Stock or price changes      | Present new terms and ask acceptance               | Invalidate old cart intent                                  |
| Artwork processing fails    | Show reason and replace-file action                | Preserve other selections                                   |
| Logo exceeds zone           | Highlight bounds, offer resize or another zone     | Never silently crop production artwork                      |
| Required date infeasible    | Show a later estimate or quote review              | Never promise rush automatically                            |
| 3D fails                    | Accurate 2D product and flat proof views           | Same resolver and purchase rules                            |
| Cart timeout                | Show checking status                               | Read cart before retrying                                   |
| Cart price differs          | Show discrepancy and correction path               | No false add-to-cart success                                |
| Proof edited after approval | New approval required                              | Hold production                                             |
| Order cancellation arrives  | Updated status                                     | Reconcile before release; escalate if already in production |
| Saved model retired         | Explain alternatives                               | Preserve old design for reference; no automatic replacement |

## 17. Delivery plan and acceptance gates

### Gate 0: Feasibility and source data

Obtain one approved physical pen, factory specification, accurate artwork zone, price/MOQ rules, quantity-one fulfillment confirmation, and test-store access. Verify the proposed Shopify pricing/enforcement path before promising personalized checkout.

Deliverables: source-of-truth offering fixture, commercial route decision, measured asset reference, and unresolved-decision register.

### Gate 1: Complete purchase slice

Build one pen with two real colors, accessible controls, server resolution, a 2D fallback, cart reconciliation, and order-to-production identity. Add elementary camera framing.

Pass: a test purchase produces exactly the expected product, amount, and production ticket; cart tampering cannot silently create a wrongly priced custom order.

### Gate 2: Experience and constrained catalog

Add up to three approved body families, calibrated materials, chapter choreography, undo, conflict proposals, responsive controls, and performance instrumentation.

Pass: every selectable combination resolves to an approved offering; rapid edits never display stale resolution; all breakpoint and reduced-motion checks pass.

### Gate 3: Identity and bulk

Add text production rules, secure logo upload, quantity tiers, quotes, proof revision approval, and draft-order invoicing.

Pass: an approved logo revision follows through quote, payment, and production; changing it reliably invalidates approval. A single-unit buyer completes the shorter route without bulk administration.

### Gate 4: Launch readiness

Validate physical samples against approved renders/proofs, finalize support and retention policies, test failure recovery and webhook reconciliation, and instrument outcomes. Roll out to a limited audience with an immediate switch to 2D and quote-only routes if necessary.

### Acceptance scenarios

1. Switching from gold trim to a chrome-only surface proposes the trim change and supports one-step undo.
2. A fixed-grip body never exposes independent grip customization.
3. Ten rapid selections with out-of-order responses end on the last accepted selection and matching price.
4. Quantity below MOQ or between pack increments cannot submit without an explicit supported change.
5. Two different engravings of the same Shopify variant remain separate cart lines.
6. Cart edits, omitted metadata, discounts, currency changes, and direct requests cannot bypass the supported commercial route.
7. A duplicated quote request or webhook does not create duplicate production work.
8. An approved logo edited by one millimeter requires the appropriate new proof approval.
9. A cold mobile load fits the agreed budget; settled scenes stop continuous rendering.
10. Keyboard and screen-reader users can complete personal and bulk paths; no canvas action is required.
11. Lost WebGL context preserves the draft and offers a usable 2D path.
12. A retired offering or expired price is explained on reopen before acceptance.
13. A production release cannot occur with missing payment, required proof, supply confirmation, or order identity.
14. Rendered and physically measured artwork dimensions agree within the factory-approved tolerance.

## 18. Decisions still requiring real inputs

| Input                                                              | Owner                        | Why it blocks launch                                |
| ------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------- |
| Actual approved SKUs and physical samples                          | Factory operations           | Determines real geometry and independent choices    |
| Single-unit personalization fulfillment                            | Operations                   | Determines whether the personal promise is viable   |
| Merchant store plan, theme, markets, and app distribution          | Commerce engineering         | Determines pricing and checkout enforcement options |
| Print zones, fonts, tolerances, and color policies                 | Factory / artwork operations | Determines production accuracy                      |
| Fees, margins, tiers, availability freshness, and quote expiry     | Merchant                     | Determines authoritative commercial terms           |
| Proof ownership, response targets, payment and cancellation policy | Merchant operations          | Determines a workable bulk service                  |
| Launch language, currency, shipping regions, and tax display       | Merchant                     | Determines localized totals and timing              |
| Brand identity and visual assets                                   | Design                       | Determines the final visual system                  |
| Privacy, retention, and support policy                             | Merchant                     | Determines handling of personal text and artwork    |

The defining experience is continuous authorship: the customer sees one pen become their own. The implementation earns that feeling by making every accepted choice accurate, recoverable, and deliverable.

## 19. This repository: the Gate 1 vertical slice

This repository implements a deployable slice of the specification as a Next.js app. It runs standalone on Vercel with a browser-local mock cart, and can later be mounted in a Shopify theme.

### Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm test` for the resolver, pricing, and order tests, and `npm run build` for a production build.

### Deploy on Vercel

1. Push the repository to GitHub and import it in Vercel. The framework preset is detected as Next.js; no build settings need changing.
2. Set `PENFORGE_SIGNING_SECRET` to a long random value in the project's environment variables. It signs configuration revisions and share links. Without it, a public development fallback is used.
3. Leave `NEXT_PUBLIC_COMMERCE_ADAPTER` unset (or `mock`) for a standalone deployment. Set it to `shopify` only when the app is served inside a Shopify theme, where the storefront Ajax Cart API is reachable.

Or from the command line: `npx vercel` for a preview and `npx vercel --prod` for production.

### Catalog: Parker collections

The catalog in `src/server/catalog` models Parker's current lineup as grouped on parkerpen.com: Duofold Classic (Heritage); Sonnet, Parker 51 and Ingenuity (Classic); Urban (Stylish); IM, Jotter, Jotter XL and Vector XL (Essential). It expands to 219 approved offerings across finishes, trims (chrome, palladium, gold, rose gold, black PVD, IM Vibrant Rings), and writing modes (fountain, rollerball, ballpoint, gel, mechanical pencil).

The finish, trim, and mode matrix was assembled from Parker's public collection pages and authorised retailers. parkerpen.com blocks automated access, so it could not be scraped directly. **Prices, SKUs, variant IDs, dimensions, and availability are illustrative** and must be replaced with the merchant's price book and verified product data before launch (see §18). Parker is a trademark of its owner; this project is not affiliated with or endorsed by Parker.

### What is implemented

| Area | Implementation |
| --- | --- |
| Resolver | Offering-level matching, per-facet candidate options with reasons, minimal-change conflict proposals, dependent-facet confirmation (`src/server/resolver`) |
| Pricing | Integer minor units, quantity tiers, engraving and pad-print fees, setup, packaging, exact / quote_required states (`src/server/pricing`) |
| Orders | HMAC-signed immutable configuration revisions, idempotent cart intents and quotes, stale-price and catalog-version rejection (`src/server/orders`) |
| API | `GET /api/bootstrap`, `POST /api/resolve`, `POST /api/configurations`, `POST /api/cart-intents`, `POST /api/quotes`, `POST /api/designs`, `GET /api/designs/:token`, `GET /api/poster` |
| Experience | One persistent procedural 3D pen (React Three Fiber) with a chapter camera director, hover preview, compare, 20-step undo, reduced motion, opt-in sound, and a verified 2D mode with a dimensioned flat layout |
| Identity | Engraving with glyph, length, and physical-width checks; logo footprint with MOQ and pack-increment rules routed to quotes |
| Commerce | Mock theme cart and a Shopify Ajax Cart adapter, both reconciled after add; distinct personalisations stay distinct lines |

### Not yet implemented

- Persistence: revisions, quotes, and share links are signed tokens, not database records. There is no operations console.
- Real artwork upload, scanning, and preflight. Logo files are described by name, type, and size only.
- Shopify theme app extension, draft-order invoicing, checkout validation functions, and webhooks.
- glTF assets. The pen is generated from manifest parameters; a glTF loader can replace `PenModel` without changing the director or UI.
