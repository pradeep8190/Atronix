import React, { lazy, Suspense } from 'react';
import './ProjectGrid.css';

// Direct imports of actual registered components & templates
const AeroCore = lazy(() => import('../../components/ui/aero_core/AeroCore'));
const GravitonField = lazy(() => import('../../components/ui/graviton_field/GravitonField'));
const PendantLamp = lazy(() => import('../../components/ui/pendant_lamp/PendantLamp'));
const SpeedRays = lazy(() => import('../../components/ui/speed_rays/SpeedRays'));
const MercurySlider = lazy(() => import('../../components/ui/mercury_slider/MercurySlider'));
const Folder = lazy(() => import('../../components/ui/frost_vault/Folder'));
const Testimonials = lazy(() => import('../../templates/testimonials/Testimonials'));
const LiquidMitosis = lazy(() => import('../../components/ui/liquid_mitosis/LiquidMitosis'));
const OrbitGlobe = lazy(() => import('../../components/ui/orbit_globe/OrbitGlobe'));

interface ProjectGridProps {
  onSelectComponent?: (id: string) => void;
  onSelectTemplate?: (id: string) => void;
}

interface ComponentCardItem {
  id: string;
  name: string;
  category: string;
  isTemplate?: boolean;
  component: React.ComponentType<any>;
}

// --------------------------------------------------------------------------
// Row 1 Lineup: Aero Core, Graviton Field, Pendant Lamp
// --------------------------------------------------------------------------
const ROW_1_ITEMS: ComponentCardItem[] = [
  {
    id: 'aero-core',
    name: 'Aero Core',
    category: 'Tactile Acoustic Orb',
    component: () => <AeroCore size="sm" />,
  },
  {
    id: 'graviton-field',
    name: 'Graviton Field',
    category: '3D GPGPU Relativistic Field',
    component: () => (
      <GravitonField
        theme="dark"
        density={220}
        particlesScale={0.65}
        color1="#818cf8"
        color2="#c084fc"
        color3="#475569"
      />
    ),
  },
  {
    id: 'pendant-lamp',
    name: 'Pendant Lamp',
    category: 'Kinetic Cord & Ambient Ray',
    component: () => (
      <div className="card-lamp-container">
        <PendantLamp size="sm" align="center" />
      </div>
    ),
  },
];

// --------------------------------------------------------------------------
// Row 2 Lineup: Speed Rays, Mercury Slider, Frost Vault
// --------------------------------------------------------------------------
const ROW_2_ITEMS: ComponentCardItem[] = [
  {
    id: 'speed-rays',
    name: 'Speed Rays',
    category: 'Velocity Laser Stream',
    component: () => (
      <div className="card-rays-container">
        <SpeedRays size="sm" />
      </div>
    ),
  },
  {
    id: 'mercury-slider',
    name: 'Mercury Slider',
    category: 'Hydrodynamic Liquid Meniscus',
    component: () => (
      <div className="card-mercury-container">
        <MercurySlider color="black" defaultValue={65} />
      </div>
    ),
  },
  {
    id: 'frost-vault',
    name: 'Frost Vault',
    category: '3D Obsidian Glass Folder',
    component: () => (
      <div className="card-vault-container">
        <Folder color="black" size="sm" />
      </div>
    ),
  },
];

// --------------------------------------------------------------------------
// Row 3 Lineup: Decentralized Deck, Liquid Mitosis, Orbit Globe
// --------------------------------------------------------------------------
const ROW_3_ITEMS: ComponentCardItem[] = [
  {
    id: 'testimonials',
    name: 'Decentralized Deck',
    category: '3D Curved Glass Template',
    isTemplate: true,
    component: () => (
      <div className="card-testimonials-container">
        <Testimonials speed={1.2} />
      </div>
    ),
  },
  {
    id: 'liquid-mitosis',
    name: 'Liquid Mitosis',
    category: 'Capillary Cellular Fusion',
    component: () => (
      <div className="card-mitosis-container">
        <LiquidMitosis size="sm" primaryText="Quantum Engine" secondaryText="Launch" color="black" />
      </div>
    ),
  },
  {
    id: 'orbit-globe',
    name: 'Orbit Globe',
    category: '3D Coordinate Projection',
    component: () => (
      <div className="card-globe-container">
        <OrbitGlobe size="sm" color="black" autoRotate={true} />
      </div>
    ),
  },
];

const ALL_ROWS = [...ROW_1_ITEMS, ...ROW_2_ITEMS, ...ROW_3_ITEMS];

// --------------------------------------------------------------------------
// Main Project Grid Component
// Stably rendered on HomePage (no scroll thrashing/lag).
// Completely torn down by React when leaving HomePage.
// --------------------------------------------------------------------------
export const ProjectGrid: React.FC<ProjectGridProps> = ({ onSelectComponent, onSelectTemplate }) => {
  return (
    <>
      {/* Structured Section Divider */}
      <div className="home-section-divider">
        <div className="divider-line" />
        <span className="divider-label">Featured Components</span>
        <div className="divider-line" />
      </div>

      {/* 3-Column Project Grid: 9 Real Atronix Physical Components */}
      <section className="project-images-grid">
        {ALL_ROWS.map((item, index) => (
          <div
            key={item.id}
            className="project-image-card scroll-visible"
            style={{ '--stagger-index': index % 3 } as React.CSSProperties}
            onClick={() => {
              if (item.isTemplate) {
                onSelectTemplate?.(item.id);
              } else {
                onSelectComponent?.(item.id);
              }
            }}
          >
            {/* Direct Physical Stage */}
            <div className="project-direct-wrapper">
              <Suspense fallback={null}>
                <item.component />
              </Suspense>
            </div>

            {/* Attached Liquid Glass Info Card/Pill under component */}
            <div className="project-glass-card">
              <div className="project-card-info">
                <span className="project-card-name">{item.name}</span>
                <span className="project-card-category">{item.category}</span>
              </div>
              <div className="card-action-arrow" aria-hidden="true">
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
      </section>
    </>
  );
};

export default ProjectGrid;
