import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChargingCharacters } from "@/components/charging-characters";
import { advanceCharge, parseBatteryMessage, resolveChargingMode, resolveStartCharge, resolveTestBackground } from "@/lib/charging";
import wallpaper from "@/assets/pink-phone-background.jpeg.asset.json";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({ mode: resolveChargingMode(search["mode"]), battery: resolveStartCharge(search["battery"]), bg: resolveTestBackground(search["bg"]) }),
  head: () => ({ meta: [
    { title: "小新與小白・Turbo 充電桌布" },
    { name: "description", content: "自訂粉紅背景上的 iPhone 全螢幕充電動畫：小新與小白、流光能量環與 Turbo 動態電量。" },
    { property: "og:title", content: "小新與小白・Turbo 充電桌布" },
    { property: "og:description", content: "粉紅背景、柔和旋轉能量環與小新小白奔跑充電動畫。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ChargingScreen,
});

function ChargingScreen() {
  const { mode, battery, bg } = Route.useSearch();
  const transparent = mode === "transparent";
  const [percentage, setPercentage] = useState(battery);
  const [sound, setSound] = useState(false);
  const [burst, setBurst] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromExpo = useRef(false);
  useEffect(() => { if (!fromExpo.current) setPercentage(battery); }, [battery]);

  useEffect(() => {
    const onMessage = (event: Event) => {
      const level = parseBatteryMessage((event as MessageEvent).data);
      if (level === undefined) return;
      fromExpo.current = true;
      setPercentage(level);
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    const bridge = (window as unknown as { ReactNativeWebView?: { postMessage: (m: string) => void } }).ReactNativeWebView;
    bridge?.postMessage(JSON.stringify({ type: "PAGE_LOADED" }));
    if (window.parent !== window) window.parent.postMessage({ type: "PAGE_LOADED" }, "*");
    return () => { window.removeEventListener("message", onMessage); document.removeEventListener("message", onMessage); };
  }, []);

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
    <main className="charging-screen" data-mode={mode} style={bg ? { background: bg } : !transparent ? { backgroundImage: `url("${wallpaper.url}")` } : undefined} onPointerDown={pulse} aria-label="小新 Turbo 充電動畫">
      <div className={`phone-stage${burst ? " is-burst" : ""}`}>
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

        <Button variant="ghost" size="icon" className="sound-switch" aria-label={sound ? "靜音" : "開啟音效"} aria-pressed={sound} title={sound ? "靜音" : "開啟音效"} onPointerDown={event => event.stopPropagation()} onClick={() => { if (!sound) playCharge(); setSound(value => !value); }}>{sound ? <Volume2 /> : <VolumeX />}</Button>
      </div>
    </main>
  );
}
