import React from 'react';
import './QuantumMorphFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const quantumMorphPropsDoc: PropDoc[] = [
  {
    name: 'theme',
    type: "'dark' | 'light'",
    default: "'light'",
    description: 'Color scheme mode controlling background baseline and particle brightness.',
  },
  {
    name: 'density',
    type: 'number',
    default: '50',
    description: 'Number of point cloud seeds distributed across the 3D volume (range 30 - 200).',
  },
  {
    name: 'particlesScale',
    type: 'number',
    default: '0.6',
    description: 'Size multiplier for individual points in the morphing lattice.',
  },
  {
    name: 'cameraZoom',
    type: 'number',
    default: '8.8',
    description: 'Orthographic/perspective camera depth zoom controlling formation prominence.',
  },
  {
    name: 'texture',
    type: 'string',
    default: "'/assets/textures/icons/individual.png'",
    description: 'Normal displacement map driving target point coordinates ({ } brackets).',
  },
  {
    name: 'color1',
    type: 'string',
    default: "'#676A72'",
    description: 'Primary lead particle tint in the 3-stop noise gradient.',
  },
  {
    name: 'color2',
    type: 'string',
    default: "'#475569'",
    description: 'Mid-tone harmonic particle color blending along the morph lattice.',
  },
  {
    name: 'color3',
    type: 'string',
    default: "'#334155'",
    description: 'Deep shadow particle tint framing the inner volume.',
  },
  {
    name: 'badgeText',
    type: 'string',
    default: "'Atronix Sovereign Engine'",
    description: 'Top pill badge label displayed above headline.',
  },
  {
    name: 'headline',
    type: 'string',
    default: "'Physical Interface Dynamics'",
    description: 'Primary title displayed in serif typography.',
  },
  {
    name: 'subheadline',
    type: 'string',
    default: "'Interactive 3D particle lattice with fluid code morphing'",
    description: 'Subtitle description text.',
  },
  {
    name: 'buttonText',
    type: 'string',
    default: "'Explore Components'",
    description: 'Interactive button label with metallic shimmer sweep.',
  },
  {
    name: 'buttonIcon',
    type: "'mac' | 'windows' | 'code' | 'none'",
    default: "'code'",
    description: 'Icon displayed within the action button.',
  },
  {
    name: 'onAction',
    type: '() => void',
    default: 'undefined',
    description: 'Click callback fired by the action button.',
  },
  {
    name: 'showContent',
    type: 'boolean',
    default: 'true',
    description: 'Toggle whether the hero card overlay content is visible.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Additional CSS class names for custom container sizing.',
  },
];

export const QuantumMorphFooter: React.FC = () => {
  return (
    <div className="quantum-morph-props-section">
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
            {quantumMorphPropsDoc.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className="prop-name">{prop.name}</code>
                </td>
                <td>
                  <span className="prop-type">{prop.type}</span>
                </td>
                <td>
                  <code className="prop-default">{prop.default}</code>
                </td>
                <td>
                  <span className="prop-desc">{prop.description}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuantumMorphFooter;
