"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./FlowingTabs.css";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface FlowingTabsProps {
  tabs?: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (tabId: string) => void;
  theme?: "black" | "amber" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const defaultTabsList: TabItem[] = [
  {
    id: "preview",
    label: "Preview",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: "code",
    label: "Code",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

const themeConfigs = {
  black: {
    glassTint: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
  },
  amber: {
    glassTint: [1.0, 0.82, 0.45],
    accentHex: "#f59e0b",
  },
  blue: {
    glassTint: [0.65, 0.85, 1.0],
    accentHex: "#38bdf8",
  },
  purple: {
    glassTint: [0.85, 0.7, 1.0],
    accentHex: "#c084fc",
  },
  emerald: {
    glassTint: [0.65, 1.0, 0.8],
    accentHex: "#34d399",
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
  },
};

const sizeScales = {
  sm: 0.88,
  md: 1.0,
  lg: 1.15,
};

export const FlowingTabs: React.FC<FlowingTabsProps> = ({
  tabs = defaultTabsList,
  activeId: controlledActiveId,
  defaultActiveId,
  onChange,
  theme = "black",
  color,
  size = "md",
  disabled = false,
  className = "",
}) => {
  const effectiveTheme = (color as keyof typeof themeConfigs) || theme || "black";
  const themeConfig = themeConfigs[effectiveTheme] || themeConfigs.black;
  const scale = sizeScales[size] || 1.0;

  const initialId = controlledActiveId || defaultActiveId || (tabs[0] ? tabs[0].id : "");
  const [selectedId, setSelectedId] = useState<string>(initialId);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active pool index: 0.0 (Pool A / Left) -> 1.0 (Pool B / Right)
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === selectedId));
  const normTarget = activeIndex === 0 ? 0.0 : 1.0;

  // Real-Time Hydraulic Fluid Siphon State
  const transferProgressRef = useRef(normTarget);
  const targetTransferRef = useRef(normTarget);
  const flowVelocityRef = useRef(0);
  const sloshRippleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Sync controlled state
  useEffect(() => {
    if (controlledActiveId !== undefined) {
      setSelectedId(controlledActiveId);
      const newIdx = Math.max(0, tabs.findIndex((t) => t.id === controlledActiveId));
      targetTransferRef.current = newIdx === 0 ? 0.0 : 1.0;
    }
  }, [controlledActiveId, tabs]);

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (disabled || tabId === selectedId) return;
      const newIdx = Math.max(0, tabs.findIndex((t) => t.id === tabId));
      targetTransferRef.current = newIdx === 0 ? 0.0 : 1.0;

      if (controlledActiveId === undefined) {
        setSelectedId(tabId);
      }
      onChange?.(tabId);
    },
    [disabled, selectedId, controlledActiveId, onChange, tabs]
  );

  // WebGL True Dual-Pool Liquid Transfer & Bridge Siphon Shader
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Pure Mathematical Fluid Drainage, Capillary Bridge Siphon & Slosh Shader
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_progress;   // 0.0 (Left Pool full) -> 1.0 (Right Pool full)
      uniform float u_velocity;   // Live flow speed
      uniform float u_slosh;      // Arrival impact ripple
      uniform float u_dpr;
      uniform vec3 u_tint;

      // Inigo Quilez 2D Rounded Box SDF
      float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
        r.xy = (p.x > 0.0) ? r.xy : r.zw;
        r.x  = (p.y > 0.0) ? r.x  : r.y;
        vec2 q = abs(p) - b + r.x;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
      }

      // Exact 2D Capsule Segment SDF
      float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
        vec2 pa = p - a, ba = b - a;
        float d2 = dot(ba, ba);
        if (d2 < 0.0001) return length(pa) - r;
        float h = clamp(dot(pa, ba) / d2, 0.0, 1.0);
        return length(pa - ba * h) - r;
      }

      // Inigo Quilez Smooth Minimum (Metaball Fluid Fusion)
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // Dual-Reservoir Liquid Scene
      float mapScene(vec2 p, float u, float vel, float slosh) {
        float centerX = u_resolution.x * 0.5;
        float centerY = u_resolution.y * 0.5;

        // Two Reservoir Positions inside the Sluice Housing
        vec2 leftPoolCenter = vec2(centerX - 54.0 * u_dpr, centerY);
        vec2 rightPoolCenter = vec2(centerX + 54.0 * u_dpr, centerY);

        // --- Volumetric Siphon Transfer Dynamics ---
        // As u moves 0 -> 1:
        // Pool A (Left) drains its liquid: volumeA goes 1.0 -> 0.0
        // Pool B (Right) fills with liquid: volumeB goes 0.0 -> 1.0
        float volumeA = clamp(1.0 - u * 1.25, 0.0, 1.0);
        float volumeB = clamp((u - 0.20) * 1.25, 0.0, 1.0);

        // 1. Left Reservoir Liquid Body (Drains and contracts towards the gate)
        float leftHalfW = mix(0.0, 50.0 * u_dpr, volumeA);
        float leftHalfH = mix(0.0, 18.0 * u_dpr, volumeA);
        float dPoolA = 999.0;
        if (volumeA > 0.001) {
          // Creeps toward the central gate as it pours out
          vec2 pA = p;
          float creepA = (1.0 - volumeA) * (14.0 * u_dpr);
          pA.x -= creepA;
          dPoolA = sdRoundedBox(pA - leftPoolCenter, vec2(leftHalfW, leftHalfH), vec4(10.0 * u_dpr * volumeA));
        }

        // 2. Right Reservoir Liquid Body (Fills and expands from the bottom floor)
        float rightHalfW = mix(0.0, 50.0 * u_dpr, volumeB);
        float rightHalfH = mix(0.0, 18.0 * u_dpr, volumeB);
        float dPoolB = 999.0;
        if (volumeB > 0.001) {
          vec2 pB = p;
          // Arrival slosh wave resonance
          float sloshOffset = sin((p.x - rightPoolCenter.x) * 0.2) * slosh * (5.5 * u_dpr);
          pB.y -= sloshOffset * 0.4;
          dPoolB = sdRoundedBox(pB - rightPoolCenter, vec2(rightHalfW, rightHalfH), vec4(10.0 * u_dpr * volumeB));
        }

        // 3. Siphon Capillary Liquid Bridge (Pouring across the central gate)
        // Highest volume at mid-transfer (u ~ 0.5), necks down and snaps off near the ends
        float bridgeActivity = sin(clamp(u, 0.0, 1.0) * 3.14159265);
        float bridgeThickness = bridgeActivity * (15.0 * u_dpr);
        
        // Fluid floor sag: gravity pulls the stream down slightly towards the bottom floor
        float floorSag = (bridgeThickness * 0.35);
        vec2 pStreamA = vec2(leftPoolCenter.x + leftHalfW, centerY + floorSag);
        vec2 pStreamB = vec2(rightPoolCenter.x - rightHalfW, centerY + floorSag);

        float dBridge = 999.0;
        if (bridgeActivity > 0.01) {
          dBridge = sdCapsule(p, pStreamA, pStreamB, bridgeThickness);
        }

        // 4. Fluid Fusion using Inigo Quilez Smooth Minimum (Metaball Meniscus)
        float dFluid = smin(dPoolA, dPoolB, 18.0 * u_dpr);
        dFluid = smin(dFluid, dBridge, 14.0 * u_dpr);

        return dFluid;
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_progress, u_velocity, u_slosh);

        if (d > 2.5 * u_dpr) {
          discard;
        }

        // Exact LiquidMitosis finite-difference surface normal gradient
        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_progress, u_velocity, u_slosh) - 
                   mapScene(vec2(p.x - eps, p.y), u_progress, u_velocity, u_slosh);
        float dy = mapScene(vec2(p.x, p.y + eps), u_progress, u_velocity, u_slosh) - 
                   mapScene(vec2(p.x, p.y - eps), u_progress, u_velocity, u_slosh);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // --- Core Optical Liquid Glass (ZERO Flat White Sheets) ---
        // 1. Pure Frosted Glass Base
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.052;

        // 2. Specular Top Linear Gloss Sheen
        float centerY = u_resolution.y * 0.5;
        float topEdgeY = centerY - 18.0 * u_dpr;
        float heightNorm = clamp((p.y - topEdgeY) / (16.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - heightNorm, 1.35) * 0.28 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 3. Crisp Surface Tension Rim Highlights
        float edge = smoothstep(1.5 * u_dpr, 0.0, abs(d));
        float topEdge = edge * clamp(-grad.y, 0.0, 1.0) * 0.30;
        float sideEdge = edge * 0.09;
        float botEdge = edge * clamp(grad.y, 0.0, 1.0) * 0.05;

        // 4. Fluid Caustic Stream Focus (Subtle internal refraction in the pouring neck)
        float streamRefract = 0.0;
        float centerX = u_resolution.x * 0.5;
        if (abs(u_velocity) > 0.1) {
          float gateDist = abs(p.x - centerX);
          streamRefract = exp(-gateDist * 0.06) * abs(u_velocity) * 0.18;
        }

        float totalAlpha = clamp(bodyAlpha + topGloss + topEdge + sideEdge + botEdge + streamRefract, 0.0, 0.98);
        vec3 col = u_tint * (1.0 + topGloss * 0.4 + streamRefract * 1.2);

        gl_FragColor = vec4(col * totalAlpha, totalAlpha);
      }
    `;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uProgressLoc = gl.getUniformLocation(program, "u_progress");
    const uVelocityLoc = gl.getUniformLocation(program, "u_velocity");
    const uSloshLoc = gl.getUniformLocation(program, "u_slosh");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");
    const uTintLoc = gl.getUniformLocation(program, "u_tint");

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let lastTime = performance.now();
    let wasAtTarget = true;

    // 120 FPS Fluid Volumetric Siphon Physics Loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const target = targetTransferRef.current;
      const current = transferProgressRef.current;

      // Hydrodynamic fluid pressure spring
      const k = 42.0; // Steady, viscous liquid siphon flow
      const c = 12.4; // Critical viscous damping

      const force = -k * (current - target) - c * flowVelocityRef.current;
      flowVelocityRef.current += force * dt;
      transferProgressRef.current += flowVelocityRef.current * dt;

      // Trigger destination impact slosh when liquid finishes pouring into the pool
      const distToTarget = Math.abs(transferProgressRef.current - target);
      if (distToTarget < 0.08 && !wasAtTarget && Math.abs(flowVelocityRef.current) > 0.25) {
        sloshRippleRef.current = 1.0;
        wasAtTarget = true;
      } else if (distToTarget > 0.3) {
        wasAtTarget = false;
      }

      if (distToTarget < 0.0003 && Math.abs(flowVelocityRef.current) < 0.0008) {
        transferProgressRef.current = target;
        flowVelocityRef.current = 0;
      }

      // Slosh wave decay
      if (sloshRippleRef.current > 0.001) {
        sloshRippleRef.current = Math.max(0, sloshRippleRef.current - dt * 2.8);
      }

      const cssWidth = 260;
      const cssHeight = 68;
      const pixelWidth = Math.floor(cssWidth * dpr);
      const pixelHeight = Math.floor(cssHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, pixelWidth, pixelHeight);
      gl.uniform1f(uProgressLoc, transferProgressRef.current);
      gl.uniform1f(uVelocityLoc, flowVelocityRef.current);
      gl.uniform1f(uSloshLoc, sloshRippleRef.current);
      gl.uniform1f(uDprLoc, dpr);
      gl.uniform3f(
        uTintLoc,
        themeConfig.glassTint[0],
        themeConfig.glassTint[1],
        themeConfig.glassTint[2]
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [themeConfig]);

  return (
    <div
      ref={containerRef}
      className={`flowing-tabs-container theme-${effectiveTheme} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
      role="tablist"
    >
      {/* Underlying WebGL Real Siphon Water Flow Canvas */}
      <canvas ref={canvasRef} className="flowing-tabs-canvas" aria-hidden="true" />

      {/* Interactive Tabs Header (2 Pools) */}
      <div className="flowing-tabs-track">
        {tabs.map((tab) => {
          const isActive = tab.id === selectedId;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`flowing-tab-btn ${isActive ? "is-active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
              disabled={disabled}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FlowingTabs;
