import React from 'react';
import './SpeedRaysFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const speedRaysPropsDoc: PropDoc[] = [
  {
    name: 'title',
    type: 'string',
    default: "'Crafted for 120 FPS...'",
    description: 'Prominent headline rendered with optical glow and negative letter spacing.',
  },
  {
    name: 'description',
    type: 'string',
    default: "'GPU-accelerated signed...'",
    description: 'Sub-paragraph text detailing mathematical fluid mechanics and GPU acceleration.',
  },
  {
    name: 'stats',
    type: 'SpeedRayStat[]',
    default: '[ { value: "120 FPS", ... } ]',
    description: 'Array of high-precision metrics rendered in monospaced typography with hairline dividers.',
  },
  {
    name: 'color',
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald'",
    default: "'black'",
    description: 'Curated luxury colorway for laser streaks, tail gradients, and ambient photon glow.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Scale factor governing vertical padding, typography clamp bounds, and dash proportions.',
  },
  {
    name: 'speed',
    type: 'number',
    default: '1',
    description: 'Relativistic velocity multiplier controlling dash traversal speed across the screen.',
  },
  {
    name: 'rayCount',
    type: 'number',
    default: '32',
    description: 'Total number of active laser velocity dashes distributed along the screen height.',
  },
];

export const SpeedRaysFooter: React.FC = () => {
  return (
    <div className="speed-rays-props-section">
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
            {speedRaysPropsDoc.map((prop) => (
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

      <div className="speed-rays-physics-note">
        <h4>GPU-Accelerated Relativistic Velocity Field</h4>
        <p>
          Simulates sub-millisecond edge data packets as <strong>tapered photon laser streaks</strong>. Each ray utilizes hardware-accelerated <code>transform: translate3d(...)</code> on a dedicated compositor layer, achieving zero-cost 120 FPS rendering. Rays feature deterministic negative phase offsets (<code>animationDelay: -X.XXs</code>) ensuring immediate optical density on viewport entry without startup delay, while radial vignette falloff preserves razor-sharp text legibility.
        </p>
      </div>
    </div>
  );
};

export default SpeedRaysFooter;
