import React from 'react';
import './FluxScaleFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const fluxScalePropsDoc: PropDoc[] = [
  {
    name: 'legacyCard',
    type: 'FluxCardItem',
    default: '{ title, price: 888, period, ... }',
    description: 'Configuration object for the left baseline comparison card (title, tag, price, period, description, features, note).',
  },
  {
    name: 'proCard',
    type: 'FluxCardItem',
    default: '{ title, price: 204, period, ... }',
    description: 'Configuration object for the right featured unified card (title, tag, price, period, description, features, note).',
  },
  {
    name: 'currency',
    type: 'string',
    default: "'$'",
    description: 'Currency symbol rendered as an elevated superscript before each price.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Additional CSS class names for custom layout positioning.',
  },
];

export const FluxScaleFooter: React.FC = () => {
  return (
    <div className="flux-scale-props-section">
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
            {fluxScalePropsDoc.map((prop) => (
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

      <div className="flux-physics-note">
        <h4>14-Stop Optical Radial Gradients & 7-Stop Specular Hairlines</h4>
        <p>
          Constructed with <strong>14-stop precision radial light falloffs</strong> blending from <code>28% white</code> down to <code>0% black</code> across a 40% body reach. A <strong>7-stop specular hairline</strong> at the top chamfer expands from <code>scaleX(0.92)</code> to <code>scaleX(1.0)</code> on hover, simulating directional incident light glinting off diamond-cut obsidian edges with <strong>zero layout shifts (locked 490px fixed heights)</strong>.
        </p>
      </div>
    </div>
  );
};

export default FluxScaleFooter;
