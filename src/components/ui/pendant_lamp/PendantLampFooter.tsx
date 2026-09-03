import React from 'react';
import './PendantLampFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const pendantLampPropsDoc: PropDoc[] = [
  {
    name: 'title',
    type: 'string',
    default: "'ATRONIX'",
    description: 'Giant typography displayed within the illuminated beam cone.',
  },
  {
    name: 'sublabel',
    type: 'string',
    default: "'PHYSICAL UI ENGINE'",
    description: 'Sub-heading label rendered directly under the giant illuminated letters.',
  },
  {
    name: 'color',
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald'",
    default: "'black'",
    description: 'Color temperature and volumetric light bloom palette theme.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Physical scale factor of the lamp fixture, beam cone, and typography.',
  },
  {
    name: 'align',
    type: "'left' | 'center' | 'right'",
    default: "'left'",
    description: 'Horizontal positioning alignment of the lamp assembly within its container.',
  },
  {
    name: 'defaultOn',
    type: 'boolean',
    default: 'true',
    description: 'Initial illumination power state of the pendant lamp.',
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'true',
    description: 'Enables click-to-toggle on fixture and pull-string bead interaction.',
  },
  {
    name: 'onToggle',
    type: '(isOn: boolean) => void',
    default: 'undefined',
    description: 'Event callback fired whenever the lamp illumination power is switched.',
  },
];

export const PendantLampFooter: React.FC = () => {
  return (
    <div className="pendant-lamp-props-section">
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
            {pendantLampPropsDoc.map((prop) => (
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

      <div className="lighting-physics-note">
        <h4>Volumetric Light Cone & Cast Shadow Optics</h4>
        <p>
          Simulates an industrial suspended pendant lamp utilizing <strong>inverse-square exponential light falloff</strong>. A polygonal conic light mask (<code>clip-path: polygon(...)</code>) paired with dual Gaussian blur layers crafts realistic beam diffusion and ambient bloom. As light traverses downward, it illuminates the floating typographic boundary while casting an elliptical ground contact reflection and high-density occlusion shadow.
        </p>
      </div>
    </div>
  );
};

export default PendantLampFooter;
