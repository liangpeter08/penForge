"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { AssetManifest, ChapterId } from "@/shared/contracts";

/**
 * Camera shot contract (spec §3). Each shot is expressed relative to the pen's bounds and fitted to the
 * stage; the director retargets from the current transform and never queues animations.
 */
export interface Shot {
  /** Spherical position around the target: azimuth / polar in radians, distance as a multiple of the fitted distance. */
  azimuth: number;
  polar: number;
  distance: number;
  /** Target along the pen axis as 0..1 from tip to rear. */
  focus: number;
  /** Vertical extent (fraction of pen length) that must fit in frame. */
  fit: number;
  roll: number;
  durationMs: number;
}

export function shotFor(chapter: ChapterId, manifest: AssetManifest, identityZone: string | null, entry: boolean): Shot {
  const zone = manifest.zones.find((z) => z.id === identityZone) ?? manifest.zones[0];
  switch (chapter) {
    case "form":
      return { azimuth: 0.55, polar: 1.25, distance: 1, focus: 0.5, fit: 1.05, roll: 0, durationMs: entry ? 650 : 400 };
    case "surface":
      return { azimuth: 0.85, polar: 1.15, distance: 1, focus: 0.42, fit: 0.62, roll: 0.15, durationMs: 450 };
    case "details":
      return { azimuth: 0.35, polar: 1.05, distance: 1, focus: 0.82, fit: 0.42, roll: 0, durationMs: 550 };
    case "identity":
      return { azimuth: THREE.MathUtils.degToRad(zone.angleDeg) + 0.02, polar: Math.PI / 2, distance: 1, focus: zone.axialFraction, fit: 0.5, roll: 0, durationMs: 500 };
    case "review":
    default:
      return { azimuth: THREE.MathUtils.degToRad(zone.angleDeg) + 0.4, polar: 1.3, distance: 1, focus: 0.5, fit: 1.08, roll: 0, durationMs: 550 };
  }
}

interface Props {
  chapter: ChapterId;
  manifest: AssetManifest;
  identityZone: string | null;
  reducedMotion: boolean;
  controls: React.RefObject<OrbitControlsImpl | null>;
  /** Increments to force a re-frame (Reset view). */
  resetKey: number;
  /** Rotation about Z applied to the pen group; targets are expressed in the pen's frame and rotated to match. */
  tilt: number;
  onSettled?: () => void;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CameraDirector({ chapter, manifest, identityZone, reducedMotion, controls, resetKey, tilt, onSettled }: Props) {
  const { camera, size, invalidate } = useThree();
  const anim = useRef<{ fromPos: THREE.Vector3; fromTarget: THREE.Vector3; toPos: THREE.Vector3; toTarget: THREE.Vector3; start: number; duration: number } | null>(null);
  const userOrbited = useRef(false);
  const entered = useRef(false);

  // A user orbit suspends the director until the next explicit chapter / focus action.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const onStart = () => {
      userOrbited.current = true;
    };
    c.addEventListener("start", onStart);
    return () => c.removeEventListener("start", onStart);
  }, [controls]);

  useEffect(() => {
    userOrbited.current = false;
    const shot = shotFor(chapter, manifest, identityZone, !entered.current);
    const L = manifest.silhouette.lengthMm * 0.001;
    const target = new THREE.Vector3(0, -L / 2 + shot.focus * L, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt);
    // Fit: vertical FOV must contain `fit * L` with a margin; account for aspect on narrow stages.
    const persp = camera as THREE.PerspectiveCamera;
    const vFov = THREE.MathUtils.degToRad(persp.fov);
    const aspect = size.width / Math.max(1, size.height);
    const extent = shot.fit * L * 1.18;
    // The pen is presented diagonally; its projected extent depends on orientation, so fit the larger of the axes.
    const distV = extent / 2 / Math.tan(vFov / 2);
    const distH = extent / 2 / Math.tan(vFov / 2) / aspect;
    const dist = Math.max(distV, distH) * shot.distance;
    const pos = new THREE.Vector3().setFromSphericalCoords(dist, shot.polar, shot.azimuth).add(target);

    const c = controls.current;
    const fromTarget = c ? c.target.clone() : new THREE.Vector3();
    if (reducedMotion || !entered.current) {
      camera.position.copy(pos);
      if (c) {
        c.target.copy(target);
        c.update();
      }
      entered.current = true;
      invalidate();
      onSettled?.();
      if (reducedMotion) return;
      // Entry: a small settling rotation from a slightly offset pose.
      const offset = new THREE.Vector3().setFromSphericalCoords(dist * 1.08, shot.polar + 0.08, shot.azimuth - 0.25).add(target);
      anim.current = { fromPos: offset, fromTarget: target.clone(), toPos: pos, toTarget: target, start: performance.now(), duration: 650 };
      camera.position.copy(offset);
      invalidate();
      return;
    }
    anim.current = { fromPos: camera.position.clone(), fromTarget, toPos: pos, toTarget: target, start: performance.now(), duration: shot.durationMs };
    invalidate();
  }, [chapter, manifest, identityZone, reducedMotion, resetKey, tilt, camera, size.width, size.height, controls, invalidate, onSettled]);

  useFrame(() => {
    const a = anim.current;
    if (!a) return;
    if (userOrbited.current) {
      anim.current = null;
      return;
    }
    const t = Math.min(1, (performance.now() - a.start) / a.duration);
    const k = easeOut(t);
    camera.position.lerpVectors(a.fromPos, a.toPos, k);
    const c = controls.current;
    if (c) {
      c.target.lerpVectors(a.fromTarget, a.toTarget, k);
      c.update();
    } else {
      camera.lookAt(a.toTarget);
    }
    if (t >= 1) {
      anim.current = null;
      onSettled?.();
    } else {
      invalidate();
    }
  });

  return null;
}
