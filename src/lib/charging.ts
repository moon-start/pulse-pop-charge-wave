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
