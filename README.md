# Immersive Shopify Pen Configurator

## PenForge

## Product Vision

This project is a Shopify-integrated pen configurator that makes buying a pen feel like building a premium object in a game inventory screen.

The central illusion is high customization. The real business model is constrained manufacturing.

Customers interact with one persistent hero pen in an immersive 3D scene. They rotate, inspect, personalize, and order that pen through cinematic steps. Behind the experience, every choice maps to a controlled set of pre-approved factory SKUs, finishes, components, print methods, and order rules.

The configurator should feel like:

- A premium object-customization experience, similar to configuring a lightsaber, watch, car trim, or game item.
- A guided cinematic flow where the camera moves around the pen as each part is customized.
- A simple buying experience that supports both one-off consumer purchases and bulk branded orders.
- A manufacturable product graph disguised as creative freedom.

The user should never feel like they are browsing a spreadsheet of factory options. They should feel like they are designing a pen.

## Core Concept

The experience is built around one persistent 3D pen that remains on screen throughout the entire flow.

Do not show a traditional product grid as the main experience. Do not move the user through separate pages for body, grip, clip, color, logo, and quantity. Instead, the camera moves around the same pen and reveals each editable zone in sequence.

The pen is both:

- The product preview.
- The main navigation surface.

At any moment, the interface should answer:

- What part of the pen am I editing?
- What changed on the actual object?
- Is this option manufacturable?
- What will I receive if I buy this?

The backend constrains the available options. The frontend presents those constraints as elegant, intentional choices.

## Target Users

### Individual Consumer

The individual buyer wants one premium, expressive pen.

Primary motivations:

- Personal taste.
- Gift giving.
- Aesthetic novelty.
- Name engraving or small personalization.
- Fast purchase with minimal decision fatigue.

The consumer flow should feel emotional, polished, and quick.

### Bulk Buyer

The bulk buyer wants pens for a company, event, school, conference, hotel, or client gift.

Primary motivations:

- Logo placement.
- Brand color accuracy.
- Quantity pricing.
- Production feasibility.
- Proof approval.
- Delivery timeline.

The bulk flow should preserve the cinematic pen experience, but gradually reveal operational controls once the customer signals business intent.

## Experience Principles

1. Keep the hero pen persistent.
   The pen should not disappear between steps. It may explode, rotate, focus, assemble, or transform, but it remains the same object in the user's mental model.

2. Hide complexity until needed.
   A single consumer should not see MOQ rules, imprint methods, proofing, or tiered pricing unless relevant. A bulk buyer should get those controls as soon as they need them.

3. Make constraints feel designed.
   If a finish is not available with a barrel shape, do not present it as an error. The unavailable option should gracefully fade, slide away, or be replaced by compatible alternatives.

4. Use motion as explanation.
   Camera movement should teach the product structure: tip, grip, barrel, clip, cap, clicker, ink, logo area, packaging.

5. Every visual option must map to a real purchasable configuration.
   No fantasy state should be allowed to reach checkout.

6. Make bulk feel premium, not administrative.
   Even quote requests, logo uploads, and proof previews should feel integrated into the object-building flow.

## Information Architecture

Recommended top-level flow:

1. Entry
2. Body profile
3. Grip
4. Finish
5. Color
6. Clip and trim
7. Ink
8. Personalization or branding
9. Quantity and order type
10. Review
11. Shopify checkout or quote submission

The flow can be linear by default, with a compact progress rail that lets users revisit completed steps.

Desktop navigation:

- Persistent hero pen in center.
- Step controls docked to the side or bottom.
- Compact step rail along the opposite edge.
- Price and order summary visible but unobtrusive.

Mobile navigation:

- Hero pen occupies the top or center majority of the viewport.
- Controls appear in a bottom sheet.
- Step rail becomes a horizontal segmented control.
- Price, quantity, and primary action remain sticky near the bottom.

## Immersive 3D UX

### Scene Composition

The 3D scene should feel like a product stage, not a technical CAD viewer.

Recommended baseline:

- One hero pen floating horizontally.
- Subtle idle rotation when the user is not interacting.
- Physically based materials.
- Soft studio shadows.
- Controlled reflections.
- Minimal environment so the product remains dominant.

The background should be clean and premium. It may be light or dark depending on brand direction, but it should not compete with the pen.

Avoid:

- Busy decorative backgrounds.
- Product grids as the main interface.
- Constant particle effects.
- Overly dramatic lighting that prevents material inspection.
- Camera motion that feels like a loading screen rather than a purposeful reveal.

### Pen Anatomy

The 3D model should be authored as separate named components:

- `tip`
- `nib_or_ballpoint`
- `grip`
- `front_barrel`
- `main_barrel`
- `rear_barrel`
- `clip`
- `cap`
- `clicker`
- `trim_rings`
- `ink_window`, if applicable
- `logo_zone_primary`
- `logo_zone_secondary`
- `engraving_zone`
- `packaging`, if included in review

Each component should support:

- Focus targeting.
- Material assignment.
- Visibility or replacement.
- Compatibility filtering.
- Animation offsets for exploded views.
- Analytics event tagging.

### Persistent Hero Pen

The hero pen should persist through:

- Component selection.
- Material changes.
- Color changes.
- Logo placement.
- Quantity changes.
- Review.

When a selected option requires a different base SKU, the visual transition should still feel like the same pen evolving. Use morphing, crossfading, or masked replacement rather than a hard object swap.

## Camera Choreography

Camera movement is a core part of the product experience. It should be designed as a sequence of intentional shots.

### Entry Shot

Goal: Create emotional commitment.

Behavior:

- Pen floats horizontally in a centered studio shot.
- Slow idle rotation.
- Start button or first option appears after the pen settles.
- Lighting glides slightly across the material to show quality.

Suggested copy:

- `Build your pen`
- `Start`

### Exploded Anatomy Shot

Goal: Teach that the pen is customizable.

Behavior:

- On start, the camera pushes in.
- Pen rotates to a clean side profile.
- Components subtly separate along the pen axis.
- Labels appear only for the active or hover-targeted component.
- The pen reassembles before the first selection.

Explosion should be elegant and controlled. It should not look like a mechanical teardown unless the brand is technical.

### Body Profile Shot

Goal: Choose the base silhouette.

Behavior:

- Camera pulls back to show the full pen.
- Compatible body profiles appear as ghost silhouettes or small orbiting previews.
- Hovering or tapping an option previews the profile on the hero pen.
- Selection locks the body and filters downstream options.

### Grip Shot

Goal: Make texture tangible.

Behavior:

- Camera travels toward the front third of the pen.
- Grip rotates toward the viewer.
- Options affect texture, pattern, material, or ergonomic shape.
- Use close lighting to reveal rubber, knurling, soft-touch, or metal grip details.

### Finish Shot

Goal: Show material response.

Behavior:

- Camera returns to a three-quarter view.
- Environment reflections become more visible.
- Finish changes should update roughness, metalness, normal maps, and reflections, not just color.

Examples:

- Matte resin
- Gloss lacquer
- Brushed aluminum
- Anodized metal
- Soft-touch coating
- Recycled plastic
- Transparent barrel

### Color Shot

Goal: Make color selection feel real.

Behavior:

- Color applies directly to the selected material.
- Swatches should be organized by palette or brand families.
- For bulk orders, allow brand color input using HEX, Pantone, or uploaded logo extraction.
- Incompatible colors should not appear for materials or SKUs that cannot support them.

### Clip And Trim Shot

Goal: Emphasize premium details.

Behavior:

- Camera rotates 90 degrees to present the clip.
- Clip and trim highlight with a subtle rim light.
- Options change clip shape, trim color, plating, or accent material.

### Ink Shot

Goal: Keep practical choice simple.

Behavior:

- Camera moves toward tip.
- Options are simple: black, blue, gel, ballpoint, rollerball, refill type, line width.
- For consumer purchase, keep this step fast.
- For bulk purchase, expose refill availability and factory lead-time impact.

### Branding Shot

Goal: Make personalization feel precise and trustworthy.

Behavior:

- Camera moves to the logo or engraving zone.
- Barrel rotates to face the user.
- A placement guide appears on the pen surface.
- The user can add text, upload a logo, choose imprint color, or select engraving.
- The preview should curve or project artwork onto the barrel surface rather than floating flat above it.

### Review Shot

Goal: Convert with confidence.

Behavior:

- Pen returns to full hero view.
- It performs one slow rotation.
- A concise configuration summary appears.
- Price, quantity, shipping estimate, and primary action become clear.
- For bulk orders, show proof status, quote path, MOQ warnings, and estimated production timeline.

## Lighting Design

Lighting should help users understand material and form.

Recommended setup:

- Key light: soft, large-area, slightly above and forward.
- Rim light: narrow highlight along clip, barrel, and edges.
- Fill light: low-intensity, prevents shadows from hiding details.
- Reflection cards or HDRI: controlled enough to show metal and gloss finishes.

Dynamic lighting moments:

- Entry: slow sweep across the pen.
- Finish step: increase reflection contrast.
- Logo step: flatten glare so branding is readable.
- Review: balanced product lighting with subtle premium motion.

Lighting should change with purpose. Do not turn every step into a different dramatic scene.

## Sound Design

Sound should be optional, tasteful, and quiet by default.

Rules:

- Start muted unless the user enables sound or the context clearly supports audio.
- Provide a visible sound toggle.
- Never block checkout or selection with audio.
- Respect system reduced-motion and reduced-sound preferences where available.

Suggested sound palette:

- Soft mechanical click on selection.
- Gentle magnetic snap when components assemble.
- Low whoosh during camera transitions.
- Subtle material shimmer when finish changes.
- Fine engraving sound during text personalization preview.
- Quiet confirmation tone when configuration becomes valid.

Avoid:

- Loud game UI sounds.
- Repetitive hover sounds.
- Long musical loops.
- Audio that makes the store feel gimmicky.

## Transitions And Motion

Motion should clarify the relationship between choices and the pen.

Transition types:

- Camera dolly: moving closer to the active component.
- Object rotation: exposing the relevant side.
- Exploded offset: separating components to show structure.
- Material sweep: applying finish or color across a surface.
- Magnetic snap: confirming a component choice.
- Ghost preview: showing compatible alternatives without committing.
- Soft dissolve: changing between manufacturable SKU geometries.

Motion timing:

- Micro-interactions: 100-200ms.
- Option changes: 200-400ms.
- Camera moves: 600-1100ms.
- Entry and review cinematic moves: 1200-1800ms.

All major motion should support a reduced-motion mode:

- Replace long camera moves with direct reframing.
- Replace object spin with short fades.
- Keep all customization functional.

## Interaction Model

### Desktop

Desktop users should be able to:

- Rotate the pen by dragging.
- Zoom within limits.
- Click components to jump to relevant steps.
- Hover options to preview.
- Click to commit.
- Use keyboard navigation for all controls.
- See a live configuration summary.

Recommended desktop layout:

- Center: 3D pen.
- Left or bottom: current step options.
- Right: summary, price, quantity, checkout.
- Top: brand/store navigation kept minimal.

### Mobile

Mobile users should be able to:

- Swipe or drag the pen.
- Tap visible option chips or swatches.
- Use a bottom sheet for controls.
- Expand review details only when needed.
- Complete purchase with one thumb.

Recommended mobile layout:

- Top/middle: 3D pen.
- Bottom: step controls in a sheet.
- Sticky bottom row: price and primary action.
- Logo editing should use simplified placement handles and zoomed view.

Mobile performance is a first-class requirement, not a degraded fallback.

## Single-Consumer Flow

The single-consumer path should minimize business complexity.

Default steps:

1. Choose body style.
2. Choose finish.
3. Choose color.
4. Choose trim.
5. Choose ink.
6. Add optional name or short engraving.
7. Review.
8. Add to cart.

Consumer-specific behavior:

- Quantity defaults to `1`.
- Hide MOQ and quote language.
- Show exact price whenever possible.
- Personalization limits should be clear before checkout.
- Unsupported combinations should be quietly filtered.

Consumer conversion priorities:

- Fast load.
- Immediate visual reward.
- Simple choices.
- Strong review preview.
- Clear delivery estimate.

## Bulk-Order Flow

The bulk path should emerge naturally when the user changes quantity, selects `Order for a team`, uploads a logo, or chooses business-focused options.

Bulk-specific steps:

1. Choose body style.
2. Choose finish and brand color.
3. Add logo or campaign artwork.
4. Choose imprint method.
5. Choose packaging, if available.
6. Select quantity.
7. Review unit price tiers.
8. Request proof, request quote, or add eligible bulk item to cart.

Bulk controls:

- Quantity selector with tiered pricing.
- MOQ messaging.
- Logo upload.
- Imprint area selection.
- Imprint color count.
- Pantone or HEX support.
- Proof preview.
- Estimated production lead time.
- Shipping deadline or event date.
- Sales contact or quote submission.

Bulk conversion priorities:

- Make manufacturability feel trustworthy.
- Show when a configuration is production-ready.
- Explain quote-needed states without making them feel like failure.
- Preserve the premium 3D experience even when operational details appear.

## Branding And Logo Customization

Logo customization is central to the bulk flow and optional for consumer gifting.

Supported personalization modes:

- Plain text engraving.
- Monogram.
- Uploaded logo.
- One-color imprint.
- Multi-color imprint, if factory-supported.
- Laser engraving, if material-supported.
- Pad print.
- UV print.
- Screen print, if available.

Logo upload requirements:

- Accept SVG, PDF, PNG, JPG where supported.
- Prefer vector formats for production.
- Warn when raster resolution is too low.
- Extract dominant brand colors from uploaded artwork.
- Allow user to choose imprint color from compatible production colors.

Preview behavior:

- Artwork should be projected or UV-mapped onto the barrel.
- Placement zone should reflect actual factory imprint area.
- The preview must enforce size, position, and aspect-ratio constraints.
- If the logo cannot be produced on a selected SKU, offer compatible alternatives.

Proofing behavior:

- Consumer text engraving may go directly to cart if supported.
- Bulk logo orders may require proof approval.
- The review step should clearly label preview states:
  - `Preview only`
  - `Production-ready`
  - `Proof required`
  - `Quote required`

## Backend Compatibility Graph

The backend should model the catalog as a compatibility graph, not as independent dropdowns.

Each visible choice narrows the set of manufacturable configurations.

Core entities:

- Factory
- Base pen model
- Component
- Material
- Finish
- Color
- Clip option
- Trim option
- Ink refill
- Decoration method
- Decoration zone
- Packaging option
- Quantity tier
- SKU
- Lead time
- Price rule

### Compatibility Rules

Examples:

- Body model A supports rubber grip, metal grip, and soft-touch grip.
- Body model B supports metal grip only.
- Matte finish supports 12 colors.
- Anodized aluminum supports 8 colors.
- Laser engraving is available only on metal barrels.
- Full-color logo printing is available only above a quantity threshold.
- Gold trim is available only with specific clip shapes.
- Factory X supports rush production only for approved SKUs.

The frontend should never assemble an invalid configuration. It should request available options based on current state.

### Graph Behavior

When a user selects an option:

1. Update the selected configuration.
2. Query or compute compatible downstream options.
3. Preserve existing downstream choices if still valid.
4. Gracefully replace invalid downstream choices with the closest compatible default.
5. Update the 3D preview.
6. Update price, lead time, and order eligibility.

### Option Presentation

Do not show every backend option equally.

Options should be curated into user-facing groups:

- `Classic`
- `Modern`
- `Executive`
- `Eco`
- `Lightweight`
- `Metal`
- `Soft touch`
- `Best for logos`
- `Fastest production`

These groups can map to many underlying SKUs.

## Shopify Integration

The configurator should integrate with Shopify as a product-customization layer.

Recommended integration approaches:

- Shopify theme app extension for storefront placement.
- Shopify app proxy or backend service for configuration validation.
- Shopify cart line item properties for personalization metadata.
- Shopify product variants for core purchasable SKUs where practical.
- Draft orders or quote workflow for complex bulk purchases.

### Add To Cart

For cart-ready configurations, the app should submit:

- Shopify variant ID or product ID.
- Quantity.
- Configuration ID.
- Human-readable configuration summary.
- Personalization text.
- Logo asset reference, if applicable.
- Proof requirement flag.
- Factory SKU.
- Production lead-time estimate.

Use line item properties for customer-visible details and backend metadata where appropriate.

Example line item properties:

- `Body`: `Aero Metal`
- `Finish`: `Brushed Aluminum`
- `Color`: `Midnight Blue`
- `Trim`: `Chrome`
- `Ink`: `Black Gel 0.5mm`
- `Personalization`: `A. Chen`
- `Configuration ID`: `cfg_01J...`
- `Factory SKU`: `PEN-MTL-042-BLU-CHR`
- `Proof Required`: `No`

### Quote Flow

Some bulk orders should not go directly to checkout.

Quote-required triggers:

- Quantity exceeds normal checkout threshold.
- Logo file requires manual review.
- Multi-location imprint.
- Non-standard color match.
- Rush delivery request.
- Unpriced factory combination.
- Sales approval required.

Quote submissions should capture:

- Customer contact information.
- Company name.
- Desired quantity.
- Event date or deadline.
- Full configuration.
- Uploaded assets.
- Preview image.
- Backend compatibility state.
- Estimated price range, if available.

## State Model

The configurator state should be serializable, shareable, and validated by the backend.

Example state shape:

```json
{
  "configurationId": "cfg_01JABC123",
  "mode": "consumer",
  "selected": {
    "baseModelId": "base_aero_metal",
    "bodyProfileId": "slim",
    "gripId": "knurled_metal",
    "finishId": "brushed_aluminum",
    "bodyColorId": "midnight_blue",
    "trimId": "chrome",
    "clipId": "classic_clip",
    "inkId": "black_gel_05",
    "packagingId": "standard_box"
  },
  "personalization": {
    "type": "engraving",
    "text": "A. Chen",
    "zoneId": "engraving_zone",
    "fontId": "serif_01"
  },
  "branding": {
    "logoAssetId": null,
    "decorationMethodId": null,
    "zoneId": null,
    "imprintColors": []
  },
  "order": {
    "quantity": 1,
    "currency": "USD",
    "requiresQuote": false,
    "requiresProof": false
  },
  "resolved": {
    "factorySku": "PEN-MTL-042-BLU-CHR",
    "shopifyVariantId": "gid://shopify/ProductVariant/123456789",
    "unitPrice": 42,
    "leadTimeDays": 5,
    "valid": true
  }
}
```

### State Requirements

- State must be recoverable from a URL or configuration ID.
- Backend validation is required before add-to-cart or quote submission.
- Frontend state should optimistically update for smooth interaction.
- Invalid states must be resolved before checkout.
- Configuration IDs should be immutable snapshots once submitted.

## Data Model Guidance

Recommended tables or collections:

- `factories`
- `base_models`
- `components`
- `materials`
- `finishes`
- `colors`
- `component_options`
- `decoration_methods`
- `decoration_zones`
- `ink_options`
- `packaging_options`
- `compatibility_rules`
- `sku_mappings`
- `price_rules`
- `quantity_tiers`
- `lead_time_rules`
- `configurations`
- `uploaded_assets`
- `quote_requests`

The most important backend capability is resolving a user-facing configuration into:

- A valid factory SKU.
- A Shopify purchasable item or quote path.
- A price.
- A lead time.
- A proof requirement.
- A set of production metadata.

## API Guidance

Suggested API endpoints:

```http
GET /api/configurator/bootstrap
```

Returns initial scene, default model, curated option groups, and tracking metadata.

```http
POST /api/configurator/resolve
```

Accepts current selections and returns valid compatible options, price, SKU, lead time, and warnings.

```http
POST /api/configurator/assets/logo
```

Uploads logo artwork and returns asset metadata, preview readiness, color extraction, and production warnings.

```http
POST /api/configurator/configurations
```

Creates an immutable saved configuration snapshot.

```http
POST /api/configurator/cart
```

Validates the saved configuration and returns Shopify cart payload or redirects to checkout.

```http
POST /api/configurator/quote
```

Submits a bulk quote request with configuration, asset, quantity, and customer details.

## Frontend Implementation Guidance

Recommended stack:

- Three.js or React Three Fiber for 3D rendering.
- GSAP, Framer Motion, or native animation timelines for UI transitions.
- Zustand, Redux Toolkit, or equivalent for configuration state.
- Shopify theme app extension or storefront integration layer.
- Backend service for SKU resolution and validation.

### Rendering Architecture

Separate the system into:

- `Scene`: lights, camera, renderer, environment.
- `HeroPen`: assembled 3D model and component registry.
- `CameraDirector`: named shots and transitions.
- `ConfiguratorState`: selected options and resolved backend state.
- `OptionPanel`: current step controls.
- `CompatibilityClient`: backend resolution calls.
- `ShopifyBridge`: cart, checkout, and line item payloads.
- `AnalyticsTracker`: event capture.

### Component Registry

The 3D model should expose named component handles:

```ts
type PenComponentKey =
  | "tip"
  | "grip"
  | "main_barrel"
  | "clip"
  | "cap"
  | "clicker"
  | "trim_rings"
  | "logo_zone_primary";
```

Each step can reference component keys for focus, highlight, and material assignment.

### Camera Director

Define named shots instead of hardcoding camera positions throughout UI components.

Example:

```ts
type CameraShot =
  | "entry"
  | "anatomy"
  | "body"
  | "grip"
  | "finish"
  | "color"
  | "clip"
  | "ink"
  | "branding"
  | "review";
```

The camera director should own:

- Position.
- Target.
- Focal length.
- Rotation constraints.
- Transition duration.
- Easing.
- Reduced-motion alternative.

## Performance Requirements

Performance targets:

- First meaningful visual: under 2.5 seconds on modern mobile.
- Interactive configurator: under 4 seconds on modern mobile.
- Option change visual response: under 100ms optimistic feedback.
- Backend resolution response: ideally under 300ms.
- Maintain 60 FPS on desktop where possible.
- Maintain 30 FPS minimum on mobile.

3D asset requirements:

- Use compressed glTF or GLB.
- Use Draco or Meshopt compression where appropriate.
- Use KTX2 or WebP textures.
- Keep polygon counts practical for mobile.
- Lazy-load optional components.
- Preload the next likely step assets.
- Use environment maps responsibly.
- Avoid excessive real-time lights.

Fallback behavior:

- If 3D fails, show high-quality rendered images for selected configurations where possible.
- If WebGL is unavailable, provide a simplified 2D configuration flow.
- Checkout and quote submission must remain possible without full 3D.

## Accessibility Requirements

The configurator must be usable without relying solely on motion, color, sound, or pointer interactions.

Requirements:

- Full keyboard navigation.
- Visible focus states.
- Screen-reader labels for controls.
- Text alternatives for selected configuration.
- Color names shown alongside swatches.
- Reduced-motion support.
- Mute and no-audio support.
- Sufficient contrast in all UI panels.
- Touch targets at least 44px on mobile.
- No essential information conveyed only by hover.
- Clear validation messaging for personalization and bulk constraints.

The 3D scene can be decorative for assistive technology, but the configuration state and available actions must be exposed through accessible controls.

## Analytics

Analytics should measure both commerce performance and configurator quality.

Track:

- Configurator opened.
- Start clicked.
- Step viewed.
- Option previewed.
- Option selected.
- Invalid option filtered.
- Configuration resolved.
- Personalization added.
- Logo uploaded.
- Bulk mode entered.
- Quantity changed.
- Quote required.
- Add to cart clicked.
- Quote submitted.
- Checkout completed, if available.
- Drop-off step.
- 3D load failure.
- Reduced-motion enabled.
- Sound enabled.

Important derived metrics:

- Start-to-cart conversion.
- Start-to-quote conversion.
- Average configuration time.
- Most selected body profiles.
- Most selected colors and finishes.
- Bulk conversion by quantity tier.
- Drop-off by step.
- Invalid combination frequency.
- Logo upload failure rate.
- Mobile performance impact on conversion.

Analytics should include configuration metadata, but avoid storing sensitive uploaded artwork or personal text in raw event streams.

## Error And Edge States

Handle these gracefully:

- 3D model fails to load.
- Backend resolver times out.
- Uploaded logo is too low resolution.
- Selected quantity is below MOQ.
- Selected option becomes unavailable.
- Shopify variant is unpublished.
- Factory SKU is temporarily unavailable.
- Price cannot be resolved.
- Customer requests impossible delivery date.
- Browser does not support WebGL.

Error tone should be calm and constructive.

Examples:

- `This finish is not available with the selected body. We switched to the closest compatible finish.`
- `This logo needs a production proof before checkout.`
- `This quantity requires a quote so we can confirm pricing and lead time.`

## Admin And Catalog Management

The merchant or internal team should be able to manage:

- Supported factories.
- Approved pen models.
- User-facing option names.
- SKU mappings.
- Compatibility rules.
- Material and color availability.
- Price rules.
- Quantity tiers.
- Lead times.
- Decoration methods.
- Decoration zones.
- Shopify variant mappings.
- Featured presets.
- Default configuration.

Admin tools should distinguish between:

- Factory-facing IDs.
- Shopify IDs.
- User-facing labels.
- 3D asset references.

## Presets

Presets help users start quickly without undermining customization.

Examples:

- `Executive Black`
- `Founder Blue`
- `Conference Classic`
- `Eco Matte`
- `Studio White`
- `Gift Edition`
- `Fastest Production`
- `Best for Logo`

Selecting a preset should animate the pen into that configuration and keep the user inside the same customization flow.

## Review And Checkout

The review step should show:

- Full rotating pen preview.
- Static thumbnail fallback.
- Selected body, finish, color, trim, ink.
- Personalization or logo status.
- Quantity.
- Unit price and total price.
- Lead time.
- Proof requirement.
- Return or edit controls.
- Primary checkout or quote action.

Consumer primary action:

- `Add to cart`

Bulk primary actions:

- `Request proof`
- `Request quote`
- `Add bulk order to cart`, only when the configuration is fully priced and allowed.

## Implementation Phases

### Phase 1: Prototype

Goal: Prove the hero pen experience.

Build:

- One GLB pen model with separable components.
- Core camera choreography.
- Body, finish, color, and trim steps.
- Local mock compatibility graph.
- Basic Shopify add-to-cart proof of concept.

### Phase 2: Manufacturable Catalog

Goal: Connect the illusion to real factory constraints.

Build:

- Backend compatibility resolver.
- SKU mappings.
- Price and lead-time rules.
- Shopify variant mapping.
- Saved configuration snapshots.
- Invalid state handling.

### Phase 3: Personalization And Bulk

Goal: Support the two major buying modes.

Build:

- Engraving preview.
- Logo upload.
- Decoration zones.
- Quantity tiers.
- Quote workflow.
- Proof-required states.

### Phase 4: Production Polish

Goal: Make the experience fast, accessible, and conversion-ready.

Build:

- Mobile optimization.
- Reduced-motion mode.
- Asset compression.
- Analytics.
- Error states.
- Admin catalog workflows.
- A/B testing support for steps, presets, and entry copy.

## Definition Of Done

The configurator is ready when:

- A user can customize one persistent hero pen from start to review.
- Every visible option maps to a valid backend configuration or gracefully resolves to one.
- A consumer can add a personalized single pen to Shopify cart.
- A bulk buyer can upload a logo, choose quantity, and submit a quote or checkout when eligible.
- The 3D experience performs well on mobile and desktop.
- Reduced-motion and accessible controls are supported.
- Analytics capture the full configuration funnel.
- Backend validation prevents impossible factory orders.
- Designers can adjust choreography, lighting, and UI states without changing SKU logic.
- Engineers can add new factory SKUs without redesigning the frontend experience.

## North Star

The customer should say:

> I built this pen.

The business should know:

> They selected a valid, priced, manufacturable SKU.

That tension is the product. The experience should feel cinematic, personal, and custom, while the system underneath remains disciplined, constrained, and production-safe.
