import React from 'react';
import './LiquidMitosisFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const liquidMitosisPropsDoc: PropDoc[] = [
  {
    name: 'primaryText',
    type: 'string',
    default: "'Quantum Engine'",
    description: 'The main label displayed inside the mother liquid glass capsule.',
  },
  {
    name: 'secondaryText',
    type: 'string',
    default: "'Launch'",
    description: 'The action label revealed inside the separated companion satellite pill.',
  },
  {
    name: 'color / theme',
    type: "'black' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: 'Spectral glass refraction tint and ambient caustic color palette.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Controls the proportional physical scale factor of the button and shader canvas.',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    default: '<QuantumIcon />',
    description: 'Custom SVG leading icon displayed before the primary label.',
  },
  {
    name: 'href',
    type: 'string',
    default: 'undefined',
    description: 'Optional URL string converting the button into an interactive anchor link.',
  },
  {
    name: 'onClick',
    type: '() => void',
    default: 'undefined',
    description: 'Callback function triggered upon clicking the button.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Additional CSS class names for custom layout overrides.',
  },
];

export const LiquidMitosisFooter: React.FC = () => {
  return (
    <div className="liquid-mitosis-props-section">
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
            {liquidMitosisPropsDoc.map((prop) => (
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

      <div className="liquid-physics-note">
        <h4>Physics & Shader Architecture</h4>
        <p>
          Powered by a custom <strong>Signed Distance Field (SDF)</strong> fragment shader running on WebGL. Fluid fusion is governed by an <strong>Inigo Quilez C¹-smooth minimum (smin)</strong>, while droplet pinch-off models physical <strong>Rayleigh-Plateau capillary instability</strong>. Surface tension dynamics are computed in real time via a damped harmonic oscillator at 120 FPS with zero external 3D libraries.
        </p>
      </div>
    </div>
  );
};

export default LiquidMitosisFooter;
