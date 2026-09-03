import React from 'react';
import './AeroCoreFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const aeroCorePropsDoc: PropDoc[] = [
  {
    name: 'color / theme',
    type: "'purple' | 'amber' | 'blue' | 'black' | 'emerald' | 'white' | string",
    default: "'purple'",
    description: 'Color theme name or custom hex color tint for the fluid nebula cloud and caustic refraction.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Proportional scale factor for the WebGL canvas and glass containment ring.',
  },
  {
    name: 'sensitivity',
    type: 'number',
    default: '1.0',
    description: 'Acoustic breathing response multiplier for simulated speech cadence.',
  },
  {
    name: 'enableMouseStir',
    type: 'boolean',
    default: 'true',
    description: 'Enables 3D cursor drag impulse stirring the internal smoke vortex.',
  },
  {
    name: 'mouseIntensity',
    type: 'number',
    default: '1.0',
    description: 'Velocity turbulence gain factor for cursor fluid displacement.',
  },
  {
    name: 'enableClickShockwave',
    type: 'boolean',
    default: 'true',
    description: 'Triggers procedural radial harmonic shockwave ring upon clicking the core.',
  },
  {
    name: 'label',
    type: 'string',
    default: "'Aero Core'",
    description: 'Status label displayed on the glass containment rim.',
  },
  {
    name: 'onVoiceActivity',
    type: '(level: number) => void',
    default: 'undefined',
    description: 'Callback invoked continuously with normalized 0-1 acoustic energy level for external audio synchronization.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Suppresses acoustic breathing animation and interaction listeners.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Additional CSS class names for custom layout overrides.',
  },
];

export const AeroCoreFooter: React.FC = () => {
  return (
    <div className="aero-core-props-section">
      <h3 className="props-title">Props Reference</h3>
      <div className="props-table-wrapper">
        <table className="props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {aeroCorePropsDoc.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className="prop-name">{prop.name}</code>
                </td>
                <td>
                  <code className="prop-type">{prop.type}</code>
                </td>
                <td>
                  <code className="prop-default">{prop.default}</code>
                </td>
                <td className="prop-desc">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="aero-physics-note">
        <h4>Acoustic Fluid & Volumetric FBM Architecture</h4>
        <p>
          Simulates an organic fluid nebula inside an optical glass orb using custom <strong>WebGL Signed Distance Fields (SDFs)</strong> and <strong>5-octave rotational Fractional Brownian Motion (FBM)</strong> domain warping. Pointer dragging injects localized angular momentum (stirring vortex velocity), while acoustic breathing dynamics pulse the core with zero external 3D libraries at 120 FPS.
        </p>
      </div>
    </div>
  );
};

export default AeroCoreFooter;
