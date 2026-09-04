"use client";

import React from "react";
import "./FluxScale.css";

export interface FluxCardItem {
  title?: string;
  tag?: string;
  price?: string | number;
  period?: string;
  description?: string;
  features?: string[];
  note?: string;
}

export interface FluxScaleProps {
  legacyCard?: FluxCardItem;
  proCard?: FluxCardItem;
  currency?: string;
  className?: string;
}

const defaultLegacy: Required<FluxCardItem> = {
  title: "Traditional Cloud",
  tag: "Legacy Stack",
  price: 888,
  period: "/ 6 months",
  description: "Estimated multi-vendor spend across compute, egress, and managed vector infrastructure.",
  features: [
    "Disjointed egress markups & hidden fees",
    "Separate vector database invoices",
    "Unpredictable idle capacity waste",
  ],
  note: "3.8× average vendor overhead",
};

const defaultPro: Required<FluxCardItem> = {
  title: "Protron X",
  tag: "Unified System",
  price: 204,
  period: "/ 6 months",
  description: "Autonomous consolidated billing with native compute, vector cache, and zero cloud markup.",
  features: [
    "Zero egress tax & single line-item bill",
    "Built-in sub-millisecond vector memory",
    "Sub-second autonomous edge scaling",
  ],
  note: "Save up to 77% with zero cloud tax",
};

export const FluxScale: React.FC<FluxScaleProps> = ({
  legacyCard,
  proCard,
  currency = "$",
  className = "",
}) => {
  const legacy = { ...defaultLegacy, ...legacyCard };
  const pro = { ...defaultPro, ...proCard };

  const formattedLegacyPrice =
    typeof legacy.price === "number" ? legacy.price.toLocaleString() : legacy.price;
  const formattedProPrice =
    typeof pro.price === "number" ? pro.price.toLocaleString() : pro.price;

  return (
    <div className={`flux-scale-container ${className}`}>
      {/* Background Ambient Spotlights */}
      <div className="flux-scale-ambient-spotlight" />

      <div className="flux-scale-cards-wrapper">
        {/* Card 1: Traditional Cloud (14-Stop Luxury Crimson Gradient) */}
        <div className="flux-scale-card flux-scale-card-legacy">
          <div className="flux-scale-card-glow-crimson" />
          <div className="flux-scale-card-inner">
            <div className="flux-scale-card-top-row">
              <h3 className="flux-scale-card-title">{legacy.title}</h3>
              <span className="flux-scale-card-tag flux-scale-tag-legacy">{legacy.tag}</span>
            </div>

            <div className="flux-scale-card-price-box">
              <span className="flux-scale-card-price-num">
                <sup className="flux-scale-currency-sup">{currency}</sup>
                {formattedLegacyPrice}
              </span>
              <span className="flux-scale-card-cadence">{legacy.period}</span>
            </div>

            <p className="flux-scale-card-desc">{legacy.description}</p>

            <div className="flux-scale-card-divider" />

            <ul className="flux-scale-card-features">
              {legacy.features.map((feat, idx) => (
                <li key={idx} className="flux-scale-feature-item negative">
                  <span className="flux-scale-feature-bullet">✕</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="flux-scale-card-footer">
              <span className="flux-scale-footer-note negative">{legacy.note}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Protron X (14-Stop Luxury Velvet Purple Gradient) */}
        <div className="flux-scale-card flux-scale-card-pro">
          <div className="flux-scale-card-glow-purple" />
          <div className="flux-scale-card-inner">
            <div className="flux-scale-card-top-row">
              <h3 className="flux-scale-card-title brand">{pro.title}</h3>
              <span className="flux-scale-card-tag flux-scale-tag-purple">{pro.tag}</span>
            </div>

            <div className="flux-scale-card-price-box">
              <span className="flux-scale-card-price-num">
                <sup className="flux-scale-currency-sup">{currency}</sup>
                {formattedProPrice}
              </span>
              <span className="flux-scale-card-cadence">{pro.period}</span>
            </div>

            <p className="flux-scale-card-desc">{pro.description}</p>

            <div className="flux-scale-card-divider" />

            <ul className="flux-scale-card-features">
              {pro.features.map((feat, idx) => (
                <li key={idx} className="flux-scale-feature-item positive">
                  <span className="flux-scale-feature-bullet">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="flux-scale-card-footer">
              <span className="flux-scale-footer-note positive">{pro.note}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FluxScale;
