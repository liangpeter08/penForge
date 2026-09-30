import { CATALOG_VERSION, DEFAULT_SELECTION, FAMILIES, FONTS, MERCHANT, OFFERINGS } from "@/server/catalog";
import { resolve } from "@/server/resolver";
import { SCHEMA_VERSION, newId, type BootstrapResponse } from "@/shared/contracts";
import Configurator from "@/storefront/configurator/Configurator";

export const dynamic = "force-dynamic";

/** The first screen opens directly on a valid, priced pen: bootstrap is computed on the server and streamed with the page. */
export default function Page() {
  const bootstrap: BootstrapResponse = {
    schemaVersion: SCHEMA_VERSION,
    catalogVersion: CATALOG_VERSION,
    merchant: MERCHANT,
    families: FAMILIES.map((f) => ({
      id: f.id,
      label: f.label,
      tier: f.tier,
      tagline: f.tagline,
      modes: [...new Set(OFFERINGS.filter((o) => o.bodyFamilyId === f.id).map((o) => o.modeId))],
    })),
    fonts: FONTS,
    defaultSelection: DEFAULT_SELECTION,
    defaultResolution: resolve({ schemaVersion: SCHEMA_VERSION, requestId: newId("req"), draftRevision: 0, selection: DEFAULT_SELECTION }),
    featureFlags: { directCheckoutForPersonalization: true, logoUploads: true },
  };
  return <Configurator bootstrap={bootstrap} />;
}
