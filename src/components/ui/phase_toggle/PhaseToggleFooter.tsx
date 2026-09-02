import React from "react";
import "./PhaseToggleFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const phaseTogglePropsDoc: PropDoc[] = [
  {
    name: "checked",
    type: "boolean",
    default: "undefined",
    description: "Controlled boolean activation state.",
  },
  {
    name: "defaultChecked",
    type: "boolean",
    default: "false",
    description: "Initial activation state when in uncontrolled mode.",
  },
  {
    name: "onChange",
    type: "(checked: boolean) => void",
    default: "undefined",
    description: "Callback fired when toggle is activated or deactivated.",
  },
  {
    name: "label",
    type: "string",
    default: "'Quantum Phase'",
    description: "Text label displayed alongside the switch vessel.",
  },
  {
    name: "color / theme",
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Optical glass refraction tint, caustic bead luster, and active glow palette.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the toggle container and GPU canvas.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether the toggle is disabled from user interaction.",
  },
];

export const PhaseToggleFooter: React.FC = () => {
  return (
    <div className="phase-toggle-props-section">
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
            {phaseTogglePropsDoc.map((prop) => (
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
        <h4>Hydrodynamic Capillary Squirt Kinematics</h4>
        <p>
          Simulates a pressurized viscous liquid mercury droplet trapped inside an optical dual-chamber frosted glass vessel using <strong>Signed Distance Fields (SDFs)</strong>. When triggered, the droplet necks down and accelerates through the central capillary constriction (elongating up to 1.55x at the throat), then decelerates rapidly upon entry into the destination chamber, generating an <strong>under-damped fluid splash wave</strong> with dynamic caustic refraction at 120 FPS.
        </p>
      </div>
    </div>
  );
};

export default PhaseToggleFooter;
