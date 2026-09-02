"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./FerroDrop.css";

export interface AttachedFile {
  name: string;
  size: string;
  previewUrl?: string;
  file?: File;
}

export interface FerroDropProps {
  onDrop?: (file: File | AttachedFile) => void;
  onSubmit?: (prompt: string, attachment: AttachedFile | null) => void;
  placeholder?: string;
  soundEnabled?: boolean;
  theme?: "black" | "amber" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const themeConfigs = {
  black: {
    glassTint: [1.0, 1.0, 1.0],
  },
  blue: {
    glassTint: [0.65, 0.85, 1.0],
  },
  amber: {
    glassTint: [1.0, 0.88, 0.7],
  },
  purple: {
    glassTint: [0.85, 0.7, 1.0],
  },
  emerald: {
    glassTint: [0.65, 1.0, 0.8],
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
  },
};

const sizeScales = {
  sm: 0.88,
  md: 1.0,
  lg: 1.12,
};

// =============================================================================
// Web Audio Procedural Acoustic Synthesizer (0ms Latency, Zero Audio Files)
// =============================================================================
let globalAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  try {
    if (!globalAudioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        globalAudioCtx = new AudioCtxClass();
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
    return globalAudioCtx;
  } catch {
    return null;
  }
};

const playVenomLatchThud = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, now);
  filter.connect(ctx.destination);

  // Deep Magnetic Core Thud (170Hz -> 48Hz)
  const oscCore = ctx.createOscillator();
  const gainCore = ctx.createGain();
  oscCore.type = "sine";
  oscCore.frequency.setValueAtTime(170, now);
  oscCore.frequency.exponentialRampToValueAtTime(48, now + 0.045);

  gainCore.gain.setValueAtTime(0.08, now);
  gainCore.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

  oscCore.connect(gainCore);
  gainCore.connect(filter);

  // Fluid Snap Transient (880Hz -> 280Hz)
  const oscSnap = ctx.createOscillator();
  const gainSnap = ctx.createGain();
  oscSnap.type = "sine";
  oscSnap.frequency.setValueAtTime(880, now);
  oscSnap.frequency.exponentialRampToValueAtTime(280, now + 0.02);

  gainSnap.gain.setValueAtTime(0.05, now);
  gainSnap.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  oscSnap.connect(gainSnap);
  gainSnap.connect(filter);

  oscCore.start(now);
  oscCore.stop(now + 0.055);
  oscSnap.start(now);
  oscSnap.stop(now + 0.03);
};

export const FerroDrop: React.FC<FerroDropProps> = ({
  onDrop,
  onSubmit,
  placeholder = "Ask anything or drop an image...",
  soundEnabled = true,
  theme = "black",
  color,
  size = "md",
  disabled = false,
  className = "",
}) => {
  const effectiveTheme = (color as keyof typeof themeConfigs) || theme || "black";
  const themeConfig = themeConfigs[effectiveTheme] || themeConfigs.black;
  const scale = sizeScales[size] || 1.0;

  const [prompt, setPrompt] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachment, setAttachment] = useState<AttachedFile | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cursor & Magnetic Physics in Canvas Coordinates
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });
  const pullStrengthRef = useRef(0);
  const currentPullXRef = useRef(0);
  const currentPullYRef = useRef(0);

  // Venom Shockwave State
  const shockwaveTimeRef = useRef(0);
  const shockwaveOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Trigger Assimilation
  const triggerAssimilation = useCallback(
    (fileData: AttachedFile, dropX?: number, dropY?: number) => {
      setAttachment(fileData);
      shockwaveTimeRef.current = performance.now();
      if (dropX !== undefined && dropY !== undefined) {
        shockwaveOriginRef.current = { x: dropX, y: dropY };
      }
      if (soundEnabled) {
        playVenomLatchThud();
      }
      onDrop?.(fileData.file || fileData);
    },
    [soundEnabled, onDrop]
  );

  // Drag Event Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    getAudioContext();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
    mousePosRef.current.active = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    mousePosRef.current.active = false;

    let dropX = 0;
    let dropY = 0;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      dropX = e.clientX - rect.left;
      dropY = e.clientY - rect.top;
    }

    const customData = e.dataTransfer.getData("application/json");
    if (customData) {
      try {
        const parsed = JSON.parse(customData);
        triggerAssimilation(parsed, dropX, dropY);
        return;
      } catch (_) {}
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      const sizeKb = (file.size / 1024).toFixed(1);
      triggerAssimilation(
        {
          name: file.name,
          size: `${sizeKb} KB`,
          previewUrl,
          file,
        },
        dropX,
        dropY
      );
    }
  };

  const handleSampleDragStart = (e: React.DragEvent) => {
    getAudioContext();
    const samplePayload = {
      name: "vision_reference.png",
      size: "2.4 MB",
      previewUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%231e1b4b'/><circle cx='50' cy='50' r='28' fill='%236366f1'/><path d='M30 65 Q 50 35 70 65' stroke='%2338bdf8' stroke-width='4' fill='none'/></svg>",
    };
    e.dataTransfer.setData("application/json", JSON.stringify(samplePayload));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      const sizeKb = (file.size / 1024).toFixed(1);
      triggerAssimilation({
        name: file.name,
        size: `${sizeKb} KB`,
        previewUrl,
        file,
      });
    }
  };

  const handleSend = () => {
    if ((!prompt.trim() && !attachment) || disabled) return;
    onSubmit?.(prompt, attachment);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDragOverRef = useRef(false);

  // Omni-directional Drag Proximity Listener (Optimized for 120 FPS zero-lag)
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Senses drag within 220px of perimeter
      const inZone =
        e.clientX >= rect.left - 220 &&
        e.clientX <= rect.right + 220 &&
        e.clientY >= rect.top - 220 &&
        e.clientY <= rect.bottom + 220;

      mousePosRef.current = { x, y, active: inZone };

      // Only trigger React state update if status actually changed (prevents 60fps re-render lag)
      if (inZone !== isDragOverRef.current) {
        isDragOverRef.current = inZone;
        setIsDragOver(inZone);
      }
    };

    const handleWindowDragEnd = () => {
      mousePosRef.current.active = false;
      if (isDragOverRef.current) {
        isDragOverRef.current = false;
        setIsDragOver(false);
      }
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragEnd);
    window.addEventListener("drop", handleWindowDragEnd);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragEnd);
      window.removeEventListener("drop", handleWindowDragEnd);
    };
  }, []);

  // ===========================================================================
  // 100% Pure WebGL Signed Distance Field (SDF) Fluid Deformation Engine
  // Authentic dark luxury obsidian glass - zero white haze, zero lag
  // ===========================================================================
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
      uniform vec2 u_boxCenter;
      uniform vec2 u_boxHalf;
      uniform vec2 u_mouse;
      uniform float u_pullStrength;
      uniform float u_shockProgress;
      uniform vec2 u_shockOrigin;
      uniform float u_dpr;
      uniform vec3 u_tint;

      // Inigo Quilez Signed Distance Field of Rounded Box
      float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
        r.xy = (p.x > 0.0) ? r.xy : r.zw;
        r.x  = (p.y > 0.0) ? r.x  : r.y;
        vec2 q = abs(p) - b + r.x;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
      }

      void main() {
        // Coordinate conversion: Top-left origin
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        vec2 boxMin = u_boxCenter - u_boxHalf;
        vec2 boxMax = u_boxCenter + u_boxHalf;

        // Localized Single-Edge Magnetic Meniscus Lift:
        // Only the specific border closest to the incoming file stretches and lifts,
        // while the other 3 borders remain completely static and motionless!
        vec2 localDisplacement = vec2(0.0);

        if (u_pullStrength > 0.001) {
          // 1. TOP BORDER PULL: If file is near top, only top border lifts towards it
          if (u_mouse.y < boxMin.y + 40.0 * u_dpr && p.y < u_boxCenter.y) {
            float distY = max(0.0, boxMin.y - u_mouse.y);
            float pullHeight = exp(-distY / (85.0 * u_dpr)) * 28.0 * u_dpr * u_pullStrength;
            float sigmaX = 52.0 * u_dpr;
            float gaussianX = exp(- pow(p.x - u_mouse.x, 2.0) / (2.0 * sigmaX * sigmaX));
            float verticalAtten = smoothstep(boxMin.y + 24.0 * u_dpr, boxMin.y - 12.0 * u_dpr, p.y);
            localDisplacement.y += pullHeight * gaussianX * verticalAtten;
          }

          // 2. BOTTOM BORDER PULL: If file is near bottom, only bottom border pulls downward
          if (u_mouse.y > boxMax.y - 40.0 * u_dpr && p.y > u_boxCenter.y) {
            float distY = max(0.0, u_mouse.y - boxMax.y);
            float pullHeight = exp(-distY / (85.0 * u_dpr)) * 28.0 * u_dpr * u_pullStrength;
            float sigmaX = 52.0 * u_dpr;
            float gaussianX = exp(- pow(p.x - u_mouse.x, 2.0) / (2.0 * sigmaX * sigmaX));
            float verticalAtten = smoothstep(boxMax.y - 24.0 * u_dpr, boxMax.y + 12.0 * u_dpr, p.y);
            localDisplacement.y -= pullHeight * gaussianX * verticalAtten;
          }

          // 3. LEFT BORDER PULL: If file is near left, only left border reaches left
          if (u_mouse.x < boxMin.x + 40.0 * u_dpr && p.x < u_boxCenter.x) {
            float distX = max(0.0, boxMin.x - u_mouse.x);
            float pullWidth = exp(-distX / (85.0 * u_dpr)) * 28.0 * u_dpr * u_pullStrength;
            float sigmaY = 36.0 * u_dpr;
            float gaussianY = exp(- pow(p.y - u_mouse.y, 2.0) / (2.0 * sigmaY * sigmaY));
            float horizAtten = smoothstep(boxMin.x + 24.0 * u_dpr, boxMin.x - 12.0 * u_dpr, p.x);
            localDisplacement.x += pullWidth * gaussianY * horizAtten;
          }

          // 4. RIGHT BORDER PULL: If file is near right, only right border reaches right
          if (u_mouse.x > boxMax.x - 40.0 * u_dpr && p.x > u_boxCenter.x) {
            float distX = max(0.0, u_mouse.x - boxMax.x);
            float pullWidth = exp(-distX / (85.0 * u_dpr)) * 28.0 * u_dpr * u_pullStrength;
            float sigmaY = 36.0 * u_dpr;
            float gaussianY = exp(- pow(p.y - u_mouse.y, 2.0) / (2.0 * sigmaY * sigmaY));
            float horizAtten = smoothstep(boxMax.x - 24.0 * u_dpr, boxMax.x + 12.0 * u_dpr, p.x);
            localDisplacement.x -= pullWidth * gaussianY * horizAtten;
          }
        }

        vec2 pWarped = p + localDisplacement;

        // Venom Shockwave Harmonic Radial Wavefront on Drop
        if (u_shockProgress > 0.001) {
          float shockDist = length(p - u_shockOrigin);
          float wavePhase = clamp(u_shockProgress, 0.0, 1.0);
          float shockRadius = wavePhase * 400.0 * u_dpr;
          float waveProfile = sin((shockDist - shockRadius) * 0.06) * exp(-abs(shockDist - shockRadius) / (30.0 * u_dpr));
          float shockDisp = waveProfile * (1.0 - wavePhase) * 12.0 * u_dpr;
          pWarped += normalize(p - u_shockOrigin + vec2(0.001)) * shockDisp;
        }

        // Signed Distance to Rounded Box
        vec2 relP = pWarped - u_boxCenter;
        float cornerRadius = 22.0 * u_dpr;
        float d = sdRoundedBox(relP, u_boxHalf, vec4(cornerRadius));

        // Anti-aliased outer boundary
        float aa = 1.5 * u_dpr;
        if (d > aa) {
          discard;
        }

        // --- Signature Atronix Liquid Glass Optics (Low, refined border) ---
        // 1. Translucent Frosted Liquid Glass Body
        float bodyAlpha = smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d) * 0.055;

        // 2. Directional Top Specular Sheen (Soft, clean liquid gloss)
        float topNorm = clamp((p.y - boxMin.y) / (24.0 * u_dpr), 0.0, 1.0);
        float topGloss = pow(1.0 - topNorm, 1.4) * 0.15 * smoothstep(1.0 * u_dpr, -1.0 * u_dpr, d);

        // 3. Very Low & Refined Specular Inset Edge (Subtle, whisper-soft border)
        float edge = smoothstep(1.2 * u_dpr, 0.0, abs(d));
        float topEdge = edge * 0.13;
        float botEdge = edge * 0.03;

        // Composite Total Alpha: Translucent optical liquid glass
        float totalAlpha = clamp(bodyAlpha + topGloss + topEdge + botEdge, 0.0, 0.88);
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
    const uBoxCenterLoc = gl.getUniformLocation(program, "u_boxCenter");
    const uBoxHalfLoc = gl.getUniformLocation(program, "u_boxHalf");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uPullStrengthLoc = gl.getUniformLocation(program, "u_pullStrength");
    const uShockProgressLoc = gl.getUniformLocation(program, "u_shockProgress");
    const uShockOriginLoc = gl.getUniformLocation(program, "u_shockOrigin");
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
    let animId: number;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(canvas.clientWidth * dpr);
      const pixelHeight = Math.round(canvas.clientHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      // Smooth Magnetic Pull Damping
      const mouse = mousePosRef.current;
      const targetPull = mouse.active ? 1.0 : 0.0;
      pullStrengthRef.current += (targetPull - pullStrengthRef.current) * Math.min(1, dt * 14.0);

      // Venom Shockwave Progress (0 -> 1 in 0.65 seconds)
      let shockProgress = 0;
      if (shockwaveTimeRef.current > 0) {
        const elapsed = (now - shockwaveTimeRef.current) / 1000;
        if (elapsed < 0.65) {
          shockProgress = elapsed / 0.65;
        } else {
          shockwaveTimeRef.current = 0;
        }
      }

      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, pixelWidth, pixelHeight);

      // The input box is centered inside the canvas with 45px bleed margin
      const pad = 45.0 * dpr;
      const boxPixelW = pixelWidth - pad * 2.0;
      const boxPixelH = pixelHeight - pad * 2.0;

      gl.uniform2f(uBoxCenterLoc, pixelWidth / 2.0, pixelHeight / 2.0);
      gl.uniform2f(uBoxHalfLoc, boxPixelW / 2.0, boxPixelH / 2.0);
      gl.uniform2f(uMouseLoc, mouse.x * dpr, mouse.y * dpr);
      gl.uniform1f(uPullStrengthLoc, pullStrengthRef.current);
      gl.uniform1f(uShockProgressLoc, shockProgress);
      gl.uniform2f(
        uShockOriginLoc,
        shockwaveOriginRef.current.x * dpr,
        shockwaveOriginRef.current.y * dpr
      );
      gl.uniform1f(uDprLoc, dpr);
      gl.uniform3f(uTintLoc, themeConfig.glassTint[0], themeConfig.glassTint[1], themeConfig.glassTint[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [themeConfig]);

  return (
    <div
      className={`ferro-drop-wrapper theme-${effectiveTheme} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Main Container - The WebGL Canvas Beneath IS the Entire Visual Box */}
      <div
        ref={containerRef}
        className={`ferro-drop-container ${isDragOver ? "is-drag-over" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Real WebGL Signed Distance Field Glass Canvas (Bleed Rule: 45px buffer) */}
        <canvas ref={canvasRef} className="ferro-magnetic-canvas" aria-hidden="true" />

        {/* Floating Input Interface (Zero CSS Borders/Backgrounds) */}
        <div className="ferro-inner-content">
          {/* Attached Media Chip (Venom Assimilated Card) */}
          {attachment && (
            <div className="ferro-attachment-chip">
              {attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name}
                  className="ferro-chip-thumb"
                />
              ) : (
                <div className="ferro-chip-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  📄
                </div>
              )}
              <div className="ferro-chip-info">
                <span className="ferro-chip-name">{attachment.name}</span>
                <span className="ferro-chip-size">{attachment.size}</span>
              </div>
              <button
                type="button"
                className="ferro-chip-remove"
                onClick={() => setAttachment(null)}
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          )}

          {/* Textarea Prompt Row */}
          <div className="ferro-input-row">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isDragOver ? "Release to assimilate image..." : placeholder}
              rows={1}
              disabled={disabled}
              className="ferro-textarea"
            />
          </div>

          {/* Action Bar: Attachment Trigger, Model Badge, Send Button */}
          <div className="ferro-actions-row">
            <div className="ferro-actions-left">
              {/* Native File Upload Trigger */}
              <button
                type="button"
                className="ferro-action-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                aria-label="Attach file"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />

              {/* Model Capability Badge */}
              <span className="ferro-model-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Atronix Vision
              </span>
            </div>

            {/* Send Prompt Button */}
            <button
              type="button"
              className={`ferro-send-btn ${(prompt.trim() || attachment) ? "is-active" : ""}`}
              onClick={handleSend}
              disabled={(!prompt.trim() && !attachment) || disabled}
              aria-label="Send prompt"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FerroDrop;
