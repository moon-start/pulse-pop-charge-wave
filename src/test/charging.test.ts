import { describe, expect, it } from "vitest";
import { advanceCharge, INITIAL_CHARGE, resolveChargingMode } from "@/lib/charging";

describe("charging percentage", () => {
  it("opens pure effects for mode=transparent and otherwise keeps the full desktop", () => {
    expect(resolveChargingMode("transparent")).toBe("transparent");
    expect(resolveChargingMode(undefined)).toBe("desktop");
    expect(resolveChargingMode("desktop")).toBe("desktop");
    expect(resolveChargingMode("invalid")).toBe("desktop");
  });
  it("starts at the reference percentage", () => {
    expect(INITIAL_CHARGE).toBe(79.98);
  });
  it("rises in small increments without exceeding full charge", () => {
    expect(advanceCharge(79.98, 0.01)).toBeCloseTo(79.99, 2);
    expect(advanceCharge(99.99, 0.02)).toBe(100);
  });
});
import { resolveStartCharge, resolveTestBackground } from "@/lib/charging";
describe("shortcut parameters", () => {
  it("starts from the battery value passed by the shortcut", () => {
    expect(resolveStartCharge("45")).toBe(45);
    expect(resolveStartCharge(62.5)).toBe(62.5);
    expect(resolveStartCharge("80%")).toBe(80);
    expect(resolveStartCharge("150")).toBe(100);
    expect(resolveStartCharge("abc")).toBe(79.98);
    expect(resolveStartCharge(undefined)).toBe(79.98);
  });
  it("accepts a single test background color", () => {
    expect(resolveTestBackground("00ff00")).toBe("#00ff00");
    expect(resolveTestBackground("red")).toBe("red");
    expect(resolveTestBackground("url(x)")).toBeUndefined();
  });
});
