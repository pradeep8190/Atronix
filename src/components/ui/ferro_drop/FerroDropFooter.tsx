import React from "react";
import "./FerroDropFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const ferroDropPropsDoc: PropDoc[] = [
  {
    name: "onDrop",
    type: "(file: File | AttachedFile) => void",
    default: "undefined",
    description: "Callback triggered when a file or media object is dropped and assimilated.",
  },
  {
    name: "onSubmit",
    type: "(prompt: string, attachment: AttachedFile | null) => void",
    default: "undefined",
    description: "Callback triggered when user submits prompt via Enter or send button.",
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Ask anything or drop an image...'",
    description: "Placeholder text displayed in the transparent prompt input.",
  },
  {
    name: "soundEnabled",
    type: "boolean",
    default: "true",
    description: "Synthesizes procedural Web Audio API magnetic latch & shockwave thuds (0ms latency).",
  },
  {
    name: "theme / color",
    type: "'black' | 'blue' | 'amber' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Specular refractive aura and magnetic ferrofluid tint.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the prompt bar and fluid simulation boundary.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether prompt entry and magnetic file capture are disabled.",
  },
];

export const FerroDropFooter: React.FC = () => {
  return (
    <div className="ferro-drop-props-section">
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
            {ferroDropPropsDoc.map((prop) => (
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

      <div className="ferro-physics-note">
        <h4>Magnetic Ferrofluid Attraction & Venom Assimilation Dynamics</h4>
        <p>
          Unlike conventional static dashed-border file drop zones, <strong>Ferro Drop</strong> simulates an active magnetic field. When an image or document is dragged near the prompt bar, the perimeter behaves like an opposite magnetic pole, pulling an organic <strong>Gaussian fluid tendril</strong> directly toward the cursor's exact coordinates. Dropping the payload triggers a damped <strong>harmonic shockwave</strong> across the glass perimeter, while pure <strong>procedural Web Audio API synthesis</strong> generates a deep mechanical magnetic latch thud as the media is assimilated into a floating glass chip.
        </p>
      </div>
    </div>
  );
};

export default FerroDropFooter;
