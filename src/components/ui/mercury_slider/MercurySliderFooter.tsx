import React from "react";
import "./MercurySliderFooter.css";

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const mercurySliderPropsDoc: PropDoc[] = [
  {
    name: "value",
    type: "number",
    default: "undefined",
    description: "Controlled current numerical slider value.",
  },
  {
    name: "defaultValue",
    type: "number",
    default: "50",
    description: "Initial value when in uncontrolled mode.",
  },
  {
    name: "min",
    type: "number",
    default: "0",
    description: "Minimum selectable range boundary.",
  },
  {
    name: "max",
    type: "number",
    default: "100",
    description: "Maximum selectable range boundary.",
  },
  {
    name: "step",
    type: "number",
    default: "1",
    description: "Granular step quantization value.",
  },
  {
    name: "onChange",
    type: "(value: number) => void",
    default: "undefined",
    description: "Continuous callback fired during live drag interactions.",
  },
  {
    name: "onChangeEnd",
    type: "(value: number) => void",
    default: "undefined",
    description: "Callback fired when user releases the mercury droplet bead.",
  },
  {
    name: "soundEnabled",
    type: "boolean",
    default: "true",
    description: "Synthesizes procedural Apple VisionOS mechanical haptic clicks at 0ms latency.",
  },
  {
    name: "label",
    type: "string",
    default: "'Output Gain'",
    description: "Primary header title displayed above the track.",
  },
  {
    name: "formatValue",
    type: "(val: number) => string",
    default: "(v) => `${Math.round(v)}%`",
    description: "Function to format the numerical value display string.",
  },
  {
    name: "color / theme",
    type: "'black' | 'blue' | 'purple' | 'emerald' | 'white'",
    default: "'black'",
    description: "Optical glass refraction tint and caustic mercury bead palette.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Physical scale factor of the slider container and GPU canvas.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether the slider is disabled from pointer interactions.",
  },
];

export const MercurySliderFooter: React.FC = () => {
  return (
    <div className="mercury-slider-props-section">
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
            {mercurySliderPropsDoc.map((prop) => (
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
        <h4>Hydrodynamic Mercury Droplet Kinematics & Web Audio Haptics</h4>
        <p>
          Simulates a viscous liquid mercury bead inside an optical glass channel using real-time <strong>Signed Distance Fields (SDFs)</strong>. Moving the bead exerts fluid drag, dynamically stretching the droplet horizontally while compressing vertically (Poisson volume conservation: σy = 1 / √σx). Integrated with <strong>procedural Web Audio API synthesis</strong> (zero audio files, zero latency), generating warm, whisper-soft Apple VisionOS mechanical haptic clicks across quantization steps and boundary elasticity.
        </p>
      </div>
    </div>
  );
};

export default MercurySliderFooter;
