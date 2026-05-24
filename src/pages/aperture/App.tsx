import { useEffect, useRef } from "react";
import "./App.css";
import { useMouseSettings } from "../../hooks/useMouseSettings";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";

type StyleName = "neon" | "golden" | "aurora" | "fire" | "frost" | "rainbow" | "shadow" | "sparkle" | "firefly" | "ripple";

// ── Animated style drawing functions ──────────────────────────────────
// All functions receive the current size; gradients are computed relative to it.

function drawNeon(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.002);
  const shift = 0.02 * Math.sin(t * 0.003);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.2, "rgba(0,0,0,0)");
  g.addColorStop(0.35 - shift, `rgba(0,255,255,${0.15 * pulse})`);
  g.addColorStop(0.5 - shift, `rgba(0,255,255,${0.4 * pulse})`);
  g.addColorStop(0.65 + shift, `rgba(255,0,255,${0.5 * pulse})`);
  g.addColorStop(0.8 + shift, `rgba(255,0,255,${0.15 * pulse})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawGolden(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const pulse = 0.8 + 0.2 * Math.sin(t * 0.0015);
  const shift = 0.02 * Math.cos(t * 0.002);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.25, "rgba(0,0,0,0)");
  g.addColorStop(0.38 + shift, `rgba(255,215,0,${0.12 * pulse})`);
  g.addColorStop(0.5 + shift, `rgba(255,185,30,${0.5 * pulse})`);
  g.addColorStop(0.62 - shift, `rgba(255,140,0,${0.55 * pulse})`);
  g.addColorStop(0.78 - shift, `rgba(255,100,20,${0.12 * pulse})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawAurora(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const hue1 = (t * 0.02) % 360;
  const hue2 = (t * 0.015 + 120) % 360;
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.002);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.22, "rgba(0,0,0,0)");
  g.addColorStop(0.36, `hsla(${hue1},80%,60%,${0.18 * pulse})`);
  g.addColorStop(0.5, `hsla(${hue1},70%,55%,${0.42 * pulse})`);
  g.addColorStop(0.64, `hsla(${hue2},70%,55%,${0.48 * pulse})`);
  g.addColorStop(0.78, `hsla(${hue1},60%,60%,${0.15 * pulse})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawFire(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const flicker = 0.85 + 0.15 * Math.sin(t * 0.005) + 0.05 * Math.sin(t * 0.013);
  const warmth = 0.9 + 0.1 * Math.sin(t * 0.004);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.2, "rgba(0,0,0,0)");
  g.addColorStop(0.33, `rgba(255,220,0,${0.18 * flicker})`);
  g.addColorStop(0.46, `rgba(255,${Math.floor(160 * warmth)},0,${0.5 * flicker})`);
  g.addColorStop(0.58, `rgba(255,${Math.floor(50 * warmth)},0,${0.6 * flicker})`);
  g.addColorStop(0.72, `rgba(200,0,0,${0.35 * flicker})`);
  g.addColorStop(0.88, `rgba(80,0,0,${0.1 * flicker})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawFrost(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const shimmer = 0.8 + 0.2 * Math.sin(t * 0.002);
  const wave = 0.02 * Math.cos(t * 0.003);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.22 + wave, "rgba(0,0,0,0)");
  g.addColorStop(0.36 + wave, `rgba(190,225,255,${0.3 * shimmer})`);
  g.addColorStop(0.5, `rgba(140,200,255,${0.55 * shimmer})`);
  g.addColorStop(0.64 - wave, `rgba(60,160,255,${0.5 * shimmer})`);
  g.addColorStop(0.78 - wave, `rgba(180,220,255,${0.2 * shimmer})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawRainbow(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const base = t * 0.03;
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.002);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.25, "rgba(0,0,0,0)");
  g.addColorStop(0.38, `hsla(${base % 360},90%,55%,${0.2 * pulse})`);
  g.addColorStop(0.47, `hsla(${(base + 45) % 360},90%,55%,${0.28 * pulse})`);
  g.addColorStop(0.56, `hsla(${(base + 90) % 360},90%,55%,${0.28 * pulse})`);
  g.addColorStop(0.65, `hsla(${(base + 135) % 360},90%,55%,${0.3 * pulse})`);
  g.addColorStop(0.74, `hsla(${(base + 180) % 360},90%,55%,${0.3 * pulse})`);
  g.addColorStop(0.83, `hsla(${(base + 225) % 360},90%,55%,${0.18 * pulse})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawShadow(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, r = s / 2;
  const breathe = 0.6 + 0.4 * Math.sin(t * 0.0018);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.3, "rgba(0,0,0,0)");
  g.addColorStop(0.44, `rgba(255,255,255,${0.06 * breathe})`);
  g.addColorStop(0.55, `rgba(255,255,255,${0.18 * breathe})`);
  g.addColorStop(0.66, `rgba(255,255,255,${0.06 * breathe})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
}

function drawSparkle(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, maxR = s / 2;
  const count = 28;

  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random values from particle index
    const seed = i * 137.508;
    const angle = ((seed * 2.4) % 360) * (Math.PI / 180);
    const sizeBase = 1.5 + 3 * ((seed * 5.1) % 1);
    const hue = (seed * 42 + t * 0.05) % 360;

    // Particle life cycle: 0 → 1, loops
    const cycle = 1200 + 800 * ((seed * 7.3) % 1);
    const age = ((t + i * 173) % cycle) / cycle;
    const dist = age * maxR;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;

    // Alpha: fade in quickly, fade out slowly
    const alpha = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;
    const twinkle = 0.5 + 0.5 * Math.sin(t * 0.01 + i * 2.7);
    const a = alpha * twinkle * 0.9;

    const starSize = sizeBase * (1 - age * 0.5);

    // Draw 4-pointed star
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * 0.0005 + i);
    ctx.beginPath();
    for (let j = 0; j < 4; j++) {
      const a2 = (j * Math.PI) / 2;
      ctx.lineTo(Math.cos(a2) * starSize, Math.sin(a2) * starSize);
      const mid = a2 + Math.PI / 4;
      ctx.lineTo(Math.cos(mid) * starSize * 0.3, Math.sin(mid) * starSize * 0.3);
    }
    ctx.closePath();
    ctx.fillStyle = `hsla(${hue},90%,70%,${a})`;
    ctx.fill();

    // Glow dot at center
    ctx.beginPath();
    ctx.arc(0, 0, starSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue},100%,90%,${a})`;
    ctx.fill();

    ctx.restore();
  }
}

// Firefly: floating light dots with organic wandering motion
function drawFirefly(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, maxR = s * 0.45;
  const count = 16;

  for (let i = 0; i < count; i++) {
    const seed = i * 97.333;
    // Each firefly orbits around the center with its own path
    const orbitAngle = t * 0.0003 + seed;
    const orbitR = maxR * (0.25 + 0.7 * ((seed * 2.17) % 1));
    // Wandering offset via Lissajous-like motion
    const wx = Math.cos(orbitAngle) * orbitR + Math.sin(t * 0.0012 + seed) * maxR * 0.15;
    const wy = Math.sin(orbitAngle * 1.3) * orbitR + Math.cos(t * 0.0015 + seed) * maxR * 0.15;
    const px = cx + wx;
    const py = cy + wy;

    const glowSize = 2 + 5 * ((seed * 3.7) % 1);
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.003 + i * 1.8));
    const hue = 50 + 30 * Math.sin(t * 0.001 + i); // warm gold-green range
    const a = twinkle * 0.8;

    // Outer glow
    const g = ctx.createRadialGradient(px, py, 0, px, py, glowSize);
    g.addColorStop(0, `hsla(${hue + 30},100%,85%,${a})`);
    g.addColorStop(0.3, `hsla(${hue},90%,70%,${a * 0.6})`);
    g.addColorStop(1, `hsla(${hue},80%,50%,0)`);
    ctx.fillStyle = g;
    ctx.fillRect(px - glowSize, py - glowSize, glowSize * 2, glowSize * 2);
  }
}

// Ripple: concentric rings expanding outward, cyan-to-purple hue shift
function drawRipple(ctx: CanvasRenderingContext2D, t: number, s: number) {
  const cx = s / 2, cy = s / 2, maxR = s * 0.48;
  const ringCount = 5;

  for (let i = 0; i < ringCount; i++) {
    const cycle = 1800 + i * 350;
    const age = ((t + i * 400) % cycle) / cycle;
    const r = age * maxR;
    const alpha = (1 - age) * 0.55;
    const width = 2 * (1 - age * 0.7);
    const hue = 180 + age * 120; // cyan → purple

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue},90%,65%,${alpha})`;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

type DrawFn = (ctx: CanvasRenderingContext2D, t: number, size: number) => void;

const DRAW_FNS: Record<StyleName, DrawFn> = {
  neon: drawNeon,
  golden: drawGolden,
  aurora: drawAurora,
  fire: drawFire,
  frost: drawFrost,
  rainbow: drawRainbow,
  shadow: drawShadow,
  sparkle: drawSparkle,
  firefly: drawFirefly,
  ripple: drawRipple,
};

// ── Component ────────────────────────────────────────────────────────

const BASE_SIZE = 150;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const styleRef = useRef<StyleName>("neon");
  const sizeRef = useRef<number>(BASE_SIZE);
  const rafRef = useRef<number>(0);
  const { mouseSettings, loading } = useMouseSettings();

  const scale = mouseSettings.apertureScale ?? 1.0;
  const size = Math.round(BASE_SIZE * Math.max(0.1, Math.min(1.0, scale)));

  // 同步窗口大小
  useEffect(() => {
    if (loading) return;
    sizeRef.current = size;
    getCurrentWindow().setSize(new LogicalSize(size, size)).catch(() => {});
  }, [size, loading]);

  // 初始化 canvas（size 变化时重新初始化）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [size]);

  // 动画循环 / 静态绘制
  useEffect(() => {
    const enabled = mouseSettings.enableAperture !== false;
    if (loading || !enabled) return;

    const style = (mouseSettings.apertureStyle as StyleName) || "neon";
    styleRef.current = style;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = sizeRef.current;
    const animated = mouseSettings.enableApertureAnimation !== false;

    if (!animated) {
      ctx.clearRect(0, 0, s, s);
      DRAW_FNS[styleRef.current](ctx, 0, s);
      return;
    }

    const loop = (timestamp: number) => {
      const sz = sizeRef.current;
      ctx.clearRect(0, 0, sz, sz);
      DRAW_FNS[styleRef.current](ctx, timestamp, sz);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [mouseSettings, loading]);

  if (mouseSettings.enableAperture === false) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", pointerEvents: "none" as const }}
    />
  );
}

export default App;
