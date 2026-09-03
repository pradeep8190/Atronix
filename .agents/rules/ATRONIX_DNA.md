# ATRONIX ARCHITECTURAL MEMORY & GOD-MODE LAWS
> **Project**: Atronix — Sovereign Liquid Glass & Mathematical Fluid UI Library  
> **Standard**: 100,000 / 10 (Apple VisionOS / Linear / DeepMind Physical Realism)  
> **Status**: Living Goldmine Document for AI & Engineering Alignment

---

## 1. The Core Philosophy & Aesthetic Identity

1. **Anti-Mediocrity (Zero Cheap Neon Gradients)**:
   - Never use generic 2018 Tailwind buttons, flat rounded rectangles, or cheap neon-purple saturated gradients.
   - Atronix is built on **pure optical luxury**: deep obsidian frosted dark glass, genuine liquid metal chrome, and real-world physical fluid dynamics.
2. **The Optical Glass Model**:
   - **Body Alpha**: Low, whisper-soft base transparency (`~0.045 - 0.065`).
   - **Top Specular Sheen**: Exponential linear or spherical gloss (`pow(1.0 - heightNorm, 1.35) * 0.28`).
   - **Surface Tension Bevels**: Finite-difference surface normal gradients producing crisp 1px top and side edge highlights.
   - **Directional 3D Specular Glints**: Every bead or droplet carries a tight, high-power specular reflection, making it look genuinely liquid and molten rather than a faint, washed-out transparent circle.
3. **Curated Luxury Themes**:
   - 🖤 **`black`** (Default): Obsidian Dark Glass + Molten Liquid Chrome / Pure Clear Water.
   - 🍯 **`amber`**: Desert Titanium / Liquid 24k Champagne Gold.
   - 💎 **`blue`**: Cryo Sapphire / OpenAI "Spruce" Azure Blue.
   - 🔮 **`purple`**: Cosmic Amethyst / Ethereal Violet Plasma.
   - 🟢 **`emerald`**: Oceanic Jade / Bioluminescent Liquid Emerald.

---

## 2. Hard Behavioral Rules & Workflow Constraints

- 🚫 **TERMINAL CONSTRAINT (CRITICAL)**:
  - **NEVER** run `npm run build`, `npm run dev`, or any `git` commands unless explicitly requested by the Director/User.
- 💬 **Direct Conversational Chat**:
  - Always communicate directly in chat with high energy, warmth, and camaraderie.
  - Do NOT generate unsolicited planning blocks, formal approval gates, or corporate fluff when the user wants fast, decisive execution.
- 🧼 **Anti-Clutter & Typography First**:
  - Do not spam wireframe cubes, suns, or repetitive SVGs everywhere.
  - Prioritize clean, confident, minimal typography with generous breathing room and negative space.
- 📐 **Zero Flat Cuts (The Canvas Bleed Rule)**:
  - WebGL fragment shaders discard or fail to render outside the viewport boundary `[0, width]`. If an SDF droplet or surface bulge reaches an edge, the browser canvas physically slices it vertically flat.
  - **Rule**: ALWAYS give WebGL canvases an abundant padding/bleed buffer (minimum 20px to 35px on all sides) with CSS negative offsets (e.g. `width: calc(100% + 60px); left: -30px;`) and ensure parent sandbox containers have `overflow: visible`.

---

## 3. The Analogy Engine & Real-World Physics Laws

Abstract instructions (*"make it smooth"*) produce mediocre results. **Real-world physical analogies produce mathematical magic.**

### A. Incompressible Fluid Volume Conservation (The Water Bag Law)
- *Analogy*: A pill-shaped water bag lying on the ground. A stone drops on it at coordinate $(X_0, Y_0)$.
- *Math*:
  - Water in a sealed membrane is incompressible ($\nabla \cdot \vec{u} = 0$).
  - When $(X_0, Y_0)$ dents inward as a concave impact crater, the displaced fluid **MUST physically surge outward against the opposite perimeter borders**, bulging them outwards under internal hydrostatic pressure ($\Delta P$).
  - Surface tension waves ripple radially outward from the impact point and reflect off the membrane boundaries.

### B. Leading-Edge Liquid Stretch Kinematics (The Viscous Pseudopod Law)
- *Analogy*: A cohesive liquid jelly drop where the leading edge reaches forward across the gap while the waist thins down into an ultra-soft liquid bridge.
- *Math*:
  - The pill never translates as a rigid geometric box or a fake sheet.
  - **Phase 1 (Leading Edge Reaches Forward)**: When switching tabs, the leading vertical edge (right edge when going right, left edge when going left) stretches forward first toward the destination tab while the trailing edge remains anchored.
  - **Phase 2 (Ultra-Thin Liquid Waist Pull)**: As the span elongates across the gap, Poisson volume conservation and concave parabolic curvature neck down the center waist into an ultra-thin, soft liquid bridge ($H_{\text{min}} = H_0 \cdot (1 - 0.72 \cdot \text{smoothstep}(0, 1.1, S))$).
  - **Phase 3 (Trailing Edge Catch-Up & Cushioning)**: Once the leading edge approaches the destination, the trailing edge smoothly accelerates forward, closing the span back to resting width ($2W_0$), thickening the waist back to full height ($H_0$), and settling with a silky cushion at 120 FPS.

### C. Atmospheric Cloud/Smoke over Rigid Shelves (The Horizon Law)
- *Analogy*: A celestial gas nebula or dry-ice smoke trapped in a crystal glass orb.
- *Math*:
  - Never use a 1D straight horizontal line or periodic sine wave `sin(x)` — real smoke has NO fixed shape or size.
  - Use multi-scale, domain-warped **Fractional Brownian Motion (FBM) & Curl Vortices** where smoke wisps billow, curl, and disperse organically.
  - **OpenAI Voice Mode Composition**: Upper 70% is a bright, solid, luminous white sky; lower 30% is a billowing, volumetric cloud bank.
  - **3D Circumference Coverage**: The cloud curves in 3D along the spherical dome ($z = \sqrt{1 - r^2}$), climbing and wrapping around the 360-degree glass circumference with true 3D Fresnel highlights.

### D. Weighted Viscous Damping over Bouncing (The Luxury Motion Law)
- High-frequency sinusoidal jumps or snappy springs feel cheap, nervous, and jittery.
- Always use smooth, continuous respiratory bell-curve envelopes (`smoothstep` / sinusoidal swells) paired with heavy viscous damping (`factor ~ 0.04 - 0.055`).
- The motion must feel like a **weighted, physical, majestic glide** that lifts with grandeur and settles with effortless serenity.

---

## 4. Complete Atronix Component Registry

| Component ID | Name | Core Technology & Physics Architecture |
| :--- | :--- | :--- |
| `frost-vault` | **Frost Vault** | 3D interactive expanding card vault with glass optics, spring physics, and colorways. |
| `liquid-mitosis` | **Liquid Mitosis** | WebGL Inigo Quilez C1 smooth metaball fusion with Rayleigh-Plateau capillary separation and glass caustics. |
| `cascade-select` | **Cascade Select** | Gravity-driven liquid glass dropdown melt with damped harmonic waist pinch, meniscus sag, and elastic rebound. |
| `mercury-slider` | **Mercury Slider** | Hydrodynamic liquid mercury bead with Poisson volume stretch ($\sigma_y = 1/\sqrt{\sigma_x}$), drag velocity, and elastic overdrag. |
| `phase-toggle` | **Phase Toggle** | Dual-chamber optical glass switch with capillary throat squirt kinematics and impact wave dispersion. |
| `hydro-button` | **Hydro Button** | Incompressible hydrostatic water bag button with localized stone-drop indentation craters and outer border pressure bulges. |
| `aero-core` | **Aero Core** | OpenAI Voice Mode-grade luminous white sky with 3D circumference-wrapping billowing volumetric cloud and Web Audio mic reactivity. |
| `ferro-drop` | **Ferro Drop** | Magnetic AI prompt bar with ferrofluid boundary pull toward dragged files, Venom-like harmonic assimilation shockwaves, and procedural Web Audio haptic latching. |
| `pendant-lamp` | **Pendant Lamp** | Industrial suspended pendant lamp with physical inverse-square cone beam lighting, specular dome fixture, and cast shadow floor physics. |
| `orbit-globe` | **Orbit Globe** | 3D interactive wireframe orbital globe with Natural Earth vector coastlines, great-circle flight arcs, glowing photons, and momentum drag physics. |
| `speed-rays` | **Speed Rays** | GPU-accelerated relativistic velocity field with tapered photon laser streaks, hardware compositor transforms, and optical vignette framing. |

---

## 5. File Structure Conventions

- Components live under: `src/components/ui/<component_name>/`
  - `<ComponentName>.tsx` (Component logic + WebGL render loop)
  - `<ComponentName>.css` (Component styling + theme modifiers)
  - `<ComponentName>Footer.tsx` (Props documentation + physics architecture note)
  - `<ComponentName>Footer.css` (Props table and callout styling)
- Registration:
  - `src/sidebar/Sidebar.tsx` $\to$ Add to `componentItems` list.
  - `src/data/componentsRegistry.ts` $\to$ Add full registry entry, metadata, raw code import, and footer component.
