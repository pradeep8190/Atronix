import React, { useRef, useEffect, useState } from 'react';
import { sliderVsSource, sliderFsSource } from './silicaSliderShaders';
import './SilicaSlider.css';

export interface SilicaSliderProps {
  value?: number;
  defaultValue?: number;
  onChange?: (val: number) => void;
  className?: string;
  style?: React.CSSProperties;
}
export type LiquidGlassSliderProps = SilicaSliderProps;

// Geometric Constants (in CSS pixels from slider-app.js)
const THUMB_HALF_WIDTH = 54.0;
const THUMB_HALF_HEIGHT = 30.0;
const THUMB_RADIUS = 30.0;
const TRACK_HEIGHT = 10.0;
const TRACK_PADDING = 54.0;

// Optical Constants (from slider-app.js)
const OPTICAL_IOR = 1.52;
const OPTICAL_DISPERSION = 0.038;
const OPTICAL_LENS_HEIGHT = 14.0;

export const SilicaSlider: React.FC<SilicaSliderProps> = ({
  value: controlledValue,
  defaultValue = 72,
  onChange,
  className = '',
  style,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const initialFraction = (controlledValue !== undefined ? controlledValue : defaultValue) / 100;
  const [displayValue, setDisplayValue] = useState<number>(Math.round(initialFraction * 100));
  const [counterLeft, setCounterLeft] = useState<number>(0);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mutable animation state matching slider-app.js
  const stateRef = useRef({
    sliderValue: initialFraction,
    targetSliderValue: initialFraction,
    sliderVelocity: 0.0,
    isDragging: false,
    dpr: 1,
    prevThumbX: null as number | null,
    jellyStretchX: 1.0,
    jellyStretchY: 1.0,
    jellyVelocityX: 0.0,
    jellyVelocityY: 0.0,
    currentPressScale: 1.0,
    wobbleIntensity: 0.0,
    lastFrameTime: performance.now(),
    startTime: performance.now(),
  });

  // Sync controlled value if provided
  useEffect(() => {
    if (controlledValue !== undefined) {
      const frac = Math.max(0, Math.min(1, controlledValue / 100));
      stateRef.current.targetSliderValue = frac;
    }
  }, [controlledValue]);

  // Main WebGL Context & Physics Setup
  useEffect(() => {
    const stage = stageRef.current;
    const glCanvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!stage || !glCanvas || !overlay) return;

    const gl = glCanvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

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

    const vs = compile(gl.VERTEX_SHADER, sliderVsSource);
    const fs = compile(gl.FRAGMENT_SHADER, sliderFsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen Quad Buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Cache Uniform Locations (matching slider-app.js)
    const uBgLoc = gl.getUniformLocation(program, 'u_background');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');
    const uThumbPosLoc = gl.getUniformLocation(program, 'u_thumbPos');
    const uThumbHalfLoc = gl.getUniformLocation(program, 'u_thumbHalfSize');
    const uThumbRadLoc = gl.getUniformLocation(program, 'u_thumbRadius');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uSliderValLoc = gl.getUniformLocation(program, 'u_sliderVal');
    const uDragActiveLoc = gl.getUniformLocation(program, 'u_dragActive');
    const uIorLoc = gl.getUniformLocation(program, 'u_ior');
    const uDispLoc = gl.getUniformLocation(program, 'u_dispersion');
    const uLensHLoc = gl.getUniformLocation(program, 'u_lensHeight');
    const uWobbleLoc = gl.getUniformLocation(program, 'u_wobble');

    // Create Background Texture
    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Offscreen 2D Background Canvas
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

    const getTrackBounds = (width: number) => {
      const counterReserve = 56; // Room for percentage text at right end of slider line
      const totalGroupW = Math.min(560, width - 48);
      const trackW = Math.max(120, totalGroupW - counterReserve);
      const groupLeft = Math.max(24, (width - (trackW + counterReserve)) * 0.5);
      return {
        start: groupLeft,
        end: groupLeft + trackW,
      };
    };

    // Calculate Thumb X in CSS pixels
    const getThumbX = (val: number, width: number) => {
      const { start, end } = getTrackBounds(width);
      return start + val * (end - start);
    };

    // Calculate Value from Client X (clamped cleanly to [0.0, 1.0])
    const getValueFromClientX = (clientX: number) => {
      const rect = stage.getBoundingClientRect();
      const x = clientX - rect.left;
      const { start, end } = getTrackBounds(rect.width);
      const trackLength = Math.max(1, end - start);
      const clamped = Math.max(start, Math.min(end, x));
      return (clamped - start) / trackLength;
    };

    // Render Crisp 2D Background Track (left of glass is red, right of glass is grey, single unified card)
    const renderBackgroundTrack = (val: number) => {
      if (!bgCtx) return;
      const w = bgCanvas.width;
      const h = bgCanvas.height;
      const centerY = h * 0.5;

      const dpr = stateRef.current.dpr;

      const canvasCssW = w / dpr;
      const { start, end } = getTrackBounds(canvasCssW);
      const trackStart = start * dpr;
      const trackEnd = end * dpr;
      const totalTrackLen = Math.max(1, trackEnd - trackStart);
      const trackH = TRACK_HEIGHT * dpr;
      const trackR = trackH * 0.5;

      // 1. Studio Background Fill (Single unified background with subtle ambient glows)
      bgCtx.fillStyle = '#ffffff';
      bgCtx.fillRect(0, 0, w, h);

      const bgGrad = bgCtx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#f1f5f9');
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, w, h);

      const rad1 = bgCtx.createRadialGradient(w * 0.15, h * 0.15, 0, w * 0.15, h * 0.15, w * 0.40);
      rad1.addColorStop(0, 'rgba(225, 29, 72, 0.04)');
      rad1.addColorStop(1, 'rgba(225, 29, 72, 0)');
      bgCtx.fillStyle = rad1;
      bgCtx.fillRect(0, 0, w, h);

      const rad2 = bgCtx.createRadialGradient(w * 0.85, h * 0.85, 0, w * 0.85, h * 0.85, w * 0.45);
      rad2.addColorStop(0, 'rgba(244, 63, 94, 0.03)');
      rad2.addColorStop(1, 'rgba(244, 63, 94, 0)');
      bgCtx.fillStyle = rad2;
      bgCtx.fillRect(0, 0, w, h);

      // 2. Inactive Track (Full track base in frosted grey #e2e8f0)
      bgCtx.beginPath();
      bgCtx.roundRect(trackStart, centerY - trackR, totalTrackLen, trackH, trackR);
      bgCtx.fillStyle = '#e2e8f0';
      bgCtx.fill();

      // 3. Active Track (Apple Crimson Rose / Ruby gradient stopping under the glass thumb)
      const clampedVal = Math.max(0.0, Math.min(1.0, val));
      const activeWidth = Math.max(0, Math.min(totalTrackLen, clampedVal * totalTrackLen + 6.0 * dpr));
      if (activeWidth > 0) {
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.roundRect(trackStart, centerY - trackR, activeWidth, trackH, trackR);

        const redGrad = bgCtx.createLinearGradient(trackStart, 0, trackStart + activeWidth, 0);
        redGrad.addColorStop(0, '#be123c');   // Deep rich carmine ruby
        redGrad.addColorStop(0.5, '#e11d48'); // Luxurious Apple rose-ruby
        redGrad.addColorStop(1, '#f43f5e');   // Luminous soft coral rose
        bgCtx.fillStyle = redGrad;
        bgCtx.fill();
        bgCtx.restore();
      }

      // Upload rendered canvas to WebGL texture
      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
    };

    // Resize Handler (ensuring bgCanvas and glCanvas are always identical size)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stateRef.current.dpr = dpr;
      const rect = stage.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      glCanvas.width = width;
      glCanvas.height = height;
      bgCanvas.width = width;
      bgCanvas.height = height;
      gl.viewport(0, 0, width, height);

      const { end } = getTrackBounds(rect.width);
      setCounterLeft(Math.round(end + 16));
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    // Event Listeners for Drag and Touch (exact from slider-app.js)
    const onPointerDown = (e: PointerEvent) => {
      const st = stateRef.current;
      st.isDragging = true;
      try {
        overlay.setPointerCapture(e.pointerId);
      } catch (_) {}
      st.targetSliderValue = getValueFromClientX(e.clientX);

      // Gentle tactile cushion on press
      st.jellyVelocityY -= 1.0;
      st.jellyVelocityX += 0.8;
    };

    const onPointerMove = (e: PointerEvent) => {
      const st = stateRef.current;
      if (!st.isDragging) return;
      st.targetSliderValue = getValueFromClientX(e.clientX);
    };

    const onPointerUp = (e: PointerEvent) => {
      const st = stateRef.current;
      if (!st.isDragging) return;
      st.isDragging = false;
      try {
        overlay.releasePointerCapture(e.pointerId);
      } catch (_) {}

      st.targetSliderValue = getValueFromClientX(e.clientX);

      // Gentle elastic pop on release
      st.jellyVelocityY += 1.0;
      st.jellyVelocityX -= 0.6;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const st = stateRef.current;
      let delta = 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -0.05;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 0.05;
      if (e.key === 'Home') st.targetSliderValue = 0;
      if (e.key === 'End') st.targetSliderValue = 1;

      if (delta !== 0) {
        e.preventDefault();
        st.targetSliderValue = Math.max(0.0, Math.min(1.0, st.targetSliderValue + delta));
        st.sliderVelocity += delta * 2.0; // Gentle spring nudge
        st.jellyVelocityX += delta > 0 ? 1.2 : -1.2;
      }
    };

    overlay.addEventListener('pointerdown', onPointerDown);
    overlay.addEventListener('pointermove', onPointerMove);
    overlay.addEventListener('pointerup', onPointerUp);
    overlay.addEventListener('pointercancel', onPointerUp);
    overlay.addEventListener('keydown', onKeyDown);

    // Main Render Loop (exact math from slider-app.js)
    let animId = 0;

    const render = () => {
      const st = stateRef.current;
      const now = performance.now();
      const dt = Math.min((now - st.lastFrameTime) * 0.001, 0.033);
      st.lastFrameTime = now;

      // 1. Position Tracking & Tactile Spring Bounce
      if (st.isDragging) {
        const dragResponsiveness = Math.min(dt * 32.0, 0.65);
        const prevVal = st.sliderValue;
        st.sliderValue += (st.targetSliderValue - st.sliderValue) * dragResponsiveness;
        st.sliderVelocity = (st.sliderValue - prevVal) / Math.max(dt, 0.001);
      } else {
        const springK = 280.0;
        const springDamp = 22.0;
        const displacement = st.sliderValue - st.targetSliderValue;
        const springForce = -springK * displacement - springDamp * st.sliderVelocity;
        st.sliderVelocity += springForce * dt;
        st.sliderValue += st.sliderVelocity * dt;

        if (Math.abs(displacement) < 0.0003 && Math.abs(st.sliderVelocity) < 0.003) {
          st.sliderValue = st.targetSliderValue;
          st.sliderVelocity = 0.0;
        }
      }

      st.sliderValue = Math.max(0.0, Math.min(1.0, st.sliderValue));

      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      const currentThumbX = getThumbX(st.sliderValue, stageWidth);
      const currentThumbY = stageHeight * 0.5;

      // 2. Jelly Squash, Stretch & Wobble
      if (st.prevThumbX === null) st.prevThumbX = currentThumbX;
      const thumbSpeed = (currentThumbX - st.prevThumbX) / Math.max(dt, 0.001);
      st.prevThumbX = currentThumbX;

      const absThumbSpeed = Math.abs(thumbSpeed);
      const maxStretch = 0.12;
      const dynamicStretch = Math.min(absThumbSpeed * 0.00032, maxStretch);
      const baseTargetSx = 1.0 + dynamicStretch;
      const baseTargetSy = 1.0 - dynamicStretch * 0.50;

      const pressSpreadX = st.isDragging ? 0.02 : 0.0;
      const pressSquashY = st.isDragging ? 0.02 : 0.0;

      const targetStretchX = baseTargetSx + pressSpreadX;
      const targetStretchY = baseTargetSy - pressSquashY;

      const jellyK = 290.0;
      const jellyDamp = 20.0;

      const forceX = -jellyK * (st.jellyStretchX - targetStretchX) - jellyDamp * st.jellyVelocityX;
      st.jellyVelocityX += forceX * dt;
      st.jellyStretchX += st.jellyVelocityX * dt;

      const forceY = -jellyK * (st.jellyStretchY - targetStretchY) - jellyDamp * st.jellyVelocityY;
      st.jellyVelocityY += forceY * dt;
      st.jellyStretchY += st.jellyVelocityY * dt;

      st.jellyStretchX = Math.max(0.85, Math.min(1.18, st.jellyStretchX));
      st.jellyStretchY = Math.max(0.85, Math.min(1.18, st.jellyStretchY));

      const targetPressScale = st.isDragging ? 1.015 : 1.0;
      st.currentPressScale += (targetPressScale - st.currentPressScale) * Math.min(dt * 20.0, 1.0);

      const dynamicHalfW = THUMB_HALF_WIDTH * st.jellyStretchX * st.currentPressScale;
      const dynamicHalfH = THUMB_HALF_HEIGHT * st.jellyStretchY * st.currentPressScale;
      const dynamicRadius = Math.min(dynamicHalfW, dynamicHalfH);

      const fluidThickness = 1.0 / Math.max(0.80, Math.sqrt(st.jellyStretchX * st.jellyStretchY));
      const dynamicLensHeight = OPTICAL_LENS_HEIGHT * fluidThickness * st.dpr;

      st.wobbleIntensity = Math.min((Math.abs(st.jellyVelocityX) + Math.abs(st.jellyVelocityY)) * 0.02, 0.15);

      renderBackgroundTrack(st.sliderValue);

      gl.useProgram(program);
      gl.uniform1i(uBgLoc, 0);
      gl.uniform2f(uResLoc, glCanvas.width, glCanvas.height);

      const glThumbX = currentThumbX * st.dpr;
      const glThumbY = (stageHeight - currentThumbY) * st.dpr;
      gl.uniform2f(uThumbPosLoc, glThumbX, glThumbY);

      gl.uniform2f(uThumbHalfLoc, dynamicHalfW * st.dpr, dynamicHalfH * st.dpr);
      gl.uniform1f(uThumbRadLoc, dynamicRadius * st.dpr);

      const time = (performance.now() - st.startTime) * 0.001;
      gl.uniform1f(uTimeLoc, time);
      gl.uniform1f(uSliderValLoc, st.sliderValue);
      gl.uniform1f(uDragActiveLoc, st.isDragging ? 1.0 : 0.0);

      gl.uniform1f(uIorLoc, OPTICAL_IOR);
      gl.uniform1f(uDispLoc, OPTICAL_DISPERSION);
      gl.uniform1f(uLensHLoc, dynamicLensHeight);
      gl.uniform1f(uWobbleLoc, st.wobbleIntensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const currentIntVal = Math.round(st.sliderValue * 100);
      setDisplayValue(currentIntVal);
      overlay.setAttribute('aria-valuenow', String(currentIntVal));

      if (onChangeRef.current) {
        onChangeRef.current(currentIntVal);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      overlay.removeEventListener('pointerdown', onPointerDown);
      overlay.removeEventListener('pointermove', onPointerMove);
      overlay.removeEventListener('pointerup', onPointerUp);
      overlay.removeEventListener('pointercancel', onPointerUp);
      overlay.removeEventListener('keydown', onKeyDown);
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(bgTexture);
    };
  }, []);

  return (
    <div className={`silica-slider-root liquid-glass-slider-root ${className}`} style={style}>
      <div className="slider-stage" ref={stageRef}>
        <canvas id="glcanvas" ref={canvasRef} />
        <div
          className="slider-overlay"
          ref={overlayRef}
          tabIndex={0}
          role="slider"
          aria-label="Liquid Glass Slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={displayValue}
        />
        {counterLeft > 0 && (
          <div
            className="slider-value-counter"
            style={{ left: `${counterLeft}px` }}
            aria-hidden="true"
          >
            {displayValue}%
          </div>
        )}
      </div>
    </div>
  );
};

export const LiquidGlassSlider = SilicaSlider;
export default SilicaSlider;
