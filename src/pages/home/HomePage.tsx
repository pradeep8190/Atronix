import React, { useEffect, useRef } from 'react';
import ergosImg from '../../assets/project_images/ergos.jpg';
import gravionImg from '../../assets/project_images/gravion.png';
import heptonImg from '../../assets/project_images/hepton.png';
import horizonImg from '../../assets/project_images/horizon.png';
import jarvisImg from '../../assets/project_images/jarvis.png';
import multichatImg from '../../assets/project_images/mulitchat.png';
import nothricImg from '../../assets/project_images/nothric.png';
import protonImg from '../../assets/project_images/proton.png';
import zeoxImg from '../../assets/project_images/zeox.png';
import './HomePage.css';
import { LiquidDocButton } from './LiquidDocButton';

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  image: string;
}

export const HomePage: React.FC = () => {
  const gridRef = useRef<HTMLElement>(null);
  const endingRef = useRef<HTMLDivElement>(null);

  const projectItems: ProjectItem[] = [
    { id: 'zeox', name: 'Zeox Dynamic', category: 'Interactive Hero', image: zeoxImg },
    { id: 'jarvis', name: 'Jarvis AI', category: 'Intelligence Orb', image: jarvisImg },
    { id: 'proton', name: 'Proton X', category: 'Design System', image: protonImg },
    { id: 'ergos', name: 'Ergos UI', category: 'Glass Lens', image: ergosImg },
    { id: 'gravion', name: 'Gravion Motion', category: 'Physics Engine', image: gravionImg },
    { id: 'hepton', name: 'Hepton Vault', category: 'Security Widget', image: heptonImg },
    { id: 'horizon', name: 'Horizon Pro', category: 'Dashboard UI', image: horizonImg },
    { id: 'multichat', name: 'MultiChat Lens', category: 'Chat Flow', image: multichatImg },
    { id: 'nothric', name: 'Nothric Glass', category: 'Obsidian Card', image: nothricImg },
  ];

  // Scroll Trigger Intersection Observer for Cards & Page Ending
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

    const cards = gridRef.current?.querySelectorAll('.project-image-card');
    cards?.forEach((card) => observer.observe(card));

    if (endingRef.current) {
      observer.observe(endingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Dynamic cursor position tracking for CTA primary button (RAF optimized to prevent layout thrashing)
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
    <main className="home-page-container">
      {/* Hero Header Section */}
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
            onMouseMove={handleButtonMouseMove}
            onMouseLeave={handleButtonMouseLeave}
          >
            {/* Dynamic cursor-following specular spotlight */}
            <span className="btn-cursor-glow" aria-hidden="true" />
            {/* High-speed specular light ray sweep */}
            <span className="btn-light-sweep" aria-hidden="true" />
            
            <span className="btn-primary-content">
              <span>Explore Components</span>
              <span className="btn-arrow-wrap" aria-hidden="true">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-arrow-svg"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </span>
          </a>

          <LiquidDocButton href="#docs" />
        </div>
      </section>

      {/* Structured Section Divider */}
      <div className="home-section-divider">
        <div className="divider-line" />
        <span className="divider-label">Featured Components</span>
        <div className="divider-line" />
      </div>

      {/* 3-Column Project Grid */}
      <section ref={gridRef} className="project-images-grid">
        {projectItems.map((item, index) => (
          <div
            key={item.id}
            className="project-image-card"
            style={{ '--stagger-index': index % 3 } as React.CSSProperties}
          >
            {/* Liquid glass diagonal light sweep */}
            <div className="card-glass-shine" />

            <div className="project-image-wrapper">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
              />
              <div className="image-vignette-overlay" />
            </div>

            <div className="project-card-footer">
              <div className="project-card-info">
                <span className="project-card-name">{item.name}</span>
                <span className="project-card-category">{item.category}</span>
              </div>
              <div className="card-action-arrow" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Clean Aesthetic Page Ending Section */}
      <div ref={endingRef} className="home-page-ending">
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
          <a href="#components" className="ending-chip-btn primary">
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
            <span className="ending-status-pill">
              <span className="ending-pulse-dot" />
              More components dropping weekly
            </span>
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
    </main>
  );
};

export default HomePage;
