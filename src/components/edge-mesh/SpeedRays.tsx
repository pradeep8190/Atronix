import React, { useMemo } from 'react';
import './SpeedRays.css';

interface RayItem {
  id: number;
  top: number; // percentage
  width: number; // short length in px
  height: number; // thickness in px
  speed: number; // duration in seconds
  delay: number; // start delay in seconds (negative for pre-filled field)
  type: 'white' | 'red' | 'purple';
  opacity: number;
}

export const SpeedRays: React.FC = () => {
  // Generate lightweight, short velocity dashes with deterministic random distribution
  const rays: RayItem[] = useMemo(() => {
    const items: RayItem[] = [];
    const types: ('white' | 'red' | 'purple')[] = [
      'white',
      'red',
      'white',
      'purple',
      'white',
      'white',
      'red',
      'purple',
      'white',
    ];

    const count = 38;
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      // Short length: 28px to 85px
      const width = 28 + ((i * 19) % 58);
      // Thickness: 1px to 1.5px
      const height = i % 5 === 0 ? 1.5 : 1;
      // Distributed vertically between 5% and 95%
      const top = 5 + ((i * 17) % 90);
      // Speed: 2.8s to 6.2s
      const speed = 2.8 + ((i * 13) % 35) / 10;
      // Staggered negative delays so rays are already active across the entire canvas on load
      const delay = -(((i * 73) % 100) / 100) * speed;
      // Opacity
      const opacity = type === 'white' ? 0.85 : 0.7;

      items.push({
        id: i,
        top,
        width,
        height,
        speed,
        delay,
        type,
        opacity,
      });
    }
    return items;
  }, []);

  return (
    <div className="speed-rays-field" aria-hidden="true">
      {rays.map((ray) => (
        <div
          key={ray.id}
          className={`speed-ray-dash ray-${ray.type}`}
          style={
            {
              top: `${ray.top}%`,
              width: `${ray.width}px`,
              height: `${ray.height}px`,
              animationDuration: `${ray.speed}s`,
              animationDelay: `${ray.delay.toFixed(2)}s`,
              '--ray-op': ray.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default SpeedRays;
