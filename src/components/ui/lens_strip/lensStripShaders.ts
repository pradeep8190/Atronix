/**
 * Apple Liquid Glass Camera Mode Roll-Up — WebGL GLSL Shaders
 * Strict Physical Optics & Analytical Surface Mathematics:
 * - Analytical 2D Rounded Box Signed Distance Fields (SDF)
 * - Stationary Central Optical Lens with Convex Focal Magnification
 * - Top & Bottom Specular White Rim Lines (Directional Key-Light + Grazing Fresnel)
 * - Positive Snell's Law Ray Bending (IOR = 1.520 Crown Glass)
 * - 6-Band Spectral Chromatic Dispersion (700nm Red to 405nm Violet)
 * - Continuous Meniscus Bevel Gradient Field & Analytical Normal Derivatives
 */

export const cameraRollVsSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const cameraRollFsSource = `
  precision highp float;

  varying vec2 v_uv;

  uniform sampler2D u_background;
  uniform vec2 u_resolution;

  // Stationary Center Lens Geometry
  uniform vec2 u_lensPos;         // Center of the lens in device coordinates
  uniform vec2 u_lensHalfSize;    // Half-dimensions (width, height)
  uniform float u_lensRadius;     // Corner radius
  uniform float u_time;
  uniform float u_velocity;       // Carousel rolling velocity for dynamic dispersion flare
  uniform float u_press;          // 0.0 to 1.0 (tactile touch compression)

  // Calibrated Physical Optical Constants
  uniform float u_ior;            // 1.520 Crown Glass
  uniform float u_dispersion;     // Abbe Chromatic Dispersion
  uniform float u_lensHeight;     // Volumetric convex height

  // Analytical 2D Signed Distance Field for Rounded Box
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // 6-Band Normalized Spectral Weights for Visible Light (700nm to 405nm)
  vec3 getSpectralWeight(int i) {
    if (i == 0) return vec3(0.40, 0.00, 0.00); // Deep Red (~700nm)
    if (i == 1) return vec3(0.35, 0.26, 0.00); // Warm Amber (~590nm)
    if (i == 2) return vec3(0.00, 0.40, 0.04); // Pure Green (~535nm)
    if (i == 3) return vec3(0.00, 0.26, 0.30); // Cyan (~490nm)
    if (i == 4) return vec3(0.04, 0.08, 0.40); // Royal Blue (~445nm)
    return vec3(0.21, 0.00, 0.26);              // Violet (~405nm)
  }

  void main() {
    vec2 pixelCoord = v_uv * u_resolution;
    vec2 p = pixelCoord - u_lensPos;

    float dpr = max(1.0, u_lensHalfSize.y / 28.0);
    vec2 pCSS = p / dpr;

    // Signed Distance to Center Glass Lens
    float d = sdRoundedBox(p, u_lensHalfSize, u_lensRadius);

    // Outside the central glass lens: Render background substrate directly
    if (d > 0.0) {
      vec3 bg = texture2D(u_background, v_uv).rgb;
      gl_FragColor = vec4(bg, 1.0);
      return;
    }

    // Inside the central glass lens
    float distInside = -d;
    float distInsideCSS = distInside / dpr;

    // 1. Analytical Smooth Meniscus Bevel (C2-continuous derivative, zero slope spikes, zero noise)
    float bevelWidthCSS = 8.0 * (1.0 - u_press * 0.15);
    float bevelWidth = bevelWidthCSS * dpr;

    float surfaceHeight = u_lensHeight * (1.0 - u_press * 0.20);
    vec3 normal = vec3(0.0, 0.0, 1.0);
    vec2 grad = vec2(0.0);
    vec2 eps = vec2(1.0, 0.0);
    float smoothT = 1.0;

    if (distInside < bevelWidth) {
      float t = clamp(distInside / bevelWidth, 0.0, 1.0);
      smoothT = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);

      // Continuous SDF gradient for exact surface normal direction
      float dX = sdRoundedBox(p + eps.xy, u_lensHalfSize, u_lensRadius) - sdRoundedBox(p - eps.xy, u_lensHalfSize, u_lensRadius);
      float dY = sdRoundedBox(p + eps.yx, u_lensHalfSize, u_lensRadius) - sdRoundedBox(p - eps.yx, u_lensHalfSize, u_lensRadius);
      grad = normalize(vec2(dX, dY) + 1e-5);

      float slopeProfile = 30.0 * (t * t) * ((1.0 - t) * (1.0 - t));
      float slope = slopeProfile * (surfaceHeight / bevelWidth) * 0.35;

      normal = normalize(vec3(-grad * slope, 1.0));
    }

    // Dynamic motion activity from rolling strip velocity
    float rollActivity = clamp(abs(u_velocity) / 60.0, 0.0, 1.0);

    // 2. Snell's Law Ray Tracing + Subtle Center Magnification
    vec3 incident = vec3(0.0, 0.0, -1.0);
    float baseDepth = surfaceHeight + 16.0 * dpr;

    vec2 pUV = p / u_resolution;
    vec2 magnificationOffset = pUV * 0.035;

    float dynamicDispersion = u_dispersion * (0.15 + rollActivity * 0.85);
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

      vec2 sampleUV = v_uv - offset - magnificationOffset;
      vec3 sampleCol = texture2D(u_background, sampleUV).rgb;
      vec3 weight = getSpectralWeight(i);
      totalRefracted += sampleCol * weight;
    }

    // Subtle dark obsidian glass body tint
    float bodyTint = mix(0.06, -0.04, clamp((p.y / u_lensHalfSize.y) * 0.5 + 0.5, 0.0, 1.0));
    totalRefracted *= (1.0 + bodyTint);

    // 3. Diagonal Axis Specular Arcs (Top-Left Key Light & Bottom-Right Counter Glint)
    // Non-uniform diagonal highlights with progressive thinning & opacity reduction towards centers.
    // Dynamically tracks adaptive lens width & jelly stretch deformation.
    float halfWCSS = u_lensHalfSize.x / dpr;
    float halfHCSS = u_lensHalfSize.y / dpr;
    float flatSegmentX = max(0.0, halfWCSS - halfHCSS);

    // --- Top-Left Diagonal Key Arc ---
    float tlTopProg = smoothstep(flatSegmentX * 0.15, -(flatSegmentX + 4.0), pCSS.x);
    float tlLeftProg = smoothstep(-2.0, halfHCSS * 0.8, pCSS.y);
    float tlEnvelope = tlTopProg * tlLeftProg;

    vec2 tlKeyDir = normalize(vec2(-0.85, 0.85));
    float tlNormalDot = dot(grad, tlKeyDir);
    float tlNormalFactor = smoothstep(0.10, 0.85, tlNormalDot);
    float tlFactor = tlEnvelope * tlNormalFactor;

    float tlSigma = mix(0.14, 0.36, tlFactor);
    float tlDist = (distInsideCSS - 0.55) / tlSigma;
    float tlHairline = exp(-tlDist * tlDist);
    float tlOpacity = mix(0.10, 0.76, tlFactor) * tlEnvelope;
    float tlReflection = tlHairline * tlOpacity;

    // --- Bottom-Right Diagonal Counter Arc ---
    float brBottomProg = smoothstep(-flatSegmentX * 0.15, flatSegmentX + 4.0, pCSS.x);
    float brRightProg = smoothstep(2.0, -halfHCSS * 0.8, pCSS.y);
    float brEnvelope = brBottomProg * brRightProg;

    vec2 brKeyDir = normalize(vec2(0.85, -0.85));
    float brNormalDot = dot(grad, brKeyDir);
    float brNormalFactor = smoothstep(0.10, 0.85, brNormalDot);
    float brFactor = brEnvelope * brNormalFactor;

    float brSigma = mix(0.14, 0.34, brFactor);
    float brDist = (distInsideCSS - 0.55) / brSigma;
    float brHairline = exp(-brDist * brDist);
    float brOpacity = mix(0.08, 0.58, brFactor) * brEnvelope;
    float brReflection = brHairline * brOpacity;

    float reflectionLine = tlReflection + brReflection;

    // Subtle directional grazing sheen: localized to illuminated diagonal quadrants
    float cosTheta = clamp(normal.z, 0.0, 1.0);
    float grazing = 1.0 - cosTheta;
    float fresnelEnvelope = tlEnvelope + brEnvelope * 0.75;
    float fresnel = pow(grazing, 3.5) * (1.0 - smoothT) * 0.12 * fresnelEnvelope;

    // Refined greyish liquid titanium glass tone (sovereign smoky silver, zero harsh white)
    vec3 highlightColor = vec3(0.66, 0.69, 0.73);
    vec3 reflectedLight = highlightColor * (reflectionLine + fresnel);
    vec3 glassColor = totalRefracted + reflectedLight;

    // Subpixel boundary anti-aliasing
    float edgeAA = smoothstep(0.0, 1.2 * dpr, distInside);
    vec3 bg = texture2D(u_background, v_uv).rgb;
    vec3 finalColor = mix(bg, glassColor, edgeAA);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
