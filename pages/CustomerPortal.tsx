import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, CreditCard, Loader2, LockKeyhole, Mail, Ship, TriangleAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { API, CONTACT } from '../config';
import { formatUsd } from '../shared/bookingCatalog';
import { isAdminPreviewEnabled } from '../utils/adminPreview';

interface PortalResponse {
  ok?: boolean;
  error?: string;
  reservation?: {
    reference: string;
    status: string;
    requestKind: 'tour' | 'course' | 'transfer';
    customer: { name: string; email: string; phone: string | null };
    party: { adults: number; children: number };
    accommodation: string | null;
    divingExperience: string | null;
    customerNotes: string | null;
    customerMessage: string | null;
    createdAt: string;
  };
  items?: Array<{ id: string; name_snapshot: string; requested_date: string; adults: number; children: number }>;
  quote?: { status: string; customer_message: string | null; subtotal_cents: number; discount_cents: number; total_cents: number; expires_at: string | null } | null;
  quoteItems?: Array<{ id: string; label: string; service_date: string | null; quantity: number; unit_price_cents: number; line_total_cents: number; notes: string | null }>;
  payment?: { status: string; paid_at: string | null; expires_at: string; receipt_reference?: string } | null;
  paymentAvailable?: boolean;
  redirectUrl?: string;
}

const gatewayUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'belizebank.com' || url.hostname.endsWith('.belizebank.com') || url.hostname === 'radarpayment.online' || url.hostname.endsWith('.radarpayment.online'));
  } catch { return false; }
};

const formatDate = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(`${value}${value.length === 10 ? 'T12:00:00' : ''}`));

const statusLabel: Record<string, string> = {
  new: 'Request received', reviewing: 'Under staff review', needs_contact: 'Staff needs to contact you', quoted: 'Reservation update', awaiting_payment: 'Ready for payment', paid: 'Paid', cancelled: 'Cancelled', completed: 'Completed',
};

const previewPortal = (paid: boolean): PortalResponse => ({
  ok: true,
  reservation: {
    reference: paid ? 'AD-DEMO-PAID' : 'AD-DEMO-QUOTE',
    status: paid ? 'paid' : 'awaiting_payment',
    requestKind: 'tour',
    customer: { name: 'Preview Guest', email: 'guest@example.com', phone: '+1 555 010 2026' },
    party: { adults: 2, children: 1 },
    accommodation: 'Sample hotel in San Pedro',
    divingExperience: null,
    customerNotes: 'Fictional reservation used only to preview the customer experience.',
    customerMessage: 'This is a demonstration portal. No reservation or payment has been created.',
    createdAt: '2026-08-01T14:00:00.000Z',
  },
  items: [
    { id: 'demo-item-1', name_snapshot: 'Hol Chan & Shark Ray Alley Snorkeling', requested_date: '2026-09-12', adults: 2, children: 1 },
  ],
  quote: {
    status: 'payable',
    customer_message: 'Your requested tour is shown here as a fictional finalized quote for preview purposes.',
    subtotal_cents: 36000,
    discount_cents: 0,
    total_cents: 36000,
    expires_at: '2026-09-05T23:59:59.000Z',
  },
  quoteItems: [
    { id: 'demo-line-1', label: 'Hol Chan & Shark Ray Alley Snorkeling', service_date: '2026-09-12', quantity: 4, unit_price_cents: 9000, line_total_cents: 36000, notes: 'Minimum billed quantity: 4 guests' },
  ],
  payment: paid ? { status: 'paid', paid_at: '2026-08-03T16:30:00.000Z', expires_at: '2026-09-05T23:59:59.000Z', receipt_reference: 'DEMO-RECEIPT' } : null,
  paymentAvailable: !paid,
});

const CustomerPortal: React.FC = () => {
  const { token = '' } = useParams();
  const isPreview = isAdminPreviewEnabled() && (token === 'preview' || token === 'preview-paid');
  const [data, setData] = useState<PortalResponse | null>(() => isPreview ? previewPortal(token === 'preview-paid') : null);
  const [loading, setLoading] = useState(!isPreview);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPreview) return;
    let active = true;
    fetch(API.url(`/portal/${encodeURIComponent(token)}`))
      .then(async (response) => {
        const body = await response.json() as PortalResponse;
        if (!response.ok || !body.reservation) throw new Error(body.error || 'This reservation link could not be loaded.');
        if (active) setData(body);
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'This reservation link could not be loaded.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [isPreview, token]);

  const startPayment = async () => {
    if (isPreview) {
      window.location.assign('/pay/preview');
      return;
    }
    setStarting(true);
    setError('');
    try {
      const response = await fetch(API.url(`/portal/${encodeURIComponent(token)}/payment/start`), { method: 'POST' });
      const body = await response.json() as PortalResponse;
      if (!response.ok || !body.redirectUrl || !gatewayUrl(body.redirectUrl)) throw new Error(body.error || 'Secure payment could not be started.');
      window.location.assign(body.redirectUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Secure payment could not be started.');
      setStarting(false);
    }
  };

  if (loading) return <div className="flex min-h-[75vh] items-center justify-center pt-20 text-[#F8F4E8]"><Loader2 className="mr-3 h-6 w-6 animate-spin text-[#11C7D9]" /> Loading reservation…</div>;
  if (!data?.reservation) return (
    <section className="flex min-h-[75vh] items-center justify-center px-6 pt-20 text-center">
      <SEO title="Reservation Link Unavailable" description="This private reservation link is unavailable." path="/reservation" noindex />
      <div className="max-w-lg"><TriangleAlert className="mx-auto h-11 w-11 text-[var(--brand-orange)]" /><h1 className="mt-6 text-4xl font-extrabold text-[#F8F4E8]">Reservation link unavailable</h1><p className="mt-4 text-[#F8F4E8]/70">{error || 'The link may have expired or been replaced by a newer update.'}</p><a href={`mailto:${CONTACT.email}`} className="mt-8 inline-flex rounded-full bg-[var(--brand-orange)] px-7 py-3 font-bold text-white">Email Action Divers</a></div>
    </section>
  );

  const { reservation, quote, quoteItems = [], payment } = data;
  const requestLabel = reservation.requestKind === 'course' ? 'course request' : reservation.requestKind === 'transfer' ? 'transfer request' : 'trip request';
  const paid = payment?.status === 'paid' || reservation.status === 'paid';
  return (
    <div className="min-h-screen bg-[#001219] px-4 pb-24 pt-32 sm:px-6 lg:pt-40">
      <SEO title={`Reservation ${reservation.reference}`} description="Private Action Divers reservation details." path="/reservation" noindex />
      <main className="mx-auto max-w-6xl">
        {isPreview && <div role="status" className="mb-7 rounded-xl bg-[#11C7D9]/10 px-5 py-4 text-sm leading-relaxed text-[#C8F5F8]"><strong>Customer portal preview:</strong> every name, date, price, message, and receipt shown here is fictional. No reservation is stored.</div>}
        <header className="flex flex-col gap-7 border-b border-white/10 pb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#11C7D9]">{reservation.reference}</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-[#F8F4E8] sm:text-6xl">Your {requestLabel}</h1>
            <p className="mt-4 text-lg text-[#F8F4E8]/68">Prepared for {reservation.customer.name}</p>
          </div>
          <div className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-bold ${paid ? 'bg-emerald-400/15 text-emerald-200' : 'bg-[#11C7D9]/12 text-[#8fe8f1]'}`}>
            {paid ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Clock3 className="mr-2 h-4 w-4" />}{statusLabel[reservation.status] || reservation.status}
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            {quote?.customer_message && <section className="rounded-xl bg-[#0a2a34] p-6"><h2 className="font-bold text-[#F8F4E8]">Message from Action Divers</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-[#F8F4E8]/72">{quote.customer_message}</p></section>}

            <section>
              <h2 className="text-2xl font-extrabold text-[#F8F4E8]">{reservation.requestKind === 'course' ? 'Course details' : reservation.requestKind === 'transfer' ? 'Transfer details' : 'Trip details'}</h2>
              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {(quoteItems.length ? quoteItems : (data.items || []).map((item) => ({ id: item.id, label: item.name_snapshot, service_date: item.requested_date, quantity: item.adults + item.children, unit_price_cents: 0, line_total_cents: 0, notes: `${item.adults} adults · ${item.children} children` }))).map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between">
                    <div><h3 className="font-bold text-[#F8F4E8]">{item.label}</h3>{item.notes && <p className="mt-1 text-sm text-[#F8F4E8]/60">{item.notes}</p>}<p className="mt-2 inline-flex items-center text-sm text-[#11C7D9]"><CalendarDays className="mr-2 h-4 w-4" />{item.service_date ? formatDate(item.service_date) : 'Date to be confirmed'}</p></div>
                    {quote && <div className="text-left sm:text-right"><p className="font-bold text-[#F8F4E8]">{formatUsd(item.line_total_cents)}</p>{item.quantity > 1 && <p className="text-xs text-[#F8F4E8]/50">{item.quantity} × {formatUsd(item.unit_price_cents)}</p>}</div>}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-extrabold text-[#F8F4E8]">Guest information</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-5 border-y border-white/10 py-6 sm:grid-cols-2">
                <div><dt className="text-sm text-[#F8F4E8]/55">Party</dt><dd className="mt-1 font-bold text-[#F8F4E8]">{reservation.party.adults} adults, {reservation.party.children} children</dd></div>
                <div><dt className="text-sm text-[#F8F4E8]/55">Email</dt><dd className="mt-1 font-bold text-[#F8F4E8]">{reservation.customer.email}</dd></div>
                {reservation.customer.phone && <div><dt className="text-sm text-[#F8F4E8]/55">Phone</dt><dd className="mt-1 font-bold text-[#F8F4E8]">{reservation.customer.phone}</dd></div>}
                {reservation.accommodation && <div><dt className="text-sm text-[#F8F4E8]/55">Accommodation</dt><dd className="mt-1 font-bold text-[#F8F4E8]">{reservation.accommodation}</dd></div>}
              </dl>
            </section>
          </div>

          <aside>
            <div className="sticky top-28 rounded-2xl bg-[#06212a] p-7">
              {quote ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#11C7D9]"><LockKeyhole className="h-4 w-4" /> Final quote</div>
                  <div className="mt-6 space-y-3 border-y border-white/10 py-5 text-sm">
                    <div className="flex justify-between text-[#F8F4E8]/60"><span>Subtotal</span><span>{formatUsd(quote.subtotal_cents)}</span></div>
                    <div className="flex justify-between pt-2 text-lg font-extrabold text-[#F8F4E8]"><span>Total USD</span><span>{formatUsd(quote.total_cents)}</span></div>
                  </div>
                  {quote.expires_at && !paid && <p className="mt-4 text-sm text-[#F8F4E8]/55">Payment available through {formatDate(quote.expires_at)}.</p>}
                  {paid ? (
                    <div className="mt-6 rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mb-2 h-5 w-5" />Payment confirmed{payment?.paid_at ? ` on ${formatDate(payment.paid_at)}` : ''}.{payment?.receipt_reference && <span className="mt-2 block text-xs text-emerald-100/75">Receipt reference: {payment.receipt_reference}</span>}</div>
                  ) : data.paymentAvailable ? (
                    <button type="button" onClick={startPayment} disabled={starting} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-6 py-3 font-bold text-white transition-colors hover:bg-[var(--brand-orange-light)] disabled:opacity-60">{starting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}{starting ? 'Connecting securely…' : 'Continue to Belize Bank'}</button>
                  ) : (
                    <p className="mt-6 rounded-xl bg-white/5 p-4 text-sm leading-relaxed text-[#F8F4E8]/65">Payment is not currently available. Staff may still be reviewing the request, or this quote may have expired.</p>
                  )}
                </>
              ) : (
                <><Ship className="h-7 w-7 text-[#11C7D9]" /><h2 className="mt-4 text-xl font-extrabold text-[#F8F4E8]">Staff review in progress</h2><p className="mt-3 text-sm leading-relaxed text-[#F8F4E8]/65">No final quote has been sent yet. You will receive an email when Action Divers updates this reservation.</p></>
              )}
              {error && <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
              <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Question about ${reservation.reference}`)}`} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-[#F8F4E8]"><Mail className="mr-2 h-4 w-4" /> Email about this reservation</a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;
