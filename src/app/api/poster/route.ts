import { OFFERINGS, manifestFor } from "@/server/catalog";
import { penSvg } from "@/shared/pen2d";

export const dynamic = "force-dynamic";

/** Poster image shown while 3D loads, and the base image for the 2D mode. Drawn from the same manifest as the scene. */
export function GET(req: Request) {
  const url = new URL(req.url);
  const family = url.searchParams.get("family");
  const surface = url.searchParams.get("surface");
  const trim = url.searchParams.get("trim");
  const offering = OFFERINGS.find((o) => o.bodyFamilyId === family && o.surfaceId === surface && o.trimId === trim) ?? OFFERINGS[0];
  const svg = penSvg(manifestFor(offering), { background: null });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
  });
}
