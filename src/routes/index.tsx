import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChargingCharacters } from "@/components/charging-characters";
import { advanceCharge, parseBatteryUpdate, resolveChargingMode, resolveStartCharge, resolveTestBackground } from "@/lib/charging";
import chargeSound from "@/assets/charge-sound.mp3.asset.json";

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

export function ChargingScreen() {
  const { mode, battery, bg } = Route.useSearch();
  const [percentage, setPercentage] = useState(battery);
  const [charging, setCharging] = useState(true);
  const [sound, setSound] = useState(true);
  const [burst, setBurst] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const soundOn = useRef(true);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fromExpo = useRef(false);
  const simulationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { if (!fromExpo.current) setPercentage(battery); }, [battery]);

  useEffect(() => {
    const onMessage = (event: Event) => {
      const update = parseBatteryUpdate((event as MessageEvent).data);
      if (update === undefined) return;
      const { batteryLevel, charging: externalCharging } = update;
      fromExpo.current = true;
      if (simulationTimer.current !== null) {
        clearInterval(simulationTimer.current);
        simulationTimer.current = null;
      }
      setPercentage(batteryLevel);
      if (externalCharging !== undefined) setCharging(externalCharging);
      console.log('外部電量已更新 React state：', batteryLevel);
      if (soundOn.current) playCharge();
    };
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    const bridge = (window as unknown as { ReactNativeWebView?: { postMessage: (m: string) => void } }).ReactNativeWebView;
    bridge?.postMessage(JSON.stringify({ type: "PAGE_LOADED" }));
    if (soundOn.current) playCharge();
    if (window.parent !== window) window.parent.postMessage({ type: "PAGE_LOADED" }, "*");
    return () => { window.removeEventListener("message", onMessage); document.removeEventListener("message", onMessage); };
  }, []);

  useEffect(() => {
    if (!fromExpo.current) {
      simulationTimer.current = setInterval(() => {
        if (!fromExpo.current) setPercentage(p => fromExpo.current ? p : advanceCharge(p, 0.01 + Math.random() * 0.008));
      }, 1600);
    }
    return () => {
      if (simulationTimer.current !== null) clearInterval(simulationTimer.current);
      simulationTimer.current = null;
      if (timeout.current) clearTimeout(timeout.current);
      audio.current?.pause();
    };
  }, []);

  const playCharge = () => {
    const clip = audio.current ?? new Audio(chargeSound.url);
    audio.current = clip;
    clip.currentTime = 0;
    void clip.play().catch(() => undefined);
  };

  const pulse = () => {
    setBurst(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setBurst(false), 1200);
    navigator.vibrate?.(35);
    if (sound) playCharge();
  };

  return (
    <main className="charging-screen" data-mode={mode} data-charging={charging} style={bg ? { background: bg } : undefined} onPointerDown={pulse} aria-label="小新 Turbo 充電動畫">
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

        <Button variant="ghost" size="icon" className="sound-switch" aria-label={sound ? "靜音" : "開啟音效"} aria-pressed={sound} title={sound ? "靜音" : "開啟音效"} onPointerDown={event => event.stopPropagation()} onClick={() => { if (!sound) playCharge(); setSound(value => { soundOn.current = !value; if (value) audio.current?.pause(); return !value; }); }}>{sound ? <Volume2 /> : <VolumeX />}</Button>
      </div>
    </main>
  );
}
