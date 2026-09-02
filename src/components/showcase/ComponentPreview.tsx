import React, { Suspense } from 'react';
import './ComponentPreview.css';

interface ComponentPreviewProps {
  component: React.ComponentType<{ color?: string; size?: string }>;
  color?: string;
  size?: string;
  hint?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component: ComponentToRender,
  color,
  size,
  hint,
}) => {
  return (
    <div className="preview-sandbox">
      <Suspense
        fallback={
          <div className="preview-loading-skeleton">
            <div className="preview-skeleton-spinner" />
            <span className="preview-skeleton-text">Mounting liquid physics engine...</span>
          </div>
        }
      >
        <ComponentToRender color={color} size={size} />
      </Suspense>
      <div className="preview-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {hint || 'Hover and interact to experience the fluid physics & micro-animations!'}
      </div>
    </div>
  );
};

export default ComponentPreview;
