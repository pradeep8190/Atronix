import React, { useRef, useEffect, useState } from 'react';
import { cameraRollVsSource, cameraRollFsSource } from './lensStripShaders';
import lensBgImg from '@/assets/lens_bg.png';
import './LensStrip.css';

export interface CameraModeItem {
  id: string;
  label: string;
}

export interface LensStripProps {
  initialIndex?: number;
  modes?: CameraModeItem[];
  onChange?: (mode: CameraModeItem, index: number) => void;
  showBadge?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export type CameraRollProps = LensStripProps;

const DEFAULT_MODES: CameraModeItem[] = [
  { id: '480p', label: '480p SD' },
  { id: '720p', label: '720p HD' },
  { id: '1080p', label: '1080p HD' },
  { id: '1440p', label: '1440p 2K' },
  { id: '4k', label: '4K UHD' },
  { id: '8k', label: '8K UHD' },
];

const ITEM_SPACING = 112.0;
const PILL_WIDTH = 410.0;
const PILL_HEIGHT = 52.0;
const PILL_RADIUS = 26.0;

const LENS_HALF_WIDTH = 63.0;
const LENS_HALF_HEIGHT = 30.0;
const LENS_RADIUS = 30.0;

export const LensStrip: React.FC<LensStripProps> = ({
  initialIndex = 2,
  modes = DEFAULT_MODES,
  onChange,
  showBadge: _showBadge = true,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);

  const [_activeMode, setActiveMode] = useState<CameraModeItem>(modes[initialIndex] || modes[0]);
  const [isDragging, setIsDragging] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mutable Physics State
  const physicsRef = useRef({
    itemSpacing: ITEM_SPACING,
    itemCount: modes.length,
    currentOffset: initialIndex * ITEM_SPACING,
    targetOffset: initialIndex * ITEM_SPACING,
    velocity: 0.0,
    isDragging: false,
    isGliding: false,
    isDocking: false,
    dragStartX: 0,
    dragStartOffset: 0,
    pointerHistory: [] as Array<{ x: number; time: number }>,
    pressAmount: 0.0,
    activeIndex: initialIndex,
    lastTime: performance.now(),
  });

  useEffect(() => {
    const container = containerRef.current;
    const bgCanvas = bgCanvasRef.current;
    const glCanvas = glCanvasRef.current;
    if (!container || !bgCanvas || !glCanvas) return;

    const gl = glCanvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const bgCtx = bgCanvas.getContext('2d', { alpha: false });
    if (!bgCtx) return;

    // Compile WebGL
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

    const vs = compile(gl.VERTEX_SHADER, cameraRollVsSource);
    const fs = compile(gl.FRAGMENT_SHADER, cameraRollFsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad Buffer
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

    // Uniforms
    const uniforms = {
      u_background: gl.getUniformLocation(program, 'u_background'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_lensPos: gl.getUniformLocation(program, 'u_lensPos'),
      u_lensHalfSize: gl.getUniformLocation(program, 'u_lensHalfSize'),
      u_lensRadius: gl.getUniformLocation(program, 'u_lensRadius'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_velocity: gl.getUniformLocation(program, 'u_velocity'),
      u_press: gl.getUniformLocation(program, 'u_press'),
      u_ior: gl.getUniformLocation(program, 'u_ior'),
      u_dispersion: gl.getUniformLocation(program, 'u_dispersion'),
      u_lensHeight: gl.getUniformLocation(program, 'u_lensHeight'),
    };

    // Background Texture
    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // 2D Geometry Helper
    const drawRoundedPill = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    };

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stageW = 800;
    let stageH = 460;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      stageW = Math.max(rect.width, 360);
      stageH = Math.max(rect.height, 360);

      const devW = Math.round(stageW * dpr);
      const devH = Math.round(stageH * dpr);

      bgCanvas.width = devW;
      bgCanvas.height = devH;
      glCanvas.width = devW;
      glCanvas.height = devH;
      gl.viewport(0, 0, devW, devH);
    };

    // Preload background image
    const bgImage = new Image();
    bgImage.src = lensBgImg;
    bgImage.onload = () => {
      renderSubstrate(physicsRef.current.currentOffset);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // 2D Substrate Render
    const renderSubstrate = (currentOffset: number) => {
      const w = bgCanvas.width;
      const h = bgCanvas.height;

      bgCtx.clearRect(0, 0, w, h);

      // Draw misty forest background image (cover fit)
      if (bgImage.complete && bgImage.naturalWidth > 0) {
        const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
        const canvasRatio = w / h;
        let dw = w;
        let dh = h;
        let dx = 0;
        let dy = 0;

        if (canvasRatio > imgRatio) {
          dw = w;
          dh = w / imgRatio;
          dy = (h - dh) * 0.5;
        } else {
          dh = h;
          dw = h * imgRatio;
          dx = (w - dw) * 0.5;
        }

        bgCtx.drawImage(bgImage, dx, dy, dw, dh);

        // Subtle dark cinematic overlay for contrast
        bgCtx.fillStyle = 'rgba(8, 10, 14, 0.20)';
        bgCtx.fillRect(0, 0, w, h);
      } else {
        // Fallback Dark Atmospheric Background
        const darkGrad = bgCtx.createLinearGradient(0, 0, 0, h);
        darkGrad.addColorStop(0, '#101217');
        darkGrad.addColorStop(0.5, '#0c0d11');
        darkGrad.addColorStop(1, '#050608');
        bgCtx.fillStyle = darkGrad;
        bgCtx.fillRect(0, 0, w, h);
      }

      // Pill Track Coordinates
      const cx = stageW * 0.5;
      const cy = stageH * 0.5;
      const pm = {
        cx,
        cy,
        x: cx - PILL_WIDTH * 0.5,
        y: cy - PILL_HEIGHT * 0.5,
        w: PILL_WIDTH,
        h: PILL_HEIGHT,
        r: PILL_RADIUS,
      };

      bgCtx.save();
      bgCtx.scale(dpr, dpr);

      // Pill Track Base: Soft shadow + dark translucent body
      bgCtx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      bgCtx.shadowBlur = 20;
      bgCtx.shadowOffsetX = 0;
      bgCtx.shadowOffsetY = 6;

      drawRoundedPill(bgCtx, pm.x, pm.y, pm.w, pm.h, pm.r);
      bgCtx.fillStyle = 'rgba(12, 13, 17, 0.72)';
      bgCtx.fill();

      bgCtx.shadowColor = 'transparent';

      // Text Strip clipped inside pill
      bgCtx.save();
      drawRoundedPill(bgCtx, pm.x + 2, pm.y, pm.w - 4, pm.h, pm.r);
      bgCtx.clip();

      bgCtx.font = '500 15px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
      bgCtx.textAlign = 'center';
      bgCtx.textBaseline = 'middle';

      const textY = pm.cy + 0.5;

      for (let i = 0; i < modes.length; i++) {
        const mode = modes[i];
        const itemX = pm.cx + (i * ITEM_SPACING - currentOffset);
        const distFromCenter = Math.abs(itemX - pm.cx);

        let alpha = 1.0;
        if (distFromCenter > 135) {
          alpha = Math.max(0.0, 1.0 - (distFromCenter - 135) / 65.0);
        }
        if (alpha <= 0.001) continue;

        // Golden yellow transition inside center lens
        const yellowFactor = Math.max(0.0, Math.min(1.0, 1.0 - distFromCenter / 48.0));
        const r = Math.round(240 + (255 - 240) * yellowFactor);
        const g = Math.round(242 + (214 - 242) * yellowFactor);
        const b = Math.round(246 + (10 - 246) * yellowFactor);
        const finalAlpha = (0.85 + yellowFactor * 0.15) * alpha;

        bgCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
        bgCtx.fillText(mode.label, itemX, textY);
      }

      bgCtx.restore();
      bgCtx.restore();

      // Upload to WebGL Texture
      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
    };

    // Pointer Interaction Handlers
    const isOverPill = (x: number, y: number) => {
      const cx = stageW * 0.5;
      const cy = stageH * 0.5;
      const dx = x - cx;
      const dy = y - cy;
      return Math.abs(dy) <= PILL_HEIGHT * 1.8 && Math.abs(dx) <= PILL_WIDTH * 0.75;
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = glCanvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (!isOverPill(x, y)) return;

      const phy = physicsRef.current;
      phy.isDragging = true;
      phy.isGliding = false;
      phy.isDocking = false;
      phy.velocity = 0.0;
      phy.dragStartX = clientX;
      phy.dragStartOffset = phy.currentOffset;
      phy.pointerHistory = [{ x: clientX, time: performance.now() }];
      phy.pressAmount = 1.0;
      setIsDragging(true);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const phy = physicsRef.current;
      if (!phy.isDragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const now = performance.now();
      const deltaX = clientX - phy.dragStartX;
      let proposed = phy.dragStartOffset - deltaX;

      const minOffset = 0;
      const maxOffset = (phy.itemCount - 1) * ITEM_SPACING;

      if (proposed < minOffset) {
        const overscroll = minOffset - proposed;
        proposed = minOffset - Math.pow(overscroll, 0.82) * 2.5;
      } else if (proposed > maxOffset) {
        const overscroll = proposed - maxOffset;
        proposed = maxOffset + Math.pow(overscroll, 0.82) * 2.5;
      }

      phy.currentOffset = proposed;
      phy.targetOffset = proposed;

      phy.pointerHistory.push({ x: clientX, time: now });
      while (phy.pointerHistory.length > 6 || now - phy.pointerHistory[0].time > 120) {
        phy.pointerHistory.shift();
      }

      const rawIdx = Math.round(phy.currentOffset / ITEM_SPACING);
      const clampedIdx = Math.max(0, Math.min(modes.length - 1, rawIdx));
      if (clampedIdx !== phy.activeIndex) {
        phy.activeIndex = clampedIdx;
        setActiveMode(modes[clampedIdx]);
        if (onChangeRef.current) onChangeRef.current(modes[clampedIdx], clampedIdx);
      }
    };

    const onPointerUp = () => {
      const phy = physicsRef.current;
      if (!phy.isDragging) return;
      phy.isDragging = false;
      setIsDragging(false);

      if (phy.pointerHistory.length >= 2) {
        const oldest = phy.pointerHistory[0];
        const newest = phy.pointerHistory[phy.pointerHistory.length - 1];
        const dt = (newest.time - oldest.time) / 1000;
        if (dt > 0.008) {
          const rawVel = (newest.x - oldest.x) / dt;
          phy.velocity = -Math.max(-2800, Math.min(2800, rawVel));
        }
      }

      if (Math.abs(phy.velocity) > 60) {
        phy.isGliding = true;
      } else {
        phy.isDocking = true;
        const targetIdx = Math.max(
          0,
          Math.min(modes.length - 1, Math.round(phy.currentOffset / ITEM_SPACING))
        );
        phy.targetOffset = targetIdx * ITEM_SPACING;
      }
    };

    glCanvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    glCanvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Animation Render Loop
    let animId = 0;
    let startTime = performance.now();

    const render = (currentTime: number) => {
      const phy = physicsRef.current;
      const dt = Math.min((currentTime - phy.lastTime) / 1000, 0.05);
      phy.lastTime = currentTime;

      const minOffset = 0;
      const maxOffset = (phy.itemCount - 1) * ITEM_SPACING;

      // Inertial Glide Physics
      if (phy.isGliding) {
        phy.currentOffset += phy.velocity * dt;
        phy.velocity *= Math.pow(0.92, dt * 60);

        if (phy.currentOffset < minOffset || phy.currentOffset > maxOffset) {
          phy.velocity *= 0.75;
        }

        if (Math.abs(phy.velocity) < 35.0) {
          phy.isGliding = false;
          phy.isDocking = true;
          const targetIdx = Math.max(
            0,
            Math.min(modes.length - 1, Math.round(phy.currentOffset / ITEM_SPACING))
          );
          phy.targetOffset = targetIdx * ITEM_SPACING;
          phy.velocity = 0;
        }
      }

      // Critically Damped Docking
      if (phy.isDocking) {
        const springK = 260.0;
        const damping = 24.0;
        const disp = phy.currentOffset - phy.targetOffset;
        const force = -springK * disp - damping * phy.velocity;
        phy.velocity += force * dt;
        phy.currentOffset += phy.velocity * dt;

        if (Math.abs(disp) < 0.25 && Math.abs(phy.velocity) < 1.0) {
          phy.currentOffset = phy.targetOffset;
          phy.velocity = 0;
          phy.isDocking = false;
        }
      }

      // Press relaxation
      if (!phy.isDragging) {
        phy.pressAmount = Math.max(0.0, phy.pressAmount - dt * 3.5);
      }

      // Check active index
      const rawIdx = Math.round(phy.currentOffset / ITEM_SPACING);
      const clampedIdx = Math.max(0, Math.min(modes.length - 1, rawIdx));
      if (clampedIdx !== phy.activeIndex) {
        phy.activeIndex = clampedIdx;
        setActiveMode(modes[clampedIdx]);
        if (onChangeRef.current) onChangeRef.current(modes[clampedIdx], clampedIdx);
      }

      // Render Substrate
      renderSubstrate(phy.currentOffset);

      // WebGL Stationary Center Lens Uniforms
      gl.useProgram(program);
      gl.uniform1i(uniforms.u_background, 0);
      gl.uniform2f(uniforms.u_resolution, glCanvas.width, glCanvas.height);

      const centerDevX = (stageW * 0.5) * dpr;
      const centerDevY = (stageH * 0.5) * dpr;
      gl.uniform2f(uniforms.u_lensPos, centerDevX, centerDevY);

      gl.uniform2f(uniforms.u_lensHalfSize, LENS_HALF_WIDTH * dpr, LENS_HALF_HEIGHT * dpr);
      gl.uniform1f(uniforms.u_lensRadius, LENS_RADIUS * dpr);

      gl.uniform1f(uniforms.u_time, (currentTime - startTime) * 0.001);
      gl.uniform1f(uniforms.u_velocity, phy.velocity);
      gl.uniform1f(uniforms.u_press, phy.pressAmount);

      gl.uniform1f(uniforms.u_ior, 1.52);
      gl.uniform1f(uniforms.u_dispersion, 0.038);
      gl.uniform1f(uniforms.u_lensHeight, 14.0 * dpr);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      glCanvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      glCanvas.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(bgTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [modes]);

  return (
    <div ref={containerRef} className={`lens-strip-root camera-roll-root ${className}`} style={style}>
      <div className="lens-strip-stage camera-roll-stage">
        <canvas ref={bgCanvasRef} className="lens-strip-canvas-layer camera-roll-canvas-layer camera-roll-canvas-bg" />
        <canvas
          ref={glCanvasRef}
          className={`lens-strip-canvas-layer camera-roll-canvas-layer camera-roll-canvas-gl ${isDragging ? 'is-dragging' : ''}`}
        />
      </div>

      <div className="lens-strip-guide">
        Drag left or right to switch modes
      </div>
    </div>
  );
};

export const CameraRoll = LensStrip;
export default LensStrip;
