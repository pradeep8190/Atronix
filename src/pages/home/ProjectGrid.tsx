import React, { lazy, Suspense } from 'react';
import './ProjectGrid.css';

// Lazy imports of the Top 3 Flagship Components
const PendantLamp = lazy(() => import('../../components/ui/pendant_lamp/PendantLamp'));
const GravitonField = lazy(() => import('../../components/ui/graviton_field/GravitonField'));
const Folder = lazy(() => import('../../components/ui/frost_vault/Folder'));

interface ProjectGridProps {
  onSelectComponent?: (id: string) => void;
  onSelectTemplate?: (id: string) => void;
}

interface FlagshipItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  component: React.ComponentType<any>;
}

// --------------------------------------------------------------------------
// Top 3 Flagship Masterpieces (Single Row, Fits 100vh with Hero)
// --------------------------------------------------------------------------
const TOP_FLAGSHIPS: FlagshipItem[] = [
  {
    id: 'pendant-lamp',
    name: 'Pendant Lamp',
    category: 'Kinetic Cord & Ambient Ray',
    badge: 'Spring Physics',
    component: () => (
      <div className="card-lamp-container">
        <PendantLamp size="sm" align="center" />
      </div>
    ),
  },
  {
    id: 'graviton-field',
    name: 'Graviton Field',
    category: 'GPGPU Relativistic Particle Vortex',
    badge: 'Quantum Physics',
    component: () => (
      <div className="card-graviton-container">
        <GravitonField
          theme="dark"
          density={180}
          particlesScale={0.7}
          color1="#818cf8"
          color2="#c084fc"
          color3="#475569"
        />
      </div>
    ),
  },
  {
    id: 'frost-vault',
    name: 'Frost Vault',
    category: '3D Obsidian Glass Folder',
    badge: 'Spatial Depth',
    component: () => (
      <div className="card-vault-container">
        <Folder color="black" size="sm" />
      </div>
    ),
  },
];

export const ProjectGrid: React.FC<ProjectGridProps> = ({ onSelectComponent }) => {
  return (
    <section className="home-flagship-section" aria-label="Featured Masterpieces">
      {/* Structured Minimal Section Divider */}
      <div className="home-section-divider">
        <div className="divider-line" />
        <span className="divider-label">Featured Artifacts</span>
        <div className="divider-line" />
      </div>

      {/* Single Row 3-Column Grid */}
      <div className="flagship-row-grid">
        {TOP_FLAGSHIPS.map((item, index) => (
          <div
            key={item.id}
            className="flagship-card scroll-visible"
            style={{ '--stagger-index': index } as React.CSSProperties}
            onClick={() => onSelectComponent?.(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectComponent?.(item.id);
              }
            }}
          >
            {/* Live Interactive Physics Stage */}
            <div className="flagship-stage-wrapper">
              <Suspense
                fallback={
                  <div className="stage-skeleton-fallback">
                    <span className="stage-skeleton-pulse" />
                  </div>
                }
              >
                <item.component />
              </Suspense>
            </div>

            {/* Attached Liquid Glass Info Dock */}
            <div className="flagship-glass-dock">
              <div className="flagship-title-row">
                <span className="flagship-card-name">{item.name}</span>
                <span className="flagship-card-badge">{item.badge}</span>
              </div>

              <div className="flagship-action-arrow" aria-label={`Open ${item.name}`}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectGrid;
