import React, { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { API, buildWhatsAppUrl } from '../config';
import { useBooking } from '../contexts/BookingContext';
import { belizeDateAfter, estimateBookingItemCents, formatUsd, hasMainlandDateConflict } from '../shared/bookingCatalog';

interface SubmissionResult {
  ok?: boolean;
  reference?: string;
  portalUrl?: string;
  emailStatus?: string;
  error?: string;
}

const Reservations: React.FC = () => {
  const { catalog, items, addItem, removeItem, setRequestedDate, setParticipants, setDetails, setAllParticipants, clearCart, catalogOnline } = useBooking();
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [accommodation, setAccommodation] = useState('');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const estimate = useMemo(() => items.reduce((sum, item) => sum + estimateBookingItemCents(item, item.participantAdults + item.participantChildren, item.details), 0), [items]);
  const datesComplete = items.every((item) => item.requestedDate >= belizeDateAfter(item.noticeDays));
  const mainlandDatesValid = !hasMainlandDateConflict(items);
  const participantsComplete = items.every((item) => item.participantAdults >= 0 && item.participantChildren >= 0 && item.participantAdults + item.participantChildren > 0 && item.participantAdults <= adults && item.participantChildren <= children && (!item.maxParticipants || item.participantAdults + item.participantChildren <= item.maxParticipants));
  const detailsComplete = items.every((item) => {
    if (item.serviceKind === 'recreational_dive') return Boolean(item.details.certificationLevel && item.details.lastDiveDate);
    return true;
  });
  const availableCatalogItems = useMemo(() => catalog.items.filter((item) => item.active && (item.category === 'Island' || item.category === 'Mainland') && !items.some((cartItem) => cartItem.catalogItemId === item.id)).sort((a, b) => a.sortOrder - b.sortOrder), [catalog.items, items]);
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
    if (!items.length || !datesComplete || !participantsComplete || !detailsComplete || !mainlandDatesValid) {
      setError(mainlandDatesValid ? 'Complete each experience, including a date at least seven days away and any required diving or transfer details.' : 'Choose a different date for each mainland adventure. Only one mainland tour can be scheduled per day.');
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
          notes,
          company,
          items: items.map((item) => ({ catalogItemId: item.catalogItemId, requestedDate: item.requestedDate, adults: item.participantAdults, children: item.participantChildren, details: item.details })),
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
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#F8F4E8]/70">Choose dates at least seven days in advance for each experience. This is a request—not an instant booking. Staff confirms availability and sends the final quote before payment.</p>
      </header>

      {!catalogOnline && (
        <div className="mt-8 flex max-w-3xl gap-3 rounded-xl bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Live reservation service is currently unavailable. You can still review the cart and contact Action Divers through the WhatsApp fallback below.</p>
        </div>
      )}

      <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <section className="border-b border-white/10 pb-9">
              <h2 className="text-2xl font-extrabold text-[#F8F4E8]">How many people are traveling?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F8F4E8]/60">Enter everyone in the group first. You can choose which adults and children join each tour afterward.</p>
              <div className="mt-6 grid max-w-lg grid-cols-2 gap-4">
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Total adults<input required type="number" min={1} max={40} value={adults} onChange={(event) => setAdults(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Total children<input type="number" min={0} max={40} value={children} onChange={(event) => setChildren(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
              </div>
            </section>
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
                      return choices.length ? <optgroup key={category} label={`${category} adventures`}>{choices.map((item) => <option key={item.id} value={item.id}>{item.name} — {formatUsd(item.priceCents)}{item.maxParticipants ? ` · max ${item.maxParticipants} guests` : ''}</option>)}</optgroup> : null;
                    })}
                  </select>
                </label>
                <button type="button" onClick={addSelectedExperience} disabled={!selectedCatalogId} className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-[#11C7D9] px-5 font-bold text-[#001219] transition-colors hover:bg-[#42D6E3] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="mr-2 h-5 w-5" /> Add experience</button>
              </div>
              <div className="flex flex-col gap-4 border-b border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div><h3 className="text-sm font-bold text-[#F8F4E8]">Tour participation</h3><p className="mt-1 text-sm leading-relaxed text-[#F8F4E8]/55">Start every tour with the full group, then adjust exceptions below.</p></div>
                <button type="button" onClick={() => setAllParticipants(adults, children)} disabled={!items.length} className="min-h-11 shrink-0 rounded-lg bg-[#0d3943] px-5 text-sm font-bold text-[#D9EEF1] transition-colors hover:bg-[#124852] disabled:cursor-not-allowed disabled:opacity-40">Apply total party to all tours</button>
              </div>
              {items.length === 0 && <div className="border-b border-white/10 py-9 text-center"><h3 className="text-lg font-bold text-[#F8F4E8]">Start with any experience above.</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#F8F4E8]/60">You can add island and mainland activities here without opening their individual pages.</p></div>}
              <div className="divide-y divide-white/10">
                {items.map((item) => (
                  <div key={item.catalogItemId} className="grid gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_180px_170px_44px] sm:items-end">
                    <div>
                      <h3 className="font-bold text-[#F8F4E8]">{item.name}</h3>
                      <p className="mt-2 text-sm text-[#F8F4E8]/60">{formatUsd(item.priceCents)} · {item.pricingBasis === 'per_group' ? 'group rate' : item.pricingBasis === 'tiered_transfer' ? 'starting one-way rate' : 'per person'}{item.minimumPaidParticipants ? ` · minimum charge ${item.minimumPaidParticipants}` : ''}{item.maxParticipants ? ` · maximum ${item.maxParticipants} guests` : ''}{item.priceStatus === 'proposed' ? ' · proposed, staff confirmation required' : ''}</p>
                    </div>
                    <label className="block text-sm font-semibold text-[#F8F4E8]/75">
                      Requested date
                      <input type="date" min={belizeDateAfter(item.noticeDays)} required value={item.requestedDate} onChange={(event) => setRequestedDate(item.catalogItemId, event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-4 text-[#F8F4E8] [color-scheme:dark] outline-none focus:border-[#11C7D9]" />
                    </label>
                    <fieldset><legend className="text-sm font-semibold text-[#F8F4E8]/75">Who is joining?</legend><div className="mt-2 grid grid-cols-2 gap-2"><label className="text-xs text-[#F8F4E8]/60">Adults<input aria-label={`${item.name} adults`} type="number" min={0} max={Math.min(adults, Math.max(0, (item.maxParticipants ?? 80) - item.participantChildren))} value={item.participantAdults} onChange={(event) => setParticipants(item.catalogItemId, Math.min(Math.max(0, Number(event.target.value)), adults, Math.max(0, (item.maxParticipants ?? 80) - item.participantChildren)), item.participantChildren)} className="mt-1 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-3 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label><label className="text-xs text-[#F8F4E8]/60">Children<input aria-label={`${item.name} children`} type="number" min={0} max={Math.min(children, Math.max(0, (item.maxParticipants ?? 80) - item.participantAdults))} value={item.participantChildren} onChange={(event) => setParticipants(item.catalogItemId, item.participantAdults, Math.min(Math.max(0, Number(event.target.value)), children, Math.max(0, (item.maxParticipants ?? 80) - item.participantAdults)))} className="mt-1 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-3 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label></div></fieldset>
                    <button type="button" onClick={() => removeItem(item.catalogItemId)} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#F8F4E8]/55 transition-colors hover:bg-red-500/10 hover:text-red-300" aria-label={`Remove ${item.name}`}><Trash2 className="h-5 w-5" /></button>
                    {item.serviceKind === 'recreational_dive' && <div className="grid gap-4 sm:col-span-4 sm:grid-cols-2">
                      <label className="text-sm font-semibold text-[#F8F4E8]/75">Certification level<input required value={item.details.certificationLevel ?? ''} onChange={(event) => setDetails(item.catalogItemId, { certificationLevel: event.target.value })} placeholder="Required" className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                      <label className="text-sm font-semibold text-[#F8F4E8]/75">Last dive date<input type="date" required max={belizeDateAfter(0)} value={item.details.lastDiveDate ?? ''} onChange={(event) => setDetails(item.catalogItemId, { lastDiveDate: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-4 text-[#F8F4E8] [color-scheme:dark] outline-none focus:border-[#11C7D9]" /></label>
                    </div>}
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-white/10 pt-9">
              <h2 className="text-2xl font-extrabold text-[#F8F4E8]">Guest and trip details</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#F8F4E8]/60">Tell us who to contact and anything staff should know when reviewing the request.</p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Phone (optional)<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
                <label className="text-sm font-semibold text-[#F8F4E8]/75">Hotel or villa<input autoComplete="off" value={accommodation} onChange={(event) => setAccommodation(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#06212a] p-4 text-[#F8F4E8] outline-none focus:border-[#11C7D9]" /></label>
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
              <p className="mt-5 text-sm leading-relaxed text-[#F8F4E8]/60">This estimate is not charged today. It applies minimum paid-participant rules where shown. Staff will confirm availability and final quote-line quantities.</p>
              {error && <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
              {!participantsComplete && items.length > 0 && <p className="mt-5 rounded-xl bg-amber-400/10 p-3 text-sm leading-relaxed text-amber-100">Each experience needs at least one participant, without exceeding the overall adult and child totals.</p>}
              {!mainlandDatesValid && <p className="mt-5 rounded-xl bg-amber-400/10 p-3 text-sm leading-relaxed text-amber-100">Only one mainland adventure can be scheduled per day. Choose a different requested date for one of the mainland tours.</p>}
              <button disabled={submitting || !items.length || !datesComplete || !participantsComplete || !detailsComplete || !mainlandDatesValid} className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-6 py-4 font-bold text-white transition-colors hover:bg-[var(--brand-orange-light)] disabled:cursor-not-allowed disabled:opacity-50">
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
