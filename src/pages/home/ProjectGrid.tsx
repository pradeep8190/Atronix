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
import './ProjectGrid.css';

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  image: string;
}

const PROJECT_ITEMS: ProjectItem[] = [
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

export const ProjectGrid: React.FC = () => {
  const gridRef = useRef<HTMLElement>(null);

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

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Structured Section Divider */}
      <div className="home-section-divider">
        <div className="divider-line" />
        <span className="divider-label">Featured Components</span>
        <div className="divider-line" />
      </div>

      {/* 3-Column Project Grid */}
      <section ref={gridRef} className="project-images-grid">
        {PROJECT_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className="project-image-card"
            style={{ '--stagger-index': index % 3 } as React.CSSProperties}
          >
            {/* Cardless Image directly on body */}
            <div className="project-image-wrapper">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                decoding="async"
              />
              <div className="image-vignette-overlay" />
            </div>

            {/* Attached Liquid Glass Info Card/Pill under image */}
            <div className="project-glass-card">
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
    </>
  );
};
