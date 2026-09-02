import React, { useEffect, useRef } from 'react';
import './HomeFooter.css';

interface HomeFooterProps {
  onExplore?: () => void;
}

export const HomeFooter: React.FC<HomeFooterProps> = ({ onExplore }) => {
  const endingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    if (endingRef.current) {
      observer.observe(endingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={endingRef} className="home-page-ending">
      {/* Soft Ambient White Glow Layer */}
      <div className="footer-ambient-glow" aria-hidden="true" />

      {/* Top Glowing Divider Line */}
      <div className="ending-divider-wrap">
        <div className="ending-line" />
        <div className="ending-center-mark">
          <span className="ending-diamond">✦</span>
        </div>
        <div className="ending-line" />
      </div>

      {/* Ending Copy Lines */}
      <div className="ending-hero-content">
        <h3 className="ending-heading">Ready to elevate your interface?</h3>
        <p className="ending-description">
          Handcrafted with Liquid Glassmorphism, Spring Physics & Zero Dependencies.
        </p>
        <p className="ending-subtext">
          Copy, paste, and customize into your React & Next.js projects with zero setup.
        </p>
      </div>

      {/* Action Badges / Quick Links Line */}
      <div className="ending-actions-row">
        <a
          href="#components"
          className="ending-chip-btn primary"
          onClick={(e) => {
            if (onExplore) {
              e.preventDefault();
              onExplore();
            }
          }}
        >
          <span>Explore All 50+ Components</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>

        <a href="https://github.com" target="_blank" rel="noreferrer" className="ending-chip-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          <span>GitHub Repository</span>
        </a>
      </div>

      {/* Universal Bottom Branding & Back to top Bar */}
      <div className="ending-bottom-bar">
        <div className="ending-brand">
          <span className="ending-brand-dot" />
          <span className="ending-brand-text">Atronix UI</span>
          <span className="ending-brand-divider">•</span>
          <span className="ending-brand-tagline">Engineered with Liquid Glass & Spring Physics</span>
        </div>

        <div className="ending-bottom-links">
          <span className="ending-meta-tag">Open Source (MIT)</span>
          <span className="ending-brand-divider">•</span>
          <span className="ending-meta-tag">Built for React & Next.js</span>
          <span className="ending-brand-divider">•</span>
          <button
            className="ending-back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>Back to top</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
