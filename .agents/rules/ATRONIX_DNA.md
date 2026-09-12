---
trigger: always_on
---

# ATRONIX — CORE LAWS

## 1. Core Philosophy

* **Anti-Mediocrity:** No generic UI, flat rounded rectangles, cheap neon gradients, or excessive visual effects.
* **Optical Luxury:** Interfaces should feel physically believable, premium, calm, and refined.
* **Physical Realism First:** Prefer real-world physical analogies and mathematical behavior over arbitrary animations.
* **Minimalism:** Clean typography, generous negative space, and restrained visual elements.
* **Never Fake Physics:** Motion, deformation, lighting, reflections, and fluid behavior should have a believable physical cause.

---

## 2. Optical Glass Law

Atronix glass must behave like a physical optical surface.

* Use subtle, low transparency rather than obvious translucent overlays.
* Create depth through optical interaction, not flat opacity.
* Surfaces require realistic specular highlights.
* Use surface gradients for crisp but restrained edge highlights.
* Materials must have believable optical behavior.
* Liquid surfaces require tight directional specular reflections rather than washed-out transparency.

---

## 3. Real-World Physics Law

Never describe motion vaguely as simply "smooth."

Start with a real-world physical analogy and derive the behavior from it.

### Fluid Conservation

For liquid surfaces:

* Treat fluid as approximately incompressible.
* Local deformation must create compensating displacement elsewhere.
* An inward deformation should produce outward pressure bulges.
* Surface tension should propagate deformation as waves.
* Boundaries should influence and reflect those waves.

### Liquid Stretching

For cohesive liquid transitions:

1. **Leading Edge:** The edge toward the destination moves first.
2. **Liquid Waist:** The connecting region stretches and becomes thinner.
3. **Trailing Edge:** The anchored edge catches up.
4. **Recovery:** The liquid returns toward its resting volume and shape.
5. **Settlement:** Motion finishes with restrained viscous cushioning.

The object must **deform like liquid**, not translate like a rigid box.

---

## 4. Atmospheric / Organic Motion Law

For smoke, clouds, vapor, nebulae, and similar organic materials:

* Never rely on simple 1D sine-wave motion as the primary structure.
* Avoid repetitive or obviously procedural shapes.
* Use multi-scale noise, FBM, domain warping, vortices, and layered motion.
* Organic forms should billow, curl, disperse, and evolve at different scales.
* 3D atmospheric forms should preserve curvature and depth.
* Lighting should respond to the perceived 3D volume.

---

## 5. Motion Law

Atronix motion should feel **weighted, viscous, and majestic**.

* Avoid nervous springiness.
* Avoid excessive bouncing.
* Avoid high-frequency oscillations.
* Avoid abrupt acceleration and deceleration.
* Prefer continuous envelopes, smoothstep-style transitions, and viscous damping.
* Motion should communicate mass, inertia, and settling.
* Every movement should feel intentional rather than decorative.

> **It should feel like matter moving through the real world, not pixels following an animation curve.**

---

## 6. Boundary / Bleed Law

Visual elements must never be physically sliced by rendering boundaries.

* Give WebGL surfaces sufficient bleed beyond their visible region.
* Liquid deformation must have room to extend beyond its resting bounds.
* Containers must not accidentally clip physically meaningful deformation.
* Never create an artificial flat cut where a physical surface should continue naturally.

---

## 7. Visual Restraint Law

* Do not add effects simply because they are technically possible.
* Do not clutter interfaces with repetitive decorative geometry.
* Do not overuse gradients, glows, particles, or decorative SVGs.
* Typography and spacing should carry the composition.
* Every highlight, reflection, shadow, deformation, and animation must serve a purpose.

---

## 8. Quality Standard

Every Atronix experience should pursue:

**Optical realism**
**Physical plausibility**
**Mathematical coherence**
**Premium interaction design**
**Restrained visual composition**

> **Atronix should look designed by physics, not decorated by CSS.**
