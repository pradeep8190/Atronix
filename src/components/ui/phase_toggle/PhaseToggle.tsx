"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./PhaseToggle.css";

export interface PhaseToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  theme?: "black" | "amber" | "blue" | "purple" | "emerald" | "white";
  color?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const themeColors: Record<string, { off: string; on: string; hue: number }> = {
  black: { off: "hsl(0, 0%, 25%)", on: "#ffffff", hue: 0 },
  white: { off: "hsl(0, 0%, 25%)", on: "#ffffff", hue: 0 },
  emerald: { off: "hsl(0, 0%, 25%)", on: "hsl(144, 92%, 46%)", hue: 144 },
  blue: { off: "hsl(0, 0%, 25%)", on: "hsl(215, 95%, 58%)", hue: 215 },
  purple: { off: "hsl(0, 0%, 25%)", on: "hsl(272, 92%, 62%)", hue: 275 },
  amber: { off: "hsl(0, 0%, 25%)", on: "hsl(38, 96%, 52%)", hue: 38 },
};

export const PhaseToggle: React.FC<PhaseToggleProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  color = "black",
  size = "md",
  disabled = false,
  className = "",
}) => {
  const [isChecked, setIsChecked] = useState(
    controlledChecked !== undefined ? controlledChecked : defaultChecked
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    pointerX: number;
    dragBounds: number;
    pressTime: number;
    pressed: boolean;
    lastX: number;
    currentVal: number;
  }>({
    isDragging: false,
    startX: 0,
    pointerX: 0,
    dragBounds: 0,
    pressTime: 0,
    pressed: false,
    lastX: 0,
    currentVal: defaultChecked ? 100 : 0,
  });

  // Sync controlled prop
  useEffect(() => {
    if (controlledChecked !== undefined) {
      setIsChecked(controlledChecked);
      const toggleEl = toggleRef.current;
      if (toggleEl && !dragRef.current.isDragging) {
        toggleEl.setAttribute("aria-pressed", String(controlledChecked));
        toggleEl.style.setProperty("--complete", controlledChecked ? "100" : "0");
        dragRef.current.currentVal = controlledChecked ? 100 : 0;
      }
    }
  }, [controlledChecked]);

  // Exact 1:1 implementation of Jhey's toggleState timeline
  const toggleState = useCallback(() => {
    const toggleEl = toggleRef.current;
    if (!toggleEl || disabled) return;

    setHasInteracted(true);

    // 1. Scale up & inflate bubble
    toggleEl.dataset.pressed = "true";
    toggleEl.dataset.active = "true";

    const pressed = toggleEl.getAttribute("aria-pressed") === "true";
    const targetVal = pressed ? 0 : 100;
    const startVal =
      parseFloat(toggleEl.style.getPropertyValue("--complete")) || (pressed ? 100 : 0);

    // 2. Wait 0.18s for the liquid bubble to scale up with the spring curve
    const timeoutId = setTimeout(() => {
      const animStart = performance.now();
      const duration = 120; // Exact duration from Jhey's gsap.to duration: 0.12s

      const step = (now: number) => {
        const elapsed = now - animStart;
        const progress = Math.min(1, elapsed / duration);
        const currentComplete = startVal + (targetVal - startVal) * progress;

        toggleEl.style.setProperty("--complete", String(currentComplete));
        dragRef.current.currentVal = currentComplete;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          toggleEl.style.setProperty("--complete", String(targetVal));
          dragRef.current.currentVal = targetVal;

          // 3. Jhey's exact delayedCall(0.05) to deflate and swap aria-pressed
          setTimeout(() => {
            toggleEl.dataset.active = "false";
            toggleEl.dataset.pressed = "false";
            const nextPressed = !pressed;
            toggleEl.setAttribute("aria-pressed", String(nextPressed));
            setIsChecked(nextPressed);
            onChange?.(nextPressed);
          }, 50);
        }
      };

      requestAnimationFrame(step);
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [disabled, onChange]);

  // Exact 1:1 Draggable implementation
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const toggleEl = toggleRef.current;
    if (!toggleEl) return;

    setHasInteracted(true);
    const now = Date.now();
    const toggleBounds = toggleEl.getBoundingClientRect();
    const pressed = toggleEl.getAttribute("aria-pressed") === "true";

    // Jhey's exact drag bounds calculation
    const bounds = pressed
      ? toggleBounds.left - e.clientX
      : toggleBounds.left + toggleBounds.width - e.clientX;

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      pointerX: e.clientX,
      dragBounds: bounds,
      pressTime: now,
      pressed,
      lastX: e.clientX,
      currentVal: parseFloat(toggleEl.style.getPropertyValue("--complete")) || (pressed ? 100 : 0),
    };

    toggleEl.dataset.active = "true";
    toggleEl.dataset.pressed = "true";

    try {
      toggleEl.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const toggleEl = toggleRef.current;
    if (!toggleEl || !dragRef.current.isDragging) return;

    const { startX, dragBounds, pressed, lastX } = dragRef.current;
    const dragged = e.clientX - startX;
    const deltaX = e.clientX - lastX;
    dragRef.current.lastX = e.clientX;

    // Jhey's exact mapRange formula
    let complete = 0;
    if (pressed) {
      complete = dragBounds !== 0 ? ((dragged - dragBounds) / (0 - dragBounds)) * 100 : 0;
    } else {
      complete = dragBounds !== 0 ? (dragged / dragBounds) * 100 : 0;
    }

    complete = Math.max(0, Math.min(100, complete));
    const delta = Math.min(Math.abs(deltaX), 12);

    toggleEl.style.setProperty("--complete", String(complete));
    toggleEl.style.setProperty("--delta", String(delta));
    dragRef.current.currentVal = complete;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const toggleEl = toggleRef.current;
    if (!toggleEl || !dragRef.current.isDragging) return;

    dragRef.current.isDragging = false;
    toggleEl.style.setProperty("--delta", "0");

    const releaseTime = Date.now();
    const { pressTime, startX, currentVal } = dragRef.current;

    // Jhey's exact condition: if releaseTime - pressTime <= 150 -> click/tap!
    if (releaseTime - pressTime <= 150 || Math.abs(e.clientX - startX) < 4) {
      toggleState();
      return;
    }

    // Drag release threshold snap: fromTo duration 0.15s
    const targetVal = currentVal >= 50 ? 100 : 0;
    const animStart = performance.now();
    const duration = 150; // Exact duration from Jhey's gsap.fromTo duration: 0.15s

    const step = (now: number) => {
      const elapsed = now - animStart;
      const progress = Math.min(1, elapsed / duration);
      const val = currentVal + (targetVal - currentVal) * progress;

      toggleEl.style.setProperty("--complete", String(val));
      dragRef.current.currentVal = val;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        toggleEl.style.setProperty("--complete", String(targetVal));
        dragRef.current.currentVal = targetVal;

        // Jhey's exact delayedCall(0.05)
        setTimeout(() => {
          toggleEl.dataset.active = "false";
          toggleEl.dataset.pressed = "false";
          const nextPressed = targetVal === 100;
          toggleEl.setAttribute("aria-pressed", String(nextPressed));
          setIsChecked(nextPressed);
          onChange?.(nextPressed);
        }, 50);
      }
    };

    requestAnimationFrame(step);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleState();
    }
  };

  const activeTheme = themeColors[color] || themeColors.black;

  const scaleMultiplier = {
    sm: 0.8,
    md: 1.0,
    lg: 1.25,
  }[size] || 1.0;

  return (
    <div
      ref={containerRef}
      className={`liquid-toggle-wrapper ${className}`}
      data-bounce="true"
      data-mapped="false"
      data-theme="dark"
      style={
        {
          "--scale": scaleMultiplier,
        } as React.CSSProperties
      }
    >
      {/* Hand-drawn Tap and Drag Arrow Indicator */}
      <div className={`arrow arrow--main ${hasInteracted ? "arrow-hidden" : ""}`}>
        <span>tap and drag.</span>
        <svg viewBox="0 0 77 139" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M63.9153 0.37541C62.6706 1.85361 63.1403 31.3942 64.7373 54.4353C65.5593 65.9325 67.0389 77.8285 68.8708 87.6362C71.0784 99.4618 71.3837 102.113 70.7496 103.99C70.1155 105.914 68.6594 106.384 61.9191 106.876C51.2566 107.674 49.3543 108.003 32.6561 112.038C25.9157 113.681 18.8936 115.112 18.7057 114.924C18.6352 114.877 19.1754 113.939 19.8799 112.859C21.3126 110.63 21.5944 109.692 21.1951 108.401C20.6784 106.642 18.5882 105.656 16.8973 106.36C16.451 106.548 14.807 107.604 13.257 108.683C10.5797 110.56 9.0531 111.405 4.54388 113.47C-0.435059 115.745 -1.37449 119.734 1.98395 124.404C3.48702 126.515 4.9901 127.829 8.65384 130.246C12.8578 132.991 16.2397 134.61 20.561 135.971C22.4868 136.581 24.9293 137.426 25.9627 137.872C27.137 138.364 27.9355 138.575 28.0764 138.435C28.9219 137.59 24.718 133.249 18.3534 128.51C15.8404 126.633 13.4684 124.826 13.0691 124.521L12.3646 123.934L13.304 123.77C19.8565 122.667 28.1468 120.861 35.8736 118.819C45.1269 116.379 51.2566 115.018 55.8128 114.385C64.2441 113.211 68.0018 112.578 69.4579 112.132C72.558 111.17 74.977 108.824 75.8929 105.867C76.8559 102.77 76.5505 99.1568 74.2959 87.2842C71.5951 73.0888 70.1155 61.1928 68.5185 41.1785C67.5086 28.5551 66.3813 11.6614 66.1465 5.04465C65.9821 0.750832 65.7707 0 64.7608 0C64.4555 0 64.0797 0.164239 63.9153 0.37541Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Button with Exact HTML Structure from dist/index.html */}
      <button
        ref={toggleRef}
        type="button"
        role="switch"
        aria-label="Liquid Toggle"
        aria-pressed={isChecked}
        disabled={disabled}
        className="liquid-toggle"
        style={
          {
            "--complete": isChecked ? 100 : 0,
            "--theme-off": activeTheme.off,
            "--theme-on": activeTheme.on,
            "--hue": activeTheme.hue,
            "--delta": 0,
          } as React.CSSProperties
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div className="knockout">
          <div className="indicator indicator--masked">
            <div className="mask" />
          </div>
        </div>
        <div className="indicator__liquid">
          <div className="shadow" />
          <div className="wrapper">
            <div className="liquids">
              <div className="liquid__shadow" />
              <div className="liquid__track" />
            </div>
          </div>
          <div className="cover" />
        </div>
      </button>

      {/* Exact SVG Filters from dist/index.html & script.js update() */}
      <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              id="SvgjsFeGaussianBlur1000"
              result="SvgjsFeGaussianBlur1000"
              in="SourceGraphic"
              stdDeviation="2"
            />
            <feColorMatrix
              id="SvgjsFeColorMatrix1001"
              result="SvgjsFeColorMatrix1001"
              in="SvgjsFeGaussianBlur1000"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 16 -10
              "
              type="matrix"
            />
            <feComposite
              id="SvgjsFeComposite1002"
              result="SvgjsFeComposite1002"
              in="SvgjsFeColorMatrix1001"
              operator="atop"
            />
          </filter>
          <filter id="remove-black" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -255 -255 -255 0 1"
              result="black-pixels"
            />
            <feMorphology
              in="black-pixels"
              operator="dilate"
              radius="0.5"
              result="smoothed"
            />
            <feComposite in="SourceGraphic" in2="smoothed" operator="out" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default PhaseToggle;
