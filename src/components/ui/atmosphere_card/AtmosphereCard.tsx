import React, { useRef, useEffect, useState, useCallback } from 'react';
import { atmosphereVsSource, atmosphereFsSource } from './atmosphereCardShaders';
import './AtmosphereCard.css';

export interface WeatherItem {
  time: Date;
  hour: number;
  diffHours: number;
  label: string;
  isCurrent: boolean;
  tempC: number;
  tempF: number;
  condition: string;
  isDay: boolean;
}

export interface AtmosphereCardProps {
  defaultCity?: string;
  initialCelsius?: boolean;
  onHourChange?: (item: WeatherItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

export type ClimateWeatherProps = AtmosphereCardProps;

const OPTICAL_IOR = 1.54;
const OPTICAL_DISPERSION = 0.048;
const BASE_LENS_HEIGHT = 16.0;

const CARD_WIDTH_CSS = 390.0;
const CARD_HEIGHT_CSS = 185.0;
const CARD_RADIUS_CSS = 30.0;

const ITEM_WIDTH = 64;
const ITEM_GAP = 16;
const DIGIT_HEIGHT = 44;

function cToF(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

function formatHourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h} ${ampm}`;
}

function getWeatherCondition(code: number, isDay: boolean): string {
  switch (code) {
    case 0:
      return isDay ? 'Clear Sky' : 'Clear Night';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Foggy';
    case 51:
    case 53:
    case 55:
      return 'Light Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 71:
    case 73:
    case 75:
      return 'Snowfall';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm';
    default:
      return isDay ? 'Sunny' : 'Clear Night';
  }
}

function generateInitialTimeline(): WeatherItem[] {
  const now = new Date();
  const timeline: WeatherItem[] = [];
  const baseTemp = 24;

  for (let offset = -12; offset <= 16; offset++) {
    const targetDate = new Date(now.getTime() + offset * 3600 * 1000);
    const h = targetDate.getHours();
    const isDay = h >= 6 && h <= 19;
    const dayProgress = Math.sin(((h - 8) / 24) * Math.PI * 2);
    const tempC = Math.round(baseTemp + dayProgress * 5 + offset * 0.1);
    const tempF = cToF(tempC);
    const isCurrent = offset === 0;
    const label = isCurrent ? 'Now' : formatHourLabel(h);
    const condition = isDay ? (tempC > 25 ? 'Mostly Sunny' : 'Partly Cloudy') : 'Clear Night';

    timeline.push({
      time: targetDate,
      hour: h,
      diffHours: offset,
      label,
      isCurrent,
      tempC,
      tempF,
      condition,
      isDay,
    });
  }

  return timeline;
}

export const AtmosphereCard: React.FC<AtmosphereCardProps> = ({
  defaultCity = 'San Francisco',
  initialCelsius = true,
  onHourChange,
  className = '',
  style,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerElRef = useRef<HTMLDivElement>(null);
  const wheelElRef = useRef<HTMLDivElement>(null);

  const [city, setCity] = useState(defaultCity);
  const [isCelsius, setIsCelsius] = useState(initialCelsius);
  const [timeline, setTimeline] = useState<WeatherItem[]>(() => generateInitialTimeline());
  const [currentIndex, setCurrentIndex] = useState(12); // Now is offset 0, index 12

  const onHourChangeRef = useRef(onHourChange);
  onHourChangeRef.current = onHourChange;

  // Mutable dial scrubber & physics state
  const dialRef = useRef({
    currentIndex: 12,
    wheelOffset: 0,
    targetWheelOffset: 0,
    wheelVelocity: 0,
    isDragging: false,
    startX: 0,
    startOffset: 0,
    lastDragX: 0,
    lastDragTime: 0,
  });

  const currentItem = timeline[currentIndex] || timeline[0];

  const getOffsetForIndex = useCallback((idx: number) => {
    const container = containerElRef.current;
    const containerWidth = container ? container.clientWidth : 340;
    const itemOffset = idx * (ITEM_WIDTH + ITEM_GAP);
    return containerWidth * 0.5 - itemOffset - ITEM_WIDTH * 0.5;
  }, []);

  const goToIndex = useCallback(
    (idx: number, animate = true) => {
      const clamped = Math.max(0, Math.min(timeline.length - 1, idx));
      const targetOffset = getOffsetForIndex(clamped);
      dialRef.current.currentIndex = clamped;
      dialRef.current.targetWheelOffset = targetOffset;
      if (!animate) {
        dialRef.current.wheelOffset = targetOffset;
      }
      setCurrentIndex(clamped);
      if (onHourChangeRef.current && timeline[clamped]) {
        onHourChangeRef.current(timeline[clamped]);
      }
    },
    [getOffsetForIndex, timeline]
  );

  // Return to 'Now'
  const handleReturnNow = useCallback(() => {
    const nowIdx = timeline.findIndex((item) => item.isCurrent);
    if (nowIdx >= 0) {
      goToIndex(nowIdx, true);
    }
  }, [goToIndex, timeline]);

  // Toggle Celsius / Fahrenheit
  const handleToggleUnit = useCallback(() => {
    setIsCelsius((prev) => !prev);
  }, []);

  // Fetch real-time weather in background
  useEffect(() => {
    let cancelled = false;

    async function loadRealWeather() {
      try {
        let lat = 37.7749;
        let lon = -122.4194;
        let detectedCity = defaultCity;

        // Try IP detection
        try {
          const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.city && ipData.latitude && ipData.longitude) {
              lat = parseFloat(ipData.latitude);
              lon = parseFloat(ipData.longitude);
              detectedCity = ipData.city;
            }
          }
        } catch {
          // Keep defaults
        }

        if (cancelled) return;
        setCity(detectedCity);

        // Open-Meteo forecast
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&current_weather=true&past_days=1&forecast_days=2&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.hourly?.time) return;

        const times: string[] = data.hourly.time;
        const temps: number[] = data.hourly.temperature_2m;
        const codes: number[] = data.hourly.weathercode;
        const now = new Date();

        const newTimeline: WeatherItem[] = [];
        let nowIdx = -1;

        for (let i = 0; i < times.length; i++) {
          const dateObj = new Date(times[i]);
          const hour = dateObj.getHours();
          const tempC = Math.round(temps[i]);
          const tempF = cToF(tempC);
          const weatherCode = codes[i];
          const isDay = hour >= 6 && hour <= 19;
          const condition = getWeatherCondition(weatherCode, isDay);
          const diffHours = Math.round((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60));

          if (diffHours >= -12 && diffHours <= 16) {
            const isCurrent = Math.abs(diffHours) === 0 && nowIdx === -1;
            const label = isCurrent ? 'Now' : formatHourLabel(hour);

            newTimeline.push({
              time: dateObj,
              hour,
              diffHours,
              label,
              isCurrent,
              tempC,
              tempF,
              condition,
              isDay,
            });

            if (isCurrent) {
              nowIdx = newTimeline.length - 1;
            }
          }
        }

        if (newTimeline.length > 0) {
          setTimeline(newTimeline);
          const resolvedNow = nowIdx >= 0 ? nowIdx : Math.floor(newTimeline.length / 2);
          setCurrentIndex(resolvedNow);
          dialRef.current.currentIndex = resolvedNow;
          dialRef.current.targetWheelOffset = getOffsetForIndex(resolvedNow);
          dialRef.current.wheelOffset = dialRef.current.targetWheelOffset;
        }
      } catch (e) {
        console.warn('Weather fetch error:', e);
      }
    }

    loadRealWeather();
    return () => {
      cancelled = true;
    };
  }, [defaultCity, getOffsetForIndex]);

  // Odometer target string calculation
  const displayedTemp = currentItem ? (isCelsius ? currentItem.tempC : currentItem.tempF) : 24;
  const tempStr = String(displayedTemp);

  // WebGL & Molten Silk Waves Loop
  useEffect(() => {
    const stage = stageRef.current;
    const glCanvas = glCanvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!stage || !glCanvas || !bgCanvas) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const gl = glCanvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // Compile Shaders
    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compileShader(gl.VERTEX_SHADER, atmosphereVsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, atmosphereFsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }
    gl.useProgram(program);

    // Quad geometry
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
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

    // Uniform locations
    const uBackground = gl.getUniformLocation(program, 'u_background');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uCardCenter = gl.getUniformLocation(program, 'u_cardCenter');
    const uCardHalfSize = gl.getUniformLocation(program, 'u_cardHalfSize');
    const uCardRadius = gl.getUniformLocation(program, 'u_cardRadius');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uIor = gl.getUniformLocation(program, 'u_ior');
    const uDispersion = gl.getUniformLocation(program, 'u_dispersion');
    const uLensHeight = gl.getUniformLocation(program, 'u_lensHeight');

    // Texture for background
    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

    function renderMoltenSilk(w: number, h: number, time: number) {
      if (!bgCtx) return;
      // Deep obsidian fill
      bgCtx.fillStyle = '#090b10';
      bgCtx.fillRect(0, 0, w, h);

      // Ambient radial gradient
      const centerGrad = bgCtx.createRadialGradient(
        w * 0.5, h * 0.45, 10 * dpr,
        w * 0.5, h * 0.5, w * 0.6
      );
      centerGrad.addColorStop(0, '#1a1e29');
      centerGrad.addColorStop(0.55, '#0d0f15');
      centerGrad.addColorStop(1, '#050608');
      bgCtx.fillStyle = centerGrad;
      bgCtx.fillRect(0, 0, w, h);

      // Silky molten fluid bands
      const t = time * 0.6;
      const waveCount = 5;

      for (let i = 0; i < waveCount; i++) {
        const fi = i / waveCount;
        const phase = t + fi * Math.PI * 1.5;

        bgCtx.beginPath();
        const waveY = h * 0.25 + fi * h * 0.5 + Math.sin(phase) * 18 * dpr;
        bgCtx.moveTo(0, waveY);

        for (let x = 0; x <= w; x += 20 * dpr) {
          const nx = x / w;
          const cy =
            waveY +
            Math.sin(nx * 4.5 + phase) * 22 * dpr +
            Math.cos(nx * 7.0 - phase * 0.8) * 12 * dpr;
          bgCtx.lineTo(x, cy);
        }
        bgCtx.lineTo(w, h);
        bgCtx.lineTo(0, h);
        bgCtx.closePath();

        const waveGrad = bgCtx.createLinearGradient(0, waveY - 40 * dpr, 0, waveY + 80 * dpr);
        const alpha = 0.08 + Math.sin(phase * 0.5) * 0.03;
        waveGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 1.6})`);
        waveGrad.addColorStop(0.3, `rgba(180, 195, 220, ${alpha})`);
        waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        bgCtx.fillStyle = waveGrad;
        bgCtx.fill();
      }
    }

    function handleResize() {
      if (!stage || !glCanvas || !bgCanvas || !gl) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = stage.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      glCanvas.width = w * dpr;
      glCanvas.height = h * dpr;
      bgCanvas.width = w * dpr;
      bgCanvas.height = h * dpr;

      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      dialRef.current.targetWheelOffset = getOffsetForIndex(dialRef.current.currentIndex);
      dialRef.current.wheelOffset = dialRef.current.targetWheelOffset;
    }

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(stage);

    let animId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    function frame(nowTime: number) {
      const dt = Math.min((nowTime - lastTime) / 1000, 0.04);
      lastTime = nowTime;
      elapsed += dt;

      // Update dial spring physics
      const dial = dialRef.current;
      if (!dial.isDragging) {
        const diff = dial.targetWheelOffset - dial.wheelOffset;
        if (Math.abs(diff) > 0.4) {
          dial.wheelOffset += diff * Math.min(1.0, dt * 14.0);
        } else {
          dial.wheelOffset = dial.targetWheelOffset;
        }
      }

      // Render molten silk texture
      renderMoltenSilk(bgCanvas!.width, bgCanvas!.height, elapsed);
      gl!.bindTexture(gl!.TEXTURE_2D, bgTexture);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, bgCanvas!);

      // Render WebGL Quad
      gl!.useProgram(program);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, bgTexture);
      gl!.uniform1i(uBackground, 0);

      gl!.uniform2f(uResolution, glCanvas!.width, glCanvas!.height);
      gl!.uniform2f(uCardCenter, glCanvas!.width * 0.5, glCanvas!.height * 0.5);
      gl!.uniform2f(
        uCardHalfSize,
        CARD_WIDTH_CSS * 0.5 * dpr,
        CARD_HEIGHT_CSS * 0.5 * dpr
      );
      gl!.uniform1f(uCardRadius, CARD_RADIUS_CSS * dpr);
      gl!.uniform1f(uTime, elapsed);
      gl!.uniform1f(uIor, OPTICAL_IOR);
      gl!.uniform1f(uDispersion, OPTICAL_DISPERSION);
      gl!.uniform1f(uLensHeight, BASE_LENS_HEIGHT * dpr);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (gl) {
        gl.deleteBuffer(posBuffer);
        gl.deleteTexture(bgTexture);
        gl.deleteProgram(program);
      }
    };
  }, [getOffsetForIndex]);

  // Scrubber drag / wheel listeners
  useEffect(() => {
    const container = containerElRef.current;
    if (!container) return;

    function snapToNearest(offset: number) {
      const containerWidth = container ? container.clientWidth : 340;
      const centerX = containerWidth * 0.5;
      let closestDist = Infinity;
      let closestIdx = dialRef.current.currentIndex;

      for (let i = 0; i < timeline.length; i++) {
        const itemOffset = i * (ITEM_WIDTH + ITEM_GAP);
        const tickPos = offset + itemOffset + ITEM_WIDTH * 0.5;
        const dist = Math.abs(tickPos - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      goToIndex(closestIdx, true);
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      dialRef.current.isDragging = true;
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      dialRef.current.startX = clientX;
      dialRef.current.startOffset = dialRef.current.wheelOffset;
      dialRef.current.lastDragX = clientX;
      dialRef.current.lastDragTime = performance.now();
      dialRef.current.wheelVelocity = 0;
      container?.classList.add('is-dragging');
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      if (!dialRef.current.isDragging) return;
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const dx = clientX - dialRef.current.startX;
      dialRef.current.wheelOffset = dialRef.current.startOffset + dx;

      const now = performance.now();
      const dt = Math.max(1, now - dialRef.current.lastDragTime);
      dialRef.current.wheelVelocity = (clientX - dialRef.current.lastDragX) / dt;
      dialRef.current.lastDragX = clientX;
      dialRef.current.lastDragTime = now;

      // Rubber banding
      const maxOffset = getOffsetForIndex(0) + 40;
      const minOffset = getOffsetForIndex(timeline.length - 1) - 40;
      if (dialRef.current.wheelOffset > maxOffset) {
        dialRef.current.wheelOffset = maxOffset + (dialRef.current.wheelOffset - maxOffset) * 0.3;
      } else if (dialRef.current.wheelOffset < minOffset) {
        dialRef.current.wheelOffset = minOffset + (dialRef.current.wheelOffset - minOffset) * 0.3;
      }

      // Real-time slot update during drag
      const containerWidth = container ? container.clientWidth : 340;
      const centerX = containerWidth * 0.5;
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < timeline.length; i++) {
        const itemOffset = i * (ITEM_WIDTH + ITEM_GAP);
        const tickPos = dialRef.current.wheelOffset + itemOffset + ITEM_WIDTH * 0.5;
        const dist = Math.abs(tickPos - centerX);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      if (closestIdx !== dialRef.current.currentIndex) {
        dialRef.current.currentIndex = closestIdx;
        setCurrentIndex(closestIdx);
        if (onHourChangeRef.current && timeline[closestIdx]) {
          onHourChangeRef.current(timeline[closestIdx]);
        }
      }
    }

    function onPointerUp() {
      if (!dialRef.current.isDragging) return;
      dialRef.current.isDragging = false;
      container?.classList.remove('is-dragging');
      const momentum = dialRef.current.wheelVelocity * 160;
      const projectedOffset = dialRef.current.wheelOffset + momentum;
      snapToNearest(projectedOffset);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta > 20) {
        goToIndex(dialRef.current.currentIndex + 1, true);
      } else if (delta < -20) {
        goToIndex(dialRef.current.currentIndex - 1, true);
      }
    }

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      container.removeEventListener('wheel', onWheel);
    };
  }, [getOffsetForIndex, goToIndex, timeline]);

  // Sync wheel DOM transform with dialRef
  useEffect(() => {
    let animId = 0;
    const wheel = wheelElRef.current;
    const container = containerElRef.current;
    if (!wheel || !container) return;

    function syncTransform() {
      const offset = dialRef.current.wheelOffset;
      wheel!.style.transform = `translate3d(${offset}px, 0, 0)`;

      const containerWidth = container!.clientWidth || 340;
      const centerX = containerWidth * 0.5;
      const ticks = wheel!.children;

      for (let i = 0; i < ticks.length; i++) {
        const tick = ticks[i] as HTMLElement;
        const itemOffset = i * (ITEM_WIDTH + ITEM_GAP);
        const tickPos = offset + itemOffset + ITEM_WIDTH * 0.5;
        const dist = Math.abs(tickPos - centerX);

        tick.classList.remove('active', 'near-active', 'far-active');
        if (dist < ITEM_WIDTH * 0.45) {
          tick.classList.add('active');
        } else if (dist < ITEM_WIDTH * 1.5) {
          tick.classList.add('near-active');
        } else {
          tick.classList.add('far-active');
        }
      }

      animId = requestAnimationFrame(syncTransform);
    }

    animId = requestAnimationFrame(syncTransform);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className={`atronix-atmosphere-card atronix-climate-weather ${className}`} style={style}>
      {/* Studio Stage */}
      <div className="atronix-climate-stage" ref={stageRef}>
        {/* GPU Liquid Glass Optical Shader Canvas */}
        <canvas className="atronix-climate-glcanvas" ref={glCanvasRef} />

        {/* Dynamic 2D Molten Silk Background Canvas */}
        <canvas className="atronix-climate-bgcanvas" ref={bgCanvasRef} />

        {/* Interactive Weather Controller UI Layer */}
        <div className="atronix-climate-card-ui">
          {/* Header: Location & Condition */}
          <div className="atronix-climate-card-header">
            <div className="atronix-climate-device-info">
              <h2 className="atronix-climate-title">{city}</h2>
              <span className="atronix-climate-subtitle">
                {currentItem?.condition || 'Mostly Sunny'} ·{' '}
                {currentItem?.isCurrent ? 'Now' : currentItem?.label}
              </span>
            </div>

            {/* Quick Return to 'Now' Button */}
            <button
              type="button"
              className={`atronix-climate-now-pill ${
                currentItem && !currentItem.isCurrent ? 'visible' : ''
              }`}
              onClick={handleReturnNow}
              aria-label="Return to live weather"
            >
              <svg
                className="atronix-climate-now-icon"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Live</span>
            </button>
          </div>

          {/* Center Hero: Split-Digit Rolling Odometer */}
          <div className="atronix-climate-temp-hero">
            <div className="atronix-climate-odometer">
              {tempStr.split('').map((ch, idx) => {
                const isMinus = ch === '-';
                const digit = parseInt(ch, 10);
                if (isMinus) {
                  return (
                    <div key={`minus-${idx}`} className="atronix-climate-slot minus">
                      <span className="atronix-climate-digit">-</span>
                    </div>
                  );
                }
                const reelOffset = isNaN(digit) ? 0 : -digit * DIGIT_HEIGHT;
                return (
                  <div key={`digit-slot-${idx}`} className="atronix-climate-slot">
                    <div
                      className="atronix-climate-reel"
                      style={{
                        transform: `translate3d(0, ${reelOffset}px, 0)`,
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                        <span key={d} className="atronix-climate-digit">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unit Switch Button */}
            <button
              type="button"
              className="atronix-climate-unit-btn"
              onClick={handleToggleUnit}
              title={`Switch to ${isCelsius ? 'Fahrenheit (°F)' : 'Celsius (°C)'}`}
              aria-label={`Temperature unit: ${isCelsius ? 'Celsius' : 'Fahrenheit'}`}
            >
              <span className="atronix-climate-degree">°</span>
              <span className="atronix-climate-unit-label">{isCelsius ? 'C' : 'F'}</span>
            </button>
          </div>

          {/* Interactive 24-Hour Timeline Wheel Scrubber */}
          <div className="atronix-climate-timeline-container" ref={containerElRef}>
            <div className="atronix-climate-timeline-wheel" ref={wheelElRef}>
              {timeline.map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  className="atronix-climate-tick"
                  onClick={() => goToIndex(idx, true)}
                >
                  <span className="atronix-climate-tick-time">{item.label}</span>
                  <span className="atronix-climate-tick-line" />
                </div>
              ))}
            </div>
            <div className="atronix-climate-center-marker">
              <span className="atronix-climate-marker-triangle" />
            </div>
          </div>
        </div>

        {/* Subtle one-line grey guide */}
        <div className="atronix-climate-guide">
          Drag timeline horizontally to preview 24h weather
        </div>
      </div>
    </div>
  );
};

export const ClimateWeather = AtmosphereCard;
export default AtmosphereCard;
