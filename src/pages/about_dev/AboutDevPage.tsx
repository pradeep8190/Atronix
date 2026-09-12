import { useState, useCallback, useEffect, useRef } from 'react';
import './AboutDevPage.css';

const PING_STAGES: Record<number, string> = {
  1: 'Ping failed: Dev has no recharge in wifi 📶💸',
  2: 'Ping failed: Dev wifi lost, currently hunting for neighbor’s hotspot 🔌📡',
  3: 'Ping failed: Dev busy doomscrolling reels at 200 BPM 📱💀',
  4: 'Ping failed: Dev was last seen at 4:18 AM fighting CSS "align-items: center" 🪦',
  5: 'Ping failed: Dev replied: "It works on my machine, not my problem" 💻🤷‍♂️',
  6: 'Ping failed: Dev pushed directly to production on Friday 5:59 PM and turned off phone 💣🏃',
  7: 'Ping failed: Dev is watching "How to build an OS in 45 seconds" at 3x speed 🏎️',
  8: 'Ping failed: Dev accidentally deleted .env and is now praying in 4 languages 🙏',
  9: 'Ping failed: Dev touched natural grass for 2 seconds and panicked back to dark mode 🌿🏃',
  10: 'Ping failed: Critical Chai level < 0.1%, dev motor functions suspended ☕⚠️',
};

const EXTRA_PINGS = [
  'Ping failed: Dev closed his laptop because the code looked at him funny 👀',
  'Ping failed: Dev is arguing with ChatGPT about which semicolon is more aesthetic 🎭',
  'Ping failed: Dev is reading 14-year-old StackOverflow answers marked "deprecated" 📜',
  'Ping failed: Dev forgot he created this website 3 minutes after running build 🧠💨',
];

interface Dot {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  baseRadius: number;
}

function InteractiveDotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;
    let shockwaveRadius = 0;
    let shockwaveActive = true;

    const spacing = 38;
    const dots: Dot[] = [];

    const initDots = () => {
      dots.length = 0;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = offsetX + c * spacing;
          const originY = offsetY + r * spacing;
          dots.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0,
            baseRadius: 1.25,
          });
        }
      }
    };

    initDots();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initial shockwave on landing
    const shockwaveOriginX = width * 0.35;
    const shockwaveOriginY = height * 0.45;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Expand landing shockwave
      if (shockwaveActive) {
        shockwaveRadius += 22;
        if (shockwaveRadius > Math.max(width, height) * 1.5) {
          shockwaveActive = false;
        }
      }

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // 1. Mouse repulsion physics
        const dxMouse = dot.x - mouseX;
        const dyMouse = dot.y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const maxDist = 120;

        if (distMouse < maxDist && distMouse > 0) {
          const force = (1 - distMouse / maxDist) * 8;
          dot.vx += (dxMouse / distMouse) * force;
          dot.vy += (dyMouse / distMouse) * force;
        }

        // 2. Landing shockwave impulse
        if (shockwaveActive) {
          const dxWave = dot.originX - shockwaveOriginX;
          const dyWave = dot.originY - shockwaveOriginY;
          const distWave = Math.sqrt(dxWave * dxWave + dyWave * dyWave);
          const waveDiff = Math.abs(distWave - shockwaveRadius);

          if (waveDiff < 60 && distWave > 0) {
            const waveForce = (1 - waveDiff / 60) * 4.5;
            dot.vx += (dxWave / distWave) * waveForce;
            dot.vy += (dyWave / distWave) * waveForce;
          }
        }

        // 3. Elastic spring return to home origin
        const homeDx = dot.originX - dot.x;
        const homeDy = dot.originY - dot.y;
        dot.vx += homeDx * 0.08;
        dot.vy += homeDy * 0.08;

        // Damping
        dot.vx *= 0.82;
        dot.vy *= 0.82;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Visual radius & alpha calculation
        const displacement = Math.sqrt(
          (dot.x - dot.originX) * (dot.x - dot.originX) +
            (dot.y - dot.originY) * (dot.y - dot.originY)
        );

        let radius = dot.baseRadius;
        let alpha = 0.06;

        if (distMouse < maxDist) {
          const proximity = 1 - distMouse / maxDist;
          radius = dot.baseRadius + proximity * 1.4;
          alpha = 0.06 + proximity * 0.22;
        } else if (displacement > 1) {
          alpha = Math.min(0.25, 0.06 + displacement * 0.02);
          radius = dot.baseRadius + Math.min(1.2, displacement * 0.1);
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="retro-dots-canvas" aria-hidden="true" />;
}

export function AboutDevPage() {
  const [pingCount, setPingCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [chaiCount, setChaiCount] = useState(0);

  const handlePing = useCallback(() => {
    if (isPinging) return;
    setIsPinging(true);

    const nextCount = pingCount + 1;

    setTimeout(() => {
      let chosen: string;
      if (nextCount in PING_STAGES) {
        chosen = PING_STAGES[nextCount];
      } else {
        if (nextCount === 11) {
          chosen = 'BROOO PLEASE STOP, LEAVE HIM ALONE HE IS SLEEPING 😭😴🛌';
        } else if (nextCount === 12) {
          chosen = 'BRO SERIOUSLY STOP... PHONE IS ON DO NOT DISTURB 🔕💀';
        } else {
          const rand = EXTRA_PINGS[(nextCount - 13) % EXTRA_PINGS.length];
          chosen = `[Ping #${nextCount}] ${rand || 'Bro please let him rest 😭'}`;
        }
      }

      setPingCount(nextCount);
      setCurrentMessage(chosen);
      setIsPinging(false);
    }, 280);
  }, [isPinging, pingCount]);

  const handleSendChai = useCallback(() => {
    setChaiCount((prev) => Math.min(prev + 25, 100));
  }, []);

  const handleGoBack = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState({ page: 'home' }, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const getChaiStatus = () => {
    if (chaiCount === 0) return '0% (EMPTY)';
    if (chaiCount < 50) return `${chaiCount}% (Dev twitched...)`;
    if (chaiCount < 100) return `${chaiCount}% (Dev opened VS Code!)`;
    return '100% (REVIVED! Still scrolling reels 📱)';
  };

  return (
    <div className="retro-page-container">
      {/* Interactive Background Dot Canvas */}
      <InteractiveDotCanvas />

      {/* Colossal 404 in Background with Soft Low Opacity */}
      <div className="retro-bg-404" aria-hidden="true">
        404
      </div>

      {/* Main Editorial Canvas */}
      <main className="retro-canvas">
        {/* Left Column: Pinterest Editorial Typography */}
        <section className="retro-col-left">
          {/* Giant Vintage Shock Headline */}
          <h1 className="retro-headline">F*ck!</h1>

          {/* User's exact lines */}
          <p className="retro-body-text">
            It looks like the dev forgot this website exists right after writing the code,
            or his wifi recharge is over.
          </p>

          <p className="retro-sub-note">
            If you would be so kind as to go back until we find him. Thanks!
          </p>

          {/* Retro Red Go Back Link */}
          <div className="retro-back-wrapper">
            <button className="retro-back-btn" onClick={handleGoBack}>
              <svg
                className="retro-back-icon"
                width="22"
                height="12"
                viewBox="0 0 24 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 7H3M8 2L3 7l5 5" />
              </svg>
              <span className="retro-back-text">Go back</span>
            </button>
          </div>
        </section>

        {/* Right Column: Seamless Open Interactive Stage */}
        <section className="retro-col-right">
          <div className="retro-open-stage">
            {/* Live Indicator */}
            <div className="stage-status-row">
              <span className="stage-pulse-dot" />
              <span className="stage-status-title">DEV_STATUS // OFFLINE</span>
              {pingCount > 0 && <span className="stage-ping-count">PINGS: {pingCount}</span>}
            </div>

            {/* Interactive Primary Ping Button */}
            <div className="stage-actions">
              <button
                className={`stage-ping-btn ${isPinging ? 'is-busy' : ''}`}
                onClick={handlePing}
                disabled={isPinging}
              >
                <span className="stage-btn-pulse" />
                <span>{isPinging ? 'Pinging...' : pingCount === 0 ? 'Ping Dev' : 'Ping Dev Again'}</span>
                {pingCount > 0 && <span className="stage-badge">#{pingCount}</span>}
              </button>

              <button
                className="stage-chai-btn"
                onClick={handleSendChai}
                title="Send virtual chai"
              >
                <span>☕</span>
                <span>Send Chai</span>
              </button>
            </div>

            {/* Open Message Display */}
            <div className="stage-msg-container">
              {currentMessage ? (
                <div className={`stage-msg-output ${pingCount >= 11 ? 'is-urgent' : ''}`}>
                  <span className="stage-msg-prefix">{pingCount >= 11 ? '⚠️' : '→'}</span>
                  <p className="stage-msg-text">{currentMessage}</p>
                </div>
              ) : (
                <div className="stage-msg-idle">
                  <span>Click <strong>Ping Dev</strong> to attempt satellite contact...</span>
                </div>
              )}
            </div>

            {/* Chai Battery Meter */}
            <div className="stage-meter-wrapper">
              <div className="stage-meter-header">
                <span className="stage-meter-title">CHAI BATTERY</span>
                <span className="stage-meter-status">{getChaiStatus()}</span>
              </div>
              <div className="stage-meter-track">
                <div className="stage-meter-fill" style={{ width: `${chaiCount}%` }} />
              </div>
            </div>

            {/* Clean Mini Specs */}
            <div className="stage-specs-list">
              <div className="stage-spec-row">
                <span className="spec-label">LAST COMMITTED:</span>
                <span className="spec-val">4:18 AM ("final final v2")</span>
              </div>
              <div className="stage-spec-row">
                <span className="spec-label">WIFI DATA:</span>
                <span className="spec-val spec-danger">0 MB LEFT</span>
              </div>
              <div className="stage-spec-row">
                <span className="spec-label">CURRENT REEL:</span>
                <span className="spec-val">#412 OF TODAY</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutDevPage;
