import React, { useRef, useEffect, useState, useCallback } from 'react';
import { buttonVsSource, buttonFsSource } from './opticDeckShaders';
import './OpticDeck.css';

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface OpticDeckProps {
  onActionClick?: (actionId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}
export type LiquidGlassButtonProps = OpticDeckProps;

const OPTICAL_IOR = 1.54;
const OPTICAL_DISPERSION = 0.055;
const BASE_LENS_HEIGHT = 15.0;
const BUTTON_RADIUS_CSS = 36.0;

const DEFAULT_ACTIONS: ActionItem[] = [
  {
    id: 'new-doc',
    label: 'New Document',
    icon: (
      <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'upload',
    label: 'Upload File',
    icon: (
      <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 'voice',
    label: 'Voice Memo',
    icon: (
      <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Scan Code',
    icon: (
      <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
      </svg>
    ),
  },
  {
    id: 'link',
    label: 'Share Link',
    icon: (
      <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export const OpticDeck: React.FC<OpticDeckProps> = ({
  onActionClick,
  className = '',
  style,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchOverlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const gliderRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  // Mutable Physics & Kinematics State
  const animStateRef = useRef({
    dpr: 1,
    buttonX: 75,
    buttonY: 405,
    pressScale: 1.0,
    targetPressScale: 1.0,
    pressVelocity: 0.0,
    expandY: 0.0,
    expandVelY: 0.0,
    expandX: 0.0,
    expandVelX: 0.0,
    targetExpand: 0.0,
    lastTime: performance.now(),
  });

  const onActionClickRef = useRef(onActionClick);
  onActionClickRef.current = onActionClick;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const touchOverlay = touchOverlayRef.current;
    const menu = menuRef.current;
    const glider = gliderRef.current;
    if (!stage || !canvas || !touchOverlay) return;

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

    const vs = compile(gl.VERTEX_SHADER, buttonVsSource);
    const fs = compile(gl.FRAGMENT_SHADER, buttonFsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad buffer
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
      u_buttonPos: gl.getUniformLocation(program, 'u_buttonPos'),
      u_buttonRadius: gl.getUniformLocation(program, 'u_buttonRadius'),
      u_pressScale: gl.getUniformLocation(program, 'u_pressScale'),
      u_ior: gl.getUniformLocation(program, 'u_ior'),
      u_dispersion: gl.getUniformLocation(program, 'u_dispersion'),
      u_lensHeight: gl.getUniformLocation(program, 'u_lensHeight'),
      u_expandProgress: gl.getUniformLocation(program, 'u_expandProgress'),
      u_expandProgressX: gl.getUniformLocation(program, 'u_expandProgressX'),
    };

    // Offscreen 2D background canvas & WebGL texture
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const renderBackground = (dpr: number) => {
      if (!bgCtx) return;
      const w = bgCanvas.width;
      const h = bgCanvas.height;

      // Clean, refined grey base
      bgCtx.fillStyle = '#ccd2dc';
      bgCtx.fillRect(0, 0, w, h);

      // Gentle, subtle soft falloff (just a little bit of edge depth)
      const surfaceGrad = bgCtx.createRadialGradient(
        w * 0.5, h * 0.45, 40 * dpr,
        w * 0.5, h * 0.45, w * 0.65
      );
      surfaceGrad.addColorStop(0.0, '#dde2ea');
      surfaceGrad.addColorStop(0.70, '#c6ccd6');
      surfaceGrad.addColorStop(1.0, '#b6bdc8');
      bgCtx.fillStyle = surfaceGrad;
      bgCtx.fillRect(0, 0, w, h);

      // Engineering grid lines - soft, clean, low-opacity
      const gridSize = 76 * dpr;
      const gridOffsetX = (w % gridSize) * 0.5;
      const gridOffsetY = (h % gridSize) * 0.5;

      bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      bgCtx.lineWidth = 1.0 * dpr;
      bgCtx.beginPath();

      for (let x = gridOffsetX; x <= w; x += gridSize) {
        bgCtx.moveTo(Math.round(x) + 0.5, 0);
        bgCtx.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = gridOffsetY; y <= h; y += gridSize) {
        bgCtx.moveTo(0, Math.round(y) + 0.5);
        bgCtx.lineTo(w, Math.round(y) + 0.5);
      }
      bgCtx.stroke();

      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
    };

    const handleResize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const st = animStateRef.current;
      st.dpr = dpr;

      const width = Math.max(Math.round(rect.width), 360);
      const height = Math.max(Math.round(rect.height || stage.clientHeight), 520);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Center and shift the optical glass action deck upward into the open upper space
      const cardW = 195.0;
      const cardH = 275.0;
      const cardLeft = Math.round((width - cardW) * 0.5);
      const verticalShiftUp = 70.0;
      const cardTop = Math.max(36.0, Math.round((height - cardH) * 0.5) - verticalShiftUp);

      st.buttonX = cardLeft + 36.0;
      st.buttonY = cardTop + cardH - 36.0;

      if (menu) {
        menu.style.left = `${cardLeft}px`;
        menu.style.top = `${cardTop}px`;
        menu.style.bottom = 'auto';
      }

      renderBackground(dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(stage);
    handleResize();

    // Interaction Handlers
    let pointerDownOnButton = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const st = animStateRef.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const distToBtn = Math.hypot(mouseX - st.buttonX, mouseY - st.buttonY);

      if (distToBtn <= BUTTON_RADIUS_CSS) {
        touchOverlay.classList.add('hovering-button');
      } else if (st.targetExpand > 0.5) {
        const inCardX = mouseX >= st.buttonX - 36 && mouseX <= st.buttonX + 160;
        const inCardY = mouseY >= st.buttonY - 240 && mouseY <= st.buttonY + 36;
        if (inCardX && inCardY) {
          touchOverlay.classList.add('hovering-button');
        } else {
          touchOverlay.classList.remove('hovering-button');
        }
      } else {
        touchOverlay.classList.remove('hovering-button');
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const st = animStateRef.current;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const dist = Math.hypot(clickX - st.buttonX, clickY - st.buttonY);

      if (dist <= BUTTON_RADIUS_CSS) {
        st.targetPressScale = 0.93;
        pointerDownOnButton = true;
        try {
          touchOverlay.setPointerCapture(e.pointerId);
        } catch {}
      } else if (st.targetExpand > 0.5) {
        st.targetExpand = 0.0;
        setIsOpen(false);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const st = animStateRef.current;
      if (pointerDownOnButton) {
        pointerDownOnButton = false;
        st.targetPressScale = 1.0;

        const rect = stage.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const dist = Math.hypot(clickX - st.buttonX, clickY - st.buttonY);

        if (dist <= BUTTON_RADIUS_CSS) {
          const nextExpand = st.targetExpand > 0.5 ? 0.0 : 1.0;
          st.targetExpand = nextExpand;
          setIsOpen(nextExpand > 0.5);
        }

        try {
          touchOverlay.releasePointerCapture(e.pointerId);
        } catch {}
      }
    };

    touchOverlay.addEventListener('pointermove', onPointerMove);
    touchOverlay.addEventListener('pointerdown', onPointerDown);
    touchOverlay.addEventListener('pointerup', onPointerUp);
    touchOverlay.addEventListener('pointercancel', onPointerUp);

    // Animation Loop
    let animId = 0;

    const render = (time: number) => {
      const st = animStateRef.current;
      const dt = Math.min((time - st.lastTime) / 1000, 0.04);
      st.lastTime = time;

      // 1. Tactile press spring
      const springK = 320.0;
      const damping = 22.0;
      const pressForce = (st.targetPressScale - st.pressScale) * springK;
      st.pressVelocity += (pressForce - st.pressVelocity * damping) * dt;
      st.pressScale += st.pressVelocity * dt;

      // 2. Vertical Fluid Column Surge
      const kY = 195.0;
      const dY = 13.5;
      const forceY = (st.targetExpand - st.expandY) * kY;
      st.expandVelY += (forceY - st.expandVelY * dY) * dt;
      st.expandY += st.expandVelY * dt;

      // 3. Lateral Fluid Spread
      const kX = 145.0;
      const dX = 14.5;
      const targetX = st.targetExpand > 0.5 ? Math.min(1.0, st.expandY * 1.15) : st.targetExpand;
      const forceX = (targetX - st.expandX) * kX;
      st.expandVelX += (forceX - st.expandVelX * dX) * dt;
      st.expandX += st.expandVelX * dt;

      if (
        st.targetExpand === 0.0 &&
        Math.abs(st.expandY) < 0.002 &&
        Math.abs(st.expandVelY) < 0.02 &&
        Math.abs(st.expandX) < 0.002 &&
        Math.abs(st.expandVelX) < 0.02
      ) {
        st.expandY = 0.0;
        st.expandVelY = 0.0;
        st.expandX = 0.0;
        st.expandVelX = 0.0;
      }

      // WebGL Uniforms
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.uniform1i(uniforms.u_background, 0);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);

      const stageHeight = canvas.height / (st.dpr || 1);
      const buttonPxX = st.buttonX * st.dpr;
      const buttonPxY = (stageHeight - st.buttonY) * st.dpr;
      gl.uniform2f(uniforms.u_buttonPos, buttonPxX, buttonPxY);

      gl.uniform1f(uniforms.u_buttonRadius, BUTTON_RADIUS_CSS * st.dpr);
      gl.uniform1f(uniforms.u_pressScale, st.pressScale);
      gl.uniform1f(uniforms.u_ior, OPTICAL_IOR);
      gl.uniform1f(uniforms.u_dispersion, OPTICAL_DISPERSION);
      gl.uniform1f(uniforms.u_lensHeight, BASE_LENS_HEIGHT * st.dpr);

      gl.uniform1f(uniforms.u_expandProgress, st.expandY);
      gl.uniform1f(uniforms.u_expandProgressX, st.expandX);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      touchOverlay.removeEventListener('pointermove', onPointerMove);
      touchOverlay.removeEventListener('pointerdown', onPointerDown);
      touchOverlay.removeEventListener('pointerup', onPointerUp);
      touchOverlay.removeEventListener('pointercancel', onPointerUp);
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(bgTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  // Hover Glider for Actions Menu
  const handleBtnEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    const glider = gliderRef.current;
    const target = e.currentTarget;
    if (!glider || !target) return;
    glider.style.top = `${target.offsetTop}px`;
    glider.style.left = `${target.offsetLeft}px`;
    glider.style.width = `${target.offsetWidth}px`;
    glider.style.height = `${target.offsetHeight}px`;
    glider.classList.add('active');
  };

  const handleMenuLeave = () => {
    gliderRef.current?.classList.remove('active');
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const st = animStateRef.current;
    st.targetPressScale = 1.0;
    st.targetExpand = 0.0;
    setIsOpen(false);
  };

  return (
    <div className={`optic-deck-root liquid-glass-button-root ${className}`} style={style}>
      <div className="studio-card-wrapper">
        <div ref={stageRef} className="stage-container">
          <canvas ref={canvasRef} className="button-glcanvas" />

          {/* Action Menu */}
          <div
            ref={menuRef}
            className={`card-actions-menu ${isOpen ? 'open' : ''}`}
            aria-hidden={!isOpen}
            onPointerLeave={handleMenuLeave}
          >
            <div ref={gliderRef} className="hover-glider" />

            {/* Dedicated Close Anchor Over Bottom-Left X Button */}
            <div
              className="card-close-anchor"
              role="button"
              aria-label="Close Optic Deck"
              onClick={handleCloseClick}
            />

            {DEFAULT_ACTIONS.map((action, idx) => (
              <button
                key={action.id}
                className="card-action-btn"
                type="button"
                style={{ '--item-idx': DEFAULT_ACTIONS.length - 1 - idx } as React.CSSProperties}
                onPointerEnter={handleBtnEnter}
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClickRef.current?.(action.id);
                }}
              >
                {action.icon}
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>

          <div ref={touchOverlayRef} className="touch-overlay" role="button" aria-label="Optic Deck Trigger" />
        </div>
      </div>
    </div>
  );
};

export const LiquidGlassButton = OpticDeck;
export default OpticDeck;
