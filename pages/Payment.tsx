import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, CreditCard, Loader2, LockKeyhole, MessageCircle, ShieldCheck, TriangleAlert } from 'lucide-react';
import SEO from '../components/SEO';
import { API, buildWhatsAppUrl } from '../config';

interface PaymentDetails {
  reference: string;
  customerName: string;
  description: string;
  amount: string;
  currency: 'USD';
  status: string;
  expiresAt: string;
  paidAt: string | null;
}

interface PaymentResponse {
  ok: boolean;
  payment?: PaymentDetails;
  redirectUrl?: string;
  error?: string;
}

const DEV_PAYMENT: PaymentDetails = {
  reference: 'AD-PREVIEW-001',
  customerName: 'Guest Preview',
  description: 'Confirmed Action Divers tour reservation',
  amount: '450.00',
  currency: 'USD',
  status: 'created',
  expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  paidAt: null,
};

function isGatewayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'belizebank.com' ||
        url.hostname.endsWith('.belizebank.com') ||
        url.hostname === 'radarpayment.online' ||
        url.hostname.endsWith('.radarpayment.online'))
    );
  } catch {
    return false;
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));
}

function statusMessage(status: string): { title: string; body: string; tone: 'success' | 'warning' | 'neutral' } {
  switch (status) {
    case 'paid':
      return { title: 'Payment confirmed', body: 'Your full payment has been verified with Belize Bank.', tone: 'success' };
    case 'declined':
      return { title: 'Payment declined', body: 'No payment was confirmed. You can try again or contact us for help.', tone: 'warning' };
    case 'cancelled':
      return { title: 'Payment cancelled', body: 'This payment was cancelled before completion.', tone: 'warning' };
    case 'refunded':
      return { title: 'Payment refunded', body: 'Belize Bank reports that this payment has been refunded.', tone: 'neutral' };
    case 'expired':
      return { title: 'Payment link expired', body: 'Please contact Action Divers for a new confirmed payment link.', tone: 'warning' };
    case 'review_required':
      return { title: 'Staff review required', body: 'Please contact Action Divers before attempting this payment again.', tone: 'warning' };
    case 'authentication_required':
      return { title: 'Bank verification in progress', body: 'Complete any verification requested by Belize Bank.', tone: 'neutral' };
    default:
      return { title: 'Ready for secure payment', body: 'Review the confirmed amount before continuing to Belize Bank.', tone: 'neutral' };
  }
}

const PaymentShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-[calc(100vh-5rem)] bg-[#001219] px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
    <SEO
      title="Secure Tour Payment"
      description="Review a private Action Divers reservation payment request."
      path="/pay"
      noindex
    />
    <div className="mx-auto max-w-6xl">{children}</div>
  </div>
);

const LoadingState = () => (
  <PaymentShell>
    <div className="flex min-h-[50vh] items-center justify-center text-[#F8F4E8]">
      <Loader2 className="mr-3 h-6 w-6 animate-spin text-[#11C7D9]" />
      <span className="text-lg">Loading your confirmed payment…</span>
    </div>
  </PaymentShell>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <PaymentShell>
    <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#06212a] p-8 text-center sm:p-12">
      <TriangleAlert className="mx-auto h-10 w-10 text-[var(--brand-orange)]" />
      <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.03em] text-[#F8F4E8]">Payment link unavailable</h1>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-[#F8F4E8]/75">{message}</p>
      <a
        href={buildWhatsAppUrl('Hi Action Divers! I need help with my reservation payment link.')}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white transition-colors hover:bg-[#20bd5a]"
      >
        <MessageCircle className="h-5 w-5" /> Contact us on WhatsApp
      </a>
    </div>
  </PaymentShell>
);

export const PaymentPage: React.FC = () => {
  const { token = '' } = useParams();
  const isPreview = import.meta.env.DEV && token === 'preview';
  const [payment, setPayment] = useState<PaymentDetails | null>(isPreview ? DEV_PAYMENT : null);
  const [loading, setLoading] = useState(!isPreview);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPreview) return;
    let active = true;
    fetch(API.url(`/payments/${encodeURIComponent(token)}`))
      .then(async (response) => {
        const data = (await response.json()) as PaymentResponse;
        if (!response.ok || !data.payment) throw new Error(data.error || 'This payment link could not be loaded.');
        if (active) setPayment(data.payment);
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : 'This payment link could not be loaded.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isPreview, token]);

  const startPayment = async () => {
    if (isPreview) {
      setError('This is a local visual preview. Connect the sandbox Worker before starting a bank payment.');
      return;
    }
    setStarting(true);
    setError('');
    try {
      const response = await fetch(API.url(`/payments/${encodeURIComponent(token)}/start`), { method: 'POST' });
      const data = (await response.json()) as PaymentResponse;
      if (!response.ok || !data.redirectUrl || !isGatewayUrl(data.redirectUrl)) {
        throw new Error(data.error || 'Belize Bank could not start this payment.');
      }
      window.location.assign(data.redirectUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Belize Bank could not start this payment.');
      setStarting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!payment) return <ErrorState message={error || 'This payment link is invalid or has expired.'} />;

  const message = statusMessage(payment.status);
  const canPay = ['created', 'registration_failed', 'awaiting_payment', 'declined', 'cancelled'].includes(payment.status);

  return (
    <PaymentShell>
      <div className="grid overflow-hidden rounded-2xl bg-[#06212a] lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative min-h-[300px] overflow-hidden lg:min-h-[650px]">
          <img
            src="/images/gallery/Three-of-a-Kind-boat-1.png"
            alt="Action Divers boat and guests on the Belize Barrier Reef"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001219] via-[#001219]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
            <div className="flex items-center gap-3 text-[#F8F4E8]">
              <ShieldCheck className="h-6 w-6 text-[#11C7D9]" />
              <p className="max-w-sm text-sm font-semibold leading-relaxed">Card details are entered only on Belize Bank’s secure hosted payment page.</p>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-10 lg:p-14">
          <div className="flex items-center gap-3 text-sm font-bold text-[#11C7D9]">
            <LockKeyhole className="h-4 w-4" /> Private reservation payment
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] sm:text-5xl text-balance">Review and pay</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#F8F4E8]/72">This amount was prepared for your confirmed Action Divers reservation. Check the details before continuing.</p>

          <div className="mt-9 border-y border-white/10 py-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F8F4E8]/60">Reservation for</p>
                <p className="mt-1 text-xl font-bold text-[#F8F4E8]">{payment.customerName}</p>
              </div>
              <p className="text-sm font-bold text-[#11C7D9]">{payment.reference}</p>
            </div>
            <p className="mt-6 leading-relaxed text-[#F8F4E8]/78">{payment.description}</p>
          </div>

          <div className="flex items-end justify-between gap-6 border-b border-white/10 py-7">
            <div>
              <p className="text-sm font-semibold text-[#F8F4E8]/60">Full payment</p>
              <p className="mt-1 text-sm text-[#F8F4E8]/55">Due by {formatDate(payment.expiresAt)}</p>
            </div>
            <p className="text-right text-4xl font-extrabold tracking-[-0.03em] text-[#F8F4E8]">
              ${payment.amount} <span className="text-sm tracking-normal text-[#F8F4E8]/60">USD</span>
            </p>
          </div>

          <div className="mt-7 flex gap-3">
            {message.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" /> : <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#11C7D9]" />}
            <div>
              <p className="font-bold text-[#F8F4E8]">{message.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#F8F4E8]/65">{message.body}</p>
            </div>
          </div>

          {error && <p role="alert" className="mt-6 rounded-xl bg-[var(--brand-orange)]/12 px-4 py-3 text-sm leading-relaxed text-[#F8F4E8]">{error}</p>}

          {canPay && (
            <button
              type="button"
              onClick={startPayment}
              disabled={starting}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[var(--brand-orange)] px-6 py-4 font-bold text-white transition-colors hover:bg-[var(--brand-orange-light)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
              {starting ? 'Connecting securely…' : 'Continue to Belize Bank'}
              {!starting && <ArrowRight className="h-5 w-5" />}
            </button>
          )}
          <p className="mt-4 text-center text-xs leading-relaxed text-[#F8F4E8]/50">Action Divers never receives or stores your card number or security code.</p>
        </div>
      </div>
    </PaymentShell>
  );
};

export const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const isPreview = import.meta.env.DEV && token === 'preview-paid';
  const [payment, setPayment] = useState<PaymentDetails | null>(isPreview ? { ...DEV_PAYMENT, status: 'paid', paidAt: new Date().toISOString() } : null);
  const [loading, setLoading] = useState(!isPreview);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPreview) return;
    let active = true;
    const verify = async () => {
      try {
        const response = await fetch(API.url(`/payments/${encodeURIComponent(token)}/refresh`), { method: 'POST' });
        const data = (await response.json()) as PaymentResponse;
        if (!response.ok || !data.payment) throw new Error(data.error || 'Payment status is not available yet.');
        if (active) setPayment(data.payment);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Payment status is not available yet.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [isPreview, token]);

  if (loading) return <LoadingState />;
  if (!payment) return <ErrorState message={error || 'We could not verify this payment yet.'} />;
  const message = statusMessage(payment.status);

  return (
    <PaymentShell>
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#06212a] p-8 text-center sm:p-12">
        {payment.status === 'paid' ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-400" />
        ) : (
          <Clock3 className="mx-auto h-14 w-14 text-[#11C7D9]" />
        )}
        <h1 className="mt-7 text-4xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] text-balance">{message.title}</h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-[#F8F4E8]/72">{message.body}</p>
        <div className="mt-8 border-y border-white/10 py-6">
          <div className="flex justify-between gap-6 text-left">
            <span className="text-[#F8F4E8]/60">Reservation</span>
            <span className="font-bold text-[#F8F4E8]">{payment.reference}</span>
          </div>
          <div className="mt-4 flex justify-between gap-6 text-left">
            <span className="text-[#F8F4E8]/60">Amount</span>
            <span className="font-bold text-[#F8F4E8]">${payment.amount} USD</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={isPreview ? '/pay/preview' : `/reservation/${encodeURIComponent(token)}`} className="rounded-full bg-[#F8F4E8] px-6 py-3 font-bold text-[#001219] transition-colors hover:bg-white">Return to reservation</Link>
          <a
            href={buildWhatsAppUrl(`Hi Action Divers! I have a question about payment ${payment.reference}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 px-6 py-3 font-bold text-[#F8F4E8] transition-colors hover:border-white/40"
          >
            Contact Action Divers
          </a>
        </div>
      </div>
    </PaymentShell>
  );
};
