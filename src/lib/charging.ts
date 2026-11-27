export const INITIAL_CHARGE = 79.98;
export function advanceCharge(current: number, increment: number) {
  return Math.min(100, current + Math.max(0, increment));
}