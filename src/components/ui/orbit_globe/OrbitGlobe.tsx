import React, { useEffect, useRef } from 'react';
import { worldCoastlines } from './worldCoastlines';
import './OrbitGlobe.css';

export interface GlobeHub {
  name: string;
  lat: number;
  lon: number;
  labelLines: string[];
  isHQ?: boolean;
}

export interface GlobeConnection {
  from: string;
  to: string;
  altitude?: number;
  speed?: number;
}

export interface OrbitGlobeProps {
  color?: 'black' | 'red' | 'amber' | 'blue' | 'purple' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  showConnections?: boolean;
  showGrid?: boolean;
  showHubs?: boolean;
  autoRotate?: boolean;
  interactive?: boolean;
  speed?: number;
  className?: string;
  hubs?: GlobeHub[];
  connections?: GlobeConnection[];
}

// Convert spherical coordinates (lat, lon) to normalized unit vector on sphere
const latLonToUnit = (latDeg: number, lonDeg: number) => {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const x = -Math.cos(lat) * Math.cos(lon);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.sin(lon);
  const len = Math.sqrt(x * x + y * y + z * z);
  return { nx: x / len, ny: y / len, nz: z / len };
};

// Pre-calculate grid lines (latitudes and longitudes)
const gridLines: { nx: number; ny: number; nz: number }[][] = [];

// Latitude circles (-60° to +60°)
for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
  const line: { nx: number; ny: number; nz: number }[] = [];
  for (let lonDeg = 0; lonDeg <= 360; lonDeg += 5) {
    line.push(latLonToUnit(latDeg, lonDeg));
  }
  gridLines.push(line);
}

// Longitude meridians (every 30°)
for (let lonDeg = 0; lonDeg < 360; lonDeg += 30) {
  const line: { nx: number; ny: number; nz: number }[] = [];
  for (let latDeg = -80; latDeg <= 80; latDeg += 5) {
    line.push(latLonToUnit(latDeg, lonDeg));
  }
  gridLines.push(line);
}

// Pre-convert 2D coastlines coordinates to 3D unit vectors
const coastlinePaths = worldCoastlines.map((path) =>
  path.map(([lon, lat]) => latLonToUnit(lat, lon))
);

// Default Global Network Hubs
const defaultHubs: GlobeHub[] = [
  {
    name: 'NEW YORK (HQ)',
    lat: 40.7128,
    lon: -74.006,
    labelLines: ['NEW YORK (HQ)', '40.7128° N,', '74.0060° W'],
    isHQ: true,
  },
  {
    name: 'INDIA',
    lat: 20.5937,
    lon: 78.9629,
    labelLines: ['INDIA', '20.5937° N,', '78.9629° E'],
    isHQ: false,
  },
  {
    name: 'RUSSIA',
    lat: 55.7558,
    lon: 37.6173,
    labelLines: ['RUSSIA', '55.7558° N,', '37.6173° E'],
    isHQ: false,
  },
];

const defaultConnections: GlobeConnection[] = [];

export const OrbitGlobe: React.FC<OrbitGlobeProps> = ({
  color = 'black',
  size = 'md',
  showConnections = false,
  showGrid = true,
  showHubs = false,
  autoRotate = true,
  interactive = true,
  speed = 1.0,
  className = '',
  hubs = defaultHubs,
  connections = defaultConnections,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Theme Color Map
  const themeColors = {
    black: {
      coastline: 'rgba(255, 255, 255, 0.22)',
      grid: 'rgba(255, 255, 255, 0.035)',
      arc: 'rgba(160, 165, 175, 0.65)',
      photon: 'rgba(255, 255, 255, 0.85)',
      photonGlow: 'rgba(255, 255, 255, 0.6)',
      node: 'rgba(140, 145, 155, 0.75)',
      nodeActive: 'rgba(255, 255, 255, 0.85)',
      textPrimary: 'rgba(255, 255, 255, 0.85)',
      textCoords: 'rgba(161, 161, 170, 0.65)',
    },
    red: {
      coastline: 'rgba(255, 117, 140, 0.45)',
      grid: 'rgba(255, 117, 140, 0.06)',
      arc: 'rgba(255, 117, 140, 0.85)',
      photon: '#ffe4e6',
      photonGlow: 'rgba(255, 117, 140, 0.95)',
      node: 'rgba(255, 117, 140, 0.85)',
      nodeActive: '#ff758c',
      textPrimary: '#ffe4e6',
      textCoords: 'rgba(254, 205, 211, 0.75)',
    },
    amber: {
      coastline: 'rgba(251, 191, 36, 0.55)',
      grid: 'rgba(251, 191, 36, 0.1)',
      arc: 'rgba(245, 158, 11, 0.85)',
      photon: '#fef08a',
      photonGlow: 'rgba(251, 191, 36, 0.95)',
      node: 'rgba(245, 158, 11, 0.9)',
      nodeActive: '#fbbf24',
      textPrimary: '#fef08a',
      textCoords: 'rgba(252, 211, 77, 0.75)',
    },
    blue: {
      coastline: 'rgba(56, 189, 248, 0.55)',
      grid: 'rgba(56, 189, 248, 0.1)',
      arc: 'rgba(14, 165, 233, 0.85)',
      photon: '#e0f2fe',
      photonGlow: 'rgba(56, 189, 248, 0.95)',
      node: 'rgba(14, 165, 233, 0.9)',
      nodeActive: '#38bdf8',
      textPrimary: '#e0f2fe',
      textCoords: 'rgba(125, 211, 252, 0.75)',
    },
    purple: {
      coastline: 'rgba(192, 132, 252, 0.55)',
      grid: 'rgba(192, 132, 252, 0.1)',
      arc: 'rgba(168, 85, 247, 0.85)',
      photon: '#f3e8ff',
      photonGlow: 'rgba(192, 132, 252, 0.95)',
      node: 'rgba(168, 85, 247, 0.9)',
      nodeActive: '#c084fc',
      textPrimary: '#f3e8ff',
      textCoords: 'rgba(216, 180, 254, 0.75)',
    },
    emerald: {
      coastline: 'rgba(52, 211, 153, 0.55)',
      grid: 'rgba(52, 211, 153, 0.1)',
      arc: 'rgba(16, 185, 129, 0.85)',
      photon: '#d1fae5',
      photonGlow: 'rgba(52, 211, 153, 0.95)',
      node: 'rgba(16, 185, 129, 0.9)',
      nodeActive: '#34d399',
      textPrimary: '#d1fae5',
      textCoords: 'rgba(110, 231, 183, 0.75)',
    },
  }[color];

  // Balanced, elegant dimensions with comfortable breathing room
  const canvasDimensions = {
    sm: { width: 360, height: 320, radius: 440, cameraZ: 1300 },
    md: { width: 420, height: 380, radius: 520, cameraZ: 1300 },
    lg: { width: 500, height: 440, radius: 600, cameraZ: 1300 },
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, radius, cameraZ } = canvasDimensions;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const fov = 58;
    const fovRad = (fov / 2) * Math.PI / 180;
    const projScale = (height / 2) / Math.tan(fovRad);

    let rotationY = 0;
    let rotationX = 0.22; // Natural orbital tilt
    let velX = 0;
    let velY = 0;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      lastX = clientX;
      lastY = clientY;
      velX = 0;
      velY = 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !interactive) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - lastX;
      const deltaY = clientY - lastY;

      rotationY += deltaX * 0.007;
      rotationX = Math.max(-Math.PI / 2.8, Math.min(Math.PI / 2.8, rotationX - deltaY * 0.007));

      velY = deltaX * 0.004;
      velX = -deltaY * 0.004;

      lastX = clientX;
      lastY = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    let animationFrameId: number | null = null;
    let isIntersecting = true;

    // Map hubs to unit vectors
    const hubMap = new Map<string, { hub: GlobeHub; vec: { nx: number; ny: number; nz: number } }>();
    hubs.forEach((hub) => {
      hubMap.set(hub.name, {
        hub,
        vec: latLonToUnit(hub.lat, hub.lon),
      });
    });

    function animate() {
      if (!ctx || !isIntersecting) return;
      ctx.clearRect(0, 0, width, height);

      // Inertial momentum + Auto-rotation
      if (isDragging) {
        // Direct manual tracking
      } else {
        if (Math.abs(velY) > 0.0001 || Math.abs(velX) > 0.0001) {
          rotationY += velY;
          rotationX = Math.max(-Math.PI / 2.8, Math.min(Math.PI / 2.8, rotationX + velX));
          velY *= 0.94; // Viscous friction
          velX *= 0.94;
        } else if (autoRotate) {
          rotationY += 0.0055 * speed;
        }
      }

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // 1. Latitude / Longitude Wireframe Grid
      if (showGrid) {
        ctx.strokeStyle = themeColors.grid;
        ctx.lineWidth = 0.9;

        gridLines.forEach((line) => {
          const projectedPoints: { sx: number; sy: number; front: boolean }[] = [];

          line.forEach((pt) => {
            const wx = pt.nx * radius;
            const wy = pt.ny * radius;
            const wz = pt.nz * radius;

            const r1x = wx * cosY - wz * sinY;
            const r1z = wx * sinY + wz * cosY;
            const r1y = wy;

            const rx = r1x;
            const ry = r1y * cosX - r1z * sinX;
            const rz = r1y * sinX + r1z * cosX;

            const eyeZ = cameraZ - rz;
            if (eyeZ <= 0) return;

            const sx = (rx * projScale) / eyeZ + width / 2;
            const sy = -(ry * projScale) / eyeZ + height / 2;

            projectedPoints.push({ sx, sy, front: rz > -radius * 0.3 });
          });

          if (projectedPoints.length > 1) {
            ctx.beginPath();
            let drawing = false;

            for (let i = 0; i < projectedPoints.length; i++) {
              const p = projectedPoints[i];
              if (p.front) {
                if (!drawing) {
                  ctx.moveTo(p.sx, p.sy);
                  drawing = true;
                } else {
                  ctx.lineTo(p.sx, p.sy);
                }
              } else {
                drawing = false;
              }
            }
            ctx.stroke();
          }
        });
      }

      // 2. Earth Vector Coastlines
      coastlinePaths.forEach((path) => {
        const projectedPoints: { sx: number; sy: number; front: boolean }[] = [];

        path.forEach((pt) => {
          const scale = radius;
          const wx = pt.nx * scale;
          const wy = pt.ny * scale;
          const wz = pt.nz * scale;

          const r1x = wx * cosY - wz * sinY;
          const r1z = wx * sinY + wz * cosY;
          const r1y = wy;

          const rx = r1x;
          const ry = r1y * cosX - r1z * sinX;
          const rz = r1y * sinX + r1z * cosX;

          const eyeZ = cameraZ - rz;
          if (eyeZ <= 0) return;

          const sx = (rx * projScale) / eyeZ + width / 2;
          const sy = -(ry * projScale) / eyeZ + height / 2;

          projectedPoints.push({ sx, sy, front: rz > -radius * 0.35 });
        });

        if (projectedPoints.length > 1) {
          ctx.beginPath();
          let drawing = false;

          for (let i = 0; i < projectedPoints.length; i++) {
            const p = projectedPoints[i];
            if (p.front) {
              if (!drawing) {
                ctx.moveTo(p.sx, p.sy);
                drawing = true;
              } else {
                ctx.lineTo(p.sx, p.sy);
              }
            } else {
              drawing = false;
            }
          }

          ctx.strokeStyle = themeColors.coastline;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      });

      // 3. Optional Great-Circle Flight Arcs & Travelling Photons
      if (showConnections && connections.length > 0) {
        connections.forEach((conn, connIdx) => {
          const fromNode = hubMap.get(conn.from);
          const toNode = hubMap.get(conn.to);
          if (!fromNode || !toNode) return;

          const pointsOnArc: { sx: number; sy: number; depth: number }[] = [];
          const steps = 36;
          const altitude = conn.altitude || 42;

          for (let step = 0; step <= steps; step++) {
            const t = step / steps;
            const x = fromNode.vec.nx * (1 - t) + toNode.vec.nx * t;
            const y = fromNode.vec.ny * (1 - t) + toNode.vec.ny * t;
            const z = fromNode.vec.nz * (1 - t) + toNode.vec.nz * t;
            const len = Math.sqrt(x * x + y * y + z * z);
            if (len === 0) continue;

            const nx = x / len;
            const ny = y / len;
            const nz = z / len;

            const arcElevation = altitude * Math.sin(t * Math.PI);
            const scale = radius + arcElevation;

            const wx = nx * scale;
            const wy = ny * scale;
            const wz = nz * scale;

            const r1x = wx * cosY - wz * sinY;
            const r1z = wx * sinY + wz * cosY;
            const r1y = wy;

            const rx = r1x;
            const ry = r1y * cosX - r1z * sinX;
            const rz = r1y * sinX + r1z * cosX;

            const eyeZ = cameraZ - rz;
            if (eyeZ <= 0) continue;

            const sx = (rx * projScale) / eyeZ + width / 2;
            const sy = -(ry * projScale) / eyeZ + height / 2;

            pointsOnArc.push({ sx, sy, depth: rz });
          }

          if (pointsOnArc.length > 1) {
            ctx.beginPath();
            ctx.moveTo(pointsOnArc[0].sx, pointsOnArc[0].sy);
            for (let k = 1; k < pointsOnArc.length; k++) {
              ctx.lineTo(pointsOnArc[k].sx, pointsOnArc[k].sy);
            }
            ctx.strokeStyle = themeColors.arc;
            ctx.lineWidth = 1.3;
            ctx.stroke();

            const speedFactor = conn.speed || 0.0009;
            const seedOffset = (connIdx * 0.33) % 1.0;
            const travelT = (Date.now() * speedFactor + seedOffset) % 1.0;

            const idx = Math.floor(travelT * (pointsOnArc.length - 1));
            const nextIdx = Math.min(idx + 1, pointsOnArc.length - 1);
            const subT = travelT * (pointsOnArc.length - 1) - idx;

            const ptA = pointsOnArc[idx];
            const ptB = pointsOnArc[nextIdx];

            if (ptA && ptB) {
              const dotSx = ptA.sx * (1 - subT) + ptB.sx * subT;
              const dotSy = ptA.sy * (1 - subT) + ptB.sy * subT;

              ctx.fillStyle = themeColors.photon;
              ctx.beginPath();
              ctx.arc(dotSx, dotSy, 3.5, 0, 2 * Math.PI);
              ctx.fill();

              ctx.strokeStyle = themeColors.photonGlow;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(dotSx, dotSy, 7.5, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
        });
      }

      // 4. Optional Hub Pins & Monospace Coordinates
      if (showHubs && hubs.length > 0) {
        hubs.forEach((hub) => {
          const item = hubMap.get(hub.name);
          if (!item) return;

          const wx = item.vec.nx * radius;
          const wy = item.vec.ny * radius;
          const wz = item.vec.nz * radius;

          const r1x = wx * cosY - wz * sinY;
          const r1z = wx * sinY + wz * cosY;
          const r1y = wy;

          const rx = r1x;
          const ry = r1y * cosX - r1z * sinX;
          const rz = r1y * sinX + r1z * cosX;

          const eyeZ = cameraZ - rz;
          if (eyeZ <= 0) return;

          const sx = (rx * projScale) / eyeZ + width / 2;
          const sy = -(ry * projScale) / eyeZ + height / 2;

          if (rz > -radius * 0.2) {
            ctx.fillStyle = hub.isHQ ? themeColors.nodeActive : themeColors.node;
            ctx.fillRect(sx - 3.5, sy - 3.5, 7, 7);

            if (hub.isHQ) {
              ctx.strokeStyle = themeColors.nodeActive;
              ctx.lineWidth = 1;
              ctx.strokeRect(sx - 5.5, sy - 5.5, 11, 11);
            }

            let offsetY = -8;
            hub.labelLines.forEach((line, lineIdx) => {
              ctx.fillStyle =
                lineIdx === 0 ? themeColors.textPrimary : themeColors.textCoords;
              ctx.font =
                lineIdx === 0
                  ? `700 9px "Ubuntu Sans", -apple-system, monospace, sans-serif`
                  : `500 8px "Ubuntu Sans", -apple-system, monospace, sans-serif`;
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(`  ${line}`, sx + 6, sy + offsetY);
              offsetY += 10;
            });
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          if (!animationFrameId) {
            animate();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      },
      { rootMargin: '200px', threshold: 0 }
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [color, size, showConnections, showGrid, showHubs, autoRotate, interactive, speed, hubs, connections]);

  return (
    <div
      ref={containerRef}
      className={`orbit-globe-wrapper theme-${color} size-${size} ${className}`}
      aria-label="Atronix 3D Orbital Wireframe Globe"
    >
      <div className="orbit-globe-canvas-container">
        {/* Atmospheric Glow Halo behind the sphere */}
        <div className="orbit-globe-halo" />

        {/* 3D Wireframe Canvas */}
        <canvas ref={canvasRef} className="orbit-globe-canvas" />
      </div>
    </div>
  );
};

export default OrbitGlobe;
