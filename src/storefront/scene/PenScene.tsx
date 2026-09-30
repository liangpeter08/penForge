"use client";

import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { AssetManifest, ChapterId, Identity } from "@/shared/contracts";
import PenModel from "./PenModel";
import CameraDirector from "./CameraDirector";

export interface PenSceneProps {
  manifest: AssetManifest;
  identity: Identity;
  fontCss?: string;
  chapter: ChapterId;
  reducedMotion: boolean;
  resetKey: number;
  poster: string;
  onFail: (reason: string) => void;
  onReady?: () => void;
}

class SceneBoundary extends Component<{ onFail: (r: string) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: Error) {
    this.props.onFail(err.message || "3D failed to start");
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Marks the first complete frame so the poster can be removed, and watches for context loss. */
function ReadySignal({ onReady, onFail }: { onReady: () => void; onFail: (r: string) => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    const lost = (e: Event) => {
      e.preventDefault();
      onFail("The graphics context was lost.");
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(id);
      gl.domElement.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, onReady, onFail]);
  return null;
}

export default function PenScene({ manifest, identity, fontCss, chapter, reducedMotion, resetKey, poster, onFail, onReady }: PenSceneProps) {
  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const L = manifest.silhouette.lengthMm * 0.001;
  const tilt = isMobile ? -0.35 : -1.05;

  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  return (
    <div className={`stage ${focused ? "stage--focused" : ""}`} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      {/* SVG poster from our own API: next/image optimisation adds nothing for vector art. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!ready && <img className="stage__poster" src={poster} alt="" aria-hidden="true" />}
      <SceneBoundary onFail={onFail}>
        <Canvas
          className="stage__canvas"
          frameloop="demand"
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          camera={{ fov: 30, near: 0.01, far: 5, position: [0.2, 0.15, 0.3] }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
          shadows={!isMobile}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.05;
          }}
          aria-label="Interactive pen preview. All choices are available in the controls; the canvas is optional."
          role="img"
        >
          <Suspense fallback={null}>
            <ReadySignal onReady={handleReady} onFail={onFail} />
            <color attach="background" args={["#f4f3ef"]} />
            {/* Neutral studio: broad soft key above/front, a narrow strip along the barrel, low fill (spec §3). */}
            <ambientLight intensity={0.35} />
            <directionalLight position={[0.4, 0.8, 0.5]} intensity={1.6} castShadow={!isMobile} shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-0.5, 0.2, -0.3]} intensity={0.5} />
            <Environment resolution={256} frames={1}>
              <Lightformer intensity={3} rotation-x={Math.PI / 2} position={[0, 2, 0]} scale={[4, 4, 1]} form="rect" />
              <Lightformer intensity={2.2} position={[0, 0.6, 2]} scale={[6, 0.35, 1]} form="rect" />
              <Lightformer intensity={0.7} position={[-2, -0.5, -1]} scale={[3, 2, 1]} form="rect" />
              <Lightformer intensity={0.4} position={[2, 0, -2]} scale={[2, 2, 1]} form="ring" />
            </Environment>
            {/* Pen presented diagonally (tip lower-left) so the silhouette reads on wide and narrow stages. */}
            <group rotation={[0, 0, tilt]}>
              <PenModel manifest={manifest} identity={identity} fontCss={fontCss} mobile={isMobile} />
            </group>
            <ContactShadows position={[0, -L * 0.42, 0]} opacity={0.4} scale={L * 2.2} blur={2.2} far={L} resolution={isMobile ? 256 : 512} frames={1} />
            <OrbitControls
              ref={controls}
              enablePan={false}
              enableZoom={focused}
              minDistance={L * 0.35}
              maxDistance={L * 2.4}
              minPolarAngle={0.35}
              maxPolarAngle={Math.PI - 0.35}
              makeDefault
            />
            <CameraDirector chapter={chapter} manifest={manifest} identityZone={identity.type === "none" ? null : identity.zoneId} reducedMotion={reducedMotion} controls={controls} resetKey={resetKey} tilt={tilt} />
          </Suspense>
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
