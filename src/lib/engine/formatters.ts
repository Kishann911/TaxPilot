/**
 * TaxPilot Currency and Number Formatters
 */

export function formatINR(val?: number | null): string {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const s = absVal.toString();
  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  const res = (otherNumbers !== "" ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," : "") + lastThree;
  return (isNegative ? "-₹" : "₹") + res;
}

export function parseNum(val: any): number {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}
