import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HomeDNA.css';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface HomeDNAProps {
  onExplore?: () => void;
}

interface PillarData {
  id: string;
  num: string;
  rule: string;
  title: string;
  desc: string;
  tags: string[];
  reversed: boolean;
}

const PILLARS: PillarData[] = [
  {
    id: 'mass',
    num: '01',
    rule: 'Law of Mass',
    title: 'Every pixel carries mass and purpose',
    desc: 'Every surface and boundary is endowed with physical inertia and mass. Motion is never decorative—it behaves like real matter.',
    tags: ['Tangible Inertia', 'Zero Weightless Pixels', 'Calculated Purpose'],
    reversed: false,
  },
  {
    id: 'restraint',
    num: '02',
    rule: 'Law of Restraint',
    title: 'Satisfying precision over chaotic noise',
    desc: 'True luxury is calm, restrained, and viscerally satisfying. Generous negative space replaces chaotic visual noise.',
    tags: ['Restrained Luxury', 'Zero Clutter', 'Visceral Satisfaction'],
    reversed: true,
  },
  {
    id: 'distinction',
    num: '03',
    rule: 'Law of Distinction',
    title: 'Bespoke character over generic templates',
    desc: 'Bespoke physical craft over generic copy-paste templates. An unmistakable signature designed by real-world physics.',
    tags: ['Anti-Mediocrity', 'Signature Craft', 'Unmistakable Identity'],
    reversed: false,
  },
];

export const HomeDNA: React.FC<HomeDNAProps> = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Manifesto Header: 3D Cylindrical Roll & Lens Un-blur
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.dna-manifesto-block',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      headerTl
        .fromTo(
          '.dna-manifesto-heading',
          {
            opacity: 0,
            y: 50,
            rotateX: -35,
            transformPerspective: 1000,
            transformOrigin: '50% 100% -40px',
            filter: 'blur(10px)',
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: 1.25,
            ease: 'power3.out',
          }
        )
        .fromTo(
          '.dna-manifesto-subtext',
          { opacity: 0, y: 20, letterSpacing: '0.04em' },
          { opacity: 1, y: 0, letterSpacing: '-0.01em', duration: 0.9, ease: 'power2.out' },
          '-=0.85'
        );

      // 2. Each Pillar Row: Unique Physical Kinetic Choreography
      const rows = gsap.utils.toArray<HTMLElement>('.dna-pillar-row');
      rows.forEach((row) => {
        const isReversed = row.classList.contains('reversed');
        const badge = row.querySelector('.dna-pillar-badge');
        const title = row.querySelector('.dna-pillar-title');
        const desc = row.querySelector('.dna-pillar-desc');
        const tags = row.querySelectorAll('.telemetry-tag');
        const numberEl = row.querySelector('.dna-card-law-number');

        // A. Kinetic Entrance Timeline (Mechanical Lock-in)
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: 'top 76%',
            toggleActions: 'play none none none',
          },
        });

        // 1. Badge Stamp
        if (badge) {
          entranceTl.fromTo(
            badge,
            { opacity: 0, x: isReversed ? 35 : -35, scale: 0.8 },
            { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'back.out(2)' }
          );
        }

        // 2. Title 3D Mechanical Roll
        if (title) {
          entranceTl.fromTo(
            title,
            {
              opacity: 0,
              y: 40,
              rotateX: -45,
              transformOrigin: '50% 100% -30px',
              transformPerspective: 1200,
              filter: 'blur(8px)',
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: 'blur(0px)',
              duration: 1.1,
              ease: 'power3.out',
            },
            '-=0.5'
          );
        }

        // 3. Description Smooth Optical Wipe
        if (desc) {
          entranceTl.fromTo(
            desc,
            { opacity: 0, y: 20, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
            '-=0.7'
          );
        }

        // 4. Telemetry Chips: Domino Velocity Cascade
        if (tags.length > 0) {
          entranceTl.fromTo(
            tags,
            {
              opacity: 0,
              scale: 0.6,
              rotateZ: isReversed ? 8 : -8,
              x: isReversed ? 24 : -24,
            },
            {
              opacity: 1,
              scale: 1,
              rotateZ: 0,
              x: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: 'back.out(1.8)',
            },
            '-=0.55'
          );
        }

        // B. Monumental Number: Deep Z-Space Gravitational Condensation
        if (numberEl) {
          gsap.fromTo(
            numberEl,
            {
              scale: 1.6,
              letterSpacing: '0.12em',
              filter: 'blur(8px)',
              opacity: 0,
              y: 50,
            },
            {
              scale: 1.0,
              letterSpacing: '-0.04em',
              filter: 'blur(0px)',
              opacity: 1,
              y: -20,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 88%',
                end: 'top 45%',
                scrub: 0.8,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="home-dna-section" aria-label="Atronix Physical Laws">
      {/* Tight, Clean Section Title */}
      <div className="dna-manifesto-block">
        <h2 className="dna-manifesto-heading">
          Engineered by physics.<br />
          <span className="dna-gradient-text">Not decorated by CSS.</span>
        </h2>
        <p className="dna-manifesto-subtext">
          Three non-negotiable laws that define the Atronix standard.
        </p>
      </div>

      {/* The 3 Physical Pillars */}
      {PILLARS.map((pillar) => (
        <div
          key={pillar.id}
          className={`dna-pillar-row ${pillar.reversed ? 'reversed' : ''}`}
        >
          {/* Content Column */}
          <div className="dna-pillar-content">
            <div className="dna-pillar-badge">
              <span className="badge-rule">{pillar.rule}</span>
            </div>
            <h3 className="dna-pillar-title">{pillar.title}</h3>
            <p className="dna-pillar-desc">{pillar.desc}</p>
            <div className="dna-telemetry-tags">
              {pillar.tags.map((tag) => (
                <span key={tag} className="telemetry-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Respective Big Law Number (Deep Z-Space Gravitational Lens) */}
          <div className="dna-number-slot" aria-hidden="true">
            <span className="dna-card-law-number">{pillar.num}</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default HomeDNA;
