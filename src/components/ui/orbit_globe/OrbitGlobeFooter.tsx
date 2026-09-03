import React from 'react';
import './OrbitGlobeFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const orbitGlobePropsDoc: PropDoc[] = [
  {
    name: 'color',
    type: "'black' | 'amber' | 'blue' | 'purple' | 'emerald'",
    default: "'black'",
    description: 'Color theme for coastlines, great-circle orbital arcs, and traveling photons.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Physical dimension and projection radius of the 3D canvas viewport.',
  },
  {
    name: 'showConnections',
    type: 'boolean',
    default: 'false',
    description: 'Renders orbital flight arcs and pulsing traveling photon packets between global hubs.',
  },
  {
    name: 'showGrid',
    type: 'boolean',
    default: 'true',
    description: 'Displays wireframe latitude circles and longitude meridians for futuristic Tron aesthetic.',
  },
  {
    name: 'autoRotate',
    type: 'boolean',
    default: 'true',
    description: 'Enables continuous natural axial planetary rotation when not dragging.',
  },
  {
    name: 'interactive',
    type: 'boolean',
    default: 'true',
    description: 'Enables 3D mouse/touch drag manipulation with frictionless momentum inertia.',
  },
  {
    name: 'speed',
    type: 'number',
    default: '1.0',
    description: 'Angular planetary rotation speed multiplier.',
  },
  {
    name: 'hubs',
    type: 'GlobeHub[]',
    default: '[NYC HQ, India, Russia, London, Tokyo]',
    description: 'Array of geographic network hubs with latitude, longitude, and monospace coordinate labels.',
  },
  {
    name: 'connections',
    type: 'GlobeConnection[]',
    default: '[India-NYC, NYC-Russia, London-Tokyo...]',
    description: 'Array of great-circle orbital arc trajectories connecting specified hubs.',
  },
];

export const OrbitGlobeFooter: React.FC = () => {
  return (
    <div className="orbit-globe-props-section">
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
            {orbitGlobePropsDoc.map((prop) => (
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
        <h4>Spherical Polar Kinematics & Natural Earth Vector Geometry</h4>
        <p>
          The Orbit Globe projects high-resolution Natural Earth vector coastlines and sinusoidal parabolic
          orbital arcs from 3D unit vectors through an orthographic-perspective camera matrix.
          Drag gestures calculate real-time angular momentum vectors with exponential viscous air friction
          for realistic planetary inertia.
        </p>
      </div>
    </div>
  );
};

export default OrbitGlobeFooter;
