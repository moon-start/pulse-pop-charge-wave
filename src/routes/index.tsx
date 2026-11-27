import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "充充電！動感光波充電動畫" },
      { name: "description", content: "iPhone 全螢幕動感光波充電動畫，點擊爆發、切換配色、復古特攝音效。" },
      { property: "og:title", content: "充充電！動感光波充電動畫" },
      { property: "og:description", content: "點擊螢幕觸發超級動感光波大爆發！" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const THEMES = [
  { name: "經典動感藍", c: ["#1e6bff", "#00f0ff", "#ffd400"] },
  { name: "動感超人金", c: ["#ffb300", "#fff27a", "#ff5a00"] },
  { name: "巧克比粉紅", c: ["#ff4fb0", "#ffd1ec", "#b46bff"] },
];

function Index() {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ theme: 0, burst: 0, sound: false });
  const actx = useRef<AudioContext | null>(null);
  const [theme, setTheme] = useState(0);
  const [sound, setSound] = useState(false);
  const [quake, setQuake] = useState(0);

  const ac = () => (actx.current ??= new AudioContext());
  const tone = (f: number, t0: number, d: number, type: OscillatorType = "square", f2?: number) => {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + d);
  };
  const charge = (big = false) => {
    const a = ac(); const t = a.currentTime;
    [0, 0.15, 0.3].forEach((d, i) => tone(880 + i * 220, t + d, 0.09));
    tone(200, t + 0.5, big ? 0.9 : 0.6, "sawtooth", big ? 3000 : 2000);
  };

  useEffect(() => {
    const c = cv.current!; const x = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(devicePixelRatio, 2);
    const rs = () => { w = innerWidth; h = innerHeight; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    rs(); addEventListener("resize", rs);
    const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), p: Math.random() * 6 }));
    const lines = Array.from({ length: 70 }, () => ({ a: Math.random() * 6.283, l: Math.random() }));
    let waves: { r: number; ci: number }[] = [];
    let parts: { x: number; y: number; vx: number; vy: number; l: number; ci: number }[] = [];
    let last = 0, spawn = 0, n = 0;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const s = st.current, col = THEMES[s.theme]!.c, cx = w / 2, cy = h / 2, R = Math.hypot(w, h) / 2;
      const sp = s.burst > 0 ? 3 : 1; s.burst = Math.max(0, s.burst - dt);
      x.fillStyle = "#050510"; x.fillRect(0, 0, w, h);
      x.strokeStyle = "rgba(255,255,255,.12)";
      for (const l of lines) { l.l += dt * 2 * sp; if (l.l > 1) { l.l = 0; l.a = Math.random() * 6.283; }
        const r1 = R * (0.35 + l.l * 0.65); x.lineWidth = 1 + l.l * 3; x.beginPath();
        x.moveTo(cx + Math.cos(l.a) * r1, cy + Math.sin(l.a) * r1);
        x.lineTo(cx + Math.cos(l.a) * (r1 + 80), cy + Math.sin(l.a) * (r1 + 80)); x.stroke(); }
      for (const t of stars) { const a = 0.5 + 0.5 * Math.sin(now / 300 + t.p); x.fillStyle = `rgba(255,255,230,${a})`;
        const sx = t.x * w, sy = t.y * h, z = 1 + a * 2; x.fillRect(sx - z, sy - 0.5, z * 2, 1); x.fillRect(sx - 0.5, sy - z, 1, z * 2); }
      spawn -= dt * sp; if (spawn <= 0) { waves.push({ r: 20, ci: n++ % 3 }); spawn = 0.35; }
      x.globalCompositeOperation = "lighter";
      waves = waves.filter((v) => { v.r += dt * 260 * sp; const a = Math.max(0, 1 - v.r / R);
        x.shadowBlur = 30; x.shadowColor = col[v.ci]!; x.strokeStyle = col[v.ci]!; x.globalAlpha = a;
        x.lineWidth = 6 + 14 * a; x.beginPath(); x.arc(cx, cy, v.r, 0, 6.283); x.stroke();
        x.fillStyle = col[v.ci]!; for (let i = 0; i < 36; i++) { const an = i / 36 * 6.283 + v.r / 200;
          x.beginPath(); x.arc(cx + Math.cos(an) * (v.r + 18), cy + Math.sin(an) * (v.r + 18), 2.2 * a + 0.5, 0, 6.283); x.fill(); }
        if (Math.random() < 0.15 * sp) { const an = Math.random() * 6.283; let px = cx + Math.cos(an) * v.r, py = cy + Math.sin(an) * v.r;
          x.lineWidth = 2; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += Math.cos(an) * 12 + (Math.random() - .5) * 18; py += Math.sin(an) * 12 + (Math.random() - .5) * 18; x.lineTo(px, py); } x.stroke(); }
        return a > 0; });
      x.globalAlpha = 1;
      const pulse = 40 + 10 * Math.sin(now / 120) + (s.burst > 0 ? 30 : 0);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, pulse * 2);
      g.addColorStop(0, "#fff"); g.addColorStop(0.3, col[1]!); g.addColorStop(1, "transparent");
      x.shadowBlur = 60; x.shadowColor = col[0]!; x.fillStyle = g; x.beginPath(); x.arc(cx, cy, pulse * 2, 0, 6.283); x.fill();
      x.shadowBlur = 12;
      parts = parts.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; x.globalAlpha = Math.max(0, p.l);
        x.fillStyle = col[p.ci]!; x.fillRect(p.x - 3, p.y - 3, 6, 6); return p.l > 0; });
      x.globalAlpha = 1; x.shadowBlur = 0; x.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    (st.current as any).emit = (px: number, py: number) => {
      for (let i = 0; i < 120; i++) { const a = Math.random() * 6.283, v = 200 + Math.random() * 700;
        parts.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1 + Math.random(), ci: i % 3 }); }
      for (let i = 0; i < 4; i++) waves.push({ r: 20 + i * 40, ci: i % 3 });
    };
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", rs); };
  }, []);

  const tap = (e: React.PointerEvent) => {
    const next = (st.current.theme + 1) % 3;
    st.current.theme = next; st.current.burst = 1.5; setTheme(next); setQuake((q) => q + 1);
    (st.current as any).emit?.(e.clientX, e.clientY);
    navigator.vibrate?.(200);
    if (st.current.sound) charge(true);
  };
  const toggle = (e: React.PointerEvent) => {
    e.stopPropagation(); const on = !sound; setSound(on); st.current.sound = on;
    if (on) { void ac().resume(); charge(); }
  };
  useEffect(() => { if (!sound) return; const id = setInterval(() => charge(), 2400); return () => clearInterval(id); }, [sound]);

  const glow = THEMES[theme]!.c[1];
  return (
    <main onPointerDown={tap} className="fixed inset-0 overflow-hidden">
      <div key={quake} className={quake ? "quake absolute inset-0" : "absolute inset-0"}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-[14%] flex flex-col items-center gap-2" style={{ ["--glow" as any]: glow }}>
          <span className="onoma text-[13vw] leading-none">充充電！</span>
          <span className="onoma text-[13vw] leading-none" style={{ animationDelay: ".4s" }}>充充電！</span>
        </div>
        <p className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+2rem)] text-center text-sm tracking-widest text-foreground/70" style={{ color: "#fff8" }}>
          {THEMES[theme]!.name} ・ 點擊螢幕大爆發
        </p>
      </div>
      <button onPointerDown={toggle} aria-label={sound ? "靜音" : "開啟音效"}
        className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] h-10 w-10 rounded-full border border-border/30 text-lg backdrop-blur" style={{ color: "#fff" }}>
        {sound ? "🔊" : "🔇"}
      </button>
    </main>
  );
}
