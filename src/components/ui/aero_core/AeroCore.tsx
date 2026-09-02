"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import "./AeroCore.css";

export interface AeroCoreProps {
  mode?: "simulate" | "mic";
  theme?: "black" | "amber" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  onVoiceActivity?: (level: number) => void;
  disabled?: boolean;
  className?: string;
}

const themeConfigs = {
  black: {
    glassTint: [1.0, 1.0, 1.0],
    fluidColor: [0.18, 0.20, 0.25], // Deep monochrome charcoal graphite cloud
    causticColor: [0.85, 0.88, 0.92],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.2)",
  },
  amber: {
    glassTint: [1.0, 0.9, 0.75],
    fluidColor: [0.95, 0.58, 0.12], // Warm desert titanium amber cloud
    causticColor: [1.0, 0.82, 0.35],
    accentHex: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.35)",
  },
  blue: {
    glassTint: [0.7, 0.88, 1.0],
    fluidColor: [0.12, 0.52, 0.95], // OpenAI Spruce azure blue cloud
    causticColor: [0.55, 0.85, 1.0],
    accentHex: "#38bdf8",
    glowColor: "rgba(56, 189, 248, 0.35)",
  },
  purple: {
    glassTint: [0.88, 0.75, 1.0],
    fluidColor: [0.65, 0.32, 0.95], // Cosmic amethyst violet cloud
    causticColor: [0.88, 0.65, 1.0],
    accentHex: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.35)",
  },
  emerald: {
    glassTint: [0.75, 1.0, 0.85],
    fluidColor: [0.15, 0.82, 0.48], // Oceanic jade emerald cloud
    causticColor: [0.45, 0.95, 0.72],
    accentHex: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.35)",
  },
  white: {
    glassTint: [1.0, 1.0, 1.0],
    fluidColor: [0.25, 0.26, 0.30],
    causticColor: [1.0, 1.0, 1.0],
    accentHex: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.25)",
  },
};

const sizeScales = {
  sm: 0.85,
  md: 1.0,
  lg: 1.2,
};

export const AeroCore: React.FC<AeroCoreProps> = ({
  mode: initialMode = "simulate",
  theme = "black",
  color,
  size = "md",
  label = "Aero Core",
  onVoiceActivity,
  disabled = false,
  className = "",
}) => {
  const effectiveTheme = (color as keyof typeof themeConfigs) || theme || "black";
  const themeConfig = themeConfigs[effectiveTheme] || themeConfigs.black;
  const scale = sizeScales[size] || 1.0;

  const [activeMode, setActiveMode] = useState<"simulate" | "mic">(initialMode);
  const [isMicListening, setIsMicListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio / Voice Frequency Analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Acoustic Fluid Dynamic Parameters
  const bassSurgeRef = useRef(0);
  const midEnergyRef = useRef(0);
  const trebleRipplesRef = useRef(0);
  const sloshAngleRef = useRef(0);
  const pointerImpulseRef = useRef<[number, number]>([-1, -1]);
  const impulseTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Simulated Voice Generator (Smooth, Luxurious Respiratory Cadence without Bouncing)
  const simulateAudioStep = useCallback((time: number) => {
    // Elegant 4.8s speech breathing cadence
    const speechCycle = (time * 0.00075) % 4.8;
    const isSpeaking = speechCycle < 3.4;

    if (!isSpeaking) {
      return {
        bass: Math.sin(time * 0.001) * 0.03,
        mid: 0.015,
        treble: 0.01,
      };
    }

    // Smooth sinusoidal breath swell (NO rapid jitter or bouncy spikes)
    const swell = Math.sin((speechCycle / 3.4) * Math.PI);
    const modulation = 0.75 + Math.sin(time * 0.0018) * 0.22;
    const bass = Math.min(Math.max(swell * modulation, 0.0), 1.0);
    const mid = Math.min(Math.max(swell * (0.5 + Math.sin(time * 0.0025) * 0.2), 0.0), 1.0);
    const treble = Math.min(Math.max(swell * (0.35 + Math.sin(time * 0.004) * 0.15), 0.0), 1.0);

    return { bass, mid, treble };
  }, []);

  // Mic Activation / Teardown
  const startMic = useCallback(async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicListening(true);
      setActiveMode("mic");
    } catch (err: any) {
      console.warn("Microphone access failed:", err);
      setMicError("Microphone access denied");
      setActiveMode("simulate");
      setIsMicListening(false);
    }
  }, []);

  const stopMic = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsMicListening(false);
    setActiveMode("simulate");
  }, []);

  const pointerPosRef = useRef<[number, number]>([-2, -2]);

  // Handle Touch / Glass Knock on the Orb
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerImpulseRef.current = [x, y];
    impulseTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Normalized to [-1.0, 1.0] relative to 260px orb center
    const nx = (x - rect.width * 0.5) / (rect.width * 0.5);
    const ny = (y - 130) / 130;
    pointerPosRef.current = [nx, ny];
  };

  const handlePointerLeave = () => {
    pointerPosRef.current = [-2, -2];
  };

  // WebGL Enclosed Acoustic Resonance Chamber Shader
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

    // Real-Time Volumetric Soft Smoke & Nebula Cloud Sphere Shader
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_bass;         // Acoustic volume & radial billowing
      uniform float u_mid;          // Swirling vorticity
      uniform float u_treble;       // Micro-wisp feathering & caustic glints
      uniform float u_slosh;        // Ambient orbital drift
      uniform vec2 u_mouse;         // Interactive pointer stir position
      uniform vec2 u_impulse;       // Direct glass knock coordinate
      uniform float u_impulseTime;  // Knock elapsed time
      uniform float u_dpr;
      uniform vec3 u_tint;
      uniform vec3 u_fluidColor;
      uniform vec3 u_causticColor;

      // 2D Rotation matrix
      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
      }

      // Fast Gradient Noise
      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float gnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                       dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                       dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
      }

      // 5-Octave Rotational Fractional Brownian Motion (Smooth Ethereal Smoke)
      float fbm(vec2 p) {
        float f = 0.0;
        mat2 m = rot(0.5);
        f += 0.5000 * gnoise(p); p = m * p * 2.02;
        f += 0.2500 * gnoise(p); p = m * p * 2.03;
        f += 0.1250 * gnoise(p); p = m * p * 2.01;
        f += 0.0625 * gnoise(p); p = m * p * 2.04;
        f += 0.03125 * gnoise(p);
        return f;
      }

      void main() {
        vec2 p = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);

        float centerX = u_resolution.x * 0.5;
        float centerY = u_resolution.y * 0.5;
        float chamberRadius = 118.0 * u_dpr;
        float distFromCenter = length(p - vec2(centerX, centerY));

        if (distFromCenter > chamberRadius + 3.0 * u_dpr) {
          discard;
        }

        // Normalized space [-1.0, 1.0] inside the sphere
        vec2 uv = (p - vec2(centerX, centerY)) / chamberRadius;
        float r = length(uv);

        // Spherical Glass Envelope SDF
        float dOrb = distFromCenter - chamberRadius;

        // --- Interactive Mouse Stir Vorticity ---
        vec2 uvStir = uv;
        if (u_mouse.x > -0.95 && u_mouse.x < 0.95) {
          vec2 mouseDir = uv - u_mouse;
          float mouseDist = length(mouseDir);
          vec2 vortex = vec2(-mouseDir.y, mouseDir.x) * exp(-mouseDist * 3.5) * 0.35;
          uvStir += vortex;
        }

        // Domain-warped FBM Cloud Turbulence
        float timeScale = u_time * 0.45;
        vec2 q = uvStir * 1.6;
        
        // Horizontal cloud drift
        q.x += timeScale * 0.35 + u_slosh * 0.4;

        vec2 warp1 = vec2(
          fbm(q + vec2(timeScale * 0.2, 0.0)),
          fbm(q + vec2(4.2, -timeScale * 0.25))
        );

        vec2 warp2 = vec2(
          fbm(q + warp1 * 0.8 + vec2(0.0, timeScale * 0.3)),
          fbm(q + warp1 * 0.8 + vec2(timeScale * 0.25, 2.5))
        );

        float cloudNoise = fbm(q + warp2 * 0.85);

        // --- Atmospheric Cloud Horizon Level ---
        // At rest: cloud sits further down in the lower bowl (uv.y ~ 0.40), giving vast room to the white sky
        // Voice surge: bass & mids billow the smoke upwards
        float voiceSurge = clamp(u_bass * 0.65 + u_mid * 0.40, 0.0, 0.85);
        float horizonY = 0.42 - voiceSurge * 0.60;

        // Pure chaotic smoke filaments (NO periodic sine waves - completely random spread & size)
        vec2 pSmoke = uvStir * 2.4;
        pSmoke.x += timeScale * 0.22 + u_slosh * 0.35;
        pSmoke.y -= timeScale * 0.14; // Rising smoke draft

        vec2 w1 = vec2(
          fbm(pSmoke + vec2(timeScale * 0.15, 0.0)),
          fbm(pSmoke + vec2(5.2, -timeScale * 0.18))
        );
        vec2 w2 = vec2(
          fbm((pSmoke + w1 * 1.1) * 1.8 + vec2(0.0, timeScale * 0.22)),
          fbm((pSmoke + w1 * 1.1) * 1.8 + vec2(timeScale * 0.2, 3.4))
        );
        float smokeChaos = fbm((pSmoke + w2 * 0.9) * 2.2 + w1 * 0.5);

        // --- 3D Spherical Geometry & Circumference Wrapping ---
        float r2 = dot(uv, uv);
        float zDome = sqrt(max(1.0 - r2, 0.0)); // 3D depth of spherical dome (1.0 at center, 0.0 at rim)
        vec3 N = vec3(uv.x, uv.y, zDome); // 3D spherical surface normal

        // 3D Circumference Coverage:
        // In 3D, fluid climbs and wraps around the circular glass bowl's curved circumference!
        float circumferenceWrap = pow(clamp(r, 0.0, 1.0), 2.6) * 0.48;

        // Dynamic organic smoke boundary with varying wisps
        float cloudEdgeY = horizonY + (smokeChaos - 0.40) * 0.55;

        // Ultra-soft, wispy atmospheric transition + 3D circumference meniscus
        float cloudMix = smoothstep(cloudEdgeY - 0.32, cloudEdgeY + 0.36, uv.y);
        cloudMix = clamp(cloudMix + circumferenceWrap * (uv.y * 0.6 + 0.4), 0.0, 1.0);

        // Glass knock shockwave expanding through the cloud
        if (u_impulse.x > 0.0 && u_impulseTime >= 0.0 && u_impulseTime < 1.6) {
          float distToKnock = length(p - u_impulse);
          float radiusWave = u_impulseTime * (220.0 * u_dpr);
          float wave = sin(abs(distToKnock - radiusWave) * 0.25) * exp(-u_impulseTime * 3.5);
          cloudMix = clamp(cloudMix + wave * 0.2, 0.0, 1.0);
        }

        // --- Colors: Solid Luminous White Sky & Themed Cloud ---
        // 1. Pure Brilliant Luminous White Sky (Upper half)
        vec3 skyWhite = vec3(0.98, 0.99, 1.0);

        // 2. Dense Atmospheric Cloud (Lower half & 3D circumference wrap)
        vec3 cloudBase = mix(vec3(0.12, 0.14, 0.18), u_fluidColor, 0.85);
        vec3 cloudShadow = mix(vec3(0.04, 0.05, 0.08), u_fluidColor * 0.45, 0.9);
        vec3 cloudCol = mix(cloudBase, cloudShadow, clamp(cloudNoise * 0.7 + uv.y * 0.3, 0.0, 1.0));

        // Highlight crest where cloud meets white light
        float rimLight = pow(clamp(1.0 - abs(uv.y - cloudEdgeY) / 0.35, 0.0, 1.0), 2.5);
        cloudCol += rimLight * 0.25;

        // Blend: Sky White -> Billowing Cloud
        vec3 interiorCol = mix(skyWhite, cloudCol, cloudMix);

        // 3. True 3D Volumetric Spherical Glass Lighting
        vec3 lightDir = normalize(vec3(-0.45, -0.65, 0.60));
        float topSheen = pow(clamp(dot(N, lightDir), 0.0, 1.0), 4.2) * 0.32;
        float rimFresnel = pow(1.0 - zDome, 3.8) * 0.35; // Wraps around entire 360-deg circumference

        vec3 finalCol = interiorCol + topSheen + rimFresnel * (interiorCol * 0.8 + 0.2);

        // Solid, opaque orb inside the circle (smoothstep 1.5px antialiased boundary)
        float orbAlpha = smoothstep(1.5 * u_dpr, -1.5 * u_dpr, dOrb);

        gl_FragColor = vec4(finalCol * orbAlpha, orbAlpha);
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
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uBassLoc = gl.getUniformLocation(program, "u_bass");
    const uMidLoc = gl.getUniformLocation(program, "u_mid");
    const uTrebleLoc = gl.getUniformLocation(program, "u_treble");
    const uSloshLoc = gl.getUniformLocation(program, "u_slosh");
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uImpulseLoc = gl.getUniformLocation(program, "u_impulse");
    const uImpulseTimeLoc = gl.getUniformLocation(program, "u_impulseTime");
    const uDprLoc = gl.getUniformLocation(program, "u_dpr");
    const uTintLoc = gl.getUniformLocation(program, "u_tint");
    const uFluidColorLoc = gl.getUniformLocation(program, "u_fluidColor");
    const uCausticColorLoc = gl.getUniformLocation(program, "u_causticColor");

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

    let freqData = new Uint8Array(128);

    // 120 FPS Acoustic Hydrostatic Orb Render Loop
    const render = (time: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      let targetBass = 0;
      let targetMid = 0;
      let targetTreble = 0;

      // Extract Voice Frequencies (Live Mic vs Simulated Acoustic Generator)
      if (activeMode === "mic" && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);

        // Lows (20Hz - 250Hz)
        let bassSum = 0;
        for (let i = 0; i < 8; i++) bassSum += freqData[i];
        targetBass = bassSum / (8 * 255);

        // Mids (250Hz - 2kHz)
        let midSum = 0;
        for (let i = 8; i < 40; i++) midSum += freqData[i];
        targetMid = midSum / (32 * 255);

        // Highs (2kHz - 8kHz)
        let trebleSum = 0;
        for (let i = 40; i < 90; i++) trebleSum += freqData[i];
        targetTreble = trebleSum / (50 * 255);
      } else {
        const sim = simulateAudioStep(time);
        targetBass = sim.bass;
        targetMid = sim.mid;
        targetTreble = sim.treble;
      }

      // Viscous, weighted physical damping (Smooth, luxurious uplift with ZERO bounce)
      bassSurgeRef.current += (targetBass - bassSurgeRef.current) * 0.042;
      midEnergyRef.current += (targetMid - midEnergyRef.current) * 0.055;
      trebleRipplesRef.current += (targetTreble - trebleRipplesRef.current) * 0.08;

      onVoiceActivity?.(bassSurgeRef.current);

      // Inertial slosh sway
      sloshAngleRef.current = Math.sin(time * 0.0022) * 0.35 * (1.0 + bassSurgeRef.current * 1.5);

      // Canvas dimensions (260px orb inside 300px canvas for complete ripple clearance)
      const cssWidth = 300;
      const cssHeight = 300;
      const pixelWidth = Math.floor(cssWidth * dpr);
      const pixelHeight = Math.floor(cssHeight * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
      }

      // Convert impulse coordinates
      let canvasImpulseX = -1;
      let canvasImpulseY = -1;
      let elapsedImpulseSec = -1;

      if (pointerImpulseRef.current[0] >= 0) {
        canvasImpulseX = (pointerImpulseRef.current[0] + 20.0) * dpr;
        canvasImpulseY = (pointerImpulseRef.current[1] + 20.0) * dpr;
        elapsedImpulseSec = (performance.now() - impulseTimeRef.current) / 1000;
      }

      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uResolutionLoc, pixelWidth, pixelHeight);
      gl.uniform1f(uTimeLoc, time * 0.001);
      gl.uniform1f(uBassLoc, bassSurgeRef.current);
      gl.uniform1f(uMidLoc, midEnergyRef.current);
      gl.uniform1f(uTrebleLoc, trebleRipplesRef.current);
      gl.uniform1f(uSloshLoc, sloshAngleRef.current);
      gl.uniform2f(uMouseLoc, pointerPosRef.current[0], pointerPosRef.current[1]);
      gl.uniform2f(uImpulseLoc, canvasImpulseX, canvasImpulseY);
      gl.uniform1f(uImpulseTimeLoc, elapsedImpulseSec);
      gl.uniform1f(uDprLoc, dpr);
      gl.uniform3f(
        uTintLoc,
        themeConfig.glassTint[0],
        themeConfig.glassTint[1],
        themeConfig.glassTint[2]
      );
      gl.uniform3f(
        uFluidColorLoc,
        themeConfig.fluidColor[0],
        themeConfig.fluidColor[1],
        themeConfig.fluidColor[2]
      );
      gl.uniform3f(
        uCausticColorLoc,
        themeConfig.causticColor[0],
        themeConfig.causticColor[1],
        themeConfig.causticColor[2]
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
  }, [themeConfig, activeMode, simulateAudioStep, onVoiceActivity]);

  // Teardown mic stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`aero-core-container theme-${effectiveTheme} ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* 300px Interactive Enclosed Glass Chamber */}
      <div
        className="aero-core-orb-box"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <canvas ref={canvasRef} className="aero-core-canvas" aria-hidden="true" />
      </div>

      {/* Control & Mode Selector Bar */}
      <div className="aero-core-controls">
        <div className="aero-core-header-row">
          <span className="aero-core-title">{label}</span>
          <span className={`aero-status-indicator ${isMicListening ? "is-live" : "is-simulating"}`}>
            {isMicListening ? "Live Microphone" : "Acoustic Cadence"}
          </span>
        </div>

        <div className="aero-core-mode-buttons">
          <button
            type="button"
            className={`aero-mode-btn ${activeMode === "simulate" ? "active" : ""}`}
            onClick={stopMic}
          >
            Simulate Voice
          </button>
          <button
            type="button"
            className={`aero-mode-btn ${activeMode === "mic" ? "active" : ""}`}
            onClick={startMic}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Live Mic
          </button>
        </div>

        {micError && <span className="aero-mic-error">{micError}</span>}
      </div>
    </div>
  );
};

export default AeroCore;
