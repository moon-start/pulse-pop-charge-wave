import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChargingScreen, Route } from "@/routes/index";
import { parseBatteryUpdate } from "@/lib/charging";

describe("external battery synchronization", () => {
  let startBattery = 79.98;
  beforeEach(() => {
    vi.useFakeTimers();
    startBattery = 79.98;
    vi.spyOn(Route, "useSearch").mockImplementation(() => ({ mode: "transparent", battery: startBattery }));
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  const receive = (target: Window | Document, data: unknown) => {
    act(() => { target.dispatchEvent(new MessageEvent("message", { data })); });
  };
  const displayedBattery = (container: HTMLElement) => Number(container.querySelector(".battery-percentage span")?.textContent?.replace("%", ""));

  it("receives real battery at the bare URL without any search parameters", () => {
    vi.mocked(Route.useSearch).mockReturnValue({});
    const { container } = render(<ChargingScreen />);
    expect(displayedBattery(container)).toBe(79.98);
    expect(container.querySelector("main")?.dataset["mode"]).toBe("transparent");
    receive(window, { type: "BATTERY_LEVEL", level: 0.45 });
    act(() => { vi.advanceTimersByTime(16000); });
    expect(displayedBattery(container)).toBe(45);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the URL starting battery and simulation until a valid reading arrives", () => {
    const { container } = render(<ChargingScreen />);
    expect(displayedBattery(container)).toBe(79.98);
    receive(window, { type: "BATTERY_LEVEL", level: "invalid" });
    act(() => { vi.advanceTimersByTime(1600); });
    expect(displayedBattery(container)).toBeGreaterThan(79.98);
    expect(vi.getTimerCount()).toBe(1);
  });

  it("updates percentage from window, logs the value and immediately clears simulation", () => {
    const { container } = render(<ChargingScreen />);
    receive(window, { type: "BATTERY_LEVEL", level: 0.45, charging: false });
    expect(displayedBattery(container)).toBe(45);
    expect(container.querySelector("main")?.dataset["charging"]).toBe("false");
    expect(console.log).toHaveBeenCalledWith("外部電量已更新 React state：", 45);
    expect(vi.getTimerCount()).toBe(0);
    act(() => { vi.advanceTimersByTime(16000); });
    expect(displayedBattery(container)).toBe(45);
  });

  it("accepts document JSON readings, later real readings and rejects URL overrides", () => {
    const { container, rerender } = render(<ChargingScreen />);
    receive(document, '{"type":"BATTERY_LEVEL","batteryLevel":62.5,"charging":false}');
    expect(displayedBattery(container)).toBe(62.5);
    startBattery = 90;
    rerender(<ChargingScreen />);
    expect(displayedBattery(container)).toBe(62.5);
    receive(document, { type: "BATTERY_LEVEL", value: 0.63, charging: true });
    expect(displayedBattery(container)).toBe(63);
    expect(container.querySelector("main")?.dataset["charging"]).toBe("true");
    receive(window, { type: "BATTERY_LEVEL", battery: 64 });
    expect(displayedBattery(container)).toBe(64);
    expect(container.querySelector("main")?.dataset["charging"]).toBe("true");
    act(() => { vi.advanceTimersByTime(16000); });
    expect(displayedBattery(container)).toBe(64);
  });

  it("parses each supported field and only accepts boolean charging state", () => {
    for (const field of ["batteryLevel", "level", "battery", "value"]) {
      expect(parseBatteryUpdate({ type: "BATTERY_LEVEL", [field]: 0.45, charging: false })).toEqual({ batteryLevel: 45, charging: false });
    }
    expect(parseBatteryUpdate({ type: "BATTERY_LEVEL", level: 62.5, charging: "false" })).toEqual({ batteryLevel: 62.5 });
    expect(parseBatteryUpdate({ type: "BATTERY_LEVEL", level: Infinity })).toBeUndefined();
  });
});