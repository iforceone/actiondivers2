export function paymentIsAvailable(quoteStatus: string | null, paymentStatus: string | null, expiresAt: string | null, now = Date.now()) {
  if (quoteStatus !== 'payable' || !paymentStatus || !expiresAt || Date.parse(expiresAt) <= now) return false;
  return ['created', 'registration_failed', 'awaiting_payment'].includes(paymentStatus);
}
