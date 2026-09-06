/**
 * Atmosphere Card — WebGL GLSL Optical Shaders
 * Dark Obsidian Monochromatic Liquid Glass with Silky Molten Wave Refraction:
 * - Analytical Signed Distance Field for Rounded Card Geometry
 * - 2D Volumetric Convex Lens Dome + Perimeter Meniscus Field
 * - Snell's Law Ray Bending with 6-Band Chromatic Dispersion
 * - Directional GGX / Blinn-Phong Specular Highlights & Calibrated Fresnel Rim
 * - Seamless Physically-Grounded Contact Shadow on Dark Studio Plane
 */

export const atmosphereVsSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const atmosphereFsSource = `
  precision highp float;

  varying vec2 v_uv;

  uniform sampler2D u_background;
  uniform vec2 u_resolution;
  uniform vec2 u_cardCenter;       // Card center in WebGL pixel coordinates
  uniform vec2 u_cardHalfSize;     // Half dimensions (width/2, height/2) in device pixels
  uniform float u_cardRadius;      // Corner radius in device pixels
  uniform float u_time;            // Elapsed time for fluid wave animation
  // Physical Optical Parameters
  uniform float u_ior;              // Index of Refraction (~1.54)
  uniform float u_dispersion;       // Chromatic Dispersion (~0.048)
  uniform float u_lensHeight;       // Volumetric dome height in pixels

  // 6-Band Normalized Spectral Weights for Visible Light (700nm to 405nm)
  vec3 getSpectralWeight(int i) {
    if (i == 0) return vec3(0.40, 0.00, 0.00); // Deep Red
    if (i == 1) return vec3(0.35, 0.26, 0.00); // Amber/Yellow
    if (i == 2) return vec3(0.00, 0.40, 0.04); // Green
    if (i == 3) return vec3(0.00, 0.26, 0.28); // Cyan
    if (i == 4) return vec3(0.04, 0.08, 0.40); // Blue
    return vec3(0.21, 0.00, 0.28);              // Violet
  }

  // Analytical 2D Signed Distance Field for Rounded Box
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // Directional Studio Contact Shadow (Strictly Outside Glass Boundary)
  vec3 sampleStageShadow(vec2 uv, vec2 p, vec2 boxHalf, float radius, float scale) {
    vec3 bg = texture2D(u_background, uv).rgb;

    vec2 shadowOffset = vec2(1.0, -4.5) * scale;
    vec2 shadowP = (p - shadowOffset);
    float dShadow = sdRoundedBox(shadowP, boxHalf, radius);
    float shadowDist = max(0.0, dShadow) / scale;

    vec2 shadowDir = normalize(vec2(0.25, -0.97));
    vec2 dirFromCenter = length(p) > 1e-4 ? normalize(p) : vec2(0.0, -1.0);
    float dirWeight = smoothstep(-0.35, 0.60, dot(dirFromCenter, shadowDir));

    // Two-tier physically grounded contact shadow & penumbra
    float contactAO = exp(-shadowDist / 6.0) * 0.12;
    float penumbra = exp(-shadowDist / 22.0) * 0.08;
    float totalShadow = (contactAO + penumbra) * dirWeight;

    return bg * (1.0 - totalShadow);
  }

  void main() {
    vec2 pixelCoord = v_uv * u_resolution;
    vec2 p = pixelCoord - u_cardCenter;

    float scale = u_cardRadius / 30.0;

    // 1. Distance to Glass Card Perimeter
    float d = sdRoundedBox(p, u_cardHalfSize, u_cardRadius);

    // Outside the Glass Card: Dark Studio Stage with physically grounded shadow
    vec3 outsideColor = sampleStageShadow(v_uv, p, u_cardHalfSize, u_cardRadius, scale);

    if (d > 1.5) {
      gl_FragColor = vec4(outsideColor, 1.0);
      return;
    }

    // 2. Surface Normal from Exact Analytical SDF Gradient
    float eps = 1.0 * scale;
    float dx = sdRoundedBox(p + vec2(eps, 0.0), u_cardHalfSize, u_cardRadius) - sdRoundedBox(p - vec2(eps, 0.0), u_cardHalfSize, u_cardRadius);
    float dy = sdRoundedBox(p + vec2(0.0, eps), u_cardHalfSize, u_cardRadius) - sdRoundedBox(p - vec2(0.0, eps), u_cardHalfSize, u_cardRadius);
    vec2 grad = normalize(vec2(dx, dy) + 1e-4);

    float distInside = max(0.0, -d);

    // 2D Normalized Coordinates from Card Center for full volumetric optical lens
    vec2 normP = p / u_cardHalfSize;
    float rho = length(normP);
    vec2 radialDir = rho > 1e-4 ? normP / rho : vec2(0.0);

    float bevelWidth = 16.0 * scale;
    float edgeFactor = smoothstep(0.0, bevelWidth, distInside);
    float rimSmooth = smoothstep(0.0, 1.5 * scale, distInside);

    // Continuous 2D Volumetric Convex Lens across 100% of the surface
    float domeSlope = pow(min(rho, 1.25), 1.3) * 2.0;
    float meniscusSlope = (1.0 - edgeFactor) * 2.4;

    vec2 totalNormalXY = (-radialDir * domeSlope - grad * meniscusSlope) * rimSmooth;
    vec3 normal = normalize(vec3(totalNormalXY, 1.0));

    // Volumetric 3D Optical Depth
    float domeProfile = sqrt(max(0.0, 1.0 - min(rho * 0.82, 0.95) * min(rho * 0.82, 0.95)));
    float surfaceHeight = domeProfile * u_lensHeight;
    float depth = surfaceHeight + 32.0 * scale;

    // 3. Positive Snell's Law Refraction + 6-Band Chromatic Dispersion
    vec3 incident = vec3(0.0, 0.0, -1.0);
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 totalRefracted = vec3(0.0);

    for (int i = 0; i < 6; i++) {
      float fi = (float(i) - 2.5) / 2.5;
      float lambdaIOR = u_ior + fi * u_dispersion;

      vec3 refr = refract(incident, normal, 1.0 / lambdaIOR);
      vec2 offset = (refr.xy / abs(refr.z)) * (depth / u_resolution);

      vec2 refrUV = v_uv - offset;
      vec3 sampleCol = texture2D(u_background, refrUV).rgb;
      vec3 weight = getSpectralWeight(i);
      totalRefracted += sampleCol * weight;
    }

    // 4. Deep Obsidian Substrate Shading & Ambient Depth
    float edgeDarkening = smoothstep(0.0, 3.0 * scale, distInside);
    totalRefracted *= mix(0.92, 1.0, edgeDarkening);

    // 5. Studio Keylight Vector
    vec3 keyLight = normalize(vec3(-0.45, 0.70, 0.55));
    vec3 halfKey = normalize(keyLight + viewDir);

    // 6. Perimeter Edge Specular Sheen (Top-Right and Top Edge Highlight)
    vec2 trAxis = normalize(vec2(0.707, 0.707));
    float trDot = dot(grad, trAxis);
    float tTR = clamp((trDot - 0.65) / 0.32, 0.0, 1.0);
    float taperTR = smoothstep(0.0, 1.0, tTR) * sqrt(tTR);
    float widthTR = mix(0.10, 0.45, taperTR) * scale;
    float specTR = (exp(-distInside / widthTR) + exp(-distInside / (widthTR * 1.6)) * 0.20) * taperTR * 0.35;

    // Top Crest Sheen (Continuous horizontal highlight along the top rail)
    float topCrest = smoothstep(0.75, 1.0, grad.y);
    float topWidth = 0.38 * scale;
    float specTop = exp(-distInside / topWidth) * topCrest * 0.28;

    vec3 edgeSpecular = vec3(0.95, 0.97, 1.0) * (specTR + specTop);

    // 7. Symmetrical Top-Left Corner Optical Rim Definition
    vec2 tlAxis = normalize(vec2(-0.707, 0.707));
    float tlDot = dot(grad, tlAxis);
    float tTL = clamp((tlDot - 0.72) / 0.26, 0.0, 1.0);
    float taperTL = smoothstep(0.0, 1.0, tTL) * sqrt(tTL);
    float widthTL = mix(0.08, 0.36, taperTL) * scale;
    float darkArc = (exp(-distInside / widthTL) + exp(-distInside / (widthTL * 1.5)) * 0.18) * taperTL;
    vec3 darkEdgeCol = vec3(0.04, 0.05, 0.07);

    // 8. Fresnel Edge Luminance
    float cosTheta = clamp(normal.z, 0.0, 1.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 4.0);
    float rimGlow = exp(-distInside / (0.65 * scale)) * fresnel * 0.10;
    vec3 fresnelGlow = vec3(0.92, 0.95, 1.0) * rimGlow;

    // Base Obsidian Glass Body Composition
    vec3 glassColor = totalRefracted + edgeSpecular + fresnelGlow;
    glassColor = mix(glassColor, darkEdgeCol, darkArc * 0.95);

    // Subpixel Anti-Aliased Glass Card Boundary Transition
    float edgeCoverage = smoothstep(0.65, -0.65, d);
    vec3 finalPixelColor = mix(outsideColor, glassColor, edgeCoverage);

    gl_FragColor = vec4(finalPixelColor, 1.0);
  }
`;

export const climateVsSource = atmosphereVsSource;
export const climateFsSource = atmosphereFsSource;
