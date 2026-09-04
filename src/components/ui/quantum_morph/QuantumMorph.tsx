"use client";

import React, { useEffect, useRef } from "react";
import "./QuantumMorph.css";

export interface QuantumMorphProps {
  theme?: "light" | "dark";
  density?: number;
  particlesScale?: number;
  cameraZoom?: number;
  texture?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonIcon?: "mac" | "windows" | "code" | "none";
  onAction?: () => void;
  className?: string;
  showContent?: boolean;
}

export const QuantumMorph: React.FC<QuantumMorphProps> = ({
  theme = "light",
  density = 50,
  particlesScale = 0.6,
  cameraZoom = 8.8,
  texture = "/assets/textures/icons/individual.png",
  color1 = "#676A72",
  color2 = "#475569",
  color3 = "#334155",
  badgeText = "Atronix Sovereign Engine",
  headline = "Physical Interface",
  subheadline = "Interactive 3D particle lattice with fluid code morphing",
  buttonText = "Explore Components",
  buttonIcon = "code",
  onAction,
  className = "",
  showContent = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload particle texture & script
    if (typeof document !== "undefined") {
      if (!document.querySelector(`link[href="${texture}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = texture;
        link.as = "image";
        document.head.appendChild(link);
      }
    }

    const triggerInit = () => {
      document.dispatchEvent(new Event("DOMContentLoaded"));
      window.dispatchEvent(new Event("resize"));
      if (typeof (window as any).__initMorphingParticles === "function") {
        (window as any).__initMorphingParticles();
      }
    };

    // Dynamically load engine directly from component-scoped engine folder
    // @ts-ignore
    import("./engine/quantum-morph-engine.js")
      .then(() => {
        triggerInit();
      })
      .catch((err) => {
        console.error("Failed to load Quantum Morph Engine:", err);
      });

    // Trigger immediately if already defined
    triggerInit();

    // Polling check: verify if <canvas> has mounted
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(() => {
      attempts++;
      const container = particleSectionRef.current;
      const hasCanvas = container && container.querySelector("canvas");

      if (hasCanvas) {
        clearInterval(interval);
      } else {
        triggerInit();
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }
    }, 100);

    let cleanupHover: (() => void) | undefined;

    const containerNode = containerRef.current;
    const particleNode = particleSectionRef.current;

    const handleHover = () => {
      const helper = (particleNode as any)?.helper;
      if (helper && typeof helper.onHover === "function") {
        helper.onHover();
      }
    };

    const handleLeave = () => {
      const helper = (particleNode as any)?.helper;
      if (helper && typeof helper.onLeave === "function") {
        helper.onLeave();
      }
    };

    if (containerNode) {
      const parentCard = containerNode.parentElement || containerNode;
      parentCard.addEventListener("mouseenter", handleHover);
      parentCard.addEventListener("mousemove", handleHover);
      parentCard.addEventListener("mouseleave", handleLeave);

      cleanupHover = () => {
        parentCard.removeEventListener("mouseenter", handleHover);
        parentCard.removeEventListener("mousemove", handleHover);
        parentCard.removeEventListener("mouseleave", handleLeave);
      };
    }

    return () => {
      clearInterval(interval);
      if (cleanupHover) cleanupHover();
      if (particleSectionRef.current) {
        const helper = (particleSectionRef.current as any)?.helper;
        if (helper && typeof helper.kill === "function") {
          helper.kill();
        }
      }
    };
  }, [texture, density, particlesScale, cameraZoom, color1, color2, color3, theme]);

  return (
    <div
      ref={containerRef}
      className={`download-hero-card quantum-morph-card ${className}`}
      data-theme={theme}
    >
      {/* 3D GPGPU Morphing Particles Simulation */}
      <div
        ref={particleSectionRef}
        className="morphing-particles-component-section morphing-particles"
        data-morphing-particles-component
        data-theme={theme}
        data-density={density}
        data-particles-scale={particlesScale}
        data-camera-zoom={cameraZoom}
        data-textures={JSON.stringify([texture])}
        data-color1={color1}
        data-color2={color2}
        data-color3={color3}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          data-container
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Content Overlay */}
      {showContent && (
        <div className="download-hero-content">
          {badgeText && (
            <div className="download-badge interactive">
              <span className="download-badge-pulse" />
              {badgeText}
            </div>
          )}

          {(headline || subheadline) && (
            <div className="download-headline">
              {headline && <h2 className="download-headline-main">{headline}</h2>}
              {subheadline && <p className="download-headline-sub">{subheadline}</p>}
            </div>
          )}

          {buttonText && (
            <button
              onClick={onAction}
              className={`btn-mac interactive ${buttonIcon === "windows" ? "btn-windows" : ""}`}
            >
              {buttonIcon === "mac" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.97.99-3.12-.98.04-2.18.66-2.88 1.47-.62.72-1.16 1.89-.99 3.01 1.09.09 2.22-.54 2.88-1.36z" />
                </svg>
              )}
              {buttonIcon === "windows" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m0 0.9h9.75V21.9L0 20.551m10.65-18.651L24 0v11.551H10.65m0 0.9H24V24l-13.35-1.9" />
                </svg>
              )}
              {buttonIcon === "code" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              )}
              {buttonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuantumMorph;
