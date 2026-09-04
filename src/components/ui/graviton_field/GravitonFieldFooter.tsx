import React from 'react';
import './GravitonFieldFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const gravitonFieldPropsDoc: PropDoc[] = [
  {
    name: 'theme',
    type: "'dark' | 'light'",
    default: "'dark'",
    description: 'Color scheme mode controlling background baseline and particle brightness.',
  },
  {
    name: 'density',
    type: 'number',
    default: '220',
    description: 'Particle Poisson-disk distribution count (range 100 - 300).',
  },
  {
    name: 'particlesScale',
    type: 'number',
    default: '0.65',
    description: 'Scale multiplier governing the individual particle point size on screen.',
  },
  {
    name: 'color1',
    type: 'string',
    default: "'#818cf8'",
    description: 'Primary leading particle tint in the 3-stop noise gradient.',
  },
  {
    name: 'color2',
    type: 'string',
    default: "'#c084fc'",
    description: 'Mid-tone harmonic particle color blending along the displacement wave.',
  },
  {
    name: 'color3',
    type: 'string',
    default: "'#475569'",
    description: 'Deep background particle tint framing the outer perimeter.',
  },
  {
    name: 'ringWidth',
    type: 'number',
    default: '0.15',
    description: 'Primary torus wave radius width driving the main particle wave.',
  },
  {
    name: 'ringWidth2',
    type: 'number',
    default: '0.05',
    description: 'Secondary concentric harmonic wave width for multi-layer depth.',
  },
  {
    name: 'ringDisplacement',
    type: 'number',
    default: '0.23',
    description: 'Z-axis amplitude multiplier governing the physical 3D wave displacement.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Additional CSS class names for custom layout positioning.',
  },
];

export const GravitonFieldFooter: React.FC = () => {
  return (
    <div className="graviton-props-section">
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
            {gravitonFieldPropsDoc.map((prop) => (
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

      <div className="graviton-physics-note">
        <h4>GPGPU Particle Physics & Dual Ping-Pong Render Targets</h4>
        <p>
          Simulates hundreds of thousands of independent 3D particles calculated entirely on the GPU via <strong>dual ping-pong GPGPU data textures</strong> (<code>Float32Array</code> positional buffers). A dynamic simplex noise displacement field computes continuous trigonometric wave vectors in real-time, warping particle velocities across concentric harmonic tori with interactive raycaster mouse momentum.
        </p>
      </div>
    </div>
  );
};

export default GravitonFieldFooter;
