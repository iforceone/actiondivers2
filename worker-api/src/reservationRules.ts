export type DiscountInput =
  | { type: 'none' }
  | { type: 'percentage'; percent: number; reason: string }
  | { type: 'fixed'; amountCents: number; reason: string };

export interface CalculatedDiscount {
  type: 'none' | 'percentage' | 'fixed';
  value: number;
  amountCents: number;
  reason: string | null;
}

export function calculateDiscount(subtotalCents: number, discount: DiscountInput): CalculatedDiscount {
  if (!Number.isInteger(subtotalCents) || subtotalCents < 0) throw new Error('Subtotal must be a non-negative integer.');
  if (discount.type === 'none') return { type: 'none', value: 0, amountCents: 0, reason: null };
  const reason = discount.reason.trim();
  if (!reason) throw new Error('A discount reason is required.');
  if (discount.type === 'percentage') {
    if (!Number.isFinite(discount.percent) || discount.percent <= 0 || discount.percent > 100) throw new Error('Percentage discount must be between 0 and 100.');
    const basisPoints = Math.round(discount.percent * 100);
    return { type: 'percentage', value: basisPoints, amountCents: Math.min(subtotalCents, Math.round(subtotalCents * basisPoints / 10_000)), reason };
  }
  if (!Number.isInteger(discount.amountCents) || discount.amountCents <= 0 || discount.amountCents > subtotalCents) throw new Error('Fixed discount must be a positive amount no greater than the subtotal.');
  return { type: 'fixed', value: discount.amountCents, amountCents: discount.amountCents, reason };
}

export function paymentIsAvailable(quoteStatus: string | null, paymentStatus: string | null, expiresAt: string | null, now = Date.now()) {
  if (quoteStatus !== 'payable' || !paymentStatus || !expiresAt || Date.parse(expiresAt) <= now) return false;
  return ['created', 'registration_failed', 'awaiting_payment'].includes(paymentStatus);
}
