"use client";

import React, { useRef, useEffect, useState } from "react";
import "./LiquidMitosis.css";

export interface LiquidMitosisProps {
  primaryText?: string;
  secondaryText?: string;
  icon?: React.ReactNode;
  theme?: "black" | "blue" | "purple" | "emerald" | "white";
  color?: string; // Showcase compatibility
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
}

const themeConfigs = {
  black: {
    glassTint: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.08)",
  },
  blue: {
    glassTint: [0.65, 0.85, 1.0],
    accentHex: "#60a5fa",
    glowColor: "rgba(96, 165, 250, 0.18)",
  },
  purple: {
    glassTint: [0.85, 0.7, 1.0],
    accentHex: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.18)",
  },
  emerald: {
    glassTint: [0.65, 1.0, 0.8],
    accentHex: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.18)",
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.15)",
  },
};

const sizeScales = {
  sm: 0.85,
  md: 1.0,
  lg: 1.18,
};

export const LiquidMitosis: React.FC<LiquidMitosisProps> = ({
  primaryText = "Quantum Engine",
  secondaryText = "Launch",
  icon,
  theme = "black",
  color,
  size = "md",
  href,
  onClick,
  className = "",
}) => {
  const effectiveTheme = (color as keyof typeof themeConfigs) || theme || "black";
  const themeConfig = themeConfigs[effectiveTheme] || themeConfigs.black;
  const scale = sizeScales[size] || 1.0;

  const containerRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // High-Resolution Spring Simulation State
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const targetRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = isHovered ? 1 : 0;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // High-Precision Signed Distance Field (SDF) Fluid Mitosis Shader
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_progress;
      uniform float u_dpr;
      uniform vec3 u_tint;

      // Exact 2D Capsule Signed Distance Field (NaN Safe)
      float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
        vec2 pa = p - a, ba = b - a;
        float d2 = dot(ba, ba);
        if (d2 < 0.0001) {
          return length(pa) - r;
        }
        float h = clamp(dot(pa, ba) / d2, 0.0, 1.0);
        return length(pa - ba * h) - r;
      }

      // Inigo Quilez Smooth Minimum for C1-continuous fluid metaball fusion
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // Mathematical Liquid Scene: 100% Symmetric Mother + Organic Membrane Budding Droplet
      float mapScene(vec2 p, float u) {
        float centerY = 27.0 * u_dpr;
        
        // 1. Mother Capsule: starts at X=6px to X=154px (width 148px, radius 21px)
        float mLeftX = 27.0 * u_dpr;
        float mRightX = 133.0 * u_dpr;
        float mRadius = 21.0 * u_dpr;

        // Reactive fluid kickback on mother capsule (only occurs as droplet pulls away)
        float kick = -3.2 * sin(clamp(smoothstep(0.1, 0.7, u) * 3.14159, 0.0, 3.14159)) * u_dpr;
        vec2 mA = vec2(mLeftX + kick, centerY);
        vec2 mB = vec2(mRightX + kick, centerY);
        float dMother = sdCapsule(p, mA, mB, mRadius);

        // At rest (u = 0): 100% mathematically pristine symmetric capsule (zero right-side bulge!)
        if (u <= 0.001) {
          return dMother;
        }

        // 2. True Liquid Budding (Forms directly on the right boundary membrane at X=154px)
        float anchorX = 154.0 * u_dpr;
        float targetCenterX = 204.0 * u_dpr;
        
        float pullProgress = smoothstep(0.25, 0.85, u);
        float childCenterX = mix(anchorX, targetCenterX, pullProgress);

        // Droplet radius inflates organically from 0.0px to 18.0px (smoothly dissolves to 0 on return)
        float childRadius = 18.0 * u_dpr * smoothstep(0.02, 0.42, u);
        // Pill length expands after detaching
        float halfLength = mix(0.0, 18.0 * u_dpr, smoothstep(0.60, 1.0, u));

        // Surface tension stretch while attached -> gentle wobble after detaching
        float squashX = 1.0;
        float squashY = 1.0;
        if (u < 0.65) {
          float stretch = sin(clamp(smoothstep(0.15, 0.65, u) * 3.14159, 0.0, 3.14159));
          squashX = 1.0 + stretch * 0.28;
          squashY = 1.0 - stretch * 0.18;
        } else {
          float wobble = sin((u - 0.65) * 14.0) * exp(-(u - 0.65) * 5.0);
          squashX = 1.0 - wobble * 0.08;
          squashY = 1.0 + wobble * 0.08;
        }

        vec2 cP = p;
        cP.x = childCenterX + (cP.x - childCenterX) / squashX;
        cP.y = centerY + (cP.y - centerY) / squashY;

        vec2 cA = vec2(childCenterX - halfLength, centerY);
        vec2 cB = vec2(childCenterX + halfLength, centerY);
        float dChild = sdCapsule(cP, cA, cB, childRadius);

        // Viscous Meniscus Blending (Smoothly scales to 0 in real-time as pill merges)
        float k = 0.0;
        if (u < 0.65) {
          float t = smoothstep(0.1, 0.65, u);
          k = 24.0 * u_dpr * smoothstep(0.02, 0.22, u) * sqrt(max(0.0, 1.0 - t * t));
        }

        return (k > 0.001) ? smin(dMother, dChild, k) : min(dMother, dChild);
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_progress);

        if (d > 2.5 * u_dpr) {
          discard;
        }

        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_progress) - mapScene(vec2(p.x - eps, p.y), u_progress);
        float dy = mapScene(vec2(p.x, p.y + eps), u_progress) - mapScene(vec2(p.x, p.y - eps), u_progress);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // 1. Transparent Frosted Liquid Glass Base
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.045;

        // 2. Linear Top Specular Sheen
        float centerY = 27.0 * u_dpr;
        float topEdgeY = centerY - 21.0 * u_dpr;
        float heightNorm = clamp((p.y - topEdgeY) / (18.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - heightNorm, 1.3) * 0.22 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 3. Crisp Top Inset Edge Highlight
        float edge = smoothstep(1.5 * u_dpr, 0.0, abs(d));
        float topEdge = edge * clamp(-grad.y, 0.0, 1.0) * 0.24;
        float sideEdge = edge * 0.07;

        // 4. Bottom Inset Shadow / Refraction Edge
        float botEdge = edge * clamp(grad.y, 0.0, 1.0) * 0.04;

        float totalAlpha = clamp(bodyAlpha + topGloss + topEdge + sideEdge + botEdge, 0.0, 0.95);
        vec3 col = u_tint * (1.0 + topGloss * 0.4);

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

    // Spring simulation render loop at 120 FPS
    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const target = targetRef.current;
      const current = progressRef.current;
      const k = 56.0; // Calm, silky fluid speed
      const c = 13.6; // Critical damping
      const dt = 0.016;

      const force = -k * (current - target) - c * velocityRef.current;
      velocityRef.current += force * dt;
      progressRef.current += velocityRef.current * dt;

      if (target === 0 && progressRef.current < 0.04) {
        progressRef.current *= 0.85;
      }

      if (Math.abs(progressRef.current - target) < 0.0008 && Math.abs(velocityRef.current) < 0.0015) {
        progressRef.current = target;
        velocityRef.current = 0;
      }

      const progress = progressRef.current;

      const cssWidth = 260;
      const cssHeight = 54;
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
      gl.uniform1f(uProgressLoc, progress);
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

  const defaultIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="liquid-mitosis-icon"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );

  const ComponentTag = href ? "a" : "button";

  return (
    <ComponentTag
      ref={containerRef as any}
      href={href}
      onClick={onClick}
      className={`liquid-mitosis-btn theme-${effectiveTheme} ${isHovered ? "is-hovered" : ""} ${isActive ? "is-active" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      aria-label={primaryText}
    >
      {/* WebGL Fluid Mitosis Canvas */}
      <canvas ref={canvasRef} className="liquid-mitosis-canvas" aria-hidden="true" />

      {/* Typography Overlay */}
      <div className="liquid-mitosis-content" aria-hidden="true">
        <span className="liquid-mitosis-mother">
          {icon || defaultIcon}
          <span>{primaryText}</span>
        </span>

        <span className="liquid-mitosis-satellite">
          <span className="satellite-text">{secondaryText}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="satellite-arrow"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </span>
      </div>
    </ComponentTag>
  );
};

export default LiquidMitosis;
