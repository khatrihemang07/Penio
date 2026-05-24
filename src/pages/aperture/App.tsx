import { useEffect, useRef, useCallback } from "react";
import "./App.css";
import { useMouseSettings } from "../../hooks/useMouseSettings";

const SIZE = 150;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2;

type StyleName = "neon" | "golden" | "aurora" | "fire" | "frost" | "rainbow" | "shadow";

// ── Style drawing functions ──────────────────────────────────────────

function drawNeon(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.2, "rgba(0,0,0,0)");
  g.addColorStop(0.35, "rgba(0,255,255,0.15)");
  g.addColorStop(0.5, "rgba(0,255,255,0.4)");
  g.addColorStop(0.65, "rgba(255,0,255,0.5)");
  g.addColorStop(0.8, "rgba(255,0,255,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawGolden(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.25, "rgba(0,0,0,0)");
  g.addColorStop(0.38, "rgba(255,215,0,0.12)");
  g.addColorStop(0.5, "rgba(255,185,30,0.5)");
  g.addColorStop(0.62, "rgba(255,140,0,0.55)");
  g.addColorStop(0.78, "rgba(255,100,20,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawAurora(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.22, "rgba(0,0,0,0)");
  g.addColorStop(0.36, "rgba(0,255,150,0.18)");
  g.addColorStop(0.5, "rgba(0,200,180,0.42)");
  g.addColorStop(0.64, "rgba(100,0,255,0.48)");
  g.addColorStop(0.78, "rgba(50,255,100,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawFire(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.2, "rgba(0,0,0,0)");
  g.addColorStop(0.33, "rgba(255,220,0,0.18)");
  g.addColorStop(0.46, "rgba(255,160,0,0.5)");
  g.addColorStop(0.58, "rgba(255,50,0,0.6)");
  g.addColorStop(0.72, "rgba(200,0,0,0.35)");
  g.addColorStop(0.88, "rgba(80,0,0,0.1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawFrost(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.22, "rgba(0,0,0,0)");
  g.addColorStop(0.36, "rgba(190,225,255,0.3)");
  g.addColorStop(0.5, "rgba(140,200,255,0.55)");
  g.addColorStop(0.64, "rgba(60,160,255,0.5)");
  g.addColorStop(0.78, "rgba(180,220,255,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}


function drawRainbow(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.25, "rgba(0,0,0,0)");
  g.addColorStop(0.38, "rgba(255,0,0,0.2)");
  g.addColorStop(0.47, "rgba(255,255,0,0.28)");
  g.addColorStop(0.56, "rgba(0,255,0,0.28)");
  g.addColorStop(0.65, "rgba(0,200,255,0.3)");
  g.addColorStop(0.74, "rgba(100,0,255,0.3)");
  g.addColorStop(0.83, "rgba(255,0,200,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawShadow(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.3, "rgba(0,0,0,0)");
  g.addColorStop(0.44, "rgba(255,255,255,0.06)");
  g.addColorStop(0.55, "rgba(255,255,255,0.18)");
  g.addColorStop(0.66, "rgba(255,255,255,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

const DRAW_FNS: Record<StyleName, (ctx: CanvasRenderingContext2D) => void> = {
  neon: drawNeon,
  golden: drawGolden,
  aurora: drawAurora,
  fire: drawFire,
  frost: drawFrost,
  rainbow: drawRainbow,
  shadow: drawShadow,
};

// ── Component ────────────────────────────────────────────────────────

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mouseSettings, loading } = useMouseSettings();

  const redraw = useCallback((style: StyleName) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    DRAW_FNS[style](ctx);
  }, []);

  // 初始化 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = SIZE * window.devicePixelRatio;
    canvas.height = SIZE * window.devicePixelRatio;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }, []);

  // 响应 mouseSettings 中的光圈样式变化
  useEffect(() => {
    if (loading) return;
    const style = (mouseSettings.apertureStyle as StyleName) || "neon";
    redraw(style);
  }, [mouseSettings, loading, redraw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", pointerEvents: "none" as const }}
    />
  );
}

export default App;
