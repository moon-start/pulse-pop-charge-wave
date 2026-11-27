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