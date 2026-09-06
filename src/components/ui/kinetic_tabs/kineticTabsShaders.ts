/**
 * Apple Liquid Glass Optical Navbar — WebGL GLSL Shaders
 * Strict Physical Optics & Analytical Surface Mathematics:
 * - Analytical 2D Rounded Box SDFs (Lens Puck & Dock Capsule)
 * - Dock-Constrained Contact Occlusion (Zero smudges in surrounding air)
 * - Continuous Meniscus Gradient Field & Analytical Normal Derivatives
 * - Positive Snell's Law Refraction Ray Bending
 * - 6-Band Spectral Chromatic Dispersion (700nm to 405nm)
 * - Vibrant Electric Cyan / Magenta Dispersion Rim Flares
 * - Calibrated Fresnel Grazing Reflectance & Specular Sheen
 */

export const navbarVsSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const navbarFsSource = `
  precision highp float;

  varying vec2 v_uv;

  uniform sampler2D u_background;
  uniform vec2 u_resolution;

  // Lens Geometry & Dynamics
  uniform vec2 u_lensPos;         // Center of the liquid glass puck in screen pixels
  uniform vec2 u_lensHalfSize;    // Half width & half height (including height overhang!)
  uniform float u_lensRadius;     // Corner radius of the puck
  uniform float u_time;
  uniform float u_velocity;       // Liquid velocity for dynamic squash/stretch
  uniform float u_press;          // 0.0 to 1.0 (touch depression)
  uniform float u_wobble;         // Viscoelastic jelly wobble amplitude
  uniform float u_cornerMorph;    // -1.0 (left cap) to +1.0 (right cap)
  uniform float u_negRefract;     // 0.0 on standby, up to 1.0 while sliding

  // Dock Capsule Geometry
  uniform vec2 u_dockCenter;
  uniform vec2 u_dockHalfSize;
  uniform float u_dockRadius;

  // Calibrated Physical Optical Constants
  uniform float u_ior;            // Index of Refraction (~1.520 Crown Glass)
  uniform float u_dispersion;     // Abbe Chromatic Dispersion (~0.056)
  uniform float u_lensHeight;     // Volumetric thickness of the convex droplet

  // Analytical 2D Signed Distance Field for Rounded Pill Box
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // 6-Band Normalized Spectral Weights for Visible Light (700nm Red to 405nm Violet)
  vec3 getSpectralWeight(int i) {
    if (i == 0) return vec3(0.40, 0.00, 0.00); // Deep Red (~700nm)
    if (i == 1) return vec3(0.35, 0.26, 0.00); // Amber / Warm Orange (~590nm)
    if (i == 2) return vec3(0.00, 0.40, 0.04); // True Green (~535nm)
    if (i == 3) return vec3(0.00, 0.26, 0.30); // Cyan (~490nm)
    if (i == 4) return vec3(0.04, 0.08, 0.40); // Pure Royal Blue (~445nm)
    return vec3(0.21, 0.00, 0.26);              // Deep Violet (~405nm)
  }

  void main() {
    vec2 pixelCoord = v_uv * u_resolution;
    vec2 p = pixelCoord - u_lensPos;

    float dpr = max(1.0, u_dockHalfSize.y / 29.0);
    vec2 pCSS = p / dpr;

    // Distance to Liquid Glass Lens Perimeter
    float d = sdRoundedBox(p, u_lensHalfSize, u_lensRadius);

    // Distance to Dock Capsule Perimeter
    float dDock = sdRoundedBox(pixelCoord - u_dockCenter, u_dockHalfSize, u_dockRadius);

    // --- OUTSIDE THE LIQUID GLASS PUCK ---
    if (d > 0.0) {
      vec3 bg = texture2D(u_background, v_uv).rgb;
      gl_FragColor = vec4(bg, 1.0);
      return;
    }

    // --- INSIDE THE LIQUID GLASS PUCK ---
    float distInside = -d;
    float distInsideCSS = distInside / dpr;

    // Analytical Meniscus Profile & Continuous Normal Field
    float bevelWidthCSS = 15.0 * (1.0 - u_press * 0.15) + (u_wobble * 2.2);
    float bevelWidth = bevelWidthCSS * dpr;

    float surfaceHeight = u_lensHeight * (1.0 - u_press * 0.20) * (1.0 + u_wobble * 0.10);
    vec3 normal = vec3(0.0, 0.0, 1.0);
    vec2 grad = vec2(0.0);
    vec2 eps = vec2(1.0, 0.0);
    float slope = 0.0;
    float smoothT = 1.0;

    if (distInside < bevelWidth) {
      float t = clamp(distInside / bevelWidth, 0.0, 1.0);
      smoothT = smoothstep(0.0, 1.0, t);

      float curve = sqrt(max(0.0, 1.0 - (1.0 - smoothT) * (1.0 - smoothT)));
      surfaceHeight = curve * (u_lensHeight * (1.0 - u_press * 0.20));

      float dX = sdRoundedBox(p + eps.xy, u_lensHalfSize, u_lensRadius) - sdRoundedBox(p - eps.xy, u_lensHalfSize, u_lensRadius);
      float dY = sdRoundedBox(p + eps.yx, u_lensHalfSize, u_lensRadius) - sdRoundedBox(p - eps.yx, u_lensHalfSize, u_lensRadius);
      grad = normalize(vec2(dX, dY) + 1e-5);

      float safeT = min(smoothT, 0.985);
      slope = (1.0 - safeT) / sqrt(max(0.001, 1.0 - (1.0 - safeT) * (1.0 - safeT)));
      slope = slope * (surfaceHeight / bevelWidth) * (1.0 - smoothT);
      slope = min(slope, 5.5);

      float borderFeather = smoothstep(0.0, 0.45 * dpr, distInside);
      slope *= borderFeather;

      normal = normalize(vec3(-grad * slope, 1.0));
    }

    // Motion activity state
    float moveActivity = clamp(abs(u_velocity) / 80.0 + u_negRefract * 1.5, 0.0, 1.0);

    // Positive Snell's Law Refraction with Dynamic Chromatic Dispersion
    vec3 incident = vec3(0.0, 0.0, -1.0);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float baseDepth = surfaceHeight + (28.0 + u_press * 4.0) * dpr;

    vec2 pUV = p / u_resolution;
    vec2 negRefractOffset = vec2(
      pUV.x * 0.18,
      pUV.y * 0.38
    ) * u_negRefract;

    float borderMeniscus = 1.0 - smoothT;
    float dynamicDispersion = u_dispersion * moveActivity * (1.5 + 3.2 * borderMeniscus);

    vec3 totalRefracted = vec3(0.0);

    for (int i = 0; i < 6; i++) {
      float fi = (float(i) - 2.5) / 2.5;
      float lambdaIOR = u_ior + fi * dynamicDispersion;

      vec3 refr = refract(incident, normal, 1.0 / lambdaIOR);
      vec2 offset = vec2(0.0);
      if (length(refr.xy) > 1e-4) {
        offset = (refr.xy / abs(refr.z + 1e-4)) * (baseDepth / u_resolution);
      } else {
        vec3 refl = reflect(incident, normal);
        offset = -(refl.xy / abs(refl.z + 1e-4)) * (baseDepth / u_resolution);
      }

      vec2 sampleUV = v_uv - offset + negRefractOffset;
      vec3 sampleCol = texture2D(u_background, sampleUV).rgb;
      vec3 weight = getSpectralWeight(i);
      totalRefracted += sampleCol * weight;
    }

    // Subtle Physical Inner Depth Shadow
    float innerShadow = (1.0 - smoothT) * smoothstep(-0.4, 0.9, -grad.y) * 0.06;
    totalRefracted *= (1.0 - innerShadow);

    // Ultra-Thin Physical Reflective White Light Line
    float lineSigma = 0.26;
    float lineDist = (distInsideCSS - 0.55) / lineSigma;
    float thinLineProfile = exp(-lineDist * lineDist);

    float outerFeather = smoothstep(0.0, 0.35, distInsideCSS);
    float reflectiveLineProfile = thinLineProfile * outerFeather;

    vec3 geomNormal = normalize(vec3(grad * slope, 1.0));
    vec3 keyLight = normalize(vec3(0.0, 0.90, 0.42));
    vec3 halfV = normalize(keyLight + vec3(0.0, 0.0, 1.0));
    float specularGlint = pow(max(0.0, dot(geomNormal, halfV)), 26.0);

    float cosView = clamp(geomNormal.z, 0.0, 1.0);
    float edgeFresnel = pow(1.0 - cosView, 3.0);

    float isOuterCorner = (u_cornerMorph > 0.25 && grad.x > 0.25) || (u_cornerMorph < -0.25 && grad.x < -0.25) ? 1.0 : 0.0;
    float topLight = smoothstep(-0.20, 0.65, grad.y);
    float reflectiveBrightness = topLight * 0.75 + specularGlint * 0.50 + isOuterCorner * 0.35 + edgeFresnel * 0.12;
    reflectiveBrightness = clamp(reflectiveBrightness, 0.15, 1.0);

    float lineReflectance = clamp(reflectiveLineProfile * reflectiveBrightness * 0.85, 0.0, 0.92);
    vec3 finalGlass = mix(totalRefracted, vec3(1.0), lineReflectance);
    finalGlass += vec3(0.12) * (reflectiveLineProfile * specularGlint);

    gl_FragColor = vec4(finalGlass, 1.0);
  }
`;
