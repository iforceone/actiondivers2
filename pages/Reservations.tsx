import React, { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { API, buildWhatsAppUrl } from '../config';
import { useBooking } from '../contexts/BookingContext';
import { formatUsd } from '../shared/bookingCatalog';

interface SubmissionResult {
  ok?: boolean;
  reference?: string;
  portalUrl?: string;
  emailStatus?: string;
  error?: string;
}

const today = new Date().toISOString().slice(0, 10);

const Reservations: React.FC = () => {
  const { catalog, items, addItem, removeItem, setRequestedDate, setParticipants, setAllRequestedDates, setAllParticipants, clearCart, catalogOnline } = useBooking();
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [sharedDate, setSharedDate] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [accommodation, setAccommodation] = useState('');
  const [divingExperience, setDivingExperience] = useState('');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const estimate = useMemo(() => items.reduce((sum, item) => sum + item.priceCents * (item.pricingBasis === 'per_person' ? item.participantAdults + item.participantChildren : 1), 0), [items]);
  const datesComplete = items.every((item) => item.requestedDate);
  const participantsComplete = items.every((item) => item.participantAdults >= 0 && item.participantChildren >= 0 && item.participantAdults + item.participantChildren > 0 && item.participantAdults <= adults && item.participantChildren <= children);
  const availableCatalogItems = useMemo(() => catalog.items.filter((item) => item.active && !items.some((cartItem) => cartItem.catalogItemId === item.id)).sort((a, b) => a.sortOrder - b.sortOrder), [catalog.items, items]);
  const addSelectedExperience = () => {
    const selected = availableCatalogItems.find((item) => item.id === selectedCatalogId);
    if (!selected) return;
    addItem(selected, { adults, children });
    setSelectedCatalogId('');
    setError('');
  };

  const whatsappMessage = `Hi Action Divers! I would like help with a reservation:\n${items.map((item) => `• ${item.name}${item.requestedDate ? ` — ${item.requestedDate}` : ''} (${item.participantAdults} adults, ${item.participantChildren} children)`).join('\n') || '• I am still deciding'}\nParty: ${adults} adults, ${children} children${name ? `\nName: ${name}` : ''}`;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!items.length || !datesComplete || !participantsComplete) {
      setError('Choose at least one tour, a requested date, and who is joining each experience. Tour participants cannot exceed the overall party size.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(API.url('/reservations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          customer: { name, email, phone },
          adults,
          children,
          accommodation,
          divingExperience,
          notes,
          company,
          items: items.map((item) => ({ catalogItemId: item.catalogItemId, requestedDate: item.requestedDate, adults: item.participantAdults, children: item.participantChildren })),
        }),
      });
      const body = await response.json() as SubmissionResult;
      if (!response.ok || !body.reference) throw new Error(body.error || 'Your request could not be saved.');
      setResult(body);
      clearCart();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your request could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.reference) {
    return (
      <section className="flex min-h-[78vh] items-center px-4 pb-24 pt-36 sm:px-6">
        <SEO title="Reservation Request Received" description="Your private Action Divers reservation request." path="/reservations" noindex />
        <div className="mx-auto max-w-2xl text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#11C7D9]" />
          <h1 className="mt-7 text-4xl font-extrabold tracking-[-0.03em] text-[#F8F4E8] sm:text-6xl">Your request is in.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#F8F4E8]/72">
            Reference <strong className="text-[#F8F4E8]">{result.reference}</strong>. Staff will review availability and email you before any payment is requested.
          </p>
          {result.emailStatus === 'failed' && (
            <p className="mt-6 rounded-xl bg-amber-400/10 p-4 text-sm text-amber-100">The reservation was saved, but the acknowledgement email could not be delivered. Keep the reference above.</p>
          )}
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            {result.portalUrl && <a href={result.portalUrl} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-orange)] px-7 py-3 font-bold text-white">View Reservation</a>}
            <Link to="/island-adventures" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3 font-bold text-[#F8F4E8]">Explore More Tours</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-32 sm:px-6 lg:pt-40">
      <SEO title="Build Your Belize Trip" description="Add Belize tours, choose requested dates, and send Action Divers one organized reservation request." path="/reservations" />
      <header className="max-w-3xl">
        <p className="text-sm font-bold text-[#11C7D9]">Reservation request</p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] sm:text-7xl">Build your Belize trip.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#F8F4E8]/70">Choose dates for each experience. This is a request—not an instant booking. Staff confirms availability and sends the final quote before payment.</p>
      </header>

      {!catalogOnline && (
        <div className="mt-8 flex max-w-3xl gap-3 rounded-xl bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Live reservation service is currently unavailable. You can still review the cart and contact Action Divers through the WhatsApp fallback below.</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <section>
              <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#F8F4E8]">Requested experiences</h2>
                  <p className="mt-1 text-sm text-[#F8F4E8]/60">Choose a date and who is joining each experience.</p>
                </div>
                <span className="text-sm font-bold text-[#11C7D9]">{items.length} item{items.length === 1 ? '' : 's'}</span>
              </div>
              <div className="mt-6 flex flex-col gap-3 rounded-xl bg-[#06212a] p-4 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1 text-sm font-semibold text-[#F8F4E8]/75">
                  Choose an experience
                  <select value={selectedCatalogId} onChange={(event) => setSelectedCatalogId(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#031820] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]">
                    <option value="">Select a tour or activity</option>
                    {(['Island', 'Mainland'] as const).map((category) => {
                      const choices = availableCatalogItems.filter((item) => item.category === category);
                      return choices.length ? <optgroup key={category} label={`${category} adventures`}>{choices.map((item) => <option key={item.id} value={item.id}>{item.name} — {formatUsd(item.priceCents)}</option>)}</optgroup> : null;
                    })}
                  </select>
                </label>
                <button type="button" onClick={addSelectedExperience} disabled={!selectedCatalogId} className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-[#11C7D9] px-5 font-bold text-[#001219] transition-colors hover:bg-[#42D6E3] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="mr-2 h-5 w-5" /> Add experience</button>
              </div>
              <div className="grid gap-5 border-b border-white/10 py-5 lg:grid-cols-[minmax(180px,1fr)_310px_250px] lg:items-end">
                <div><h3 className="text-sm font-bold text-[#F8F4E8]">Quick fill</h3><p className="mt-1 max-w-sm text-sm leading-relaxed text-[#F8F4E8]/55">Apply common details, then adjust individual tours if needed.</p></div>
                <div><label htmlFor="shared-tour-date" className="text-sm font-semibold text-[#F8F4E8]/75">Same date for every tour</label><div className="mt-2 flex"><input id="shared-tour-date" type="date" min={today} value={sharedDate} onChange={(event) => setSharedDate(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-l-lg border border-r-0 border-white/15 bg-[#06212a] px-3 text-[#F8F4E8] [color-scheme:dark] outline-none focus:border-[#11C7D9]" /><button type="button" onClick={() => setAllRequestedDates(sharedDate)} disabled={!items.length || !sharedDate} className="min-h-11 shrink-0 rounded-r-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] transition-colors hover:bg-[#124852] disabled:cursor-not-allowed disabled:opacity-40">Set all dates</button></div></div>
                <div><p className="text-sm font-semibold text-[#F8F4E8]/75">Same guests for every tour</p><button type="button" onClick={() => setAllParticipants(adults, children)} disabled={!items.length} className="mt-2 min-h-11 w-full rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] transition-colors hover:bg-[#124852] disabled:cursor-not-allowed disabled:opacity-40">Apply {adults} adult{adults === 1 ? '' : 's'} + {children} child{children === 1 ? '' : 'ren'}</button></div>
              </div>
              {items.length === 0 && <div className="border-b border-white/10 py-9 text-center"><h3 className="text-lg font-bold text-[#F8F4E8]">Start with any experience above.</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#F8F4E8]/60">You can add island and mainland activities here without opening their individual pages.</p></div>}
              <div className="divide-y divide-white/10">
                {items.map((item) => (
                  <div key={item.catalogItemId} className="grid gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_180px_170px_44px] sm:items-end">
                    <div>
                      <h3 className="font-bold text-[#F8F4E8]">{item.name}</h3>
                      <p className="mt-2 text-sm text-[#F8F4E8]/60">{formatUsd(item.priceCents)} · {item.pricingBasis === 'per_group' ? 'group rate' : 'per person'} estimate</p>
                    </div>
                    <label className="block text-sm font-semibold text-[#F8F4E8]/75">
                      Requested date
                      <input type="date" min={today} required value={item.requestedDate} onChange={(event) => setRequestedDate(item.catalogItemId, event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-4 text-[#F8F4E8] [color-scheme:dark] outline-none focus:border-[#11C7D9]" />
                    </label>
                    <fieldset><legend className="text-sm font-semibold text-[#F8F4E8]/75">Who is joining?</legend><div className="mt-2 grid grid-cols-2 gap-2"><label className="text-xs text-[#F8F4E8]/60">Adults<input aria-label={`${item.name} adults`} type="number" min={0} max={adults} value={item.participantAdults} onChange={(event) => setParticipants(item.catalogItemId, Math.max(0, Number(event.target.value)), item.participantChildren)} className="mt-1 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-3 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label><label className="text-xs text-[#F8F4E8]/60">Children<input aria-label={`${item.name} children`} type="number" min={0} max={children} value={item.participantChildren} onChange={(event) => setParticipants(item.catalogItemId, item.participantAdults, Math.max(0, Number(event.target.value)))} className="mt-1 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-3 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label></div></fieldset>
                    <button type="button" onClick={() => removeItem(item.catalogItemId)} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#F8F4E8]/55 transition-colors hover:bg-red-500/10 hover:text-red-300" aria-label={`Remove ${item.name}`}><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-white/10 pt-9">
              <h2 className="text-2xl font-extrabold text-[#F8F4E8]">Guest and trip details</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#F8F4E8]/60">Enter the total number of people in the group, even if some guests will skip certain tours.</p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Phone (optional)<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Hotel or villa<input autoComplete="off" value={accommodation} onChange={(event) => setAccommodation(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Total adults<input required type="number" min={1} max={40} value={adults} onChange={(event) => setAdults(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Total children<input type="number" min={0} max={40} value={children} onChange={(event) => setChildren(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75 sm:col-span-2">Diving experience<select value={divingExperience} onChange={(event) => setDivingExperience(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]"><option value="">Not applicable / select one</option><option>First time / not certified</option><option>Certified beginner</option><option>Experienced certified diver</option><option>Training or refresher needed</option></select></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75 sm:col-span-2">Anything else we should know?<textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
              </div>
              <input tabIndex={-1} aria-hidden="true" autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} className="absolute left-[-9999px] h-px w-px" />
            </section>
          </div>

          <aside>
            <div className="sticky top-28 rounded-2xl bg-[#06212a] p-6 sm:p-8">
              <h2 className="text-xl font-extrabold text-[#F8F4E8]">Request summary</h2>
              <div className="mt-6 space-y-3 border-y border-white/10 py-5 text-sm">
                <div className="flex justify-between gap-4 text-[#F8F4E8]/65"><span>Experiences</span><span className="font-bold text-[#F8F4E8]">{items.length}</span></div>
                <div className="flex justify-between gap-4 text-[#F8F4E8]/65"><span>Starting estimate</span><span className="font-bold text-[#F8F4E8]">{formatUsd(estimate)}</span></div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-[#F8F4E8]/60">This estimate is not charged today. Staff will confirm availability, group pricing, fees, and discounts in the final quote.</p>
              {error && <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
              {!participantsComplete && items.length > 0 && <p className="mt-5 rounded-xl bg-amber-400/10 p-3 text-sm leading-relaxed text-amber-100">Each experience needs at least one participant, without exceeding the overall adult and child totals.</p>}
              <button disabled={submitting || !items.length || !datesComplete || !participantsComplete} className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-6 py-4 font-bold text-white transition-colors hover:bg-[var(--brand-orange-light)] disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving request…</> : 'Send reservation request'}
              </button>
              <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-[#F8F4E8]"><MessageCircle className="mr-2 h-5 w-5" /> WhatsApp fallback</a>
            </div>
          </aside>
      </form>
    </div>
  );
};

export default Reservations;
