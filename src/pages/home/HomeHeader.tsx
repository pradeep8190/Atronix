import React, { useRef } from 'react';
import './HomeHeader.css';
import { LiquidDocButton } from './LiquidDocButton';

interface HomeHeaderProps {
  onExplore?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onExplore }) => {
  const rafRef = useRef<number | null>(null);

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (rafRef.current) return;
    const target = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    rafRef.current = requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mouse-x', `${clientX - rect.left}px`);
      target.style.setProperty('--mouse-y', `${clientY - rect.top}px`);
      rafRef.current = null;
    });
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    e.currentTarget.style.removeProperty('--mouse-x');
    e.currentTarget.style.removeProperty('--mouse-y');
  };

  return (
    <section className="home-hero-section">
      <h1 className="home-hero-heading">
        Let's refine your project UI
      </h1>

      <p className="home-hero-subheader">
        Production-ready, ultra-refined UI components crafted with precision glassmorphism, fluid physics, and zero-compromise aesthetics.
      </p>

      {/* Action Buttons */}
      <div className="home-hero-actions">
        <a
          href="#components"
          className="home-btn-primary"
          onClick={(e) => {
            if (onExplore) {
              e.preventDefault();
              onExplore();
            }
          }}
          onMouseMove={handleButtonMouseMove}
          onMouseLeave={handleButtonMouseLeave}
        >
          <span className="btn-primary-content">
            <span>Explore</span>
            <span className="btn-rolling-word-slot">
              <span className="rolling-word default-word">Components</span>
              <span className="rolling-word hover-word">Library</span>
            </span>
            <span className="btn-arrow-wrap" aria-hidden="true">
              <span className="btn-arrow-conveyor">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-arrow-svg arrow-main"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-arrow-svg arrow-clone"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </span>
          </span>
        </a>

        <LiquidDocButton href="#docs" />
      </div>
    </section>
  );
};
