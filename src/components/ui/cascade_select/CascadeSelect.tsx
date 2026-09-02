"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./CascadeSelect.css";

export interface CascadeOption {
  id: string;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface CascadeSelectProps {
  options?: CascadeOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string, option: CascadeOption) => void;
  theme?: "black" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
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
  sm: 0.88,
  md: 1.0,
  lg: 1.15,
};

const defaultOptions: CascadeOption[] = [
  {
    id: "quantum-engine",
    label: "Quantum Engine",
  },
  {
    id: "fluid-dynamics",
    label: "Fluid Dynamics",
  },
  {
    id: "spectral-optics",
    label: "Spectral Optics",
  },
  {
    id: "harmonic-lattice",
    label: "Harmonic Lattice",
  },
];

export const CascadeSelect: React.FC<CascadeSelectProps> = ({
  options = defaultOptions,
  value,
  defaultValue,
  placeholder = "Select Architecture",
  onChange,
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

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    value !== undefined ? value : (defaultValue || "")
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-Resolution Fluid Spring State
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const targetRef = useRef(0);
  const mouseRef = useRef<[number, number]>([-1, -1]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedId(value);
    }
  }, [value]);

  useEffect(() => {
    targetRef.current = isOpen ? 1 : 0;
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    mouseRef.current = [
      (e.clientX - rect.left) * dpr,
      (e.clientY - rect.top) * dpr,
    ];
  };

  const handleMouseLeave = () => {
    mouseRef.current = [-1, -1];
  };

  // WebGL Single Unified Liquid Glass Morph Simulation
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

    // Single Unified Fluid Morph Shader (Zero two-pill separation)
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_progress;
      uniform vec2 u_mouse;
      uniform float u_dpr;
      uniform vec3 u_tint;

      // Exact 2D Rounded Box SDF
      float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
        r.xy = (p.x > 0.0) ? r.xy : r.zw;
        r.x  = (p.y > 0.0) ? r.x : r.y;
        vec2 q = abs(p) - b + r.x;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
      }

      // Unified Fluid Vessel SDF (Single body that melts & drops down)
      float mapScene(vec2 p, float u, vec2 mouse) {
        float centerX = u_resolution.x / 2.0;
        float px = p.x - centerX;
        
        float halfW = 124.0 * u_dpr;
        float baseCenterY = 28.0 * u_dpr;
        float baseH = 44.0 * u_dpr;
        float targetH = 196.0 * u_dpr;

        // When closed, exactly the pristine trigger capsule with 6px buffer
        if (u <= 0.001) {
          vec2 center = vec2(centerX, baseCenterY);
          vec2 halfSize = vec2(halfW, baseH / 2.0);
          return sdRoundedBox(p - center, halfSize, vec4(14.0 * u_dpr));
        }

        // True Liquid Flow Downward:
        // Center drops down first (water droplet meniscus curvature), sides follow
        float normX = clamp((px / halfW) * 0.5 + 0.5, 0.0, 1.0);
        float dropSagProfile = sin(normX * 3.14159265);

        // Gravitational sag leading edge
        float sagAmount = 26.0 * u_dpr * sin(clamp(u * 3.14159265, 0.0, 3.14159265));

        // Fluid waist narrowing (meniscus stretch tension during descent)
        float currentH = mix(baseH, targetH, u);
        float normY = clamp(p.y / max(currentH, 1.0), 0.0, 1.0);
        float waistPinch = sin(normY * 3.14159265) * 12.0 * u_dpr * sin(clamp(u * 3.14159265, 0.0, 3.14159265));

        // Damped harmonic water bounce at bottom
        float bounce = 0.0;
        if (u > 0.65) {
          bounce = sin((u - 0.65) * 16.0) * exp(-(u - 0.65) * 6.5) * 7.5 * u_dpr;
        }

        vec2 pFluid = p;
        pFluid.x = centerX + (p.x - centerX) * (halfW / max(halfW - waistPinch, 10.0));

        float totalBottomY = 6.0 * u_dpr + currentH + (sagAmount + bounce) * dropSagProfile;
        float actualH = totalBottomY - 6.0 * u_dpr;
        vec2 fluidCenter = vec2(centerX, 6.0 * u_dpr + actualH / 2.0);
        vec2 fluidHalf = vec2(halfW, actualH / 2.0);
        float cornerRadius = mix(14.0, 16.0, u) * u_dpr;

        float d = sdRoundedBox(pFluid - fluidCenter, fluidHalf, vec4(cornerRadius));

        // Interactive cursor liquid lens ripple
        if (mouse.x > 0.0 && mouse.y > 0.0 && u > 0.85) {
          float dist = length(p - mouse);
          float ripple = exp(-dist * dist / (2200.0 * u_dpr * u_dpr)) * 2.8 * u_dpr;
          d -= ripple;
        }

        return d;
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_progress, u_mouse);

        if (d > 2.5 * u_dpr) {
          discard;
        }

        // Exact LiquidMitosis surface normal gradient
        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_progress, u_mouse) - 
                   mapScene(vec2(p.x - eps, p.y), u_progress, u_mouse);
        float dy = mapScene(vec2(p.x, p.y + eps), u_progress, u_mouse) - 
                   mapScene(vec2(p.x, p.y - eps), u_progress, u_mouse);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // --- Core Liquid Glass Optics (Pure LiquidMitosis Formula) ---
        // 1. Transparent Frosted Liquid Glass Base
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.045;

        // 2. Linear Top Specular Sheen (Full 6px buffer highlight)
        float topEdgeY = 6.0 * u_dpr;
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
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
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

    // 120 FPS Fluid Morph Spring Simulation Loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const target = targetRef.current;
      const current = progressRef.current;

      // Silky fluid tension spring (Apple-grade fluid responsiveness)
      const isOpening = target === 1;
      const k = isOpening ? 42.0 : 54.0;
      const c = isOpening ? 9.6 : 14.0;

      const force = -k * (current - target) - c * velocityRef.current;
      velocityRef.current += force * dt;
      progressRef.current += velocityRef.current * dt;

      if (target === 0 && progressRef.current < 0.02) {
        progressRef.current = 0;
        velocityRef.current = 0;
      }

      if (Math.abs(progressRef.current - target) < 0.0005 && Math.abs(velocityRef.current) < 0.001) {
        progressRef.current = target;
        velocityRef.current = 0;
      }

      const progress = progressRef.current;

      const cssWidth = 260;
      const cssHeight = 236;
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
      gl.uniform2f(uMouseLoc, mouseRef.current[0], mouseRef.current[1]);
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

  const selectedOption = options.find((opt) => opt.id === selectedId);

  const handleSelect = useCallback(
    (option: CascadeOption) => {
      if (option.disabled) return;
      setSelectedId(option.id);
      onChange?.(option.id, option);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelect(options[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    }
  };

  const defaultIcon = (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cascade-trigger-icon"
    >
      <path d="M12 3c0 4.97-4.03 9-9 9 4.97 0 9 4.03 9 9 0-4.97 4.03-9 9-9-4.97 0-9-4.03-9-9z" />
    </svg>
  );

  return (
    <div
      ref={containerRef}
      className={`cascade-select-container theme-${effectiveTheme} ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* WebGL Unified Liquid Glass Morph Canvas */}
      <canvas ref={canvasRef} className="cascade-select-canvas" aria-hidden="true" />

      {/* Main Trigger Header Button */}
      <button
        type="button"
        className="cascade-select-trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <div className="trigger-left">
          {icon || defaultIcon}
          <span className="trigger-label">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="trigger-right">
          <motion.svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="trigger-chevron"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              type: "spring",
              stiffness: 160,
              damping: 22,
              mass: 0.9,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </div>
      </button>

      {/* Cascading Menu Options List */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="cascade-options-list"
            role="listbox"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 26,
              mass: 0.6,
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.id === selectedId;
              const isHighlighted = index === highlightedIndex;

              return (
                <motion.li
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`cascade-option-item ${isSelected ? "is-selected" : ""} ${isHighlighted ? "is-highlighted" : ""} ${option.disabled ? "is-disabled" : ""}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 24,
                    delay: 0.04 + index * 0.035,
                  }}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="option-label">{option.label}</span>

                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="option-check-icon"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CascadeSelect;
