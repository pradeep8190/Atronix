import React, { useMemo } from 'react'
import './SpeedRays.css'

interface RayItem {
  id: number
  top: number // percentage
  leftOffset: number // initial random offset
  width: number // short length in px
  height: number // thickness in px
  speed: number // duration in seconds
  delay: number // start delay in seconds
  type: 'white' | 'red' | 'purple'
  opacity: number
}

export const SpeedRays: React.FC = () => {
  // Generate 28 lightweight, short velocity dashes with deterministic random values
  const rays: RayItem[] = useMemo(() => {
    const items: RayItem[] = []
    const types: ('white' | 'red' | 'purple')[] = ['white', 'red', 'purple', 'white', 'purple', 'red', 'white']

    for (let i = 0; i < 32; i++) {
      const type = types[i % types.length]
      // Short length: 25px to 75px
      const width = 24 + ((i * 17) % 52)
      // Thickness: 1px to 1.5px
      const height = i % 4 === 0 ? 1.5 : 1
      // Distributed vertically between 8% and 92%
      const top = 8 + ((i * 13) % 84)
      // Speed: 2.2s to 5.5s
      const speed = 2.2 + ((i * 7) % 32) / 10
      // Staggered delays
      const delay = ((i * 11) % 40) / 10
      // Opacity
      const opacity = type === 'white' ? 0.8 : 0.65

      items.push({
        id: i,
        top,
        leftOffset: (i * 31) % 100,
        width,
        height,
        speed,
        delay,
        type,
        opacity,
      })
    }
    return items
  }, [])

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
              animationDelay: `${ray.delay}s`,
              '--ray-op': ray.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export default SpeedRays
