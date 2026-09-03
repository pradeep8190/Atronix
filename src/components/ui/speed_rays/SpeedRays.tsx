import React, { useMemo } from 'react';
import './SpeedRays.css';

export interface SpeedRayStat {
  value: string;
  label: string;
}

export interface SpeedRaysProps {
  title?: string;
  description?: string;
  stats?: SpeedRayStat[];
  color?: 'black' | 'amber' | 'blue' | 'purple' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  speed?: number;
  rayCount?: number;
  className?: string;
}

interface RayItem {
  id: number;
  top: number; // vertical % offset
  width: number; // dash length in px
  height: number; // thickness in px
  duration: number; // stream duration in seconds
  delay: number; // pre-warmed negative delay in seconds
  type: 'white' | 'red' | 'purple';
  opacity: number;
}

const DEFAULT_STATS: SpeedRayStat[] = [
  { value: '120 FPS', label: 'GPU PIPELINE' },
  { value: '< 0.4ms', label: 'FRAME DISPATCH' },
  { value: '0 kB', label: 'RUNTIME BLOAT' },
];

export const SpeedRays: React.FC<SpeedRaysProps> = ({
  title = 'Crafted for 120 FPS physical reality.',
  description = 'GPU-accelerated signed distance fields, real-world optical refraction, and incompressible fluid kinematics. Every component renders with pure mathematical precision and zero runtime friction.',
  stats = DEFAULT_STATS,
  color = 'black',
  size = 'md',
  speed = 1,
  rayCount = 54,
  className = '',
}) => {
  // Generate deterministic pre-distributed velocity laser rays
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
      'red',
      'white',
      'purple',
    ];

    const count = Math.max(24, rayCount);

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      // Varied lengths: short laser pulses (35px) to long relativistic comet tails (160px)
      const lengthCategory = i % 3;
      let width: number;
      if (lengthCategory === 0) {
        width = 35 + ((i * 13) % 40); // 35px - 75px
      } else if (lengthCategory === 1) {
        width = 75 + ((i * 17) % 50); // 75px - 125px
      } else {
        width = 110 + ((i * 23) % 55); // 110px - 165px
      }

      // Dash thickness: 1px to 1.5px
      const height = i % 4 === 0 ? 1.5 : 1;
      // Distributed vertically across full height (3% to 97%)
      const top = 3 + ((i * 19) % 94);
      // High-velocity stream duration: 1.6s to 4.2s scaled by speed prop
      const baseDuration = (1.6 + ((i * 17) % 26) / 10) / Math.max(0.2, speed);
      // Staggered negative delays so streaks are dynamically distributed across the entire section on load
      const delay = -(((i * 67) % 100) / 100) * baseDuration;
      // Opacity
      const opacity = type === 'white' ? 0.9 : 0.78;

      items.push({
        id: i,
        top,
        width,
        height,
        duration: baseDuration,
        delay,
        type,
        opacity,
      });
    }

    return items;
  }, [rayCount, speed]);

  return (
    <div
      className={`speed-rays-container theme-${color} size-${size} ${className}`.trim()}
      role="region"
      aria-label="High-Velocity Edge Performance"
    >
      {/* Dynamic Animated Comet Streaks */}
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
                animationDuration: `${ray.duration.toFixed(2)}s`,
                animationDelay: `${ray.delay.toFixed(2)}s`,
                '--ray-op': ray.opacity,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Atmospheric Vignette Overlay */}
      <div className="speed-rays-vignette" aria-hidden="true" />

      {/* Foreground Content */}
      <div className="speed-rays-content">
        {title && <h2 className="speed-rays-title">{title}</h2>}

        {description && <p className="speed-rays-description">{description}</p>}

        {stats && stats.length > 0 && (
          <div className="speed-rays-stats-row">
            {stats.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <div className="speed-rays-stat-item">
                  <span className="speed-rays-stat-val">{stat.value}</span>
                  <span className="speed-rays-stat-lbl">{stat.label}</span>
                </div>
                {index < stats.length - 1 && (
                  <div className="speed-rays-stat-divider" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedRays;
