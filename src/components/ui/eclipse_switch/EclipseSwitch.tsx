import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toggleVsSource, toggleFsSource } from './eclipseSwitchShaders';
import './EclipseSwitch.css';

export interface EclipseSwitchProps {
  defaultDark?: boolean;
  onChange?: (isDark: boolean) => void;
  soundEnabled?: boolean;
  showHint?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export type ThemeChangeProps = EclipseSwitchProps;

const CONFIG = {
  trackWidth: 210,
  trackHeight: 70,
  trackRadius: 35,
  thumbHalfWidth: 57,
  thumbHalfHeight: 70,
  thumbRadius: 57,
  ior: 1.22,
  dispersion: 0.00,
  lensHeight: 34.0,
};

// Precision SVG Crescent Moon Path
const moonSvgPath = typeof window !== 'undefined' ? new Path2D('M 9 0.79 A 9 9 0 1 1 -0.79 -9 A 7 7 0 0 0 9 0.79 Z') : null;

export const EclipseSwitch: React.FC<EclipseSwitchProps> = ({
  defaultDark = false,
  onChange,
  soundEnabled = true,
  showHint = false,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState<boolean>(defaultDark);

  // Audio Context Ref for synthesized click
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoftClick = useCallback((targetDark: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      const freqStart = targetDark ? 440 : 640;
      const freqEnd = targetDark ? 280 : 880;

      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext blocked or unsupported
    }
  }, [soundEnabled]);

  // Keep state mutable refs for WebGL animation loop
  const animStateRef = useRef({
    width: 800,
    height: 500,
    dpr: 1,
    targetMode: defaultDark ? 1 : 0,
    currentModeProgress: defaultDark ? 1.0 : 0.0,
    trackX: 400,
    trackY: 250,
    thumbX: 400 - (CONFIG.trackWidth * 0.5 - CONFIG.trackRadius),
    thumbY: 250,
    targetThumbX: 400 - (CONFIG.trackWidth * 0.5 - CONFIG.trackRadius),
    velThumbX: 0,
    rippleTime: 999.0,
    rippleX: 0,
    rippleY: 0,
    bgDirty: true,
  });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: false });
    if (!gl) return;

    // Helper functions for 2D background drawing
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpColor = (c1: number[], c2: number[], t: number) => [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t)),
      lerp(c1[3] !== undefined ? c1[3] : 1, c2[3] !== undefined ? c2[3] : 1, t),
    ];
    const rgbaStr = (arr: number[]) => `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;

    const drawRoundedPill = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
      const hw = width * 0.5;
      const hh = height * 0.5;
      const r = Math.min(radius, hh, hw);

      ctx.beginPath();
      ctx.moveTo(x - hw + r, y - hh);
      ctx.lineTo(x + hw - r, y - hh);
      ctx.arc(x + hw - r, y - hh + r, r, -Math.PI * 0.5, 0);
      ctx.lineTo(x + hw, y + hh - r);
      ctx.arc(x + hw - r, y + hh - r, r, 0, Math.PI * 0.5);
      ctx.lineTo(x - hw + r, y + hh);
      ctx.arc(x - hw + r, y + hh - r, r, Math.PI * 0.5, Math.PI);
      ctx.lineTo(x - hw, y - hh + r);
      ctx.arc(x - hw + r, y - hh + r, r, Math.PI, Math.PI * 1.5);
      ctx.closePath();
    };

    const drawSunIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, opacity: number, scale = 1.0) => {
      if (opacity <= 0.001) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;

      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 6;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      const rayInner = 12.5;
      const rayOuter = 18.5;

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(cosA * rayInner, sinA * rayInner);
        ctx.lineTo(cosA * rayOuter, sinA * rayOuter);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawMoonIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, opacity: number, scale = 1.0) => {
      if (opacity <= 0.001 || !moonSvgPath) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.24);
      ctx.scale(scale * 1.45, scale * 1.45);
      ctx.globalAlpha = opacity;

      ctx.shadowColor = 'rgba(255, 255, 255, 0.90)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.fill(moonSvgPath);

      ctx.shadowBlur = 4;
      ctx.fill(moonSvgPath);
      ctx.restore();
    };

    // Compile Shaders
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, toggleVsSource);
    const fs = compile(gl.FRAGMENT_SHADER, toggleFsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uThumbPosLoc = gl.getUniformLocation(program, 'u_thumbPos');
    const uThumbHalfLoc = gl.getUniformLocation(program, 'u_thumbHalfSize');
    const uThumbRadLoc = gl.getUniformLocation(program, 'u_thumbRadius');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uRippleTimeLoc = gl.getUniformLocation(program, 'u_rippleTime');
    const uRippleOrigLoc = gl.getUniformLocation(program, 'u_rippleOrigin');
    const uIorLoc = gl.getUniformLocation(program, 'u_ior');
    const uDispLoc = gl.getUniformLocation(program, 'u_dispersion');
    const uLensHLoc = gl.getUniformLocation(program, 'u_lensHeight');
    const uThemeProgLoc = gl.getUniformLocation(program, 'u_themeProgress');

    // WebGL Background Texture
    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Offscreen 2D Background Canvas
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

    const getTravelBounds = (st: typeof animStateRef.current) => {
      const travelHalf = CONFIG.trackWidth * 0.5 - CONFIG.trackRadius;
      return {
        leftX: st.trackX - travelHalf,
        rightX: st.trackX + travelHalf,
        travelHalf,
      };
    };

    const drawBackground = () => {
      if (!bgCtx) return;
      const st = animStateRef.current;
      const w = Math.round(st.width * st.dpr);
      const h = Math.round(st.height * st.dpr);
      if (bgCanvas.width !== w || bgCanvas.height !== h) {
        bgCanvas.width = w;
        bgCanvas.height = h;
      }

      bgCtx.save();
      bgCtx.scale(st.dpr, st.dpr);

      const sw = st.width;
      const sh = st.height;
      const prog = st.currentModeProgress;

      // Ambient Studio Backdrop
      const bgCenterLight = [218, 222, 228];
      const bgMidLight = [198, 202, 210];
      const bgEdgeLight = [174, 178, 186];
      const bgCenterDark = [40, 42, 48];
      const bgMidDark = [28, 29, 34];
      const bgEdgeDark = [18, 19, 23];

      const cCenter = lerpColor(bgCenterLight, bgCenterDark, prog);
      const cMid = lerpColor(bgMidLight, bgMidDark, prog);
      const cEdge = lerpColor(bgEdgeLight, bgEdgeDark, prog);

      const bgGrad = bgCtx.createRadialGradient(st.trackX, st.trackY * 0.95, 60, st.trackX, st.trackY, sw * 0.75);
      bgGrad.addColorStop(0.0, rgbaStr(cCenter));
      bgGrad.addColorStop(0.45, rgbaStr(cMid));
      bgGrad.addColorStop(1.0, rgbaStr(cEdge));
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, sw, sh);

      // Studio Key Light
      const keyLightProg = bgCtx.createRadialGradient(st.trackX - 60, st.trackY - 140, 20, st.trackX, st.trackY, 420);
      const keyAlpha = lerp(0.16, 0.06, prog);
      keyLightProg.addColorStop(0, `rgba(255, 255, 255, ${keyAlpha})`);
      keyLightProg.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      bgCtx.fillStyle = keyLightProg;
      bgCtx.fillRect(0, 0, sw, sh);

      // Track Multi-tier Shadow
      const tx = st.trackX;
      const ty = st.trackY;
      const tw = CONFIG.trackWidth;
      const th = CONFIG.trackHeight;
      const tr = CONFIG.trackRadius;

      bgCtx.save();
      bgCtx.filter = 'blur(18px)';
      drawRoundedPill(bgCtx, tx, ty + 8, tw, th, tr);
      bgCtx.fillStyle = `rgba(0, 0, 0, ${lerp(0.12, 0.44, prog)})`;
      bgCtx.fill();
      bgCtx.restore();

      bgCtx.save();
      bgCtx.filter = 'blur(7px)';
      drawRoundedPill(bgCtx, tx, ty + 4, tw, th, tr);
      bgCtx.fillStyle = `rgba(0, 0, 0, ${lerp(0.08, 0.28, prog)})`;
      bgCtx.fill();
      bgCtx.restore();

      bgCtx.save();
      bgCtx.filter = 'blur(2.5px)';
      drawRoundedPill(bgCtx, tx, ty + 2, tw, th, tr);
      bgCtx.fillStyle = `rgba(0, 0, 0, ${lerp(0.05, 0.20, prog)})`;
      bgCtx.fill();
      bgCtx.restore();

      // Track Base Fill
      bgCtx.save();
      drawRoundedPill(bgCtx, tx, ty, tw, th, tr);
      const trackGrad = bgCtx.createLinearGradient(tx, ty - th * 0.5, tx, ty + th * 0.5);
      const trackTopLight = [226, 230, 238];
      const trackBottomLight = [184, 188, 196];
      const trackTopDark = [40, 43, 50];
      const trackBottomDark = [16, 17, 21];

      trackGrad.addColorStop(0.0, rgbaStr(lerpColor(trackTopLight, trackTopDark, prog)));
      trackGrad.addColorStop(1.0, rgbaStr(lerpColor(trackBottomLight, trackBottomDark, prog)));
      bgCtx.fillStyle = trackGrad;
      bgCtx.fill();

      // Inset bottom shadow
      const insetBottomGrad = bgCtx.createLinearGradient(tx, ty + th * 0.5 - 22, tx, ty + th * 0.5);
      insetBottomGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
      insetBottomGrad.addColorStop(1.0, `rgba(0, 0, 0, ${lerp(0.10, 0.30, prog)})`);
      bgCtx.fillStyle = insetBottomGrad;
      bgCtx.fill();
      bgCtx.restore();

      // Bevel Contour
      bgCtx.save();
      drawRoundedPill(bgCtx, tx, ty, tw, th, tr);
      const bevelBorderGrad = bgCtx.createLinearGradient(tx, ty - th * 0.5, tx, ty + th * 0.5);
      const topBorderAlpha = lerp(0.30, 0.08, prog);
      const bottomBorderAlpha = lerp(0.08, 0.32, prog);
      bevelBorderGrad.addColorStop(0.0, `rgba(255, 255, 255, ${topBorderAlpha})`);
      bevelBorderGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
      bevelBorderGrad.addColorStop(0.70, 'rgba(0, 0, 0, 0.0)');
      bevelBorderGrad.addColorStop(1.0, `rgba(0, 0, 0, ${bottomBorderAlpha})`);
      bgCtx.lineWidth = 1.0;
      bgCtx.strokeStyle = bevelBorderGrad;
      bgCtx.stroke();
      bgCtx.restore();

      // Top 3D Bevel Glint
      const hwTrack = tw * 0.5;
      const hhTrack = th * 0.5;

      bgCtx.save();
      drawRoundedPill(bgCtx, tx, ty, tw, th, tr);
      bgCtx.clip();

      const dropAlpha = lerp(0.46, 0.11, prog);
      const topSheen = bgCtx.createLinearGradient(0, ty - hhTrack, 0, ty - hhTrack + 8.5);
      topSheen.addColorStop(0.0, `rgba(255, 255, 255, ${dropAlpha})`);
      topSheen.addColorStop(0.30, `rgba(255, 255, 255, ${dropAlpha * 0.40})`);
      topSheen.addColorStop(0.70, `rgba(255, 255, 255, ${dropAlpha * 0.10})`);
      topSheen.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      bgCtx.fillStyle = topSheen;
      bgCtx.fillRect(tx - hwTrack, ty - hhTrack, tw, 9);

      const specGlintAlpha = lerp(0.28, 0.06, prog);
      const rimGrad = bgCtx.createLinearGradient(tx - hwTrack, 0, tx + hwTrack, 0);
      rimGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.0)');
      rimGrad.addColorStop(0.20, `rgba(255, 255, 255, ${specGlintAlpha * 0.35})`);
      rimGrad.addColorStop(0.50, `rgba(255, 255, 255, ${specGlintAlpha})`);
      rimGrad.addColorStop(0.80, `rgba(255, 255, 255, ${specGlintAlpha * 0.35})`);
      rimGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

      bgCtx.filter = 'blur(1.4px)';
      bgCtx.beginPath();
      bgCtx.arc(tx - hwTrack + tr, ty - hhTrack + tr, tr, -Math.PI * 0.82, -Math.PI * 0.5);
      bgCtx.lineTo(tx + hwTrack - tr, ty - hhTrack);
      bgCtx.arc(tx + hwTrack - tr, ty - hhTrack + tr, tr, -Math.PI * 0.5, -Math.PI * 0.18);
      bgCtx.lineWidth = 1.0;
      bgCtx.lineCap = 'round';
      bgCtx.strokeStyle = rimGrad;
      bgCtx.stroke();
      bgCtx.restore();

      // Icons & Labels
      const { leftX, rightX } = getTravelBounds(st);
      const sunOpacity = Math.max(0, 1.0 - prog * 1.8);
      drawSunIcon(bgCtx, leftX, ty, sunOpacity, 1.0);

      const darkTextOpacity = Math.max(0, (prog - 0.3) / 0.7);
      if (darkTextOpacity > 0.01) {
        bgCtx.save();
        bgCtx.font = '600 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = `rgba(88, 92, 102, ${darkTextOpacity})`;
        bgCtx.fillText('Dark', tx - 48, ty + 1);
        bgCtx.restore();
      }

      const lightTextOpacity = Math.max(0, (0.7 - prog) / 0.7);
      if (lightTextOpacity > 0.01) {
        bgCtx.save();
        bgCtx.font = '600 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = `rgba(255, 255, 255, ${lightTextOpacity * 0.96})`;
        bgCtx.fillText('Light', tx + 48, ty + 1);
        bgCtx.restore();
      }

      const moonOpacity = Math.max(0, (prog - 0.2) / 0.8);
      drawMoonIcon(bgCtx, rightX, ty, moonOpacity, 1.0);

      bgCtx.restore();

      // Upload to WebGL
      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
      st.bgDirty = false;
    };

    // Resize Handler via ResizeObserver
    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width, 360);
      const h = Math.max(rect.height, 360);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const st = animStateRef.current;
      st.width = w;
      st.height = h;
      st.dpr = dpr;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      st.trackX = w * 0.5;
      st.trackY = h * 0.5;
      st.thumbY = st.trackY;

      const { leftX, rightX } = getTravelBounds(st);
      st.thumbX = lerp(leftX, rightX, st.currentModeProgress);
      st.targetThumbX = st.targetMode === 0 ? leftX : rightX;

      drawBackground();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Interaction Handlers
    const triggerRipple = (x: number, y: number) => {
      const st = animStateRef.current;
      st.rippleTime = 0.0;
      st.rippleX = x * st.dpr;
      st.rippleY = (st.height - y) * st.dpr;
    };

    const toggleMode = (clickX?: number, clickY?: number) => {
      const st = animStateRef.current;
      const newTarget = st.targetMode === 0 ? 1 : 0;
      st.targetMode = newTarget;
      const { leftX, rightX } = getTravelBounds(st);
      st.targetThumbX = newTarget === 0 ? leftX : rightX;

      if (clickX !== undefined && clickY !== undefined) {
        triggerRipple(clickX, clickY);
      } else {
        triggerRipple(st.thumbX, st.thumbY);
      }

      playSoftClick(newTarget === 1);
      setIsDark(newTarget === 1);
      if (onChangeRef.current) {
        onChangeRef.current(newTarget === 1);
      }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      toggleMode(x, y);
    };

    canvas.addEventListener('click', onPointerDown);

    // Animation Loop
    let animId = 0;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const st = animStateRef.current;

      const { leftX, rightX } = getTravelBounds(st);
      const springStiffness = 140.0;
      const damping = 0.78;

      const forceX = (st.targetThumbX - st.thumbX) * springStiffness;
      st.velThumbX = (st.velThumbX + forceX * dt) * damping;
      st.thumbX += st.velThumbX * dt;

      if (Math.abs(st.targetThumbX - st.thumbX) < 0.2 && Math.abs(st.velThumbX) < 0.5) {
        st.thumbX = st.targetThumbX;
        st.velThumbX = 0;
      }

      const prevProgress = st.currentModeProgress;
      const rawProgress = (st.thumbX - leftX) / (rightX - leftX);
      st.currentModeProgress = Math.max(0.0, Math.min(1.0, rawProgress));

      if (Math.abs(st.currentModeProgress - prevProgress) > 0.002 || st.bgDirty) {
        drawBackground();
      }

      st.rippleTime += dt;

      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      const glThumbX = st.thumbX * st.dpr;
      const glThumbY = (st.height - st.thumbY) * st.dpr;
      gl.uniform2f(uThumbPosLoc, glThumbX, glThumbY);

      gl.uniform2f(uThumbHalfLoc, CONFIG.thumbHalfWidth * st.dpr, CONFIG.thumbHalfHeight * st.dpr);
      gl.uniform1f(uThumbRadLoc, CONFIG.thumbRadius * st.dpr);

      gl.uniform1f(uIorLoc, CONFIG.ior);
      gl.uniform1f(uDispLoc, CONFIG.dispersion);
      gl.uniform1f(uLensHLoc, CONFIG.lensHeight * st.dpr);
      gl.uniform1f(uThemeProgLoc, st.currentModeProgress);

      gl.uniform1f(uTimeLoc, currentTime * 0.001);
      gl.uniform1f(uRippleTimeLoc, st.rippleTime);
      gl.uniform2f(uRippleOrigLoc, st.rippleX, st.rippleY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('click', onPointerDown);
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(bgTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, [playSoftClick]);

  return (
    <div
      ref={containerRef}
      className={`eclipse-switch-root theme-change-root ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className="eclipse-switch-canvas theme-change-canvas" />
      {showHint && (
        <div className={`eclipse-switch-hint theme-change-hint ${!isDark ? 'light-mode' : ''}`}>
          <span>Click switch to toggle Light & Dark mode • Real-time Snell's Law liquid optics</span>
        </div>
      )}
    </div>
  );
};

export const ThemeChange = EclipseSwitch;
export default EclipseSwitch;
