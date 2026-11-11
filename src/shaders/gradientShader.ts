export const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER_SOURCE = `
precision highp float;

varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_duration;
uniform int u_template;          // 0 to 99 (100 distinct motion graphic templates)
uniform vec3 u_colors[10];
uniform int u_colorCount;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_scale;
uniform float u_angle;           // In degrees
uniform float u_grain;           // Dither / Film grain intensity
uniform int u_seamlessLoop;      // 1: true, 0: false

#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.2831853071795864769252867665590

// Simplex 3D noise functions
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j, N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// 2D Rotation matrix
vec2 rotate2D(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

// Get gradient color by index in u_colors array
vec3 getColorAt(int idx) {
  if (idx == 0) return u_colors[0];
  if (idx == 1) return u_colors[1];
  if (idx == 2) return u_colors[2];
  if (idx == 3) return u_colors[3];
  if (idx == 4) return u_colors[4];
  if (idx == 5) return u_colors[5];
  if (idx == 6) return u_colors[6];
  if (idx == 7) return u_colors[7];
  if (idx == 8) return u_colors[8];
  return u_colors[9];
}

// Smoothly map scalar val [0..1] to the multi-stop palette
vec3 samplePalette(float t) {
  t = clamp(t, 0.0, 0.9999);
  float nStops = float(u_colorCount - 1);
  float pos = t * nStops;
  int i = int(floor(pos));
  float f = fract(pos);

  // Smooth interpolation curve for creamy gradient
  f = smoothstep(0.0, 1.0, f);

  vec3 c0 = getColorAt(i);
  vec3 c1 = getColorAt(i + 1);

  return mix(c0, c1, f);
}

// Pseudo random for dithering
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  
  // Calculate looping phase or continuous phase
  float normTime = mod(u_time, u_duration) / u_duration;
  float tRad = normTime * TWO_PI;
  
  // Temporal coordinate vectors
  float timeOffsetA, timeOffsetB;
  if (u_seamlessLoop == 1) {
    // 2D circular projection guarantees exact 100% loop seam
    timeOffsetA = sin(tRad) * 0.5;
    timeOffsetB = cos(tRad) * 0.5;
  } else {
    timeOffsetA = u_time * u_speed * 0.15;
    timeOffsetB = u_time * u_speed * 0.12;
  }

  // Rotate coordinates based on user angle
  float rad = u_angle * (PI / 180.0);
  vec2 p = rotate2D(st, rad) * u_scale;
  float turb = u_turbulence;

  // Determine Archetype (0 - 9) and Variant (0 - 9)
  int archetype = u_template / 10;
  float variant = float(u_template - archetype * 10);

  float colorVal = 0.0;

  if (archetype == 0) {
    // ==============================================================
    // ARCHETYPE 0: SILK & SATIN WAVES (Templates 01 - 10)
    // ==============================================================
    float freq = 2.4 + variant * 0.35;
    vec3 coord1 = vec3(p * (1.1 + variant * 0.08), timeOffsetA * (1.0 + variant * 0.1));
    float n1 = snoise(coord1);
    float n2 = snoise(coord1 + vec3(5.2, 1.3, timeOffsetB));

    vec2 q = p + vec2(n1, n2) * (turb * (0.35 + variant * 0.03));

    vec3 coord2 = vec3(q * 1.8, timeOffsetB * 1.2);
    float n3 = snoise(coord2);
    float n4 = snoise(coord2 + vec3(1.7, 9.2, timeOffsetA * 1.1));

    vec2 r = q + vec2(n3, n4) * (turb * 0.3);

    float wave1 = sin(r.y * freq + r.x * (1.2 + variant * 0.15) + n1 * 2.2);
    float wave2 = cos(r.x * (freq * 0.8) - r.y * 1.1 + n3 * 1.8);

    colorVal = 0.5 + 0.5 * (0.6 * wave1 + 0.4 * wave2);
    colorVal += 0.12 * snoise(vec3(r * 3.2, timeOffsetA * 1.8));

  } else if (archetype == 1) {
    // ==============================================================
    // ARCHETYPE 1: ORGANIC LIQUID BLOBS & LAVA (Templates 11 - 20)
    // ==============================================================
    float k = 1.0 + mod(variant, 3.0);
    vec2 b1 = vec2(sin(tRad * 1.0) * (0.42 + variant * 0.02), cos(tRad * 1.0) * 0.35);
    vec2 b2 = vec2(cos(tRad * k + 1.4) * 0.48, sin(tRad * 1.0) * 0.4);
    vec2 b3 = vec2(sin(tRad * 2.0 + 3.1) * 0.36, cos(tRad * 1.0 + 2.2) * 0.44);
    vec2 b4 = vec2(cos(tRad * 1.0 + 4.3) * 0.42, sin(tRad * k + 5.1) * 0.32);

    if (u_seamlessLoop == 0) {
      float t = u_time * u_speed;
      b1 = vec2(sin(t * 0.7) * 0.45, cos(t * 0.5) * 0.35);
      b2 = vec2(cos(t * 0.6 + 1.5) * 0.5, sin(t * 0.8) * 0.4);
      b3 = vec2(sin(t * 0.9 + 3.1) * 0.35, cos(t * 0.4 + 2.0) * 0.45);
      b4 = vec2(cos(t * 0.5 + 4.2) * 0.4, sin(t * 0.7 + 5.0) * 0.3);
    }

    vec3 warpCoord = vec3(p * (1.4 + variant * 0.08), timeOffsetA);
    vec2 warp = vec2(snoise(warpCoord), snoise(warpCoord + vec3(7.4, 3.1, timeOffsetB))) * (turb * 0.35);
    vec2 pos = p + warp;

    float d1 = 1.0 / (length(pos - b1) * (2.8 + variant * 0.15) + 0.35);
    float d2 = 1.0 / (length(pos - b2) * 2.7 + 0.35);
    float d3 = 1.0 / (length(pos - b3) * 2.9 + 0.35);
    float d4 = 1.0 / (length(pos - b4) * 2.4 + 0.35);

    float blobSum = (d1 * 0.8 + d2 * 1.1 + d3 * 0.9 + d4 * 1.0);
    colorVal = fract(blobSum * (0.32 + variant * 0.02) + snoise(vec3(pos * 0.8, timeOffsetB)) * 0.2);
    colorVal = abs(colorVal * 2.0 - 1.0);

  } else if (archetype == 2) {
    // ==============================================================
    // ARCHETYPE 2: VORTEX & COSMIC SPIRALS (Templates 21 - 30)
    // ==============================================================
    float r = length(p);
    float theta = atan(p.y, p.x);

    float twistStrength = turb * (1.5 + variant * 0.3);
    float swirl = theta + twistStrength / (pow(r, 0.6) + 0.25) + timeOffsetA * (1.5 + variant * 0.1);
    float arms = 2.0 + mod(variant, 4.0);

    float spiral = sin(arms * swirl + log(r + 0.12) * (3.0 + variant * 0.4) + timeOffsetB * 2.0);
    float noiseMod = snoise(vec3(p * 2.0, timeOffsetB)) * 0.35;

    colorVal = 0.5 + 0.5 * spiral + noiseMod;

  } else if (archetype == 3) {
    // ==============================================================
    // ARCHETYPE 3: AURORA & SPECTRAL RIBBONS (Templates 31 - 40)
    // ==============================================================
    float yCurve = p.y * (1.6 + variant * 0.15);
    float fold = snoise(vec3(p.x * 0.8, yCurve, timeOffsetA * 1.2)) * (turb * 0.5);
    vec2 aurCoord = vec2(p.x + fold, p.y);

    float ribbon1 = sin(aurCoord.x * (4.2 + variant * 0.5) + aurCoord.y * 2.0 + timeOffsetB * 2.2);
    float ribbon2 = cos(aurCoord.x * 3.1 - aurCoord.y * 1.8 + timeOffsetA * 1.8);

    float curtain = exp(-abs(aurCoord.x) * (0.8 + variant * 0.15));
    colorVal = 0.5 + 0.5 * (ribbon1 * 0.6 + ribbon2 * 0.4) * (0.6 + 0.4 * curtain);
    colorVal += 0.15 * snoise(vec3(aurCoord * 2.5, timeOffsetA * 2.0));

  } else if (archetype == 4) {
    // ==============================================================
    // ARCHETYPE 4: FLUID CAUSTICS & WATER RIPPLES (Templates 41 - 50)
    // ==============================================================
    vec2 cp = p * (2.2 + variant * 0.2);
    float c = 0.0;
    float iters = 4.0;
    for (float i = 1.0; i <= 4.0; i += 1.0) {
      vec2 rotP = rotate2D(cp, (i * 0.8) + (variant * 0.1));
      c += sin(rotP.x * (2.0 + i) + timeOffsetA * (1.5 + i * 0.3));
      c += cos(rotP.y * (2.0 + i) + timeOffsetB * (1.2 + i * 0.2));
    }
    c = abs(c / (iters * 2.0));
    // Invert and sharpen peaks to create swimming pool caustics
    float caustic = pow(1.0 - c, 2.2 + variant * 0.2);
    colorVal = caustic;

  } else if (archetype == 5) {
    // ==============================================================
    // ARCHETYPE 5: MARBLE INK & SMOKE TURBULENCE (Templates 51 - 60)
    // ==============================================================
    vec3 coordM = vec3(p * (1.3 + variant * 0.1), timeOffsetA * 0.8);
    vec2 qM = vec2(
      snoise(coordM),
      snoise(coordM + vec3(4.3, 1.2, timeOffsetB))
    );

    vec2 rM = vec2(
      snoise(coordM + vec3(qM * (2.5 + variant * 0.2), timeOffsetB * 1.1)),
      snoise(coordM + vec3(qM * 2.0 + vec2(2.8, 7.1), timeOffsetA * 1.2))
    );

    float fM = snoise(coordM + vec3(rM * (turb * 2.0), timeOffsetB * 0.9));
    colorVal = 0.5 + 0.5 * fM;
    colorVal = smoothstep(0.05, 0.95, colorVal);

  } else if (archetype == 6) {
    // ==============================================================
    // ARCHETYPE 6: CONCENTRIC RINGS & RADIAL PULSES (Templates 61 - 70)
    // ==============================================================
    float ringFreq = 7.0 + variant * 1.4;
    float nWarp = snoise(vec3(p * 1.4, timeOffsetA)) * (turb * 0.25);
    float rP = length(p) + nWarp;

    float ringWave = sin(rP * ringFreq - tRad * (2.0 + mod(variant, 3.0)));
    float pulse = 0.5 + 0.5 * ringWave;
    float breathing = 0.8 + 0.2 * sin(tRad + rP * 2.0);

    colorVal = pulse * breathing;
    colorVal += 0.1 * snoise(vec3(p * 3.0, timeOffsetB));

  } else if (archetype == 7) {
    // ==============================================================
    // ARCHETYPE 7: TOPOGRAPHIC & CONTOUR TERRACES (Templates 71 - 80)
    // ==============================================================
    float topoElev = snoise(vec3(p * (1.2 + variant * 0.1), timeOffsetA * 0.9)) * 0.6
                   + sin(p.x * 2.0 + p.y * 1.5 + timeOffsetB) * 0.4;
    topoElev = 0.5 + 0.5 * topoElev;

    float bands = 6.0 + variant * 1.2;
    float stepped = floor(topoElev * bands) / bands;
    float smoothT = fract(topoElev * bands);
    smoothT = smoothstep(0.1, 0.9, smoothT);

    colorVal = stepped + smoothT * (1.0 / bands);

  } else if (archetype == 8) {
    // ==============================================================
    // ARCHETYPE 8: PRISMATIC & HOLOGRAPHIC SHEEN (Templates 81 - 90)
    // ==============================================================
    float angleP = atan(p.y, p.x) + snoise(vec3(p * 1.8, timeOffsetA)) * (turb * 0.4);
    float prism1 = sin(angleP * (3.0 + mod(variant, 3.0)) + p.x * 4.0 + timeOffsetA * 2.0);
    float prism2 = cos(angleP * 2.0 - p.y * 4.0 + timeOffsetB * 2.0);

    float shimmer = 0.5 + 0.5 * (prism1 * 0.55 + prism2 * 0.45);
    shimmer += 0.12 * sin(length(p) * (8.0 + variant * 1.2) - timeOffsetB * 3.0);
    colorVal = clamp(shimmer, 0.0, 1.0);

  } else {
    // ==============================================================
    // ARCHETYPE 9: GEOMETRIC MATRIX & KALEIDOSCOPE (Templates 91 - 100)
    // ==============================================================
    float rK = length(p);
    float aK = atan(p.y, p.x);

    float folds = 3.0 + mod(variant, 5.0); // 3 to 7 fold symmetry
    float foldAngle = TWO_PI / folds;
    aK = mod(aK, foldAngle) - (foldAngle * 0.5);

    vec2 pFold = vec2(cos(aK), sin(aK)) * rK;
    vec3 kCoord = vec3(pFold * (1.5 + variant * 0.1), timeOffsetA);
    float nK = snoise(kCoord);

    float lattice = sin(pFold.x * (5.0 + variant * 0.5) + nK * 2.0)
                  * cos(pFold.y * (5.0 + variant * 0.5) + timeOffsetB * 1.5);

    colorVal = 0.5 + 0.5 * lattice;
    colorVal = abs(colorVal * 2.0 - 1.0);
  }

  // Sample multi-stop color palette
  colorVal = clamp(colorVal, 0.0, 1.0);
  vec3 finalColor = samplePalette(colorVal);

  // Apply subtle microstock anti-banding triangular dithering and film grain
  if (u_grain > 0.001) {
    float noiseA = hash12(gl_FragCoord.xy + vec2(fract(u_time * 12.3), fract(u_time * 7.1)));
    float noiseB = hash12(gl_FragCoord.yx + vec2(fract(u_time * 5.9), fract(u_time * 11.7)));
    float dither = (noiseA + noiseB - 1.0) * (u_grain * 0.08);
    finalColor += vec3(dither);
  }

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;
