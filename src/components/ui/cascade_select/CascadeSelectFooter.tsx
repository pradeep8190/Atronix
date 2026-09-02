import React from "react";
import "./CascadeSelectFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const cascadeSelectPropsDoc: PropDoc[] = [
  {
    name: "options",
    type: "CascadeOption[]",
    default: "defaultOptions",
    description: "Array of selectable option objects with id, label, subtext, badge, icon, and disabled flags.",
  },
  {
    name: "value",
    type: "string",
    default: "undefined",
    description: "Controlled selected option ID.",
  },
  {
    name: "defaultValue",
    type: "string",
    default: "''",
    description: "Initial selected option ID when in uncontrolled mode.",
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Select Engine Architecture'",
    description: "Placeholder label displayed when no item is selected.",
  },
  {
    name: "onChange",
    type: "(value: string, option: CascadeOption) => void",
    default: "undefined",
    description: "Callback invoked upon selecting an option from the fluid menu.",
  },
  {
    name: "color / theme",
    type: "'black' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Optical glass refraction tint, caustic highlights, and selection glow palette.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the dropdown trigger and GPU WebGL canvas.",
  },
  {
    name: "icon",
    type: "React.ReactNode",
    default: "<CoreIcon />",
    description: "Custom SVG leading icon displayed in the trigger button.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether the select dropdown is disabled from user interactions.",
  },
  {
    name: "className",
    type: "string",
    default: "''",
    description: "Additional CSS class names for custom layout positioning.",
  },
];

export const CascadeSelectFooter: React.FC = () => {
  return (
    <div className="cascade-select-props-section">
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
            {cascadeSelectPropsDoc.map((prop) => (
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
        <h4>Water-Bag Gravitational Dynamics & Optical Caustics</h4>
        <p>
          The dropdown employs a <strong>hydrodynamic water-balloon simulation</strong> where the descending fluid vessel obeys volume conservation (Poisson ratio squash & stretch: σx = 1 / √σy). When dropped, gravity forces an organic pear/teardrop elongation with viscous necking via an <strong>Inigo Quilez smooth minimum (smin)</strong>. Upon landing, a damped harmonic slosh wave ripples along the bottom rim before settling into optical equilibrium.
        </p>
      </div>
    </div>
  );
};

export default CascadeSelectFooter;
