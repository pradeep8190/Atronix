import React from 'react';
import { motion } from 'motion/react';
import '../../components/showcase/ShowcaseFooter.css';

interface PropDefinition {
  name: string;
  type: string;
  default: string;
  description: string;
}

const testimonialsProps: PropDefinition[] = [
  {
    name: 'tagline',
    type: 'string',
    default: "'Verified Telemetry'",
    description: 'Monospaced category label placed above the title.',
  },
  {
    name: 'title',
    type: 'string',
    default: "'Decentralized Testimonials.'",
    description: 'Primary editorial headline.',
  },
  {
    name: 'subtitle',
    type: 'string',
    default: "'What developers and design engineers...'",
    description: 'Explanatory subtext describing user reviews or testimonials.',
  },
  {
    name: 'items',
    type: 'TestimonialItem[]',
    default: 'DEFAULT_FEEDBACK',
    description: 'Array of testimonial items with quote, author, and role.',
  },
  {
    name: 'speed',
    type: 'number',
    default: '1.4',
    description: 'Continuous horizontal RAF scroll step speed (pixels/frame).',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Optional custom CSS class name applied to outer section wrapper.',
  },
];

export const TestimonialsFooter: React.FC = () => {
  return (
    <div className="showcase-footer">
      <motion.div
        className="props-guide-section"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="props-title">Props Specification</h3>
        <p className="props-subtitle">
          Configurable parameters for customizing the 3D curved perspective testimonials deck.
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
              {testimonialsProps.map((prop) => (
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
      </motion.div>
    </div>
  );
};

export default TestimonialsFooter;
