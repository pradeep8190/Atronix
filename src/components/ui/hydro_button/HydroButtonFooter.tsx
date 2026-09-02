import React from "react";
import "./HydroButtonFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const hydroButtonPropsDoc: PropDoc[] = [
  {
    name: "label",
    type: "string",
    default: "'Deploy System'",
    description: "Submerged floating text label rendered within the fluid bag.",
  },
  {
    name: "onClick",
    type: "(e: MouseEvent) => void",
    default: "undefined",
    description: "Callback fired upon clicking the hydrostatic button.",
  },
  {
    name: "color / theme",
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Optical glass refraction tint, caustic wave dispersion, and border tension palette.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the button vessel and GPU canvas.",
  },
  {
    name: "icon",
    type: "ReactNode",
    default: "undefined",
    description: "Optional icon rendered beside the floating submerged label.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether the button is disabled from pointer interactions.",
  },
];

export const HydroButtonFooter: React.FC = () => {
  return (
    <div className="hydro-button-props-section">
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
            {hydroButtonPropsDoc.map((prop) => (
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
        <h4>Incompressible Hydrostatic "Stone Drop" Kinematics</h4>
        <p>
          Models an enclosed, constant-volume water balloon/gel pouch using real-time <strong>Signed Distance Fields (SDFs)</strong>. When clicked (a "stone drop"), the point of impact forms a concave indentation crater. Because the fluid inside is incompressible, the displaced water surges away from the impact point, generating <strong>dynamic hydrostatic pressure bulges along the outer membrane borders</strong> and radiating surface tension capillary waves at 120 FPS.
        </p>
      </div>
    </div>
  );
};

export default HydroButtonFooter;
