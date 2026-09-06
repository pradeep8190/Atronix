import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toggleVsSource, toggleFsSource } from './plasmaButtonShaders';
import './PlasmaButton.css';

export interface PlasmaButtonProps {
  defaultOn?: boolean;
  onChange?: (isOn: boolean) => void;
  showHint?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export type PlasmaToggleProps = PlasmaButtonProps;

const OPTICAL_IOR = 1.52;
const OPTICAL_DISPERSION = 0.052;
const BASE_LENS_HEIGHT = 20.0;

const CAPSULE_WIDTH_CSS = 360.0;
const CAPSULE_HEIGHT_CSS = 195.0;
const CAPSULE_RADIUS_CSS = 97.5;

export const PlasmaButton: React.FC<PlasmaButtonProps> = ({
  defaultOn = true,
  onChange,
  showHint = false,
  className = '',
  style,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [isOn, setIsOn] = useState(defaultOn);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mutable Physics State
  const stateRef = useRef({
    isON: defaultOn,
    progress: defaultOn ? 0.0 : 1.0,
    targetProgress: defaultOn ? 0.0 : 1.0,
    velocity: 0.0,
    isDragging: false,
    dragStartX: 0,
    dragStartProgress: 0,
    lastDragX: 0,
    lastDragTime: 0,
    dragVelocity: 0,
    lastRenderedProgress: -1,
    dpr: 1,
    lastFrameTime: performance.now(),
  });

  const toggle = useCallback(() => {
    const st = stateRef.current;
    const newState = !st.isON;
    st.isON = newState;
    st.targetProgress = newState ? 0.0 : 1.0;
    setIsOn(newState);
    if (onChangeRef.current) onChangeRef.current(newState);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!stage || !canvas || !overlay) return;

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

    const vs = compile(gl.VERTEX_SHADER, toggleVsSource);
    const fs = compile(gl.FRAGMENT_SHADER, toggleFsSource);
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
      u_capsuleCenter: gl.getUniformLocation(program, 'u_capsuleCenter'),
      u_capsuleHalfSize: gl.getUniformLocation(program, 'u_capsuleHalfSize'),
      u_capsuleRadius: gl.getUniformLocation(program, 'u_capsuleRadius'),
      u_progress: gl.getUniformLocation(program, 'u_progress'),
      u_velocity: gl.getUniformLocation(program, 'u_velocity'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_ior: gl.getUniformLocation(program, 'u_ior'),
      u_dispersion: gl.getUniformLocation(program, 'u_dispersion'),
      u_lensHeight: gl.getUniformLocation(program, 'u_lensHeight'),
    };

    // Background Canvas & Texture
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });

    const bgTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const renderBackgroundTexture = (progress: number, dpr: number) => {
      if (!bgCtx) return;
      const w = bgCanvas.width;
      const h = bgCanvas.height;

      bgCtx.fillStyle = '#000000';
      bgCtx.fillRect(0, 0, w, h);

      const gridSize = 40 * dpr;
      bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
      bgCtx.lineWidth = 1 * dpr;

      const centerX = w * 0.5;
      const centerY = h * 0.5;

      for (let x = centerX % gridSize; x < w; x += gridSize) {
        const px = Math.floor(x) + 0.5 * dpr;
        bgCtx.beginPath();
        bgCtx.moveTo(px, 0);
        bgCtx.lineTo(px, h);
        bgCtx.stroke();
      }

      for (let y = centerY % gridSize; y < h; y += gridSize) {
        const py = Math.floor(y) + 0.5 * dpr;
        bgCtx.beginPath();
        bgCtx.moveTo(0, py);
        bgCtx.lineTo(w, py);
        bgCtx.stroke();
      }

      // Substrate Typography
      bgCtx.save();
      bgCtx.textAlign = 'center';
      bgCtx.textBaseline = 'middle';
      bgCtx.font = `300 ${40 * dpr}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif`;

      const offX = centerX - 84 * dpr;
      const onX = centerX + 84 * dpr;

      const offAlpha = Math.max(0.0, Math.min(1.0, (progress - 0.15) / 0.70));
      const onAlpha = Math.max(0.0, Math.min(1.0, (0.85 - progress) / 0.70));

      if (offAlpha > 0.01) {
        bgCtx.shadowColor = `rgba(255, 255, 255, ${0.35 * offAlpha})`;
        bgCtx.shadowBlur = 12 * dpr;
        bgCtx.fillStyle = `rgba(255, 255, 255, ${0.88 * offAlpha})`;
        bgCtx.fillText('OFF', offX, centerY);
      }

      if (onAlpha > 0.01) {
        bgCtx.shadowColor = `rgba(255, 255, 255, ${0.35 * onAlpha})`;
        bgCtx.shadowBlur = 12 * dpr;
        bgCtx.fillStyle = `rgba(255, 255, 255, ${0.88 * onAlpha})`;
        bgCtx.fillText('ON', onX, centerY);
      }

      bgCtx.restore();

      gl.bindTexture(gl.TEXTURE_2D, bgTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
    };

    const handleResize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      stateRef.current.dpr = dpr;

      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      renderBackgroundTexture(stateRef.current.progress, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(stage);
    handleResize();

    // Interaction Handlers (Pointer Drag & Tap)
    const onPointerDown = (e: PointerEvent) => {
      const st = stateRef.current;
      st.isDragging = true;
      st.dragStartX = e.clientX;
      st.dragStartProgress = st.progress;
      st.lastDragX = e.clientX;
      st.lastDragTime = performance.now();
      st.dragVelocity = 0;

      try {
        overlay.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      const st = stateRef.current;
      if (!st.isDragging) return;

      const now = performance.now();
      const dt = Math.max(1, now - st.lastDragTime);
      st.dragVelocity = (e.clientX - st.lastDragX) / dt;
      st.lastDragX = e.clientX;
      st.lastDragTime = now;

      const rect = overlay.getBoundingClientRect();
      const travelRange = rect.width * 0.55;
      const deltaProgress = (e.clientX - st.dragStartX) / travelRange;

      st.progress = Math.max(0.0, Math.min(1.0, st.dragStartProgress + deltaProgress));
      st.velocity = st.dragVelocity * 0.15;
    };

    const onPointerUp = (e: PointerEvent) => {
      const st = stateRef.current;
      if (!st.isDragging) return;
      st.isDragging = false;

      try {
        overlay.releasePointerCapture(e.pointerId);
      } catch {}

      const totalDx = Math.abs(e.clientX - st.dragStartX);
      if (totalDx < 6) {
        toggle();
        return;
      }

      const projectedProgress = st.progress + st.dragVelocity * 0.08;
      const newState = projectedProgress <= 0.5;
      st.isON = newState;
      st.targetProgress = newState ? 0.0 : 1.0;
      setIsOn(newState);
      if (onChangeRef.current) onChangeRef.current(newState);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    };

    overlay.addEventListener('pointerdown', onPointerDown);
    overlay.addEventListener('pointermove', onPointerMove);
    overlay.addEventListener('pointerup', onPointerUp);
    overlay.addEventListener('pointercancel', onPointerUp);
    overlay.addEventListener('keydown', onKeyDown);

    // Animation Loop
    let animId = 0;
    let startTime = performance.now();

    const render = (currentTime: number) => {
      const st = stateRef.current;
      const dt = Math.min((currentTime - st.lastFrameTime) / 1000, 0.04);
      st.lastFrameTime = currentTime;

      // Spring physics
      if (!st.isDragging) {
        const springK = 380.0;
        const damping = 28.0;
        const disp = st.progress - st.targetProgress;
        const force = -springK * disp - damping * st.velocity;
        st.velocity += force * dt;
        st.progress += st.velocity * dt;

        if (Math.abs(disp) < 0.0008 && Math.abs(st.velocity) < 0.005) {
          st.progress = st.targetProgress;
          st.velocity = 0;
        }
      }

      st.progress = Math.max(0.0, Math.min(1.0, st.progress));

      if (Math.abs(st.progress - st.lastRenderedProgress) > 0.003) {
        renderBackgroundTexture(st.progress, st.dpr);
        st.lastRenderedProgress = st.progress;
      }

      // WebGL Uniforms
      gl.useProgram(program);
      gl.uniform1i(uniforms.u_background, 0);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);

      const centerDevX = (stage.clientWidth * 0.5) * st.dpr;
      const centerDevY = (stage.clientHeight * 0.5) * st.dpr;
      gl.uniform2f(uniforms.u_capsuleCenter, centerDevX, centerDevY);

      gl.uniform2f(
        uniforms.u_capsuleHalfSize,
        (CAPSULE_WIDTH_CSS * 0.5) * st.dpr,
        (CAPSULE_HEIGHT_CSS * 0.5) * st.dpr
      );
      gl.uniform1f(uniforms.u_capsuleRadius, CAPSULE_RADIUS_CSS * st.dpr);

      gl.uniform1f(uniforms.u_progress, st.progress);
      gl.uniform1f(uniforms.u_velocity, st.velocity);
      gl.uniform1f(uniforms.u_time, (currentTime - startTime) * 0.001);

      gl.uniform1f(uniforms.u_ior, OPTICAL_IOR);
      gl.uniform1f(uniforms.u_dispersion, OPTICAL_DISPERSION);
      gl.uniform1f(uniforms.u_lensHeight, BASE_LENS_HEIGHT * st.dpr);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

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
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(bgTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [toggle]);

  return (
    <div className={`plasma-button-root plasma-toggle-root ${className}`} style={style}>
      <div ref={stageRef} className="plasma-studio-stage">
        <div className="plasma-studio-grid" />
        <canvas ref={canvasRef} className="plasma-glcanvas" />
        <div
          ref={overlayRef}
          className="plasma-capsule-overlay"
          role="switch"
          aria-checked={isOn}
          tabIndex={0}
          title="Click to Toggle Liquid Glass Plasma"
        />

        {showHint && (
          <div className="plasma-hint">
            <span>Click or drag capsule • Volumetric Ionized Plasma Optics</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const PlasmaToggle = PlasmaButton;
export default PlasmaButton;
