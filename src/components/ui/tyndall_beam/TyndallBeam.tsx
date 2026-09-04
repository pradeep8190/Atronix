"use client";

import React, { useRef, useEffect, useMemo } from "react";
import "./TyndallBeam.css";

export interface TyndallBeamProps {
  theme?: "amber" | "black" | "blue" | "emerald" | "purple";
  color?: string;
  particleCount?: number;
  dustSpeed?: number;
  beamIntensity?: number;
  showOverlay?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const themeColorways = {
  amber: {
    // Champagne Gold / Physical Sunbeam
    beamCore: [0.98, 0.92, 0.82],
    beamHaze: [0.82, 0.68, 0.46],
    moteSpecular: [1.0, 0.98, 0.94],
    moteWarmth: [0.92, 0.75, 0.50],
  },
  black: {
    // Obsidian Silver / Cinema Xenon
    beamCore: [0.96, 0.98, 1.0],
    beamHaze: [0.65, 0.70, 0.78],
    moteSpecular: [1.0, 1.0, 1.0],
    moteWarmth: [0.75, 0.80, 0.88],
  },
  blue: {
    // Deep Cryo Sapphire
    beamCore: [0.80, 0.92, 1.0],
    beamHaze: [0.35, 0.65, 0.95],
    moteSpecular: [0.92, 0.98, 1.0],
    moteWarmth: [0.45, 0.75, 1.0],
  },
  emerald: {
    // Canopy Jade
    beamCore: [0.84, 0.98, 0.88],
    beamHaze: [0.38, 0.82, 0.56],
    moteSpecular: [0.92, 1.0, 0.95],
    moteWarmth: [0.42, 0.88, 0.60],
  },
  purple: {
    // Celestial Violet
    beamCore: [0.92, 0.85, 1.0],
    beamHaze: [0.72, 0.45, 0.92],
    moteSpecular: [0.96, 0.92, 1.0],
    moteWarmth: [0.78, 0.52, 0.98],
  },
};

// 1. Pass: Physical Volumetric Light Shaft (Diagonal Path Only, Pitch-Black Outside)
const quadVertShader = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const quadFragShader = `
precision highp float;
varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_beamCore;
uniform vec3 u_beamHaze;
uniform float u_intensity;

void main() {
  vec2 st = v_uv;
  float aspect = (u_resolution.y > 0.0) ? (u_resolution.x / u_resolution.y) : 1.777;
  st.x *= aspect;

  // Beam source: Top-right corner
  vec2 source = vec2(aspect * 0.96, 1.0);
  // Target pointing diagonally down-left across the screen
  vec2 target = vec2(-0.15 * aspect, 0.28);
  vec2 beamDir = normalize(target - source);
  vec2 beamPerp = vec2(-beamDir.y, beamDir.x);

  vec2 toPoint = st - source;
  float proj = dot(toPoint, beamDir);

  // Strictly behind or at the source -> pitch black
  if (proj <= 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Perpendicular distance to the central ray
  float distToAxis = abs(dot(toPoint, beamPerp));

  // Conical spread: starts focused at the aperture, gently expanding diagonally
  float coneHalfWidth = 0.035 + proj * 0.19;

  // Hard physical bound: outside the cone is 100% pitch black!
  if (distToAxis > coneHalfWidth) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Cross-sectional radial falloff within the cone (feathered soft edge)
  float q = distToAxis / coneHalfWidth;
  float crossProfile = smoothstep(1.0, 0.15, q);
  float coreGlow = exp(-q * q * 3.2) * 0.65;

  // Inverse distance attenuation along the beam path
  float pathAtten = exp(-proj * 0.62);

  // Atmospheric micro-turbulence wave in the beam
  float turb = sin(proj * 4.5 - u_time * 0.35) * 0.03;
  float beamIntensity = (crossProfile * 0.35 + coreGlow * 0.65 + turb) * pathAtten * u_intensity;

  vec3 beamColor = mix(u_beamHaze, u_beamCore, coreGlow);
  vec3 finalColor = beamColor * (beamIntensity * 0.28);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// 2. Pass: Physical Suspended Dust Motes (Uniform Micro-Particles, Light-Driven Luminance)
const moteVertShader = `
precision highp float;

attribute vec3 a_position; // [x, y, z]
attribute vec3 a_params;   // [phase, speed, glintFreq]

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dpr;
uniform float u_speedMultiplier;
uniform vec2 u_mouse;
uniform float u_mouseVelocity;

varying float v_light;
varying float v_phase;
varying float v_core;

void main() {
  vec3 pos = a_position;
  float phase = a_params.x;
  float speed = a_params.y * u_speedMultiplier;
  float glintFreq = a_params.z;

  // 3D Brownian laminar drift (calm, meditative, zero jerk)
  float t = u_time * speed * 0.06;
  pos.x += sin(pos.y * 2.8 + t + phase) * 0.07 + cos(pos.z * 3.1 + t * 0.8) * 0.04;
  pos.y -= t * 0.28 + sin(pos.x * 2.5 + t * 0.7) * 0.05; // Gentle settling drift
  pos.z += sin(pos.x * 2.0 + pos.y * 1.8 + t * 0.4) * 0.04;

  // Continuous seamless toroidal wrap in 3D
  pos.x = mod(pos.x + 1.0, 2.0) - 1.0;
  pos.y = mod(pos.y + 1.0, 2.0) - 1.0;

  // Interactive air displacement under mouse velocity
  vec2 screenPos = pos.xy;
  vec2 toMouse = screenPos - u_mouse;
  float mouseDist = length(toMouse);
  if (mouseDist < 0.28 && u_mouseVelocity > 0.001) {
    float force = (1.0 - mouseDist / 0.28) * u_mouseVelocity * 0.06;
    pos.xy += normalize(toMouse) * force;
  }

  // Convert to aspect-corrected screen coordinates
  float aspect = (u_resolution.y > 0.0) ? (u_resolution.x / u_resolution.y) : 1.777;
  vec2 st = vec2(pos.x * 0.5 + 0.5, pos.y * 0.5 + 0.5);
  st.x *= aspect;

  // Physical light ray parameters (matches the beam quad exactly)
  vec2 source = vec2(aspect * 0.96, 1.0);
  vec2 target = vec2(-0.15 * aspect, 0.28);
  vec2 beamDir = normalize(target - source);
  vec2 beamPerp = vec2(-beamDir.y, beamDir.x);

  vec2 toPoint = st - source;
  float proj = dot(toPoint, beamDir);
  float distToAxis = abs(dot(toPoint, beamPerp));

  // Light field calculation
  float light = 0.0;
  float core = 0.0;
  if (proj > 0.0) {
    float coneHalfWidth = 0.035 + proj * 0.19;
    if (distToAxis <= coneHalfWidth) {
      float q = distToAxis / coneHalfWidth;
      float cross = smoothstep(1.0, 0.15, q);
      core = exp(-q * q * 3.5);
      float atten = exp(-proj * 0.55);
      light = (cross * 0.4 + core * 0.85) * atten;
    }
  }

  v_light = light;
  v_phase = phase + t * glintFreq;
  v_core = core;

  // UNIFORM MICRO-SIZE: All dust particles are tiny physical specs (1.4px to 2.6px)
  // No big bokeh circles!
  float microSize = (1.6 + 0.5 * sin(phase * 4.0)) * u_dpr;
  gl_PointSize = clamp(microSize, 1.2, 3.2);

  gl_Position = vec4(pos.xy, 0.0, 1.0);
}
`;

const moteFragShader = `
precision highp float;

uniform vec3 u_moteSpecular;
uniform vec3 u_moteWarmth;

varying float v_light;
varying float v_phase;
varying float v_core;

void main() {
  // Outside the light path -> strictly 0 opacity (dust is invisible in pitch black)
  if (v_light <= 0.003) {
    discard;
  }

  // Crisp circular micro-disc with smooth subpixel edge
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord) * 2.0;
  if (dist > 1.0) {
    discard;
  }

  // Microscopic specular facet twinkle (catching light as it tumbles in the air)
  float twinkle = pow(max(0.0, sin(v_phase * 3.14159)), 6.0) * 0.65 + 0.35;

  // Physical luminance based strictly on position inside the light cone
  float luminance = v_light * twinkle * 2.4;

  // Sharp diamond glint core
  float edgeAntialias = smoothstep(1.0, 0.4, dist);
  float specularCore = exp(-dist * dist * 4.5);

  vec3 particleColor = mix(u_moteWarmth, u_moteSpecular, v_core * 0.7 + specularCore * 0.3);
  float alpha = edgeAntialias * clamp(luminance, 0.0, 1.0);

  if (alpha < 0.005) {
    discard;
  }

  gl_FragColor = vec4(particleColor * alpha, alpha);
}
`;

export const TyndallBeam: React.FC<TyndallBeamProps> = ({
  theme = "amber",
  color,
  particleCount = 3800,
  dustSpeed = 1.0,
  beamIntensity = 1.0,
  showOverlay = false,
  size = "md",
  className = "",
  style,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, lastX: 0.5, lastY: 0.5 });

  const activeTheme = useMemo(() => {
    if (color && color in themeColorways) {
      return color as keyof typeof themeColorways;
    }
    return theme;
  }, [color, theme]);

  const themeConfig = themeColorways[activeTheme] || themeColorways.amber;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (vsSource: string, fsSource: string) => {
      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return null;

      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program error:", gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    };

    // 1. Program: Volumetric Light Cone
    const quadProgram = createProgram(quadVertShader, quadFragShader);
    if (!quadProgram) return;

    const quadPosLoc = gl.getAttribLocation(quadProgram, "a_pos");
    const quadResLoc = gl.getUniformLocation(quadProgram, "u_resolution");
    const quadTimeLoc = gl.getUniformLocation(quadProgram, "u_time");
    const quadCoreLoc = gl.getUniformLocation(quadProgram, "u_beamCore");
    const quadHazeLoc = gl.getUniformLocation(quadProgram, "u_beamHaze");
    const quadIntLoc = gl.getUniformLocation(quadProgram, "u_intensity");

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    // 2. Program: Physical Dust Motes
    const moteProgram = createProgram(moteVertShader, moteFragShader);
    if (!moteProgram) return;

    const motePosLoc = gl.getAttribLocation(moteProgram, "a_position");
    const moteParamsLoc = gl.getAttribLocation(moteProgram, "a_params");

    const moteResLoc = gl.getUniformLocation(moteProgram, "u_resolution");
    const moteTimeLoc = gl.getUniformLocation(moteProgram, "u_time");
    const moteDprLoc = gl.getUniformLocation(moteProgram, "u_dpr");
    const moteSpeedLoc = gl.getUniformLocation(moteProgram, "u_speedMultiplier");
    const moteMouseLoc = gl.getUniformLocation(moteProgram, "u_mouse");
    const moteMouseVelLoc = gl.getUniformLocation(moteProgram, "u_mouseVelocity");
    const moteSpecLoc = gl.getUniformLocation(moteProgram, "u_moteSpecular");
    const moteWarmLoc = gl.getUniformLocation(moteProgram, "u_moteWarmth");

    // Initialize 3,800 micro dust motes
    const count = particleCount;
    const posData = new Float32Array(count * 3);
    const paramData = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Natural ambient distribution across the volume
      posData[i * 3 + 0] = (Math.random() * 2 - 1) * 1.05;
      posData[i * 3 + 1] = (Math.random() * 2 - 1) * 1.05;
      posData[i * 3 + 2] = Math.random() * 2.0;

      // params: [phase, driftSpeed, glintFrequency]
      paramData[i * 3 + 0] = Math.random() * Math.PI * 2;
      paramData[i * 3 + 1] = 0.5 + Math.random() * 0.9;
      paramData[i * 3 + 2] = 1.0 + Math.random() * 2.5;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, posData, gl.STATIC_DRAW);

    const paramBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paramBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, paramData, gl.STATIC_DRAW);

    let animationFrameId: number;
    let startTime = performance.now();
    let currentWidth = 800;
    let currentHeight = 600;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const w = rect.width > 0 ? rect.width : (canvas.clientWidth > 0 ? canvas.clientWidth : (containerRef.current.parentElement?.clientWidth || window.innerWidth || 800));
      const h = rect.height > 0 ? rect.height : (canvas.clientHeight > 0 ? canvas.clientHeight : (containerRef.current.parentElement?.clientHeight || 600));

      const targetW = Math.max(20, Math.floor(w * dpr));
      const targetH = Math.max(20, Math.floor(h * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH || currentWidth !== targetW || currentHeight !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        currentWidth = targetW;
        currentHeight = targetH;
        gl.viewport(0, 0, targetW, targetH);
      }
    };

    resize();
    const rafInit = requestAnimationFrame(resize);
    const timerInit = setTimeout(resize, 60);

    const observer = new ResizeObserver(resize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const dx = nx - mouseRef.current.lastX;
      const dy = ny - mouseRef.current.lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
      mouseRef.current.lastX = nx;
      mouseRef.current.lastY = ny;
      mouseRef.current.vx = Math.min(dist * 3.5, 1.0);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      if (currentWidth <= 20 || currentHeight <= 20 || canvas.width <= 20) {
        resize();
      }

      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      mouseRef.current.vx *= 0.93;

      // PURE PITCH BLACK (0, 0, 0)
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 1. Render Physical Volumetric Light Shaft
      gl.disable(gl.BLEND);
      gl.useProgram(quadProgram);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(quadPosLoc);
      gl.vertexAttribPointer(quadPosLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(quadResLoc, currentWidth, currentHeight);
      gl.uniform1f(quadTimeLoc, elapsed);
      gl.uniform3fv(quadCoreLoc, themeConfig.beamCore);
      gl.uniform3fv(quadHazeLoc, themeConfig.beamHaze);
      gl.uniform1f(quadIntLoc, beamIntensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // 2. Render Light-Illuminated Micro Dust Motes (1 Draw Call gl.POINTS)
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE); // Additive optical photon accumulation

      gl.useProgram(moteProgram);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(motePosLoc);
      gl.vertexAttribPointer(motePosLoc, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, paramBuffer);
      gl.enableVertexAttribArray(moteParamsLoc);
      gl.vertexAttribPointer(moteParamsLoc, 3, gl.FLOAT, false, 0, 0);

      gl.uniform2f(moteResLoc, currentWidth, currentHeight);
      gl.uniform1f(moteTimeLoc, elapsed);
      gl.uniform1f(moteDprLoc, dpr);
      gl.uniform1f(moteSpeedLoc, dustSpeed);
      gl.uniform2f(moteMouseLoc, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(moteMouseVelLoc, mouseRef.current.vx);
      gl.uniform3fv(moteSpecLoc, themeConfig.moteSpecular);
      gl.uniform3fv(moteWarmLoc, themeConfig.moteWarmth);

      gl.drawArrays(gl.POINTS, 0, count);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(rafInit);
      clearTimeout(timerInit);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      gl.deleteProgram(quadProgram);
      gl.deleteProgram(moteProgram);
      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(paramBuffer);
    };
  }, [activeTheme, particleCount, dustSpeed, beamIntensity]);

  return (
    <div
      ref={containerRef}
      className={`tyndall-beam-container size-${size} ${className}`}
      style={style}
      onClick={onClick}
    >
      <canvas ref={canvasRef} className="tyndall-canvas" />

      {showOverlay && (
        <div className="tyndall-content">
          <div className="tyndall-badge">
            <span className="tyndall-badge-dot" />
            <span className="tyndall-badge-text">Tyndall Optical Scattering</span>
          </div>
          <h2 className="tyndall-title">
            Tranquil <span>Celestial Beam</span>
          </h2>
          <p className="tyndall-subtitle">
            Suspended micro dust motes illuminated strictly inside a physical volumetric champagne light cone.
          </p>
        </div>
      )}
    </div>
  );
};

export default TyndallBeam;
