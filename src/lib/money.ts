/** 450000 -> "450 000" (espace insécable, convention FCFA). */
export function formatFcfa(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
