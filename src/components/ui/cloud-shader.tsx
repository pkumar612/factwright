"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface CloudShaderProps {
  className?: string;
  children?: React.ReactNode;
  /** Drift speed multiplier. */
  speed?: number;
  /** How cloudy the sky is, 1 (a few wisps) to 6 (busy). */
  count?: number;
  cloudColor?: string;
  skyTopColor?: string;
  skyBottomColor?: string;
  /** Fade the bottom edge into this colour, so the sky blends into the page. */
  fadeTo?: string;
}

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Soft procedural clouds: layered value noise drifting over a vertical sky gradient.
const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_cover;
uniform vec3 u_top;
uniform vec3 u_bottom;
uniform vec3 u_cloud;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = vec2(uv.x * u_res.x / u_res.y, uv.y) * 2.2;
  float t = u_time * 0.025;

  vec3 sky = mix(u_bottom, u_top, smoothstep(0.0, 1.0, uv.y));

  // Two layers moving at different speeds give a little depth.
  float far = fbm(p * 0.9 + vec2(t * 0.6, 0.0));
  float near = fbm(p * 1.4 + vec2(t, t * 0.15) + far * 0.6);
  float shape = mix(far, near, 0.65);

  float density = smoothstep(u_cover, u_cover + 0.28, shape);
  // Fewer clouds near the bottom, where text and content sit.
  density *= smoothstep(0.05, 0.55, uv.y) * 0.85 + 0.15;

  // Lit from above: tops brighter, undersides a touch greyer and bluer.
  float light = clamp(fbm(p * 1.4 + vec2(t, t * 0.15) + vec2(0.0, 0.08)) - shape + 0.6, 0.0, 1.0);
  vec3 shade = mix(u_cloud * 0.82 + u_bottom * 0.12, u_cloud, light);

  gl_FragColor = vec4(mix(sky, shade, density * 0.95), 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Animated sky with soft drifting clouds, drawn with WebGL. Children sit on top. */
export function CloudShader({
  className,
  children,
  speed = 1,
  count = 6,
  cloudColor = "#fbf8f2",
  skyTopColor = "#3876ba",
  skyBottomColor = "#8cbfe8",
  fadeTo,
}: CloudShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!canvas || !gl) return; // The CSS gradient behind the canvas stays as the fallback.

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform3fv(u("u_top"), hexToRgb(skyTopColor));
    gl.uniform3fv(u("u_bottom"), hexToRgb(skyBottomColor));
    gl.uniform3fv(u("u_cloud"), hexToRgb(cloudColor));
    // count 1 -> sparse (high threshold), 6 -> fuller sky.
    const clamped = Math.min(6, Math.max(1, count));
    gl.uniform1f(u("u_cover"), 0.62 - (clamped - 1) * 0.035);
    const uRes = u("u_res");
    const uTime = u("u_time");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr * 0.75));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr * 0.75));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      if (visible) {
        gl.uniform1f(uTime, ((now - start) / 1000) * speed + 40);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [speed, count, cloudColor, skyTopColor, skyBottomColor]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(to bottom, ${skyTopColor}, ${skyBottomColor})` }}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {fadeTo && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3" style={{ background: `linear-gradient(to bottom, transparent, ${fadeTo})` }} />
      )}
      {children && <div className="relative h-full">{children}</div>}
    </div>
  );
}
