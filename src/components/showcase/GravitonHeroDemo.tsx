"use client";

import React, { useState } from "react";
import GravitonField from "../ui/graviton_field/GravitonField";
import "./GravitonHeroDemo.css";

export const GravitonHeroDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("npx atronix add graviton-field");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="graviton-hero-container">
      {/* 3D GPGPU Graviton Field Particle Canvas Background */}
      <GravitonField className="graviton-hero-canvas-bg" />

      {/* Floating Center Content Layer */}
      <div className="graviton-hero-content">
        {/* Top Floating Badge */}
        <div className="graviton-hero-badge">
          <span className="graviton-badge-icon">▲</span>
          <span className="graviton-badge-brand">Atronix UI</span>
          <span className="graviton-badge-sep">/</span>
          <span className="graviton-badge-sub">Refine in One Command</span>
        </div>

        {/* Editorial Serif Headline */}
        <h1 className="graviton-hero-title">
          Refine your interface.<br />
          Stay in flow.
        </h1>

        {/* Dual Interactive Actions */}
        <div className="graviton-hero-actions">
          <button className="graviton-btn-primary" onClick={handleCopyCmd} title="Click to copy command">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {copied ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <path d="M4 17l6-6-6-6" />
                  <path d="M12 19h8" />
                </>
              )}
            </svg>
            <span>{copied ? "Copied to clipboard!" : "npx atronix add graviton-field"}</span>
          </button>

          <a href="#props-ref" className="graviton-btn-secondary">
            <span>Explore Props</span>
            <span className="graviton-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GravitonHeroDemo;
