import React, { useRef, useEffect, useState, useCallback } from 'react';
import { navbarVsSource, navbarFsSource } from './kineticTabsShaders';
import './KineticTabs.css';

export interface NavItem {
  id: string;
  label: string;
}

export interface KineticTabsProps {
  initialIndex?: number;
  items?: NavItem[];
  onChange?: (item: NavItem, index: number) => void;
  showHint?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export type LiquidGlassNavbarProps = KineticTabsProps;

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'new', label: 'New' },
  { id: 'radio', label: 'Radio' },
  { id: 'library', label: 'Library' },
];

const DOCK_WIDTH = 380.0;
const DOCK_HEIGHT = 58.0;
const DOCK_RADIUS = 29.0;

const LENS_BASE_HALF_WIDTH = 50.0;
const LENS_BASE_HALF_HEIGHT = 34.0;
const LENS_BASE_RADIUS = 34.0;

const OPTICAL_IOR = 1.520;
const OPTICAL_DISPERSION = 0.095;
const OPTICAL_LENS_HEIGHT = 16.0;

export const KineticTabs: React.FC<KineticTabsProps> = ({
  initialIndex = 3,
  items = DEFAULT_NAV_ITEMS,
  onChange,
  showHint = false,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<number>(initialIndex);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mutable Physics & Animation State
  const stateRef = useRef({
    activeIndex: initialIndex,
    targetIndex: initialIndex,
    isDragging: false,
    dragStartX: 0,
    dragStartLensX: 0,
    dpr: 1,
    lensCurrentX: 0,
    lensTargetX: 0,
    lensVelocityX: 0,
    prevLensX: 0,
    stretchX: 1.0,
    stretchY: 1.0,
    jellyVelocityX: 0.0,
    jellyVelocityY: 0.0,
    pressAmount: 0.0,
    targetPress: 0.0,
    wobble: 0.0,
    wobbleVelocity: 0.0,
    negRefractAmount: 0.0,
    tabColorFactors: [0.0, 0.0, 0.0, 0.0],
    lastTime: performance.now(),
  });

  const getTabPositions = useCallback((stageW: number) => {
    const startX = (stageW - DOCK_WIDTH) * 0.5;
    const padding = 42.0;
    const step = (DOCK_WIDTH - padding * 2) / (items.length - 1);
    return items.map((_, i) => startX + padding + i * step);
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext('webgl', {
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

    const vs = compile(gl.VERTEX_SHADER, navbarVsSource);
    const fs = compile(gl.FRAGMENT_SHADER, navbarFsSource);
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
      u_wobble: gl.getUniformLocation(program, 'u_wobble'),
      u_cornerMorph: gl.getUniformLocation(program, 'u_cornerMorph'),
      u_negRefract: gl.getUniformLocation(program, 'u_negRefract'),
      u_dockCenter: gl.getUniformLocation(program, 'u_dockCenter'),
      u_dockHalfSize: gl.getUniformLocation(program, 'u_dockHalfSize'),
      u_dockRadius: gl.getUniformLocation(program, 'u_dockRadius'),
      u_ior: gl.getUniformLocation(program, 'u_ior'),
      u_dispersion: gl.getUniformLocation(program, 'u_dispersion'),
      u_lensHeight: gl.getUniformLocation(program, 'u_lensHeight'),
    };

    // Offscreen 2D Background Canvas & Texture
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Draw Vector Icon Helper
    const drawTabIcon = (
      ctx: CanvasRenderingContext2D,
      type: string,
      cx: number,
      cy: number,
      color: string,
      scale = 1.0
    ) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const s = scale;

      if (type === 'home') {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 9.5 * s);
        ctx.lineTo(cx - 10 * s, cy - 2 * s);
        ctx.lineTo(cx - 7.5 * s, cy - 2 * s);
        ctx.lineTo(cx - 7.5 * s, cy + 9 * s);
        ctx.quadraticCurveTo(cx - 7.5 * s, cy + 10.5 * s, cx - 6 * s, cy + 10.5 * s);
        ctx.lineTo(cx + 6 * s, cy + 10.5 * s);
        ctx.quadraticCurveTo(cx + 7.5 * s, cy + 10.5 * s, cx + 7.5 * s, cy + 9 * s);
        ctx.lineTo(cx + 7.5 * s, cy - 2 * s);
        ctx.lineTo(cx + 10 * s, cy - 2 * s);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e8ecf2';
        ctx.beginPath();
        ctx.roundRect(cx - 2.8 * s, cy + 2 * s, 5.6 * s, 8.5 * s, [2.5 * s, 2.5 * s, 0, 0]);
        ctx.fill();
      } else if (type === 'new') {
        const tileSize = 6.2 * s;
        const tileGap = 3.2 * s;
        const r = 2.0 * s;

        const x1 = cx - tileSize - tileGap * 0.5;
        const x2 = cx + tileGap * 0.5;
        const y1 = cy - tileSize - tileGap * 0.5;
        const y2 = cy + tileGap * 0.5;

        ctx.beginPath();
        ctx.roundRect(x1, y1, tileSize, tileSize, r);
        ctx.roundRect(x2, y1, tileSize, tileSize, r);
        ctx.roundRect(x1, y2, tileSize, tileSize, r);
        ctx.roundRect(x2, y2, tileSize, tileSize, r);
        ctx.fill();
      } else if (type === 'radio') {
        ctx.beginPath();
        ctx.arc(cx, cy, 2.6 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, 6.8 * s, Math.PI * 0.72, Math.PI * 1.28);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 6.8 * s, -Math.PI * 0.28, Math.PI * 0.28);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 11.2 * s, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 11.2 * s, -Math.PI * 0.25, Math.PI * 0.25);
        ctx.stroke();
      } else if (type === 'library') {
        ctx.beginPath();
        ctx.roundRect(cx - 8.5 * s, cy - 9.5 * s, 17.0 * s, 19.0 * s, 4.5 * s);
        ctx.fill();

        ctx.fillStyle = '#e8ecf2';
        ctx.beginPath();
        ctx.arc(cx - 2.0 * s, cy + 3.0 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e8ecf2';
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 0.2 * s, cy + 3.0 * s);
        ctx.lineTo(cx - 0.2 * s, cy - 4.5 * s);
        ctx.lineTo(cx + 3.5 * s, cy - 2.5 * s);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.0 * s;
        ctx.beginPath();
        ctx.arc(cx - 8.5 * s, cy, 8.0 * s, Math.PI * 0.70, Math.PI * 1.30);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 8.5 * s, cy, 8.0 * s, -Math.PI * 0.30, Math.PI * 0.30);
        ctx.stroke();
      }

      ctx.restore();
    };

    const renderSubstrate = (stageW: number, stageH: number, dpr: number) => {
      if (!bgCtx) return;
      const w = bgCanvas.width;
      const h = bgCanvas.height;
      const centerX = w * 0.5;
      const centerY = h * 0.5;

      const bgGrad = bgCtx.createRadialGradient(
        centerX,
        centerY * 0.85,
        40 * dpr,
        centerX,
        centerY,
        Math.max(w, h) * 0.75
      );
      bgGrad.addColorStop(0.0, '#e8ebf0');
      bgGrad.addColorStop(0.5, '#dde1e8');
      bgGrad.addColorStop(1.0, '#cfd5de');
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, w, h);

      const dockW = DOCK_WIDTH * dpr;
      const dockH = DOCK_HEIGHT * dpr;
      const dockR = DOCK_RADIUS * dpr;
      const dockX = centerX - dockW * 0.5;
      const dockY = centerY - dockH * 0.5;

      // Multi-tier floating floor shadow
      bgCtx.save();
      bgCtx.shadowColor = 'rgba(0, 0, 0, 0.085)';
      bgCtx.shadowBlur = 28.0 * dpr;
      bgCtx.shadowOffsetY = 12.0 * dpr;
      bgCtx.beginPath();
      bgCtx.roundRect(dockX, dockY, dockW, dockH, dockR);
      bgCtx.fillStyle = '#ffffff';
      bgCtx.fill();

      bgCtx.shadowColor = 'rgba(0, 0, 0, 0.065)';
      bgCtx.shadowBlur = 8.0 * dpr;
      bgCtx.shadowOffsetY = 4.0 * dpr;
      bgCtx.beginPath();
      bgCtx.roundRect(dockX, dockY, dockW, dockH, dockR);
      bgCtx.fillStyle = '#ffffff';
      bgCtx.fill();
      bgCtx.restore();

      // Dock Main Body
      bgCtx.save();
      const pillInnerGrad = bgCtx.createLinearGradient(0, dockY, 0, dockY + dockH);
      pillInnerGrad.addColorStop(0.0, '#f8f9fc');
      pillInnerGrad.addColorStop(1.0, '#edf0f6');
      bgCtx.beginPath();
      bgCtx.roundRect(dockX, dockY, dockW, dockH, dockR);
      bgCtx.fillStyle = pillInnerGrad;
      bgCtx.fill();

      // Crisp White Border Line
      bgCtx.lineWidth = 1.5 * dpr;
      bgCtx.strokeStyle = '#ffffff';
      bgCtx.beginPath();
      bgCtx.roundRect(dockX, dockY, dockW, dockH, dockR);
      bgCtx.stroke();

      // Upper rim specular glint
      bgCtx.save();
      bgCtx.beginPath();
      bgCtx.roundRect(dockX, dockY, dockW, dockH * 0.5, [dockR, dockR, 0, 0]);
      bgCtx.clip();
      bgCtx.lineWidth = 1.0 * dpr;
      bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      bgCtx.stroke();
      bgCtx.restore();

      // Render 4 tab icons & labels
      const tabPositions = getTabPositions(stageW);
      const st = stateRef.current;

      tabPositions.forEach((tabPosCSS, i) => {
        const item = items[i];
        const tabX = tabPosCSS * dpr;
        const iconY = (centerY - 5.0 * dpr);
        const labelY = (centerY + 16.0 * dpr);

        // Compute distance to lens center for active color transition
        const distFromLens = Math.abs(tabPosCSS - st.lensCurrentX);
        const isUnderLens = distFromLens < 34.0;
        const activeT = Math.max(0.0, Math.min(1.0, 1.0 - distFromLens / 36.0));

        // Active Apple red #fa2d48 vs muted dark grey
        const r = Math.round(92 + (250 - 92) * activeT);
        const g = Math.round(98 + (45 - 98) * activeT);
        const b = Math.round(110 + (72 - 110) * activeT);
        const colorStr = `rgb(${r}, ${g}, ${b})`;

        drawTabIcon(bgCtx, item.id, tabX, iconY, colorStr, 1.0 * dpr);

        bgCtx.font = `600 ${10.5 * dpr}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
        bgCtx.textAlign = 'center';
        bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = colorStr;
        bgCtx.fillText(item.label, tabX, labelY);
      });

      bgCtx.restore();

      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
    };

    let stageW = 800;
    let stageH = 460;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stateRef.current.dpr = dpr;
      stageW = Math.max(rect.width, 420);
      stageH = Math.max(rect.height, 360);

      const devW = Math.round(stageW * dpr);
      const devH = Math.round(stageH * dpr);

      canvas.width = devW;
      canvas.height = devH;
      bgCanvas.width = devW;
      bgCanvas.height = devH;
      gl.viewport(0, 0, devW, devH);

      const tabPositions = getTabPositions(stageW);
      if (stateRef.current.lensCurrentX === 0) {
        stateRef.current.lensCurrentX = tabPositions[stateRef.current.activeIndex];
        stateRef.current.lensTargetX = stateRef.current.lensCurrentX;
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Interaction Handlers (Drag & Tap)
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const st = stateRef.current;

      const tabPositions = getTabPositions(stageW);
      const distToLens = Math.abs(x - st.lensCurrentX);

      if (distToLens <= LENS_BASE_HALF_WIDTH * 1.2) {
        st.isDragging = true;
        st.dragStartX = clientX;
        st.dragStartLensX = st.lensCurrentX;
        st.targetPress = 1.0;
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const st = stateRef.current;
      if (!st.isDragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - st.dragStartX;
      const tabPositions = getTabPositions(stageW);
      const minX = tabPositions[0];
      const maxX = tabPositions[tabPositions.length - 1];

      let targetX = st.dragStartLensX + deltaX;
      if (targetX < minX) {
        targetX = minX - Math.pow(minX - targetX, 0.8) * 1.5;
      } else if (targetX > maxX) {
        targetX = maxX + Math.pow(targetX - maxX, 0.8) * 1.5;
      }

      st.lensTargetX = targetX;
      st.negRefractAmount = Math.min(1.0, st.negRefractAmount + 0.1);
    };

    const onPointerUp = () => {
      const st = stateRef.current;
      if (!st.isDragging) return;
      st.isDragging = false;
      st.targetPress = 0.0;

      // Snap to closest tab
      const tabPositions = getTabPositions(stageW);
      let closestIdx = 0;
      let minDiff = Infinity;

      tabPositions.forEach((pos, idx) => {
        const diff = Math.abs(pos - st.lensCurrentX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      st.targetIndex = closestIdx;
      st.activeIndex = closestIdx;
      st.lensTargetX = tabPositions[closestIdx];
      setActiveTab(closestIdx);
      if (onChangeRef.current) onChangeRef.current(items[closestIdx], closestIdx);
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // Animation Render Loop
    let animId = 0;
    let startTime = performance.now();

    const render = (currentTime: number) => {
      const st = stateRef.current;
      const dt = Math.min((currentTime - st.lastTime) / 1000, 0.04);
      st.lastTime = currentTime;

      const tabPositions = getTabPositions(stageW);

      // Spring follow on lens X position
      const springK = 260.0;
      const damping = 22.0;
      const dispX = st.lensTargetX - st.lensCurrentX;
      const forceX = dispX * springK;
      st.lensVelocityX += (forceX - st.lensVelocityX * damping) * dt;
      st.lensCurrentX += st.lensVelocityX * dt;

      // Dynamic stretch along X based on velocity
      const speed = Math.abs(st.lensVelocityX);
      const targetSx = 1.0 + Math.min(0.26, speed * 0.00038);
      const targetSy = 1.0 / Math.sqrt(targetSx);

      const jellyK = 310.0;
      const jellyD = 20.0;
      const fx = -(st.stretchX - targetSx) * jellyK - jellyD * st.jellyVelocityX;
      st.jellyVelocityX += fx * dt;
      st.stretchX += st.jellyVelocityX * dt;

      const fy = -(st.stretchY - targetSy) * jellyK - jellyD * st.jellyVelocityY;
      st.jellyVelocityY += fy * dt;
      st.stretchY += st.jellyVelocityY * dt;

      // Press smoothing
      st.pressAmount += (st.targetPress - st.pressAmount) * Math.min(dt * 18.0, 1.0);

      // Negative refraction dissipation
      if (!st.isDragging) {
        st.negRefractAmount = Math.max(0.0, st.negRefractAmount - dt * 2.8);
      }

      // Render Substrate
      renderSubstrate(stageW, stageH, st.dpr);

      // WebGL Lens Uniforms
      gl.useProgram(program);
      gl.uniform1i(uniforms.u_background, 0);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);

      const glLensX = st.lensCurrentX * st.dpr;
      const glLensY = (stageH * 0.5) * st.dpr;
      gl.uniform2f(uniforms.u_lensPos, glLensX, glLensY);

      const curHalfW = LENS_BASE_HALF_WIDTH * st.stretchX * st.dpr;
      const curHalfH = LENS_BASE_HALF_HEIGHT * st.stretchY * st.dpr;
      gl.uniform2f(uniforms.u_lensHalfSize, curHalfW, curHalfH);
      gl.uniform1f(uniforms.u_lensRadius, LENS_BASE_RADIUS * st.dpr);

      gl.uniform1f(uniforms.u_time, (currentTime - startTime) * 0.001);
      gl.uniform1f(uniforms.u_velocity, st.lensVelocityX);
      gl.uniform1f(uniforms.u_press, st.pressAmount);
      gl.uniform1f(uniforms.u_wobble, (Math.abs(st.jellyVelocityX) + Math.abs(st.jellyVelocityY)) * 0.012);
      gl.uniform1f(uniforms.u_negRefract, st.negRefractAmount);

      // Dock bounds for occlusion clipping
      const dockW = DOCK_WIDTH * st.dpr;
      const dockH = DOCK_HEIGHT * st.dpr;
      gl.uniform2f(uniforms.u_dockCenter, (stageW * 0.5) * st.dpr, (stageH * 0.5) * st.dpr);
      gl.uniform2f(uniforms.u_dockHalfSize, dockW * 0.5, dockH * 0.5);
      gl.uniform1f(uniforms.u_dockRadius, DOCK_RADIUS * st.dpr);

      gl.uniform1f(uniforms.u_ior, OPTICAL_IOR);
      gl.uniform1f(uniforms.u_dispersion, OPTICAL_DISPERSION);
      gl.uniform1f(uniforms.u_lensHeight, OPTICAL_LENS_HEIGHT * st.dpr);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(bgTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [items, getTabPositions]);

  const handleTabClick = (idx: number) => {
    const st = stateRef.current;
    const stage = containerRef.current;
    if (!stage) return;
    const tabPositions = getTabPositions(stage.clientWidth);
    st.targetIndex = idx;
    st.activeIndex = idx;
    st.lensTargetX = tabPositions[idx];
    st.jellyVelocityX += (idx > st.activeIndex ? 1.5 : -1.5);
    setActiveTab(idx);
    if (onChangeRef.current) onChangeRef.current(items[idx], idx);
  };

  return (
    <div ref={containerRef} className={`kinetic-tabs-root liquid-glass-navbar-root ${className}`} style={style}>
      <div className="navbar-stage-container">
        <canvas ref={canvasRef} className="navbar-glcanvas" />

        {/* Tab Hitboxes */}
        <div className="tabs-overlay">
          {items.map((item, idx) => (
            <button
              key={item.id}
              className="nav-tab-btn"
              type="button"
              aria-label={item.label}
              onClick={() => handleTabClick(idx)}
            />
          ))}
        </div>
      </div>

      {showHint && (
        <div className="navbar-floating-hint">
          <span>Click or drag between tabs • Real-time Snell's Law optical puck</span>
        </div>
      )}
    </div>
  );
};

export const LiquidGlassNavbar = KineticTabs;
export default KineticTabs;
