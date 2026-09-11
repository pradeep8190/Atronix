import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import './PendantLamp.css';

export interface PendantLampProps {
  /** Heading text displayed under the lamp */
  title?: string;
  /** Sub-label text displayed below the title */
  sublabel?: string;
  /** Color theme name ('black' | 'amber' | 'blue' | 'purple' | 'emerald') or custom hex/RGB color string */
  color?: string;
  /** Preset size variant ('sm' | 'md' | 'lg') */
  size?: 'sm' | 'md' | 'lg';
  /** Horizontal positioning alignment of the lamp assembly */
  align?: 'left' | 'center' | 'right';
  /** Custom scale factor multiplier of the lamp assembly (default: 1) */
  scale?: number;
  /** Spread multiplier of the light beam (default: 1) */
  spread?: number;
  /** Noise texture opacity multiplier (default: 1) */
  noiseLevel?: number;
  /** Controlled power state */
  isOn?: boolean;
  /** Initial power state for uncontrolled usage (default: true) */
  defaultOn?: boolean;
  /** Enables click and drag interactions (default: true) */
  interactive?: boolean;
  /** Callback fired when the lamp power state toggles */
  onToggle?: (isOn: boolean) => void;
  /** Optional custom content rendered inside the illuminated area */
  children?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles for the root container */
  style?: React.CSSProperties;
}

type LampCSSVars = React.CSSProperties & {
  '--lamp-scale'?: number;
  '--lamp-beam-spread'?: number;
  '--lamp-noise-opacity'?: number;
  '--lamp-beam-top'?: string;
  '--lamp-beam-high'?: string;
  '--lamp-beam-mid'?: string;
  '--lamp-beam-low'?: string;
  '--lamp-bloom-core'?: string;
  '--lamp-bloom-mid'?: string;
  '--lamp-bloom-edge'?: string;
  '--lamp-floor-core'?: string;
  '--lamp-floor-mid'?: string;
  '--lamp-text-glow'?: string;
  '--lamp-sublabel-color'?: string;
  '--lamp-text-top'?: string;
  '--lamp-text-mid'?: string;
  '--lamp-text-low'?: string;
};

const THEME_HEX_MAP: Record<string, string> = {
  black: '#ffffff',
  silver: '#ffffff',
  amber: '#fbbf24',
  blue: '#38bdf8',
  purple: '#c084fc',
  emerald: '#34d399',
};

const SIZE_SCALE_MAP: Record<string, number> = {
  sm: 0.8,
  md: 1,
  lg: 1.15,
};

function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]+$/.test(sanitized)) {
    return hex;
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (sanitized.length === 3) {
    r = parseInt(sanitized[0] + sanitized[0], 16);
    g = parseInt(sanitized[1] + sanitized[1], 16);
    b = parseInt(sanitized[2] + sanitized[2], 16);
  } else if (sanitized.length >= 6) {
    r = parseInt(sanitized.slice(0, 2), 16);
    g = parseInt(sanitized.slice(2, 4), 16);
    b = parseInt(sanitized.slice(4, 6), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const PENDULUM_SPRING = {
  type: 'spring' as const,
  stiffness: 48,
  damping: 7.2,
  mass: 1.4,
};

const REST_CORD_LENGTH = 28;
const MAX_CORD_LENGTH = 75;

export const PendantLamp: React.FC<PendantLampProps> = ({
  title = 'ATRONIX',
  sublabel = 'PHYSICAL UI ENGINE',
  color = 'black',
  size = 'md',
  align = 'left',
  scale,
  spread = 1,
  noiseLevel = 1,
  isOn: controlledIsOn,
  defaultOn = true,
  interactive = true,
  className = '',
  style,
  onToggle,
  children,
}) => {
  const isControlled = controlledIsOn !== undefined;
  const [internalOn, setInternalOn] = useState(defaultOn);
  const active = isControlled ? controlledIsOn : internalOn;

  const [isPulling, setIsPulling] = useState(false);
  const [swayAngle, setSwayAngle] = useState(0);

  const pullY = useMotionValue(REST_CORD_LENGTH);
  const isDraggingRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const setLampState = useCallback(
    (nextState: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof nextState === 'function' ? nextState(active) : nextState;
      if (!isControlled) {
        setInternalOn(resolved);
      }
      onToggle?.(resolved);
    },
    [active, isControlled, onToggle]
  );

  const triggerToggle = useCallback(
    (impulseStrength = 4.5, delay = 0) => {
      if (!interactive) return;

      clearTimers();
      setIsPulling(true);
      setSwayAngle(active ? -impulseStrength : impulseStrength);

      const performToggle = () => {
        setIsPulling(false);
        setLampState((prev) => !prev);
      };

      if (delay > 0) {
        const toggleTimer = window.setTimeout(performToggle, delay);
        timersRef.current.push(toggleTimer);
      } else {
        performToggle();
      }

      const resetSwayTimer = window.setTimeout(() => {
        setSwayAngle(0);
      }, 180);

      timersRef.current.push(resetSwayTimer);
    },
    [active, clearTimers, interactive, setLampState]
  );

  const handleStringClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;

    animate(pullY, 46, {
      type: 'spring',
      stiffness: 450,
      damping: 14,
      onComplete: () => {
        animate(pullY, REST_CORD_LENGTH, {
          type: 'spring',
          stiffness: 350,
          damping: 18,
        });
      },
    });

    triggerToggle(4.8, 35);
  };

  const handleFixtureClick = () => {
    triggerToggle(3.6, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerToggle(4.5, 0);
    }
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (_: unknown, info: { velocity: { y: number } }) => {
    const pullDistance = pullY.get() - REST_CORD_LENGTH;

    const resetTimer = window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 60);
    timersRef.current.push(resetTimer);

    if (pullDistance > 14 || (pullDistance > 5 && info.velocity.y > 120)) {
      const dynamicImpulse = Math.min(7.5, Math.max(3.5, 3.5 + pullDistance * 0.12));
      triggerToggle(dynamicImpulse, 0);
    }

    animate(pullY, REST_CORD_LENGTH, {
      type: 'spring',
      stiffness: 400,
      damping: 18,
    });
  };

  // Resolve color (either theme name or custom hex)
  const resolvedHex = THEME_HEX_MAP[color] || color;

  const colorStyles = useMemo<LampCSSVars>(() => {
    return {
      '--lamp-beam-top': hexToRgba(resolvedHex, 0.92),
      '--lamp-beam-high': hexToRgba(resolvedHex, 0.58),
      '--lamp-beam-mid': hexToRgba(resolvedHex, 0.18),
      '--lamp-beam-low': hexToRgba(resolvedHex, 0.03),
      '--lamp-bloom-core': hexToRgba(resolvedHex, 0.52),
      '--lamp-bloom-mid': hexToRgba(resolvedHex, 0.18),
      '--lamp-bloom-edge': hexToRgba(resolvedHex, 0.03),
      '--lamp-floor-core': hexToRgba(resolvedHex, 0.24),
      '--lamp-floor-mid': hexToRgba(resolvedHex, 0.08),
      '--lamp-text-glow': hexToRgba(resolvedHex, 0.5),
      '--lamp-sublabel-color': hexToRgba(resolvedHex, 0.55),
      '--lamp-text-top': '#ffffff',
      '--lamp-text-mid': hexToRgba(resolvedHex, 0.85),
      '--lamp-text-low': hexToRgba(resolvedHex, 0.35),
    };
  }, [resolvedHex]);

  const effectiveScale = scale ?? (size ? SIZE_SCALE_MAP[size] ?? 1 : 1);

  const rootStyles: LampCSSVars = {
    '--lamp-scale': effectiveScale,
    '--lamp-beam-spread': spread,
    '--lamp-noise-opacity': noiseLevel,
    ...colorStyles,
    ...style,
  };

  const themeClass = THEME_HEX_MAP[color] ? `theme-${color}` : '';

  return (
    <div
      className={`pendant-lamp-wrapper align-${align} size-${size} ${themeClass} ${className}`.trim()}
      style={rootStyles}
      aria-label={`${title} Pendant Lamp`}
    >
      <div className="lamp-assembly">
        <motion.div
          className="lamp-pendulum-assembly"
          style={{ transformOrigin: '50% 0px' }}
          animate={{ rotate: swayAngle }}
          transition={PENDULUM_SPRING}
        >
          {/* Top Suspension Wire */}
          <div className="lamp-cord-container">
            <motion.div
              className="lamp-cord"
              animate={{ height: isPulling ? 59 : 55 }}
              transition={{ duration: 0.12 }}
            />
          </div>

          {/* Precision Dome Fixture */}
          <motion.div
            className="lamp-fixture"
            onClick={handleFixtureClick}
            onKeyDown={handleKeyDown}
            role={interactive ? 'switch' : undefined}
            aria-checked={interactive ? active : undefined}
            aria-label={interactive ? 'Toggle lamp power' : undefined}
            tabIndex={interactive ? 0 : -1}
            whileHover={interactive ? { scale: 1.012 } : undefined}
            whileTap={interactive ? { scale: 0.985 } : undefined}
          >
            <div className="lamp-top-nut" />
            <div
              className="lamp-dome-shade"
              style={{
                borderColor: active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              }}
            />
            <div className="lamp-rim-lip" />

            {/* Interactive Draggable Pull Cord */}
            {interactive && (
              <div
                className="lamp-pull-string-anchor"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="pull-string-wire"
                  style={{ height: pullY }}
                />
                <motion.div
                  className="pull-string-bead"
                  style={{ y: pullY }}
                  drag="y"
                  dragConstraints={{ top: REST_CORD_LENGTH, bottom: MAX_CORD_LENGTH }}
                  dragElastic={{ top: 0, bottom: 0.2 }}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleStringClick}
                  whileHover={{ scale: 1.25 }}
                  whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
                  role="button"
                  aria-label="Pull cord to toggle light"
                  tabIndex={0}
                />
              </div>
            )}
          </motion.div>

          {/* Volumetric Light Beam */}
          <AnimatePresence>
            {active && (
              <motion.div
                key="lamp-beam"
                className="lamp-light-beam"
                initial={{ opacity: 0, scaleX: spread }}
                animate={{ opacity: 0.95, scaleX: spread }}
                exit={{ opacity: 0, scaleX: spread, transition: { duration: 0.22, ease: 'easeOut' } }}
                style={{ transformOrigin: '50% 0%' }}
                transition={{
                  opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                  scaleX: { duration: 0.36, ease: 'easeOut' },
                }}
              />
            )}
          </AnimatePresence>

          {/* Atmospheric Halo Bloom */}
          <AnimatePresence>
            {active && (
              <motion.div
                key="lamp-bloom"
                className="lamp-beam-bloom"
                initial={{ opacity: 0, scale: 0.9 * spread }}
                animate={{ opacity: 1, scale: 1 * spread }}
                exit={{ opacity: 0, scale: 0.92 * spread, transition: { duration: 0.22, ease: 'easeOut' } }}
                style={{ transformOrigin: '50% 25%' }}
                transition={{
                  opacity: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floor Reflection */}
        <motion.div
          className="lamp-floor-reflection"
          animate={{
            opacity: active ? 1 : 0.04,
            scale: active ? 1 : 0.5,
            x: swayAngle * 6.5,
          }}
          style={{ transformOrigin: '50% 50%' }}
          transition={{
            opacity: { duration: 0.32, ease: 'easeOut' },
            scale: { duration: 0.35, ease: 'easeOut' },
            x: PENDULUM_SPRING,
          }}
        />

        {/* Dynamic Shadow */}
        <motion.div
          className="lamp-cast-shadow"
          animate={{
            opacity: active ? 1 : 0.15,
            scaleX: active ? 1 : 0.6,
            x: swayAngle * -3.2,
          }}
          style={{ transformOrigin: '50% 50%' }}
          transition={{
            opacity: { duration: 0.32, ease: 'easeOut' },
            scaleX: { duration: 0.35, ease: 'easeOut' },
            x: PENDULUM_SPRING,
          }}
        />

        {/* Illuminated Content */}
        <motion.div
          className="lamp-illuminated-content"
          animate={{
            opacity: active ? 1 : 0.12,
            filter: active ? 'blur(0px)' : 'blur(3px)',
            y: active ? 0 : 4,
            x: swayAngle * 2.8,
          }}
          transition={{
            opacity: { duration: 0.32, ease: 'easeOut' },
            filter: { duration: 0.32, ease: 'easeOut' },
            y: { duration: 0.35, ease: 'easeOut' },
            x: PENDULUM_SPRING,
          }}
        >
          {children ? (
            children
          ) : (
            <>
              <span className="lamp-title-text lamp-one-text">{title}</span>
              {sublabel && <span className="lamp-sublabel">{sublabel}</span>}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PendantLamp;
