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
  const [mode, setMode] = useState<"night" | "room">("room");
  const [pct, setPct] = useState(79.5);
  const [real, setReal] = useState(false);
  const [guide, setGuide] = useState(false);
  const [panel, setPanel] = useState(false);
  const modeRef = useRef(mode); modeRef.current = mode;
  useEffect(() => {
    const nav = navigator as any;
    nav.getBattery?.().then((b: any) => { setReal(true); const u = () => setPct(b.level * 100); u(); b.addEventListener("levelchange", u); }).catch(() => {});
    const id = setInterval(() => setPct((p) => (p >= 100 ? 100 : Math.min(100, p + Math.random() * 0.03))), 200);
    return () => clearInterval(id);
  }, []);

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
      x.clearRect(0, 0, w, h);
      if (modeRef.current === "night") { x.fillStyle = "#050510"; x.fillRect(0, 0, w, h); }
      x.strokeStyle = modeRef.current === "night" ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.35)";
      for (const l of lines) { l.l += dt * 2 * sp; if (l.l > 1) { l.l = 0; l.a = Math.random() * 6.283; }
        const r1 = R * (0.35 + l.l * 0.65); x.lineWidth = 1 + l.l * 3; x.beginPath();
        x.moveTo(cx + Math.cos(l.a) * r1, cy + Math.sin(l.a) * r1);
        x.lineTo(cx + Math.cos(l.a) * (r1 + 80), cy + Math.sin(l.a) * (r1 + 80)); x.stroke(); }
      if (modeRef.current === "night") for (const t of stars) { const a = 0.5 + 0.5 * Math.sin(now / 300 + t.p); x.fillStyle = `rgba(255,255,230,${a})`;
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
        x.fillStyle = p.ci === 0 ? "#ffd400" : col[p.ci]!; x.beginPath(); x.arc(p.x, p.y, p.ci === 0 ? 6 : 3, 0, 6.283); x.fill(); return p.l > 0; });
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
  const col = THEMES[theme]!.c;
  const stop = (e: React.PointerEvent) => e.stopPropagation();
  const btn = "flex h-10 items-center justify-center rounded-full border border-border/40 bg-background/20 px-3 text-sm backdrop-blur";
  return (
    <main onPointerDown={tap} className="fixed inset-0 overflow-hidden" style={{ color: "#fff" }}>
      {mode === "room" && <Room />}
      <div key={quake} className={quake ? "quake absolute inset-0" : "absolute inset-0"}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-[11%] flex flex-col items-center" style={{ ["--glow" as any]: glow }}>
          <span className="onoma text-[11vw] leading-none">充充電！充充電！</span>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[68vmin] w-[68vmin] -translate-x-1/2 -translate-y-1/2">
          <div className="spin absolute inset-0 rounded-full" style={{ background: `conic-gradient(${col[0]},${col[1]},${col[2]},transparent,${col[0]})`, filter: `drop-shadow(0 0 18px ${col[1]})`, mask: "radial-gradient(circle,transparent 60%,#000 61%,#000 70%,transparent 71%)", WebkitMask: "radial-gradient(circle,transparent 60%,#000 61%,#000 70%,transparent 71%)" }} />
          <div className="absolute inset-[16%] overflow-hidden rounded-full" style={{ background: "radial-gradient(circle,#fff8,#fff1)" }}><Kids /></div>
          <div className="absolute -right-[22%] top-1/2 flex -translate-y-1/2 items-center">
            <svg viewBox="0 0 60 30" className="zap w-[12vmin]"><path d="M0 15 L12 6 L18 20 L28 4 L36 22 L46 8 L60 15" stroke={col[1]} strokeWidth="3" fill="none" style={{ filter: `drop-shadow(0 0 6px ${col[1]})` }} /></svg>
            <span className="text-[10vmin]" style={{ filter: "grayscale(1) brightness(2.2) drop-shadow(0 0 8px #fff)" }}>🔌</span>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] text-center">
          <div className="onoma text-[12vw] leading-none" style={{ animation: "jitter .12s infinite" }}>⚡ {pct.toFixed(2)}%</div>
          <div className="mt-2 text-base font-bold tracking-widest" style={{ textShadow: `0 0 10px ${col[1]}` }}>⚡ Turbo 快充中{real ? "（真實電量）" : ""}</div>
        </div>
      </div>
      <div onPointerDown={stop} className="absolute left-4 right-4 top-[calc(env(safe-area-inset-top)+1rem)] flex justify-end gap-2">
        <button onClick={() => setGuide(true)} className={btn}>📲 捷徑自動化教學</button>
        <button onPointerDown={toggle} aria-label={sound ? "靜音" : "開啟音效"} className={btn + " w-10 px-0"}>{sound ? "🔊" : "🔇"}</button>
      </div>
      <div onPointerDown={stop} className="absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] flex justify-center gap-2">
        <button className={btn} onClick={() => setMode(mode === "room" ? "night" : "room")}>{mode === "room" ? "🌌 夜空模式" : "🏠 房間模式"}</button>
        <button className={btn} onClick={() => setPanel(!panel)}>🔋 自訂電量</button>
        <span className={btn + " opacity-80"}>{THEMES[theme]!.name}</span>
      </div>
      {panel && (
        <div onPointerDown={stop} className="absolute inset-x-6 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] rounded-2xl bg-background/80 p-4 text-foreground backdrop-blur">
          <input type="range" min={0} max={100} step={1} value={pct} onChange={(e) => { setReal(false); setPct(+e.target.value); }} className="w-full" />
          <div className="mt-2 flex justify-between gap-2">{[20, 50, 80, 99].map((v) => <button key={v} className="rounded-lg bg-primary px-3 py-1 text-primary-foreground" onClick={() => { setReal(false); setPct(v); }}>{v}%</button>)}</div>
        </div>
      )}
      {guide && (
        <div onPointerDown={stop} className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 p-5 backdrop-blur" onClick={() => setGuide(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 text-card-foreground shadow-2xl">
            <h2 className="text-xl font-bold">📲 一插電就自動跳出充電動畫</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
              <li>先用 Safari 開啟本頁 →「分享」→「加入主畫面」，以全螢幕模式使用。</li>
              <li>打開 iPhone 內建「<b>捷徑</b>」App，點下方「<b>自動化</b>」→ 右上「＋」。</li>
              <li>向下找到並選擇「<b>充電器</b>」→ 勾選「<b>已連接</b>」，並選「<b>立即執行</b>」（關閉「執行時通知」）。</li>
              <li>點「新增空白自動化」→ 新增動作搜尋「<b>打開 URL</b>」，貼上本頁網址：<br /><code className="break-all rounded bg-muted px-1">{typeof window !== "undefined" ? location.origin : ""}</code></li>
              <li>按「完成」。插上充電線，就會自動打開充電動畫！</li>
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">提示：「打開 URL」會用 Safari 開啟，畫面會有網址列；捷徑沒辦法直接打開加到主畫面的版本。點一下畫面並開啟音效，就會聽到充電聲。</p>
            <button onClick={() => setGuide(false)} className="mt-5 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">知道了！</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Room() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="560" fill="#ffe9c7" />
      <path d="M0 0h400v40H0z" fill="#f7cf9a" />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={20 + (i % 5) * 90} cy={90 + Math.floor(i / 5) * 140} r="4" fill="#f5c58a" />)}
      <rect x="40" y="90" width="150" height="130" rx="6" fill="#bfe6ff" stroke="#c98a4b" strokeWidth="8" />
      <path d="M115 90v130M40 155h150" stroke="#c98a4b" strokeWidth="5" />
      <circle cx="160" cy="120" r="14" fill="#fff6a8" />
      <rect x="250" y="70" width="110" height="80" rx="4" fill="#fff" stroke="#e58f6b" strokeWidth="5" />
      <path d="M265 135l25-35 20 25 15-15 20 25z" fill="#9ad18b" />
      <rect y="560" width="400" height="240" fill="#e2b07a" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M0 ${590 + i * 40}H400`} stroke="#cf9a62" strokeWidth="2" />)}
      <rect x="30" y="470" width="140" height="90" rx="20" fill="#ff8f7a" />
      <rect x="20" y="440" width="160" height="50" rx="20" fill="#ff7a66" />
      <rect x="260" y="480" width="110" height="80" rx="6" fill="#a0703f" />
      <rect x="275" y="440" width="34" height="40" rx="4" fill="#ffd36b" />
      <ellipse cx="200" cy="700" rx="150" ry="40" fill="#ffd6e0" opacity=".8" />
    </svg>
  );
}

function Kids() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <ellipse cx="100" cy="170" rx="70" ry="8" fill="#0002" />
      <g className="run">
        <g transform="translate(55 50)">
          <rect className="legA" x="22" y="88" width="10" height="28" rx="5" fill="#3a5bd9" />
          <rect className="legB" x="36" y="88" width="10" height="28" rx="5" fill="#3a5bd9" />
          <rect x="16" y="52" width="36" height="40" rx="12" fill="#2bb673" />
          <rect className="legB" x="6" y="56" width="10" height="26" rx="5" fill="#ffd9b8" />
          <rect className="legA" x="52" y="56" width="10" height="26" rx="5" fill="#ffd9b8" />
          <circle cx="34" cy="32" r="24" fill="#ffd9b8" />
          <path d="M10 26a24 24 0 0 1 48 0z" fill="#ff9f1c" /><rect x="34" y="20" width="30" height="7" rx="3" fill="#ff9f1c" />
          <circle cx="28" cy="36" r="3" fill="#222" /><circle cx="44" cy="36" r="3" fill="#222" />
          <path d="M30 46q6 6 12 0" stroke="#222" strokeWidth="2" fill="none" />
          <circle cx="22" cy="44" r="4" fill="#ff9aa8" /><circle cx="50" cy="44" r="4" fill="#ff9aa8" />
        </g>
      </g>
      <g className="run" style={{ animationDelay: ".17s" }}>
        <g transform="translate(118 118)">
          <rect className="legA" x="6" y="26" width="7" height="14" rx="3" fill="#c98a4b" />
          <rect className="legB" x="30" y="26" width="7" height="14" rx="3" fill="#c98a4b" />
          <ellipse cx="22" cy="22" rx="22" ry="13" fill="#e9b47a" />
          <circle cx="44" cy="12" r="12" fill="#e9b47a" />
          <ellipse cx="38" cy="4" rx="5" ry="8" fill="#8a5a2b" />
          <circle cx="47" cy="10" r="2" fill="#222" /><circle cx="55" cy="14" r="2.5" fill="#222" />
          <path d="M0 16q-8 -8 -4 -14" stroke="#e9b47a" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
