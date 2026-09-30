"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { AssetManifest, Identity } from "@/shared/contracts";

/**
 * Procedural hero pen built from the asset manifest's silhouette, material and trim.
 * Convention (spec §12): metres, pen axis along +Y from tip to rear, clip facing +Z, origin at product centre.
 * A glTF asset with named nodes would replace this component without changing the director or the UI.
 */

const MM = 0.001;

export interface PenModelProps {
  manifest: AssetManifest;
  identity: Identity;
  fontCss?: string;
  mobile?: boolean;
}

function chiselTexture(a: string, b: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = b;
  ctx.lineWidth = 6;
  for (let i = -256; i < 512; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 128, 128);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 3);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function engravingTexture(text: string, fontCss: string, widthMm: number, heightMm: number, textHeightMm: number, light: boolean): THREE.CanvasTexture {
  // Canvas u runs around the barrel (zone height), v runs along the axis (zone width). Text reads tip -> rear.
  const scale = 20; // px per mm
  const c = document.createElement("canvas");
  c.width = Math.ceil(heightMm * scale);
  c.height = Math.ceil(widthMm * scale);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `${textHeightMm * scale}px ${fontCss}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = light ? "rgba(40,40,40,0.9)" : "rgba(235,235,235,0.9)";
  ctx.fillText(text, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function penBounds(manifest: AssetManifest) {
  const s = manifest.silhouette;
  return { length: s.lengthMm * MM, radius: (s.capDiameterMm / 2) * MM };
}

export default function PenModel({ manifest, identity, fontCss = "sans-serif", mobile }: PenModelProps) {
  const s = manifest.silhouette;
  const m = manifest.material;
  const t = manifest.trim;

  const L = s.lengthMm * MM;
  const rb = (s.barrelDiameterMm / 2) * MM;
  const rc = (s.capDiameterMm / 2) * MM;
  const y0 = -L / 2; // tip
  const capL = L * s.capFraction;
  const tipL = L * 0.07 * (0.5 + s.tipTaper);
  const gripL = s.gripSeparate ? L * 0.12 : 0;
  const barrelL = L - capL - tipL - gripL;
  const seg = mobile ? 32 : 64;

  const bodyMaterial = useMemo(() => {
    const isMetal = m.kind === "brushed_metal" || m.kind === "polished_metal" || m.kind === "chiselled";
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(m.color),
      roughness: m.roughness,
      metalness: m.metalness,
      clearcoat: m.clearcoat,
      clearcoatRoughness: m.kind === "lacquer_matte" ? 0.6 : 0.08,
      envMapIntensity: isMetal ? 1.4 : 1,
      sheen: m.kind === "pearl" ? 1 : 0,
      sheenColor: m.kind === "pearl" ? new THREE.Color(m.color2 ?? "#ffffff") : undefined,
      iridescence: m.kind === "pearl" ? 0.35 : 0,
    });
    if (m.kind === "chiselled" && typeof document !== "undefined") mat.map = chiselTexture(m.color, m.color2 ?? "#888");
    return mat;
  }, [m]);

  const trimMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(t.color), roughness: t.roughness, metalness: t.metalness, envMapIntensity: 1.5 }),
    [t],
  );
  const steelMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#c9cbcf"), roughness: 0.38, metalness: 1, envMapIntensity: 1.4 }), []);
  const capMaterial = s.bodySplit !== null ? steelMaterial : bodyMaterial;

  // Engraving decal: a thin partial cylinder over the zone, physically sized in mm.
  const engraving = useMemo(() => {
    if (identity.type !== "text" || !identity.text.trim() || typeof document === "undefined") return null;
    const zone = manifest.zones.find((z) => z.id === identity.zoneId);
    if (!zone) return null;
    const light = m.kind === "brushed_metal" || m.kind === "polished_metal" || m.kind === "chiselled" || isLight(m.color);
    const tex = engravingTexture(identity.text, fontCss, zone.widthMm, zone.heightMm, identity.heightMm, light);
    return { zone, tex };
  }, [identity, manifest.zones, fontCss, m.kind, m.color]);

  const logoZone = identity.type === "logo" ? manifest.zones.find((z) => z.id === identity.zoneId) : null;

  const endGeom = (r: number) => {
    if (s.endStyle === "flat") return <cylinderGeometry args={[r * 0.98, r, r * 0.25, seg]} />;
    if (s.endStyle === "domed") return <sphereGeometry args={[r, seg, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />;
    return <sphereGeometry args={[r, seg, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />;
  };

  const capStart = y0 + tipL + gripL + barrelL;
  const clipL = capL * 0.7;

  return (
    <group name="pen">
      {/* Tip / nib */}
      <mesh name="tip" position={[0, y0 + tipL / 2, 0]} material={trimMaterial} castShadow>
        <cylinderGeometry args={[rb * 0.82, s.hoodedNib ? rb * 0.2 : rb * 0.12, tipL, seg]} />
      </mesh>
      {s.hoodedNib && (
        <mesh name="hood" position={[0, y0 + tipL * 0.6, 0]} material={bodyMaterial}>
          <cylinderGeometry args={[rb * 0.84, rb * 0.35, tipL * 0.8, seg]} />
        </mesh>
      )}
      {/* Grip section (fixed: inspectable, never a separate option) */}
      {s.gripSeparate && (
        <group name="grip">
          <mesh position={[0, y0 + tipL + gripL / 2, 0]} material={bodyMaterial} castShadow>
            <cylinderGeometry args={[rb * 0.95, rb * 0.88, gripL, seg]} />
          </mesh>
          <mesh position={[0, y0 + tipL + gripL, 0]} material={trimMaterial}>
            <cylinderGeometry args={[rb, rb * 0.95, rb * 0.25, seg]} />
          </mesh>
        </group>
      )}
      {/* Barrel */}
      <mesh name="barrel" position={[0, y0 + tipL + gripL + barrelL / 2, 0]} material={bodyMaterial} castShadow>
        <cylinderGeometry args={[rb, rb, barrelL, seg]} />
      </mesh>
      {/* Cap */}
      <group name="cap">
        <mesh position={[0, capStart + capL / 2, 0]} material={capMaterial} castShadow>
          <cylinderGeometry args={[rc, rc, capL, seg]} />
        </mesh>
        <mesh position={[0, capStart + capL, 0]} material={capMaterial}>
          {endGeom(rc)}
        </mesh>
        <mesh position={[0, capStart, 0]} rotation={[Math.PI, 0, 0]} material={capMaterial}>
          <cylinderGeometry args={[rc, rb, rc * 0.3, seg]} />
        </mesh>
        {Array.from({ length: s.capRings }).map((_, i) => (
          <mesh key={i} name="ring" position={[0, capStart + rc * 0.3 + i * rc * 0.35, 0]} material={trimMaterial}>
            <cylinderGeometry args={[rc * 1.01, rc * 1.01, rc * 0.18, seg]} />
          </mesh>
        ))}
        {s.bodySplit !== null && (
          <mesh name="button" position={[0, capStart + capL + rc * 0.9, 0]} material={trimMaterial}>
            <cylinderGeometry args={[rc * 0.5, rc * 0.55, rc * 1.2, seg]} />
          </mesh>
        )}
        {/* Clip on +Z */}
        <group name="clip" position={[0, capStart + capL - clipL / 2 - rc * 0.3, rc + rc * 0.22]}>
          {s.clipStyle === "arrow" ? (
            <>
              <mesh material={trimMaterial} castShadow>
                <boxGeometry args={[rc * 0.42, clipL, rc * 0.2]} />
              </mesh>
              <mesh material={trimMaterial} position={[0, -clipL / 2, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[rc * 0.42, rc * 0.5, 3]} />
              </mesh>
              <mesh material={trimMaterial} position={[0, clipL / 2 - rc * 0.1, -rc * 0.12]}>
                <boxGeometry args={[rc * 0.42, rc * 0.2, rc * 0.4]} />
              </mesh>
            </>
          ) : (
            <mesh material={trimMaterial} castShadow>
              <capsuleGeometry args={[s.clipStyle === "modern" ? rc * 0.26 : rc * 0.16, clipL - rc * 0.5, 4, 8]} />
            </mesh>
          )}
        </group>
      </group>
      {/* Engraving decal */}
      {engraving && (
        <mesh
          name="engraving"
          position={[0, y0 + engraving.zone.axialFraction * L, 0]}
          rotation={[0, THREE.MathUtils.degToRad(engraving.zone.angleDeg), 0]}
        >
          <cylinderGeometry
            args={[rb * 1.004, rb * 1.004, engraving.zone.widthMm * MM, seg, 1, true, -(engraving.zone.heightMm * MM) / (2 * rb), (engraving.zone.heightMm * MM) / rb]}
          />
          <meshStandardMaterial map={engraving.tex} transparent roughness={0.9} metalness={0} polygonOffset polygonOffsetFactor={-2} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Logo placeholder: shows the physical footprint, never a fake approved print */}
      {logoZone && identity.type === "logo" && (
        <mesh name="logo-zone" position={[0, y0 + logoZone.axialFraction * L, 0]} rotation={[0, THREE.MathUtils.degToRad(logoZone.angleDeg), 0]}>
          <cylinderGeometry args={[rb * 1.004, rb * 1.004, identity.widthMm * MM, seg, 1, true, -(logoZone.heightMm * MM) / (2 * rb), (logoZone.heightMm * MM) / rb]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      )}
    </group>
  );
}

function isLight(hex: string) {
  const v = parseInt(hex.slice(1), 16);
  const r = (v >> 16) & 255,
    g = (v >> 8) & 255,
    b = v & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
