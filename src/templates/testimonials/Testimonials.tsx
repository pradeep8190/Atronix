import React, { useEffect, useRef } from 'react';
import './Testimonials.css';

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

export interface TestimonialsProps {
  tagline?: string;
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
  speed?: number;
  className?: string;
}

const DEFAULT_FEEDBACK: TestimonialItem[] = [
  {
    quote: "The WebGL signed distance fields and fluid kinematics give our interface a tactile weight flat CSS can never match.",
    author: "Devon R.",
    role: "Principal Architect",
  },
  {
    quote: "Instant CLI installation with zero runtime bloat. Dropped production shaders directly into Next.js in seconds.",
    author: "Sarah K.",
    role: "Staff Engineer",
  },
  {
    quote: "True optical refraction and mathematical fluid conservation in React. It turns every interaction into pure craft.",
    author: "Marcus V.",
    role: "Creative Technologist",
  },
  {
    quote: "Obsidian glass, viscous damping, and tactile inertia with zero compromise on frame budget. A different league.",
    author: "Elena S.",
    role: "Product Designer",
  },
  {
    quote: "Delivering 120 FPS WebGL simulations on mobile without draining battery is a triumph of graphics engineering.",
    author: "Justin T.",
    role: "VP of Engineering",
  },
];

export const Testimonials: React.FC<TestimonialsProps> = ({
  tagline = "Verified Telemetry",
  title = "Decentralized Testimonials.",
  subtitle = "What developers, design engineers, and creative technologists say after deploying Atronix UI into mission-critical production interfaces.",
  items = DEFAULT_FEEDBACK,
  speed = 1.4,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollXRef = useRef(0);
  const scrollXRef = useRef(0);

  // Triple the array for seamless infinite scroll
  const doubleTestimonials = [...items, ...items, ...items];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const track = trackRef.current;
    if (!scrollContainer || !track) return;

    let animId: number;

    const animate = () => {
      if (!isPausedRef.current && !isDraggingRef.current) {
        scrollXRef.current += speed;
      }

      const firstSetWidth = track.scrollWidth / 3;
      if (firstSetWidth > 0) {
        while (scrollXRef.current >= firstSetWidth) {
          scrollXRef.current -= firstSetWidth;
        }
        while (scrollXRef.current < 0) {
          scrollXRef.current += firstSetWidth;
        }
      }

      // Shift track
      track.style.transform = `translateX(${-scrollXRef.current}px)`;

      // Calculate curves for each card relative to screen center
      const cards = track.querySelectorAll('.testimonial-card');
      const containerRect = scrollContainer.getBoundingClientRect();
      const screenCenterX = containerRect.left + containerRect.width / 2;
      const maxDist = Math.max(containerRect.width / 2, 300);

      cards.forEach((card) => {
        const htmlCard = card as HTMLElement;
        const rect = htmlCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;

        const distance = cardCenterX - screenCenterX;
        const ratio = distance / maxDist;
        const clampedRatio = Math.max(-1.2, Math.min(1.2, ratio));
        const absRatio = Math.abs(clampedRatio);

        // Curved vertical deflection
        const yOffset = absRatio * absRatio * 65;

        // Tilt rotation
        const rotation = clampedRatio * 8;

        // Scale factor
        const scale = 1.05 - absRatio * 0.17;

        // Fade factor
        const opacity = 1.0 - Math.min(0.75, absRatio * 0.65);

        htmlCard.style.transform = `translate3d(0, ${yOffset}px, 0) rotateZ(${rotation}deg) scale(${scale})`;
        htmlCard.style.opacity = `${opacity}`;
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [items, speed]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollXRef.current = scrollXRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    scrollXRef.current = startScrollXRef.current - deltaX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    isPausedRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <section className={`testimonial-section ${className}`} ref={scrollRef}>
      <div className="testimonial-wrapper">
        {/* Left Column Header */}
        <div className="testimonial-intro-col">
          {tagline && <span className="testimonial-tagline">{tagline}</span>}
          {title && <h2 className="testimonial-title">{title}</h2>}
          {subtitle && <p className="testimonial-subtitle">{subtitle}</p>}
        </div>

        {/* Auto-play Viewport Container with interactive Drag-to-Scroll */}
        <div
          className="testimonial-scroll-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="testimonial-scroll-track" ref={trackRef}>
            {doubleTestimonials.map((t, i) => (
              <div
                className="testimonial-card"
                key={i}
                onMouseEnter={() => {
                  if (!isDraggingRef.current) {
                    isPausedRef.current = true;
                  }
                }}
                onMouseLeave={() => {
                  if (!isDraggingRef.current) {
                    isPausedRef.current = false;
                  }
                }}
              >
                <div className="testimonial-card-inner">
                  {/* Volumetric Corner Glow & Noise Dot */}
                  <div className="card-corner-glow" />
                  <div className="card-noise-dot" />

                  <span className="testimonial-index">
                    ATRONIX // 0{(i % items.length) + 1}
                  </span>
                  <p className="testimonial-quote">"{t.quote}"</p>

                  <div className="testimonial-author-block">
                    <span className="testimonial-author">{t.author}</span>
                    <span className="testimonial-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
