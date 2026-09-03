import React from 'react';
import { SpeedRays } from './SpeedRays';
import './EdgeMeshSection.css';

export const EdgeMeshSection: React.FC = () => {
  return (
    <section className="edge-mesh-section" aria-label="Edge Mesh Performance">
      {/* Dynamic Animated Comet Streaks */}
      <SpeedRays />

      {/* Atmospheric Vignette Overlay */}
      <div className="edge-mesh-vignette" aria-hidden="true" />

      {/* Center Typography & Metrics */}
      <div className="edge-mesh-content">
        <h2 className="edge-mesh-title">Crafted for 120 FPS physical reality.</h2>
        
        <p className="edge-mesh-description">
          GPU-accelerated signed distance fields, real-world optical refraction, and incompressible fluid
          kinematics. Every component renders with pure mathematical precision and zero runtime friction.
        </p>

        <div className="edge-mesh-stats-row">
          <div className="edge-mesh-stat-item">
            <span className="edge-mesh-stat-val">120 FPS</span>
            <span className="edge-mesh-stat-lbl">GPU PIPELINE</span>
          </div>

          <div className="edge-mesh-stat-divider" aria-hidden="true" />

          <div className="edge-mesh-stat-item">
            <span className="edge-mesh-stat-val">&lt; 0.4ms</span>
            <span className="edge-mesh-stat-lbl">FRAME DISPATCH</span>
          </div>

          <div className="edge-mesh-stat-divider" aria-hidden="true" />

          <div className="edge-mesh-stat-item">
            <span className="edge-mesh-stat-val">0 kB</span>
            <span className="edge-mesh-stat-lbl">RUNTIME BLOAT</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EdgeMeshSection;
