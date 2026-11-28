export const INITIAL_CHARGE = 79.98;
export function resolveChargingMode(mode: unknown) {
  return mode === "transparent" ? "transparent" : "desktop";
}
export function resolveStartCharge(battery: unknown) {
  const value = typeof battery === "number" ? battery : typeof battery === "string" && battery.trim() !== "" ? Number(battery.replace("%", "")) : NaN;
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : INITIAL_CHARGE;
}
export function resolveTestBackground(bg: unknown) {
  if (typeof bg !== "string") return undefined;
  const hex = bg.replace(/^#/, "");
  if (/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return `#${hex}`;
  return /^[a-z]{3,20}$/i.test(bg) ? bg : undefined;
}
export function advanceCharge(current: number, increment: number) {
  return Math.min(100, current + Math.max(0, increment));
}
export function normalizeBatteryLevel(level: unknown) {
  const value = typeof level === "number" ? level : typeof level === "string" && level.trim() !== "" ? Number(level.replace("%", "")) : NaN;
  if (!Number.isFinite(value) || value < 0) return undefined;
  return Math.min(100, value <= 1 ? value * 100 : value);
}
export function parseBatteryMessage(data: unknown): number | undefined {
  let payload = data;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch { return undefined; } }
  if (!payload || typeof payload !== "object") return undefined;
  const msg = payload as Record<string, unknown>;
  if (msg["type"] !== "BATTERY_LEVEL") return undefined;
  return normalizeBatteryLevel(msg["level"] ?? msg["batteryLevel"] ?? msg["battery"] ?? msg["value"]);
}
