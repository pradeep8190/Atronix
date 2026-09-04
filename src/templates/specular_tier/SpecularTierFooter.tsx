import React from 'react';
import '../../components/showcase/ShowcaseFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const specularTierPropsDoc: PropDoc[] = [
  {
    name: 'legacyCard',
    type: 'SpecularCardItem',
    default: '{ title, price: 888, period, ... }',
    description: 'Configuration object for the left baseline comparison card (title, tag, price, period, description, features, note).',
  },
  {
    name: 'proCard',
    type: 'SpecularCardItem',
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

export const SpecularTierFooter: React.FC = () => {
  return (
    <div className="showcase-footer">
      <div className="props-guide-section">
        <h3 className="props-title">Props Specification</h3>
        <p className="props-subtitle">
          Configurable parameters for customizing the 14-stop optical gradient pricing cards.
        </p>

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
              {specularTierPropsDoc.map((prop) => (
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
      </div>
    </div>
  );
};

export default SpecularTierFooter;
