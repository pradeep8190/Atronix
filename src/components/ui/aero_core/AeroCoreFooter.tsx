import React from "react";
import "./AeroCoreFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const aeroCorePropsDoc: PropDoc[] = [
  {
    name: "mode",
    type: "'simulate' | 'mic'",
    default: "'simulate'",
    description: "Audio source: simulated voice cadence or real microphone stream via Web Audio API.",
  },
  {
    name: "label",
    type: "string",
    default: "'Aero Core'",
    description: "Component title displayed on the control bar.",
  },
  {
    name: "onVoiceActivity",
    type: "(level: number) => void",
    default: "undefined",
    description: "Callback firing normalized live speech acoustic intensity [0.0 - 1.0].",
  },
  {
    name: "color / theme",
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Refractive glass tint, fluid metal hue, and acoustic caustic radiance.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the 260px resonance chamber.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether voice reactions and pointer touch are disabled.",
  },
];

export const AeroCoreFooter: React.FC = () => {
  return (
    <div className="aero-core-props-section">
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
            {aeroCorePropsDoc.map((prop) => (
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
        <h4>Volumetric Acoustic Nebula & Swirling Smoke Cloud Dynamics</h4>
        <p>
          Simulates an enclosed circular optical glass chamber containing an ethereal, luminous cloud of <strong>volumetric swirling smoke and celestial plasma gas</strong>. Governed by 5-octave rotational Fractional Brownian Motion (FBM) domain warping, the cloud billows, curls, and pulses with acoustic speech pressure. When audio frequencies enter the chamber (via live microphone or synthetic speech cadences), <strong>low frequencies drive massive radial smoke expansions</strong>, mid frequencies accelerate swirling vortex eddies, and cursor movement physically stirs the gaseous filaments at 120 FPS.
        </p>
      </div>
    </div>
  );
};

export default AeroCoreFooter;
