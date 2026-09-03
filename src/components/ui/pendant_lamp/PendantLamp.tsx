import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './PendantLamp.css';

export interface PendantLampProps {
  title?: string;
  sublabel?: string;
  color?: 'black' | 'amber' | 'blue' | 'purple' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  defaultOn?: boolean;
  interactive?: boolean;
  className?: string;
  onToggle?: (isOn: boolean) => void;
}

// Atronix Heavy Viscous Damped Pendulum Physics (Apple VisionOS standard)
const pendulumSpring = {
  type: 'spring' as const,
  stiffness: 48,
  damping: 7.2,
  mass: 1.4,
};

export const PendantLamp: React.FC<PendantLampProps> = ({
  title = 'ATRONIX',
  sublabel = 'PHYSICAL UI ENGINE',
  color = 'black',
  size = 'md',
  align = 'left',
  defaultOn = true,
  interactive = true,
  className = '',
  onToggle,
}) => {
  const [isOn, setIsOn] = useState(defaultOn);
  const [isPulling, setIsPulling] = useState(false);
  const [swayAngle, setSwayAngle] = useState(0);

  const handleToggle = () => {
    if (!interactive) return;
    setIsPulling(true);

    // Physical angular torque impulse from pull action
    const impulse = isOn ? -4.2 : 4.5;
    setSwayAngle(impulse);

    setTimeout(() => {
      setIsPulling(false);
      const nextState = !isOn;
      setIsOn(nextState);
      onToggle?.(nextState);
    }, 120);

    // Natural viscous harmonic damping returning to equilibrium (0°)
    setTimeout(() => {
      setSwayAngle(0);
    }, 160);
  };

  return (
    <div
      className={`pendant-lamp-wrapper align-${align} theme-${color} size-${size} ${className}`}
      aria-label={`${title} Pendant Lamp Component`}
    >
      <div className="lamp-assembly">
        {/* 
          1. RIGID PENDULUM ARM
          Anchored at ceiling pivot (50% 0px).
          Cord, Dome Fixture, Bulb, and Volumetric Light Beam Cone all rotate
          together as a single unified physical rigid body.
        */}
        <motion.div
          className="lamp-pendulum-assembly"
          style={{ transformOrigin: '50% 0px' }}
          animate={{ rotate: swayAngle }}
          transition={pendulumSpring}
        >
          {/* Hanging Wire Cord */}
          <div className="lamp-cord-container">
            <motion.div
              className="lamp-cord"
              animate={{
                height: isPulling ? 59 : 55,
              }}
              transition={{ duration: 0.12 }}
            />
          </div>

          {/* Precision Industrial Dome Fixture */}
          <motion.div
            className="lamp-fixture"
            onClick={handleToggle}
            title={interactive ? 'Click lamp or pull string to toggle light' : undefined}
            whileHover={interactive ? { scale: 1.012 } : undefined}
            whileTap={interactive ? { scale: 0.985 } : undefined}
          >
            <div className="lamp-top-nut" />
            <div
              className="lamp-dome-shade"
              style={{
                borderColor: isOn ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <div className="lamp-rim-lip">
              <div className={`lamp-power-indicator ${isOn ? 'active' : ''}`} />
            </div>

            {/* Vintage Hanging Bead Pull-String */}
            {interactive && (
              <motion.div
                className="lamp-pull-string"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle();
                }}
                animate={{
                  y: isPulling ? 8 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <div className="pull-string-wire" />
                <div className="pull-string-bead" />
              </motion.div>
            )}
          </motion.div>

          {/* 
            Volumetric Light Cone:
            Mechanically attached to the bottom rim of the dome.
            Sways and sweeps through the atmosphere in sync with the lamp dome!
          */}
          <AnimatePresence>
            {isOn && (
              <motion.div
                key="lamp-beam"
                className="lamp-light-beam"
                initial={{ opacity: 0, scaleY: 0.4 }}
                animate={{ opacity: 0.95, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0.2, transition: { duration: 0.25 } }}
                style={{ transformOrigin: '50% 0%' }}
                transition={{
                  opacity: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                  scaleY: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                }}
              />
            )}
          </AnimatePresence>

          {/* Diffuse Ambient Light Halo Bloom: Sways with the bulb */}
          <AnimatePresence>
            {isOn && (
              <motion.div
                key="lamp-bloom"
                className="lamp-beam-bloom"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.25 } }}
                style={{ transformOrigin: '50% 25%' }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* 
          2. GROUND CONTACT PHYSICS (Stationary Floor)
          As the light beam sways across the room, the ground reflection pool
          sweeps horizontally across the floor along the projected cone vector.
        */}
        <motion.div
          className="lamp-floor-reflection"
          animate={{
            opacity: isOn ? 1 : 0.05,
            scale: isOn ? 1 : 0.4,
            x: swayAngle * 6.5,
          }}
          style={{ transformOrigin: '50% 50%' }}
          transition={pendulumSpring}
        />

        {/* Physical Cast Shadow: Shifts opposite to the light beam angle */}
        <motion.div
          className="lamp-cast-shadow"
          animate={{
            opacity: isOn ? 1 : 0.15,
            scaleX: isOn ? 1 : 0.6,
            x: swayAngle * -3.2,
          }}
          style={{ transformOrigin: '50% 50%' }}
          transition={pendulumSpring}
        />

        {/* 
          3. ILLUMINATED TYPOGRAPHY
          Hotspot shifts subtly with the projected volumetric beam sweep.
        */}
        <motion.div
          className="lamp-illuminated-content"
          animate={{
            opacity: isOn ? 1 : 0.18,
            filter: isOn ? 'blur(0px)' : 'blur(4px)',
            y: isOn ? 0 : 6,
            x: swayAngle * 2.8,
          }}
          transition={pendulumSpring}
        >
          <span className="lamp-one-text">{title}</span>
          {sublabel && <span className="lamp-sublabel">{sublabel}</span>}
        </motion.div>
      </div>
    </div>
  );
};

export default PendantLamp;
