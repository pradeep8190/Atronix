import React from 'react';
import './TyndallBeamFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const tyndallPropsDoc: PropDoc[] = [
  {
    name: 'theme',
    type: "'amber' | 'black' | 'blue' | 'emerald' | 'purple'",
    default: "'amber'",
    description: 'Curated luxury colorway controlling volumetric scattering core and dust mote specular glints.',
  },
  {
    name: 'particleCount',
    type: 'number',
    default: '3800',
    description: 'Total number of microscopic dust motes drifting in continuous 3D Brownian fluid volume.',
  },
  {
    name: 'dustSpeed',
    type: 'number',
    default: '1.0',
    description: 'Laminar convection velocity multiplier governing calm gravitational drift and harmonic turbulence.',
  },
  {
    name: 'beamIntensity',
    type: 'number',
    default: '1.0',
    description: 'Optical photon flux multiplier controlling volumetric beam core glow and mote surface reflectance.',
  },
  {
    name: 'showOverlay',
    type: 'boolean',
    default: 'false',
    description: 'Controls visibility of the default minimal center typography overlay.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Scale preset defining minimum viewport container height.',
  },
];

export const TyndallBeamFooter: React.FC = () => {
  return (
    <div className="tyndall-props-section">
      <h3 className="tyndall-props-title">Props Reference</h3>
      <div className="tyndall-table-wrapper">
        <table className="tyndall-props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {tyndallPropsDoc.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className="tyndall-prop-name">{prop.name}</code>
                </td>
                <td>
                  <code className="tyndall-prop-type">{prop.type}</code>
                </td>
                <td>
                  <code className="tyndall-prop-default">{prop.default}</code>
                </td>
                <td className="tyndall-prop-desc">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tyndall-physics-note">
        <h4>Physical Directional Mie Scattering & Light-Driven Photon Transport</h4>
        <p>
          Simulates real-world crepuscular light transport through an obsidian dark void. Photons originate from an aperture vector at the upper right, propagating diagonally along a conical angular spread with <strong>inverse-square distance attenuation</strong>. Suspended dust particles are completely invisible outside the light envelope, igniting into sharp specular glints only when struck by direct photons. Rendered entirely via raw native WebGL in a <strong>single draw call</strong> (<code>gl.drawArrays(gl.POINTS)</code>) with zero external 3D libraries.
        </p>
      </div>
    </div>
  );
};

export default TyndallBeamFooter;
