import React from "react";
import "./FlowingTabsFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const flowingTabsPropsDoc: PropDoc[] = [
  {
    name: "tabs",
    type: "TabItem[]",
    default: "[Preview, Code]",
    description: "Array of tab objects containing id, label, and optional icon.",
  },
  {
    name: "activeId",
    type: "string",
    default: "undefined",
    description: "Controlled currently selected tab identifier.",
  },
  {
    name: "defaultActiveId",
    type: "string",
    default: "'preview'",
    description: "Initial tab identifier when in uncontrolled mode.",
  },
  {
    name: "onChange",
    type: "(tabId: string) => void",
    default: "undefined",
    description: "Callback fired when fluid surges to a new active tab.",
  },
  {
    name: "color / theme",
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Optical glass refraction tint, hydraulic wave surge color, and active text glow.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the tabs housing and WebGL canvas.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether the tab switcher is disabled from user interactions.",
  },
];

export const FlowingTabsFooter: React.FC = () => {
  return (
    <div className="flowing-tabs-props-section">
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
            {flowingTabsPropsDoc.map((prop) => (
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
        <h4>Multi-Stage Hydraulic Sluice Gate Kinematics</h4>
        <p>
          Unlike conventional UI controls where active pills translate as rigid geometric blocks, <strong>Flowing Tabs</strong> models a true hydrodynamic dam-break surge across two hydraulic chambers. When a new tab is selected, viscous fluid friction causes a <strong>leading stream to creep along the chamber floor first</strong>, followed by a rolling wave crest overtopping the central gate, culminating in <strong>damped boundary slosh resonance</strong> upon impacting the destination pool wall at 120 FPS.
        </p>
      </div>
    </div>
  );
};

export default FlowingTabsFooter;
