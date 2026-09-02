"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./HydroButton.css";

export interface HydroButtonProps {
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
    waveTint: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.15)",
  },
  amber: {
    glassTint: [1.0, 0.88, 0.7],
    waveTint: [1.0, 0.72, 0.28],
    accentHex: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
  blue: {
    glassTint: [0.65, 0.85, 1.0],
    waveTint: [0.35, 0.78, 1.0],
    accentHex: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.3)",
  },
  purple: {
    glassTint: [0.85, 0.7, 1.0],
    waveTint: [0.82, 0.52, 1.0],
    accentHex: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.3)",
  },
  emerald: {
    glassTint: [0.65, 1.0, 0.8],
    waveTint: [0.28, 0.95, 0.62],
    accentHex: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.3)",
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
    waveTint: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.2)",
  },
};

const sizeScales = {
  sm: 0.88,
  md: 1.0,
  lg: 1.15,
};

export const HydroButton: React.FC<HydroButtonProps> = ({
  label = "Deploy System",
  onClick,
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

  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hydrodynamic Incompressible Fluid State
  // Stone drop coordinates (pixel space inside button)
  const impactPosRef = useRef<[number, number]>([-1, -1]);
  const impactTimeRef = useRef<number>(0);
  const hoverPosRef = useRef<[number, number]>([-1, -1]);
  const animFrameRef = useRef<number | null>(null);

  // Subtle floating text buoyancy offset
  const [textOffset, setTextOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Stone Drop (Mouse / Touch Press)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      impactPosRef.current = [clickX, clickY];
      impactTimeRef.current = performance.now();

      // Buoyant fluid recoil on submerged text
      const centerDistX = clickX - rect.width / 2;
      const centerDistY = clickY - rect.height / 2;
      setTextOffset({
        x: -centerDistX * 0.06,
        y: -centerDistY * 0.08,
      });

      setTimeout(() => setTextOffset({ x: 0, y: 0 }), 320);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || !buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      hoverPosRef.current = [e.clientX - rect.left, e.clientY - rect.top];
    },
    [disabled]
  );

  const handlePointerLeave = useCallback(() => {
    hoverPosRef.current = [-1, -1];
  }, []);

  // WebGL Hydrostatic Bag & Incompressible Volume Shader
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

    // Incompressible Water Bag & Boundary Bulge Fragment Shader
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_impactPos;
      uniform float u_impactTime;
      uniform vec2 u_hoverPos;
      uniform float u_dpr;
      uniform vec3 u_tint;
      uniform vec3 u_waveTint;

      // Inigo Quilez 2D Rounded Box SDF
      float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
        r.xy = (p.x > 0.0) ? r.xy : r.zw;
        r.x  = (p.y > 0.0) ? r.x  : r.y;
        vec2 q = abs(p) - b + r.x;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
      }

      // Hydrostatic Water Bag Deformation Scene
      float mapScene(vec2 p, vec2 impact, float timeElapsed, vec2 hover) {
        float centerX = u_resolution.x * 0.5;
        float centerY = u_resolution.y * 0.5;

        // Base Pill Envelope Dimensions (220px x 52px with 26px radius)
        vec2 halfSize = vec2(110.0 * u_dpr, 26.0 * u_dpr);
        float cornerRadius = 26.0 * u_dpr;

        vec2 pDeformed = p;
        float boundaryBulge = 0.0;

        // 1. Incompressible Volume Displacement from "Stone Drop" Impact
        if (impact.x > 0.0 && timeElapsed >= 0.0 && timeElapsed < 2.0) {
          float distToImpact = length(p - impact);

          // Impact Crater: concave depression denting into the liquid
          float dentStrength = exp(-timeElapsed * 3.8) * cos(timeElapsed * 16.0);
          float crater = exp(-distToImpact * distToImpact / (1600.0 * u_dpr * u_dpr)) * (14.0 * u_dpr) * dentStrength;

          // Propagating Hydrodynamic Surface Tension Wave
          float waveRadius = timeElapsed * (280.0 * u_dpr);
          float waveDist = abs(distToImpact - waveRadius);
          float wave = sin(waveDist * 0.18) * exp(-waveDist * 0.05) * exp(-timeElapsed * 2.8) * (5.5 * u_dpr);

          // Internal Water Pressure Bulge on Outer Membrane (Water flows away from dent)
          vec2 dirFromImpact = (p - impact) / max(distToImpact, 1.0);
          vec2 dirFromCenter = (p - vec2(centerX, centerY)) / max(length(p - vec2(centerX, centerY)), 1.0);
          float pushAlignment = dot(dirFromImpact, dirFromCenter);

          // Incompressible boundary push: where fluid is displaced towards edges
          if (pushAlignment > -0.2) {
            boundaryBulge = (pushAlignment + 0.2) * exp(-timeElapsed * 3.2) * sin(timeElapsed * 12.0) * (9.5 * u_dpr);
          }

          pDeformed += dirFromImpact * crater * 0.45;
          pDeformed -= dirFromCenter * boundaryBulge * 0.65;
          pDeformed += dirFromImpact * wave * 0.35;
        }

        // 2. Gentle Fingertip Touch / Hover Weight
        if (hover.x > 0.0) {
          float distToHover = length(p - hover);
          float touchIndent = exp(-distToHover * distToHover / (2400.0 * u_dpr * u_dpr)) * (3.5 * u_dpr);
          pDeformed += ((p - hover) / max(distToHover, 1.0)) * touchIndent * 0.3;
        }

        float dPill = sdRoundedBox(pDeformed - vec2(centerX, centerY), halfSize, vec4(cornerRadius));
        return dPill - boundaryBulge * 0.25;
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_impactPos, u_impactTime, u_hoverPos);

        if (d > 3.0 * u_dpr) {
          discard;
        }

        // Finite-difference surface normal gradient
        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_impactPos, u_impactTime, u_hoverPos) - 
                   mapScene(vec2(p.x - eps, p.y), u_impactPos, u_impactTime, u_hoverPos);
        float dy = mapScene(vec2(p.x, p.y + eps), u_impactPos, u_impactTime, u_hoverPos) - 
                   mapScene(vec2(p.x, p.y - eps), u_impactPos, u_impactTime, u_hoverPos);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // 1. Transparent Frosted Liquid Bag Base
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.046;

        // 2. Linear Top Specular Sheen (Curved Bag Dome)
        float centerY = u_resolution.y * 0.5;
        float topEdgeY = centerY - 26.0 * u_dpr;
        float heightNorm = clamp((p.y - topEdgeY) / (22.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - heightNorm, 1.35) * 0.25 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 3. Crisp Surface Tension Boundary Rim
        float edge = smoothstep(1.8 * u_dpr, 0.0, abs(d));
        float topEdge = edge * clamp(-grad.y, 0.0, 1.0) * 0.30;
        float sideEdge = edge * 0.09;
        float botEdge = edge * clamp(grad.y, 0.0, 1.0) * 0.05;

        // 4. Hydrodynamic Impact Caustic Flash (Internal Water Shockwave)
        float waveFlash = 0.0;
        if (u_impactPos.x > 0.0 && u_impactTime >= 0.0 && u_impactTime < 1.8) {
          float distToImpact = length(p - u_impactPos);
          float waveRadius = u_impactTime * (280.0 * u_dpr);
          float waveDist = abs(distToImpact - waveRadius);
          waveFlash = exp(-waveDist * 0.08) * exp(-u_impactTime * 3.0) * 0.28;
        }

        float totalAlpha = clamp(bodyAlpha + topGloss + topEdge + sideEdge + botEdge + waveFlash, 0.0, 0.98);
        vec3 col = mix(u_tint * (1.0 + topGloss * 0.4), u_waveTint * 1.35, waveFlash);

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
    const uImpactPosLoc = gl.getUniformLocation(program, "u_impactPos");
    const uImpactTimeLoc = gl.getUniformLocation(program, "u_impactTime");
    const uHoverPosLoc = gl.getUniformLocation(program, "u_hoverPos");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");
    const uTintLoc = gl.getUniformLocation(program, "u_tint");
    const uWaveTintLoc = gl.getUniformLocation(program, "u_waveTint");

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

    // 120 FPS Incompressible Hydrostatic Physics Loop
    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Sized with 40px buffer around 220x52px pill so wave bulges never clip
      const cssWidth = 280;
      const cssHeight = 96;
      const pixelWidth = Math.floor(cssWidth * dpr);
      const pixelHeight = Math.floor(cssHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      // Convert impact coordinates into canvas coordinate space (offset by 30px left, 22px top)
      let canvasImpactX = -1;
      let canvasImpactY = -1;
      let elapsedImpactSec = -1;

      if (impactPosRef.current[0] >= 0) {
        canvasImpactX = (impactPosRef.current[0] + 30.0) * dpr;
        canvasImpactY = (impactPosRef.current[1] + 22.0) * dpr;
        elapsedImpactSec = (performance.now() - impactTimeRef.current) / 1000;
      }

      let canvasHoverX = -1;
      let canvasHoverY = -1;
      if (hoverPosRef.current[0] >= 0) {
        canvasHoverX = (hoverPosRef.current[0] + 30.0) * dpr;
        canvasHoverY = (hoverPosRef.current[1] + 22.0) * dpr;
      }

      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, pixelWidth, pixelHeight);
      gl.uniform2f(uImpactPosLoc, canvasImpactX, canvasImpactY);
      gl.uniform1f(uImpactTimeLoc, elapsedImpactSec);
      gl.uniform2f(uHoverPosLoc, canvasHoverX, canvasHoverY);
      gl.uniform1f(uDprLoc, dpr);
      gl.uniform3f(
        uTintLoc,
        themeConfig.glassTint[0],
        themeConfig.glassTint[1],
        themeConfig.glassTint[2]
      );
      gl.uniform3f(
        uWaveTintLoc,
        themeConfig.waveTint[0],
        themeConfig.waveTint[1],
        themeConfig.waveTint[2]
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
      className={`hydro-button-container theme-${effectiveTheme} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="hydro-button-trigger"
        onClick={onClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        disabled={disabled}
      >
        {/* Floating Submerged Label with Dynamic Buoyancy */}
        <div
          className="hydro-button-content"
          style={{
            transform: `translate(${textOffset.x}px, ${textOffset.y}px)`,
          }}
        >
          {icon && <span className="hydro-icon-box">{icon}</span>}
          <span className="hydro-button-label">{label}</span>
        </div>

        {/* WebGL Hydrostatic Bag & Surface Tension Canvas */}
        <canvas ref={canvasRef} className="hydro-canvas" aria-hidden="true" />
      </button>
    </div>
  );
};

export default HydroButton;
