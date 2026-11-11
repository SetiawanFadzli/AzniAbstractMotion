import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE } from '../shaders/gradientShader';
import { hexToRgb } from './colorUtils';

export interface RenderParams {
  colors: string[];
  templateIndex: number; // 0 or 1
  time: number;
  duration: number;
  speed: number;
  turbulence: number;
  scale: number;
  angle: number;
  grain: number;
  seamlessLoop: boolean;
}

export class WebGLGradientRenderer {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private quadBuffer: WebGLBuffer | null = null;

  // Uniform locations cache
  private uResolution: WebGLUniformLocation | null = null;
  private uTime: WebGLUniformLocation | null = null;
  private uDuration: WebGLUniformLocation | null = null;
  private uTemplate: WebGLUniformLocation | null = null;
  private uColors: WebGLUniformLocation[] = [];
  private uColorCount: WebGLUniformLocation | null = null;
  private uSpeed: WebGLUniformLocation | null = null;
  private uTurbulence: WebGLUniformLocation | null = null;
  private uScale: WebGLUniformLocation | null = null;
  private uAngle: WebGLUniformLocation | null = null;
  private uGrain: WebGLUniformLocation | null = null;
  private uSeamlessLoop: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.init(canvas);
  }

  private init(canvas: HTMLCanvasElement) {
    const gl =
      canvas.getContext('webgl', {
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      console.error('WebGL is not supported in this browser.');
      return;
    }
    this.gl = gl;

    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL program link error:', gl.getProgramInfoLog(program));
      return;
    }

    this.program = program;
    gl.useProgram(program);

    // Quad geometry: 2 triangles covering [-1, 1]
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Cache uniforms
    this.uResolution = gl.getUniformLocation(program, 'u_resolution');
    this.uTime = gl.getUniformLocation(program, 'u_time');
    this.uDuration = gl.getUniformLocation(program, 'u_duration');
    this.uTemplate = gl.getUniformLocation(program, 'u_template');
    this.uColorCount = gl.getUniformLocation(program, 'u_colorCount');
    this.uSpeed = gl.getUniformLocation(program, 'u_speed');
    this.uTurbulence = gl.getUniformLocation(program, 'u_turbulence');
    this.uScale = gl.getUniformLocation(program, 'u_scale');
    this.uAngle = gl.getUniformLocation(program, 'u_angle');
    this.uGrain = gl.getUniformLocation(program, 'u_grain');
    this.uSeamlessLoop = gl.getUniformLocation(program, 'u_seamlessLoop');

    this.uColors = [];
    for (let i = 0; i < 10; i++) {
      const loc = gl.getUniformLocation(program, `u_colors[${i}]`);
      if (loc) this.uColors.push(loc);
    }
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public render(params: RenderParams, width: number, height: number) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    if (gl.canvas.width !== width || gl.canvas.height !== height) {
      gl.canvas.width = width;
      gl.canvas.height = height;
    }

    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);

    if (this.uResolution) gl.uniform2f(this.uResolution, width, height);
    if (this.uTime) gl.uniform1f(this.uTime, params.time);
    if (this.uDuration) gl.uniform1f(this.uDuration, params.duration);
    if (this.uTemplate) gl.uniform1i(this.uTemplate, params.templateIndex);
    if (this.uSpeed) gl.uniform1f(this.uSpeed, params.speed);
    if (this.uTurbulence) gl.uniform1f(this.uTurbulence, params.turbulence);
    if (this.uScale) gl.uniform1f(this.uScale, params.scale);
    if (this.uAngle) gl.uniform1f(this.uAngle, params.angle);
    if (this.uGrain) gl.uniform1f(this.uGrain, params.grain);
    if (this.uSeamlessLoop) gl.uniform1i(this.uSeamlessLoop, params.seamlessLoop ? 1 : 0);

    // Set colors up to 10
    const count = Math.min(10, Math.max(2, params.colors.length));
    if (this.uColorCount) gl.uniform1i(this.uColorCount, count);

    for (let i = 0; i < 10; i++) {
      if (i < count && this.uColors[i]) {
        const [r, g, b] = hexToRgb(params.colors[i]);
        gl.uniform3f(this.uColors[i], r, g, b);
      } else if (this.uColors[i]) {
        gl.uniform3f(this.uColors[i], 0.0, 0.0, 0.0);
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  public destroy() {
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}
