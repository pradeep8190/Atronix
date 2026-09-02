"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./MercurySlider.css";

export interface MercurySliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  label?: string;
  formatValue?: (val: number) => string;
  theme?: "black" | "amber" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const themeConfigs = {
  black: {
    glassTint: [1.0, 1.0, 1.0],
    beadColor: [0.95, 0.98, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.16)",
  },
  amber: {
    glassTint: [1.0, 0.88, 0.7],
    beadColor: [1.0, 0.72, 0.28],
    accentHex: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.28)",
  },
  blue: {
    glassTint: [0.65, 0.85, 1.0],
    beadColor: [0.35, 0.78, 1.0],
    accentHex: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.28)",
  },
  purple: {
    glassTint: [0.85, 0.7, 1.0],
    beadColor: [0.82, 0.52, 1.0],
    accentHex: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.28)",
  },
  emerald: {
    glassTint: [0.65, 1.0, 0.8],
    beadColor: [0.28, 0.95, 0.62],
    accentHex: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.28)",
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
    beadColor: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.22)",
  },
};

const sizeScales = {
  sm: 0.88,
  md: 1.0,
  lg: 1.15,
};

export const MercurySlider: React.FC<MercurySliderProps> = ({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  label = "Output Gain",
  formatValue = (v) => `${Math.round(v)}%`,
  theme = "black",
  color,
  size = "md",
  icon,
  disabled = false,
  className = "",
}) => {
  const effectiveTheme = (color as keyof typeof themeConfigs) || theme || "black";
  const themeConfig = themeConfigs[effectiveTheme] || themeConfigs.black;
  const scale = sizeScales[size] || 1.0;

  const [currentValue, setCurrentValue] = useState<number>(
    controlledValue !== undefined ? controlledValue : defaultValue
  );
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-Precision Mercury Droplet Physics
  const normPosRef = useRef((currentValue - min) / (max - min));
  const targetNormRef = useRef(normPosRef.current);
  const velocityRef = useRef(0);
  const stretchXRef = useRef(1);
  const stretchYRef = useRef(1);
  const animFrameRef = useRef<number | null>(null);

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setCurrentValue(controlledValue);
      const norm = clamp((controlledValue - min) / (max - min), 0, 1);
      targetNormRef.current = norm;
    }
  }, [controlledValue, min, max]);

  // Pointer Drag Handler with Overdrag Elasticity
  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const innerLeft = rect.left + 20;
      const innerWidth = rect.width - 40;
      const rawNorm = (clientX - innerLeft) / innerWidth;

      // Elastic resistance past boundaries
      let computedNorm = rawNorm;
      if (rawNorm < 0) {
        computedNorm = rawNorm * 0.35; // Resistance
      } else if (rawNorm > 1) {
        computedNorm = 1 + (rawNorm - 1) * 0.35;
      }

      targetNormRef.current = computedNorm;

      // Quantize value for callback
      const clamped = clamp(rawNorm, 0, 1);
      const steppedVal = Math.round((min + clamped * (max - min)) / step) * step;
      setCurrentValue(steppedVal);
      onChange?.(steppedVal);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Snap back target to [0, 1] range if overdragged
    targetNormRef.current = clamp(targetNormRef.current, 0, 1);
    onChangeEnd?.(currentValue);
  };

  // WebGL Mercury Droplet & Optical Channel Shader
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

    // High-End Liquid Mercury & Frosted Glass Track Shader
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_beadX;
      uniform float u_stretchX;
      uniform float u_stretchY;
      uniform float u_dpr;
      uniform vec3 u_tint;
      uniform vec3 u_beadColor;

      // Exact 2D Capsule SDF
      float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
        vec2 pa = p - a, ba = b - a;
        float d2 = dot(ba, ba);
        if (d2 < 0.0001) return length(pa) - r;
        float h = clamp(dot(pa, ba) / d2, 0.0, 1.0);
        return length(pa - ba * h) - r;
      }

      // Inigo Quilez Smooth Minimum
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // Mercury Droplet Scene
      float mapScene(vec2 p, float beadX, float sX, float sY) {
        float centerY = 32.0 * u_dpr;

        // 1. Frosted Glass Track Channel (Capsule positioned comfortably inside 340px canvas)
        float trackLeft = 50.0 * u_dpr;
        float trackRight = u_resolution.x - 50.0 * u_dpr;
        float trackRadius = 18.0 * u_dpr;
        float dTrack = sdCapsule(p, vec2(trackLeft, centerY), vec2(trackRight, centerY), trackRadius);

        // 2. Liquid Mercury Droplet Bead
        // Scales and elongates in direction of motion (squash & stretch)
        vec2 pBead = p;
        pBead.x = beadX + (p.x - beadX) / sX;
        pBead.y = centerY + (p.y - centerY) / sY;

        float beadRadius = 14.5 * u_dpr;
        float dBead = length(pBead - vec2(beadX, centerY)) - beadRadius;

        // Meniscus fusion: the mercury bead creates a subtle fluid meniscus with the channel
        return smin(dTrack, dBead, 16.0 * u_dpr);
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_beadX, u_stretchX, u_stretchY);

        if (d > 2.5 * u_dpr) {
          discard;
        }

        // Exact LiquidMitosis finite-difference gradient
        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_beadX, u_stretchX, u_stretchY) - 
                   mapScene(vec2(p.x - eps, p.y), u_beadX, u_stretchX, u_stretchY);
        float dy = mapScene(vec2(p.x, p.y + eps), u_beadX, u_stretchX, u_stretchY) - 
                   mapScene(vec2(p.x, p.y - eps), u_beadX, u_stretchX, u_stretchY);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // 1. Transparent Frosted Liquid Glass Base (Core signature dark glass)
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.045;

        // 2. Active Liquid Mercury Reservoir Fill (gentle fluid trail behind the bead)
        float fillMask = smoothstep(u_beadX + 3.0 * u_dpr, u_beadX - 3.0 * u_dpr, p.x) * 
                         smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);
        float fillGlow = fillMask * 0.055;

        // 3. Specular Top Linear Gloss Sheen
        float topEdgeY = 14.0 * u_dpr;
        float heightNorm = clamp((p.y - topEdgeY) / (18.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - heightNorm, 1.3) * 0.22 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 4. Crisp Inset Edge Highlights
        float edge = smoothstep(1.5 * u_dpr, 0.0, abs(d));
        float topEdge = edge * clamp(-grad.y, 0.0, 1.0) * 0.26;
        float sideEdge = edge * 0.08;
        float botEdge = edge * clamp(grad.y, 0.0, 1.0) * 0.04;

        // 5. Liquid Mercury Bead (Liquid Metal Core & Directional Specular Glint)
        float centerY = 32.0 * u_dpr;
        vec2 beadCenter = vec2(u_beadX, centerY);
        float distToBead = length(p - beadCenter);
        
        // Deep molten liquid bead core
        float beadCore = smoothstep(14.0 * u_dpr, 2.0 * u_dpr, distToBead) * 0.52;
        
        // Directional specular glint (light reflection hitting curved metal sphere)
        vec2 glintOffset = vec2(-3.0, -3.5) * u_dpr;
        float distToGlint = length(p - (beadCenter + glintOffset));
        float beadGlint = pow(clamp(1.0 - distToGlint / (7.0 * u_dpr), 0.0, 1.0), 3.2) * 0.85;

        float totalAlpha = clamp(bodyAlpha + fillGlow + topGloss + topEdge + sideEdge + botEdge + beadCore + beadGlint, 0.0, 0.98);
        
        // Blending track tint with rich liquid metal bead color
        vec3 trackCol = u_tint * (1.0 + topGloss * 0.35 + fillGlow * 1.8);
        float beadMixFactor = smoothstep(15.0 * u_dpr, 3.5 * u_dpr, distToBead);
        vec3 finalCol = mix(trackCol, u_beadColor * (1.1 + beadGlint * 0.9), beadMixFactor);

        gl_FragColor = vec4(finalCol * totalAlpha, totalAlpha);
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
    const uBeadXLoc = gl.getUniformLocation(program, "u_beadX");
    const uStretchXLoc = gl.getUniformLocation(program, "u_stretchX");
    const uStretchYLoc = gl.getUniformLocation(program, "u_stretchY");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");
    const uTintLoc = gl.getUniformLocation(program, "u_tint");
    const uBeadColorLoc = gl.getUniformLocation(program, "u_beadColor");

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

    // 120 FPS Mercury Droplet Hydrodynamic Physics Render Loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const target = targetNormRef.current;
      const current = normPosRef.current;

      // Heavy mercury mass spring-damper
      const k = 72.0; // Responsive tracking
      const c = 15.2; // Critical damping

      const force = -k * (current - target) - c * velocityRef.current;
      velocityRef.current += force * dt;
      normPosRef.current += velocityRef.current * dt;

      if (Math.abs(normPosRef.current - target) < 0.0003 && Math.abs(velocityRef.current) < 0.0008) {
        normPosRef.current = target;
        velocityRef.current = 0;
      }

      const vel = velocityRef.current;

      // Mercury volume-preserving droplet stretch during movement:
      // Moving fast horizontally: stretches horizontally (stretchX > 1), squashes vertically (stretchY < 1)
      const sX = 1.0 + clamp(Math.abs(vel) * 0.28, -0.2, 0.45);
      const sY = 1.0 / Math.sqrt(Math.max(sX, 0.4));

      stretchXRef.current = sX;
      stretchYRef.current = sY;

      const cssWidth = 340;
      const cssHeight = 64;
      const pixelWidth = Math.floor(cssWidth * dpr);
      const pixelHeight = Math.floor(cssHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      // Convert norm position [0, 1] to pixel X inside the channel
      const trackPadding = 50.0 * dpr;
      const trackWidth = (290.0 - 50.0) * dpr;
      const beadPixelX = trackPadding + normPosRef.current * trackWidth;

      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, pixelWidth, pixelHeight);
      gl.uniform1f(uBeadXLoc, beadPixelX);
      gl.uniform1f(uStretchXLoc, stretchXRef.current);
      gl.uniform1f(uStretchYLoc, stretchYRef.current);
      gl.uniform1f(uDprLoc, dpr);
      gl.uniform3f(
        uTintLoc,
        themeConfig.glassTint[0],
        themeConfig.glassTint[1],
        themeConfig.glassTint[2]
      );
      gl.uniform3f(
        uBeadColorLoc,
        themeConfig.beadColor[0],
        themeConfig.beadColor[1],
        themeConfig.beadColor[2]
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
      className={`mercury-slider-container theme-${effectiveTheme} ${isDragging ? "is-dragging" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Top Label & Dynamic Formatted Value Row */}
      <div className="mercury-header-row">
        <div className="mercury-label-group">
          {icon && <span className="mercury-icon-wrapper">{icon}</span>}
          <span className="mercury-label">{label}</span>
        </div>
        <span className="mercury-value">{formatValue(currentValue)}</span>
      </div>

      {/* Interactive WebGL Glass Channel Track */}
      <div
        ref={trackRef}
        className="mercury-track-wrapper"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas ref={canvasRef} className="mercury-canvas" aria-hidden="true" />
      </div>
    </div>
  );
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export default MercurySlider;
