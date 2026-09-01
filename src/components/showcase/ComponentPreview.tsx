import React from 'react';
import './ComponentPreview.css';

interface ComponentPreviewProps {
  component: React.ComponentType<{ color?: string; size?: string }>;
  color?: string;
  size?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component: ComponentToRender,
  color,
  size,
}) => {
  return (
    <div className="preview-sandbox">
      <ComponentToRender color={color} size={size} />
      <div className="preview-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Hover & click on the folder vault to open/close cards!
      </div>
    </div>
  );
};

export default ComponentPreview;
