import React, { useRef, useEffect, useState } from "react";
import "./LiquidDocButton.css";

interface LiquidDocButtonProps {
  href?: string;
  className?: string;
}

export const LiquidDocButton: React.FC<LiquidDocButtonProps> = ({
  href = "#docs",
  className = "",
}) => {
  const containerRef = useRef<HTMLAnchorElement>(null);
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
        // Stage 1 (u: 0.0 -> 0.35): Seed droplet inflates right on the boundary
        // Stage 2 (u: 0.35 -> 0.70): Droplet pulls away from 154px to 204px with stretching liquid neck
        // Stage 3 (u: 0.70 -> 1.0): Snaps free and expands horizontally into companion pill
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
        // Convert WebGL bottom-left coords to canvas top-left
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float d = mapScene(p, u_progress);

        // Outside fluid boundary with anti-aliasing edge band
        if (d > 2.5 * u_dpr) {
          discard;
        }

        // Exact gradient surface normal in 2D (NaN safe)
        float eps = 1.0 * u_dpr;
        float dx = mapScene(vec2(p.x + eps, p.y), u_progress) - mapScene(vec2(p.x - eps, p.y), u_progress);
        float dy = mapScene(vec2(p.x, p.y + eps), u_progress) - mapScene(vec2(p.x, p.y - eps), u_progress);
        float lenGrad = length(vec2(dx, dy));
        vec2 grad = (lenGrad > 0.0001) ? vec2(dx, dy) / lenGrad : vec2(0.0, -1.0);

        // 1. Transparent Frosted Liquid Glass Base (exact match to Atronix glass: rgba(255, 255, 255, 0.035))
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.045;

        // 2. Linear Top Specular Sheen (exact match to search pill's linear-gradient top highlight)
        float centerY = 27.0 * u_dpr;
        float topEdgeY = centerY - 21.0 * u_dpr;
        float heightNorm = clamp((p.y - topEdgeY) / (18.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - heightNorm, 1.3) * 0.22 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 3. Crisp Top Inset Edge Highlight (inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.22))
        float edge = smoothstep(1.5 * u_dpr, 0.0, abs(d));
        float topEdge = edge * clamp(-grad.y, 0.0, 1.0) * 0.24;
        float sideEdge = edge * 0.07;

        // 4. Bottom Inset Shadow / Refraction Edge (inset 0 -1px rgba(255, 255, 255, 0.04))
        float botEdge = edge * clamp(grad.y, 0.0, 1.0) * 0.04;

        // Composite Pristine Atronix Liquid Glass
        float totalAlpha = clamp(bodyAlpha + topGloss + topEdge + sideEdge + botEdge, 0.0, 0.95);
        vec3 col = vec3(1.0, 1.0, 1.0);

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

      // Damped harmonic oscillator: Calm, luxurious Apple ProMotion fluid flow
      const target = targetRef.current;
      const current = progressRef.current;
      const k = 56.0; // Calm, silky fluid speed
      const c = 13.6; // Critical damping (zero harsh rebound)
      const dt = 0.016;

      const force = -k * (current - target) - c * velocityRef.current;
      velocityRef.current += force * dt;
      progressRef.current += velocityRef.current * dt;

      // Real-time zero convergence upon unhover (eliminates lingering tail)
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

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <a
      ref={containerRef}
      href={href}
      className={`liquid-doc-btn ${isHovered ? "is-hovered" : ""} ${isActive ? "is-active" : ""} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      aria-label="Documentation"
    >
      {/* Precision WebGL Signed Distance Field Canvas */}
      <canvas ref={canvasRef} className="liquid-webgl-canvas" aria-hidden="true" />

      {/* Foreground Typography Layer */}
      <div className="liquid-doc-content" aria-hidden="true">
        <span className="liquid-mother-label">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="liquid-doc-icon"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Documentation</span>
        </span>

        <span className="liquid-satellite-label">
          <span className="satellite-text">Read</span>
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </a>
  );
};
