import React from 'react';
import './ComingSoonPreview.css';

interface ComingSoonPreviewProps {
  name?: string;
}

export const ComingSoonPreview: React.FC<ComingSoonPreviewProps> = ({ name }) => {
  return (
    <div className="coming-soon-container">
      {/* Ambient Pulsing Glow Pill */}
      <div className="coming-soon-badge">
        <span className="coming-soon-dot" />
        <span>In Crafting Pipeline</span>
      </div>

      <h3 className="coming-soon-title">We will bring this component very soon</h3>
      <p className="coming-soon-desc">
        {name ? `${name} is currently` : 'This component is currently'} being engineered with GPU shaders, fluid physics, and Apple-grade optical glass caustics.
      </p>

      {/* Decorative Blueprint Grid Lines */}
      <div className="coming-soon-blueprint">
        <div className="blueprint-line" />
        <div className="blueprint-tag">Atronix Lab v2.0</div>
        <div className="blueprint-line" />
      </div>
    </div>
  );
};

export default ComingSoonPreview;
