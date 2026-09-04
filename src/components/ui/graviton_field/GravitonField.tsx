"use client";

import React, { useEffect, useRef } from "react";
import "./GravitonField.css";

export interface GravitonFieldProps {
  theme?: "dark" | "light";
  density?: number;
  particlesScale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  ringWidth?: number;
  ringWidth2?: number;
  ringDisplacement?: number;
  className?: string;
}

export const GravitonField: React.FC<GravitonFieldProps> = ({
  theme = "dark",
  density = 220,
  particlesScale = 0.65,
  color1 = "#818cf8",
  color2 = "#c084fc",
  color3 = "#475569",
  ringWidth = 0.15,
  ringWidth2 = 0.05,
  ringDisplacement = 0.23,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const initField = () => {
      if (typeof window !== "undefined" && isMounted) {
        const initFn = (window as any).__initGravitonField;
        if (typeof initFn === "function") {
          initFn();
        }
      }
    };

    // Dynamically load engine directly from component-scoped engine folder
    // @ts-ignore
    import("./engine/graviton-engine.js")
      .then(() => {
        setTimeout(initField, 50);
      })
      .catch((err) => {
        console.error("Failed to load Graviton Engine:", err);
      });

    return () => {
      if (particleSectionRef.current) {
        const section = particleSectionRef.current as any;
        if (typeof section.__gravitonCleanup === "function") {
          section.__gravitonCleanup();
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`graviton-wrapper ${className}`}>
      <div
        ref={particleSectionRef}
        className="main-particles-component-section"
        data-main-particles-component
        data-theme={theme}
        data-ring-width={ringWidth}
        data-ring-width2={ringWidth2}
        data-ring-displacement={ringDisplacement}
        data-density={density}
        data-particles-scale={particlesScale}
        data-color1={color1}
        data-color2={color2}
        data-color3={color3}
      >
        <div data-container className="graviton-canvas-container" />
      </div>

      {/* Atmospheric Vignette */}
      <div className="graviton-ambient-vignette" />
    </div>
  );
};

export default GravitonField;
