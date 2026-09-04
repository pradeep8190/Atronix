"use client";

import React from "react";
import "./SpecularTier.css";

export interface SpecularCardItem {
  title?: string;
  tag?: string;
  price?: string | number;
  period?: string;
  description?: string;
  features?: string[];
  note?: string;
}

export interface SpecularTierProps {
  legacyCard?: SpecularCardItem;
  proCard?: SpecularCardItem;
  currency?: string;
  className?: string;
}

const defaultLegacy: Required<SpecularCardItem> = {
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

const defaultPro: Required<SpecularCardItem> = {
  title: "Atronix Core",
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

export const SpecularTier: React.FC<SpecularTierProps> = ({
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
    <div className={`specular-tier-container ${className}`}>
      {/* Background Ambient Spotlights */}
      <div className="specular-tier-ambient-spotlight" />

      <div className="specular-tier-cards-wrapper">
        {/* Card 1: Traditional Cloud (14-Stop Luxury Crimson Gradient) */}
        <div className="specular-tier-card specular-tier-card-legacy">
          <div className="specular-tier-card-glow-crimson" />
          <div className="specular-tier-card-inner">
            <div className="specular-tier-card-top-row">
              <h3 className="specular-tier-card-title">{legacy.title}</h3>
              <span className="specular-tier-card-tag specular-tier-tag-legacy">{legacy.tag}</span>
            </div>

            <div className="specular-tier-card-price-box">
              <span className="specular-tier-card-price-num">
                <sup className="specular-tier-currency-sup">{currency}</sup>
                {formattedLegacyPrice}
              </span>
              <span className="specular-tier-card-cadence">{legacy.period}</span>
            </div>

            <p className="specular-tier-card-desc">{legacy.description}</p>

            <div className="specular-tier-card-divider" />

            <ul className="specular-tier-card-features">
              {legacy.features.map((feat, idx) => (
                <li key={idx} className="specular-tier-feature-item negative">
                  <span className="specular-tier-feature-bullet">✕</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="specular-tier-card-footer">
              <span className="specular-tier-footer-note negative">{legacy.note}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Atronix Core (14-Stop Luxury Velvet Purple Gradient) */}
        <div className="specular-tier-card specular-tier-card-pro">
          <div className="specular-tier-card-glow-purple" />
          <div className="specular-tier-card-inner">
            <div className="specular-tier-card-top-row">
              <h3 className="specular-tier-card-title brand">{pro.title}</h3>
              <span className="specular-tier-card-tag specular-tier-tag-purple">{pro.tag}</span>
            </div>

            <div className="specular-tier-card-price-box">
              <span className="specular-tier-card-price-num">
                <sup className="specular-tier-currency-sup">{currency}</sup>
                {formattedProPrice}
              </span>
              <span className="specular-tier-card-cadence">{pro.period}</span>
            </div>

            <p className="specular-tier-card-desc">{pro.description}</p>

            <div className="specular-tier-card-divider" />

            <ul className="specular-tier-card-features">
              {pro.features.map((feat, idx) => (
                <li key={idx} className="specular-tier-feature-item positive">
                  <span className="specular-tier-feature-bullet">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="specular-tier-card-footer">
              <span className="specular-tier-footer-note positive">{pro.note}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FluxScale = SpecularTier;
export default SpecularTier;
