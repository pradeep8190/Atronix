"use client";

import React from "react";
import { TyndallBeam } from "../ui/tyndall_beam/TyndallBeam";
import "./TyndallHeroDemo.css";

export const TyndallHeroDemo: React.FC = () => {
  return (
    <div className="tyndall-hero-demo-container">
      {/* Background Volumetric Light Beam */}
      <TyndallBeam
        theme="amber"
        particleCount={3800}
        dustSpeed={1.0}
        beamIntensity={1.0}
        showOverlay={false}
        className="tyndall-hero-canvas-bg"
        style={{ width: "100%", height: "100%", borderRadius: "inherit", minHeight: "100%" }}
      />

      {/* Top Navigation */}
      <header className="tyndall-hero-nav">
        <span className="tyndall-hero-brand">Atronix</span>

        <nav className="tyndall-hero-nav-links">
          <span className="tyndall-hero-nav-link">Docs</span>
          <span className="tyndall-hero-nav-link">Components</span>
          <span className="tyndall-hero-nav-link">Frost Vault</span>
          <span className="tyndall-hero-nav-link">Showcase</span>
          <span className="tyndall-hero-nav-link">Blog</span>
        </nav>

        <span className="tyndall-hero-nav-cta">
          <span>Get Started</span>
          <span>↗</span>
        </span>
      </header>

      {/* Center Body with Real Physical Beam-Lit Glass Typography */}
      <div className="tyndall-hero-body">
        <div className="tyndall-hero-eyebrow">Build with clarity</div>

        <h1 className="tyndall-hero-title">
          <span className="tyndall-title-row-brand">Atronix</span>
          <span className="tyndall-title-row-tagline">
            <span className="tyndall-title-shade">for what’s</span>
            <span className="tyndall-title-beam-ignite"> next.</span>
          </span>
        </h1>

        <p className="tyndall-hero-subtitle">
          A modern UI component library to help you build beautiful, fast and accessible
          products — without the noise.
        </p>

        <div className="tyndall-hero-actions">
          <button className="tyndall-hero-btn-primary">
            <span>Get Started</span>
            <span>↗</span>
          </button>

          <button className="tyndall-hero-btn-secondary">
            <span>Browse Components</span>
            <span className="arrow">→</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="tyndall-hero-footer">
        <div className="tyndall-hero-stats">
          <div className="tyndall-hero-stat-item">
            <span className="tyndall-hero-stat-val">50+</span>
            <span className="tyndall-hero-stat-lbl">Components</span>
          </div>

          <div className="tyndall-hero-stat-item">
            <span className="tyndall-hero-stat-val">100%</span>
            <span className="tyndall-hero-stat-lbl">Open Source</span>
          </div>

          <div className="tyndall-hero-stat-item">
            <span className="tyndall-hero-stat-val">Built for</span>
            <span className="tyndall-hero-stat-lbl">Modern Web</span>
          </div>
        </div>

        <div className="tyndall-hero-quote">
          <span className="tyndall-hero-quote-line">Small components.</span>
          <span className="tyndall-hero-quote-line">Big possibilities.</span>
        </div>
      </footer>
    </div>
  );
};

export default TyndallHeroDemo;
