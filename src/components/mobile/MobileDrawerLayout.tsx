import React, { useRef, useEffect, useCallback } from 'react';
import './MobileDrawerLayout.css';

interface MobileDrawerLayoutProps {
  children: React.ReactNode;
  headerContent: React.ReactNode;
  sidebarContent: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate?: (page: 'home' | 'components' | 'templates') => void;
  onOpenSearch?: () => void;
  currentPage?: 'home' | 'components' | 'templates';
}

export const MobileDrawerLayout: React.FC<MobileDrawerLayoutProps> = ({
  children,
  headerContent,
  sidebarContent,
  isOpen,
  onOpen,
  onClose,
  onNavigate,
  onOpenSearch,
  currentPage = 'components',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainScreenRef = useRef<HTMLDivElement>(null);

  // Micro-haptic tick on supported mobile devices
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch (_) {
        // Fallback for devices without vibration
      }
    }
  }, []);

  // Clear all inline dragging transforms to let CSS spring take over
  const clearInlineStyles = useCallback(() => {
    const mainScreen = mainScreenRef.current;
    if (mainScreen) {
      mainScreen.classList.remove('is-dragging');
      mainScreen.style.transform = '';
      mainScreen.style.webkitTransform = '';
      mainScreen.style.borderRadius = '';
      mainScreen.style.borderColor = '';
    }
  }, []);

  // Sync open/close state
  useEffect(() => {
    clearInlineStyles();
    triggerHaptic();
  }, [isOpen, clearInlineStyles, triggerHaptic]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ==========================================================
  // Single-Layer 1:1 Touch Dragging Engine (120Hz Pure Fluid)
  // ==========================================================
  useEffect(() => {
    const mainScreen = mainScreenRef.current;
    const container = containerRef.current;
    if (!mainScreen || !container) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    let isHorizontal: boolean | null = null;
    let initialOpen = false;
    let startTime = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocityX = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Ignore buttons, links, inputs
      const target = touch.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('input') ||
        target?.closest('.no-drag')
      ) {
        return;
      }

      initialOpen = container.classList.contains('menu-open');

      // Prevent iOS edge swipe conflict: if closed, preserve first 24px for native back-swipe
      if (!initialOpen && touch.clientX < 24) {
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
      lastX = startX;
      startTime = Date.now();
      lastTime = startTime;
      velocityX = 0;
      isDragging = false;
      isHorizontal = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocityX = (touch.clientX - lastX) / dt;
        lastX = touch.clientX;
        lastTime = now;
      }

      // Determine intent on first 8px of movement
      if (isHorizontal === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isHorizontal = true;
            isDragging = true;
            mainScreen.classList.add('is-dragging');
          } else {
            isHorizontal = false;
            return;
          }
        } else {
          return;
        }
      }

      if (!isDragging || !isHorizontal) return;

      // Lock out vertical scroll during horizontal drawer drag
      if (e.cancelable) {
        e.preventDefault();
      }

      const deviceWidth = container.clientWidth || window.innerWidth || 395;
      const maxTranslateX = deviceWidth * 0.66;

      const baseOffset = initialOpen ? maxTranslateX : 0;
      let targetX = baseOffset + deltaX;

      // Elastic rubber-band resistance
      if (targetX < 0) {
        targetX = targetX * 0.25;
      } else if (targetX > maxTranslateX) {
        targetX = maxTranslateX + (targetX - maxTranslateX) * 0.25;
      }

      currentX = targetX;
      const progress = Math.min(Math.max(targetX / maxTranslateX, 0), 1);

      // Pure 120fps GPU transform on main screen ONLY
      const scale = 1.0 - progress * 0.125;
      const rotateY = -(progress * 3);
      const transformStr = `translate3d(${targetX}px, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`;

      mainScreen.style.transform = transformStr;
      mainScreen.style.webkitTransform = transformStr;
      mainScreen.style.borderRadius = `${progress * 36}px`;
      mainScreen.style.borderColor = `rgba(255, 255, 255, ${progress * 0.08})`;
    };

    const onTouchEnd = () => {
      if (!isDragging) return;

      isDragging = false;
      isHorizontal = null;

      const deviceWidth = container.clientWidth || window.innerWidth || 395;
      const maxTranslateX = deviceWidth * 0.66;

      // Clear inline dragging styles so CSS spring smoothly takes over
      mainScreen.classList.remove('is-dragging');
      mainScreen.style.transform = '';
      mainScreen.style.webkitTransform = '';
      mainScreen.style.borderRadius = '';
      mainScreen.style.borderColor = '';

      // Physics decision: velocity flick (>0.32 px/ms) or 35% distance threshold
      if (velocityX > 0.32) {
        onOpen();
      } else if (velocityX < -0.32) {
        onClose();
      } else if (currentX > maxTranslateX * 0.35) {
        onOpen();
      } else {
        onClose();
      }
    };

    mainScreen.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      mainScreen.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onOpen, onClose]);

  return (
    <div
      ref={containerRef}
      className={`atronix-mobile-viewport ${isOpen ? 'menu-open' : ''}`}
    >
      {/* Background Plane: Real Atronix Sidebar */}
      <aside className="mobile-drawer-plane" aria-label="Mobile Navigation">
        <div className="mobile-drawer-header">
          <div className="drawer-brand-pill">
            <span className="drawer-brand-dot" />
            <span>Atronix</span>
          </div>
        </div>

        <div className="mobile-drawer-content">{sidebarContent}</div>
      </aside>

      {/* Main Content Screen (Clean Single Layer) */}
      <main ref={mainScreenRef} className="main-content-screen">
        {/* Pinned Card Header (Navbar + Dynamic Island) */}
        <div className="mobile-card-header">{headerContent}</div>

        {/* Scrollable Page Body with Native iOS 120Hz Momentum Scrolling */}
        <div className="mobile-card-scroll-body" data-lenis-prevent>
          {children}
        </div>

        {/* Tap backdrop to snap back */}
        <div
          className="mobile-drawer-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Click to close menu"
        />

        {/* Liquid Glass Mobile Bottom Dock Bar */}
        <div className="mobile-card-dock-bar">
          <nav className="mobile-bottom-dock" aria-label="Quick Dock Navigation">
            <button
              className={`dock-item ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('home')}
              aria-label="Home"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {currentPage === 'home' && <span className="dock-dot" />}
            </button>

            <button
              className={`dock-item ${currentPage === 'components' ? 'active' : ''}`}
              onClick={() => onNavigate?.('components')}
              aria-label="Components"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              {currentPage === 'components' && <span className="dock-dot" />}
            </button>

            <button
              className={`dock-item ${currentPage === 'templates' ? 'active' : ''}`}
              onClick={() => onNavigate?.('templates')}
              aria-label="Templates"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              {currentPage === 'templates' && <span className="dock-dot" />}
            </button>

            <button
              className="dock-item"
              onClick={() => onOpenSearch?.()}
              aria-label="Search"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
};

export default MobileDrawerLayout;
