import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Battery, Wifi, Signal, Volume2, VolumeX, CloudSun, StickyNote, Flower2, CreditCard, Camera, Mail, MessageCircle, Phone, Compass, Music2, Settings, CalendarDays, Heart, ShoppingBag, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChargingCharacters } from "@/components/charging-characters";
import { advanceCharge, INITIAL_CHARGE, resolveChargingMode } from "@/lib/charging";
import wallpaper from "@/assets/pink-cafe-wallpaper.png.asset.json";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({ mode: resolveChargingMode(search["mode"]) }),
  head: () => ({ meta: [
    { title: "小新與小白・Turbo 充電桌布" },
    { name: "description", content: "粉彩櫻花咖啡廳 iPhone 全螢幕充電動畫：小新與小白、粉紅流光能量環與 Turbo 充電光束。" },
    { property: "og:title", content: "小新與小白・Turbo 充電桌布" },
    { property: "og:description", content: "粉紅櫻花咖啡廳、柔和旋轉能量環與小新小白奔跑充電動畫。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ChargingScreen,
});

const widgetIcons = [CloudSun, StickyNote, Flower2, CreditCard, Camera, Mail, CalendarDays, Heart];
const apps = [
  { icon: MessageCircle, label: "微信", badge: 22 }, { icon: Flower2, label: "照片", badge: 100 },
  { icon: Camera, label: "相机" }, { icon: Mail, label: "邮件", badge: 23 },
  { icon: CalendarDays, label: "日历" }, { icon: StickyNote, label: "备忘录" },
  { icon: Heart, label: "健康" }, { icon: ShoppingBag, label: "商店" },
  { icon: Settings, label: "设置" }, { icon: Music2, label: "音乐" },
  { icon: Play, label: "视频" }, { icon: Compass, label: "Safari" },
];

function ChargingScreen() {
  const { mode } = Route.useSearch();
  const navigate = Route.useNavigate();
  const transparent = mode === "transparent";
  const [percentage, setPercentage] = useState(INITIAL_CHARGE);
  const [sound, setSound] = useState(false);
  const [burst, setBurst] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setPercentage(p => advanceCharge(p, 0.01 + Math.random() * 0.008)), 1600);
    return () => { clearInterval(timer); if (timeout.current) clearTimeout(timeout.current); void audio.current?.close(); };
  }, []);

  const playCharge = () => {
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    void context.resume();
    const now = context.currentTime;
    [0, 0.14, 0.28, 0.48].forEach((delay, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const duration = index === 3 ? 0.65 : 0.09;
      oscillator.type = index === 3 ? "sawtooth" : "square";
      oscillator.frequency.setValueAtTime(index === 3 ? 220 : 880 + index * 220, now + delay);
      if (index === 3) oscillator.frequency.exponentialRampToValueAtTime(2400, now + delay + duration);
      gain.gain.setValueAtTime(0.055, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + delay); oscillator.stop(now + delay + duration);
    });
  };

  const pulse = () => {
    setBurst(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setBurst(false), 1200);
    navigator.vibrate?.(35);
    if (sound) playCharge();
  };

  return (
    <main className="charging-screen" data-mode={mode} onPointerDown={pulse} aria-label="小新 Turbo 充電動畫">
      {!transparent && <img className="desktop-wallpaper" src={wallpaper.url} alt="" />}
      <div className={`phone-stage${burst ? " is-burst" : ""}`}>
        {!transparent && <>
        <img className="phone-wallpaper" src={wallpaper.url} alt="粉彩櫻花咖啡廳桌布" />
        <header className="phone-status" aria-label="iPhone 狀態列">
          <span className="status-time">10:41</span>
          <div className="dynamic-island"><span /></div>
          <div className="status-signals"><Signal /><Wifi /><Battery /></div>
        </header>

        <section className="turbo-widget" aria-label="Turbo 小組件">
          <div className="widget-icons">{widgetIcons.map((Icon, index) => <span key={index} className={`widget-icon pastel-${index % 4}`}><Icon strokeWidth={1.8} /></span>)}</div>
          <div className="widget-caption"><span>滑动开启 Turbo</span><span className="widget-chevrons">› › ›</span></div>
        </section>

        <div className="home-apps" aria-hidden="true">
          {apps.map((app, index) => <div className="home-app" key={app.label}><span className={`app-icon pastel-${index % 4}`}><app.icon strokeWidth={1.4} />{app.badge && <span className="notification">{app.badge}</span>}</span><span className="app-label">{app.label}</span></div>)}
        </div>
        <div className="home-dock" aria-hidden="true">{[Phone, Compass, MessageCircle, Music2].map((Icon, index) => <span className={`app-icon pastel-${index % 4}`} key={index}><Icon strokeWidth={1.5} /></span>)}</div>
        <div className="charging-shade" />
        </>}

        <section className="battery-readout" aria-label="充電電量">
          <div className="battery-percentage"><Zap fill="currentColor" strokeWidth={0} /><span>{percentage.toFixed(2)}<small>%</small></span></div>
          <div className="charging-labels"><span>Max 66W</span><span>超级快充 <b>Turbo</b></span></div>
        </section>

        <div className="charging-beam"><div className="beam-inner" />{Array.from({ length: 18 }, (_, index) => <i key={index} className={`beam-particle particle-${index % 6}`} />)}</div>
        <div className="energy-core">
          <div className="ring-halo" />
          <svg className="energy-ring" viewBox="0 0 300 300" aria-hidden="true">
            <defs><filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5" /></filter></defs>
            <g className="ring-arcs ring-blur" filter="url(#ring-glow)"><circle className="arc-blue" cx="150" cy="150" r="136" /><circle className="arc-gold" cx="150" cy="150" r="136" /><circle className="arc-green" cx="150" cy="150" r="136" /></g>
            <g className="ring-arcs"><circle className="arc-blue" cx="150" cy="150" r="136" /><circle className="arc-gold" cx="150" cy="150" r="136" /><circle className="arc-green" cx="150" cy="150" r="136" /></g>
          </svg>
          <ChargingCharacters />
          <div className="pulse-ring" /><div className="pulse-ring second" />
          <span className="core-spark spark-one">✧</span><span className="core-spark spark-two">✦</span>
        </div>
        <div className="charging-plug" aria-label="發光充電插頭"><svg viewBox="0 0 64 70"><path d="M22 7v16m20-16v16M16 23h32v17q0 13-16 13T16 40zM32 53v17" /></svg></div>
        {!transparent && <div className="home-indicator" />}

        <Button variant="ghost" className="mode-switch" onPointerDown={event => event.stopPropagation()} onClick={() => void navigate({ search: previous => ({ ...previous, mode: transparent ? "desktop" : "transparent" }), replace: true })}>{transparent ? "完整桌面" : "純透明特效"}</Button>

        <Button variant="ghost" size="icon" className="sound-switch" aria-label={sound ? "靜音" : "開啟音效"} aria-pressed={sound} title={sound ? "靜音" : "開啟音效"} onPointerDown={event => event.stopPropagation()} onClick={() => { if (!sound) playCharge(); setSound(value => !value); }}>{sound ? <Volume2 /> : <VolumeX />}</Button>
      </div>
    </main>
  );
}
