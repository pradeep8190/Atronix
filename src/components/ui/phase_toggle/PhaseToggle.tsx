"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./PhaseToggle.css";

export interface PhaseToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  theme?: "black" | "amber" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const themeConfigs = {
  black: {
    glassTint: [1.0, 1.0, 1.0],
    beadColor: [0.95, 0.98, 1.0],
    activeGlow: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
  },
  amber: {
    glassTint: [1.0, 0.88, 0.7],
    beadColor: [1.0, 0.72, 0.28],
    activeGlow: [1.0, 0.65, 0.15],
    accentHex: "#f59e0b",
  },
  blue: {
    glassTint: [0.65, 0.85, 1.0],
    beadColor: [0.35, 0.78, 1.0],
    activeGlow: [0.2, 0.65, 1.0],
    accentHex: "#38bdf8",
  },
  purple: {
    glassTint: [0.85, 0.7, 1.0],
    beadColor: [0.82, 0.52, 1.0],
    activeGlow: [0.72, 0.35, 1.0],
    accentHex: "#c084fc",
  },
  emerald: {
    glassTint: [0.65, 1.0, 0.8],
    beadColor: [0.28, 0.95, 0.62],
    activeGlow: [0.15, 0.9, 0.5],
    accentHex: "#34d399",
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
    beadColor: [1.0, 1.0, 1.0],
    activeGlow: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
  },
};

const sizeScales = {
  sm: 0.85,
  md: 1.0,
  lg: 1.2,
};

export const PhaseToggle: React.FC<PhaseToggleProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  label = "Quantum Phase",
  theme = "black",
  color,
  size = "md",
  disabled = false,
  className = "",
}) => {
  const effectiveTheme = (color as keyof typeof themeConfigs) || theme || "black";
  const themeConfig = themeConfigs[effectiveTheme] || themeConfigs.black;
  const scale = sizeScales[size] || 1.0;

  const [isChecked, setIsChecked] = useState<boolean>(
    controlledChecked !== undefined ? controlledChecked : defaultChecked
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hydrodynamic Capillary Kinetic State
  // phaseProgress: 0.0 (OFF / left chamber) -> 1.0 (ON / right chamber)
  const progressRef = useRef(isChecked ? 1.0 : 0.0);
  const targetProgressRef = useRef(isChecked ? 1.0 : 0.0);
  const velocityRef = useRef(0);
  const rippleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Sync controlled state
  useEffect(() => {
    if (controlledChecked !== undefined) {
      setIsChecked(controlledChecked);
      targetProgressRef.current = controlledChecked ? 1.0 : 0.0;
    }
  }, [controlledChecked]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const nextState = !isChecked;
    if (controlledChecked === undefined) {
      setIsChecked(nextState);
    }
    targetProgressRef.current = nextState ? 1.0 : 0.0;
    onChange?.(nextState);
  }, [disabled, isChecked, controlledChecked, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  // WebGL Kinetic Capillary Mercury Switch Shader
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

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_progress;
      uniform float u_ripple;
      uniform float u_dpr;
      uniform vec3 u_tint;
      uniform vec3 u_beadColor;
      uniform vec3 u_activeGlow;

      // Inigo Quilez 2D Rounded Box SDF
      float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
        r.xy = (p.x > 0.0) ? r.xy : r.zw;
        r.x  = (p.y > 0.0) ? r.x  : r.y;
        vec2 q = abs(p) - b + r.x;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
      }

      // Inigo Quilez Smooth Minimum
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // Capillary Glass Chamber & Liquid Mercury SDF
      float mapScene(vec2 p, float progress, float ripple) {
        float centerX = u_resolution.x * 0.5;
        float centerY = u_resolution.y * 0.5;

        // 1. Frosted Glass Housing (Width 84px, Height 44px, Corner Radius 22px)
        vec2 housingHalf = vec2(42.0 * u_dpr, 22.0 * u_dpr);
        float dHousing = sdRoundedBox(p - vec2(centerX, centerY), housingHalf, vec4(22.0 * u_dpr));

        // 2. Mercury Droplet Kinematics
        // Travel span: Left chamber (centerX - 20px) to Right chamber (centerX + 20px)
        float leftX = centerX - 20.0 * u_dpr;
        float rightX = centerX + 20.0 * u_dpr;
        float beadX = mix(leftX, rightX, progress);

        // Capillary throat constriction (necks down and elongates near center progress 0.5)
        float distFromCenter = abs(progress - 0.5) * 2.0; // 0.0 at center, 1.0 at ends
        float stretchFactor = 1.0 + (1.0 - distFromCenter) * 0.55; // Elongates to 1.55x at throat
        float pinchFactor = 1.0 / sqrt(stretchFactor);

        vec2 pBead = p;
        pBead.x = beadX + (p.x - beadX) / stretchFactor;
        pBead.y = centerY + (p.y - centerY) / pinchFactor;

        float beadRadius = 14.5 * u_dpr;
        float dBead = length(pBead - vec2(beadX, centerY)) - beadRadius;

        // Fluid impact wave ripple on the outer meniscus
        if (ripple > 0.001) {
          float distToBead = length(p - vec2(beadX, centerY));
          float wave = sin(distToBead * 0.35 - ripple * 14.0) * exp(-ripple * 4.0) * (3.5 * u_dpr * ripple);
          dBead += wave;
        }

        // Viscous fluid meniscus blending with chamber walls
        return smin(dHousing, dBead, 15.0 * u_dpr);
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_progress, u_ripple);

        if (d > 2.5 * u_dpr) {
          discard;
        }

        // Finite-difference surface normal gradient
        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_progress, u_ripple) - 
                   mapScene(vec2(p.x - eps, p.y), u_progress, u_ripple);
        float dy = mapScene(vec2(p.x, p.y + eps), u_progress, u_ripple) - 
                   mapScene(vec2(p.x, p.y - eps), u_progress, u_ripple);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // 1. Transparent Frosted Liquid Glass Base (Signature Atronix black glass)
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.048;

        // 2. Active Chamber Caustic Glow (Illuminates when switched ON)
        float centerX = u_resolution.x * 0.5;
        float centerY = u_resolution.y * 0.5;
        float rightChamberMask = smoothstep(centerX - 10.0 * u_dpr, centerX + 20.0 * u_dpr, p.x) * 
                                smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * u_progress;
        float activeCaustic = rightChamberMask * 0.075;

        // 3. Specular Top Linear Gloss Sheen
        float topEdgeY = centerY - 22.0 * u_dpr;
        float heightNorm = clamp((p.y - topEdgeY) / (18.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - heightNorm, 1.3) * 0.24 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 4. Inset Edge Highlights
        float edge = smoothstep(1.5 * u_dpr, 0.0, abs(d));
        float topEdge = edge * clamp(-grad.y, 0.0, 1.0) * 0.28;
        float sideEdge = edge * 0.08;
        float botEdge = edge * clamp(grad.y, 0.0, 1.0) * 0.04;

        // 5. Liquid Mercury Droplet Core
        float beadX = mix(centerX - 20.0 * u_dpr, centerX + 20.0 * u_dpr, u_progress);
        vec2 beadCenter = vec2(beadX, centerY);
        float distToBead = length(p - beadCenter);
        
        // Solid molten core
        float beadCore = smoothstep(14.0 * u_dpr, 2.0 * u_dpr, distToBead) * 0.58;

        // Directional 3D Specular Glint
        vec2 glintOffset = vec2(-3.2, -3.8) * u_dpr;
        float distToGlint = length(p - (beadCenter + glintOffset));
        float beadGlint = pow(clamp(1.0 - distToGlint / (7.2 * u_dpr), 0.0, 1.0), 3.2) * 0.90;

        float totalAlpha = clamp(bodyAlpha + activeCaustic + topGloss + topEdge + sideEdge + botEdge + beadCore + beadGlint, 0.0, 0.98);

        vec3 trackCol = mix(u_tint, u_activeGlow, activeCaustic * 3.5) * (1.0 + topGloss * 0.35);
        float beadMix = smoothstep(15.0 * u_dpr, 3.5 * u_dpr, distToBead);
        vec3 finalCol = mix(trackCol, u_beadColor * (1.15 + beadGlint * 0.9), beadMix);

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
    const uProgressLoc = gl.getUniformLocation(program, "u_progress");
    const uRippleLoc = gl.getUniformLocation(program, "u_ripple");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");
    const uTintLoc = gl.getUniformLocation(program, "u_tint");
    const uBeadColorLoc = gl.getUniformLocation(program, "u_beadColor");
    const uActiveGlowLoc = gl.getUniformLocation(program, "u_activeGlow");

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

    // 120 FPS High-Speed Capillary Hydrodynamics Physics Loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const target = targetProgressRef.current;
      const current = progressRef.current;

      // Snappy, pressurized mercury squirt spring
      const k = 95.0; // High acceleration through the capillary neck
      const c = 16.5; // Smooth deceleration

      const force = -k * (current - target) - c * velocityRef.current;
      velocityRef.current += force * dt;
      progressRef.current += velocityRef.current * dt;

      // Detect impact arrival for fluid wave ripple
      const distToTarget = Math.abs(progressRef.current - target);
      if (distToTarget < 0.08 && !wasAtTarget && Math.abs(velocityRef.current) > 0.4) {
        rippleRef.current = 1.0;
        wasAtTarget = true;
      } else if (distToTarget > 0.2) {
        wasAtTarget = false;
      }

      if (distToTarget < 0.0003 && Math.abs(velocityRef.current) < 0.001) {
        progressRef.current = target;
        velocityRef.current = 0;
      }

      // Decay impact wave
      if (rippleRef.current > 0.001) {
        rippleRef.current = Math.max(0, rippleRef.current - dt * 2.6);
      }

      const cssWidth = 124; // 84px housing + 40px buffer
      const cssHeight = 74; // 44px housing + 30px buffer
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
      gl.uniform1f(uProgressLoc, progressRef.current);
      gl.uniform1f(uRippleLoc, rippleRef.current);
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
      gl.uniform3f(
        uActiveGlowLoc,
        themeConfig.activeGlow[0],
        themeConfig.activeGlow[1],
        themeConfig.activeGlow[2]
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
      className={`phase-toggle-container theme-${effectiveTheme} ${isChecked ? "is-active" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={isChecked}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Label Group */}
      {label && <span className="phase-toggle-label">{label}</span>}

      {/* Interactive Kinetic Capillary Glass Vessel */}
      <div className="phase-toggle-switch-wrapper">
        <canvas ref={canvasRef} className="phase-toggle-canvas" aria-hidden="true" />
      </div>
    </div>
  );
};

export default PhaseToggle;
