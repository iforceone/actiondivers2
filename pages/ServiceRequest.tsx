import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, MessageCircle, TriangleAlert } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { API, buildWhatsAppUrl } from '../config';
import { useBooking } from '../contexts/BookingContext';
import { belizeDateAfter, BookingItemDetails, estimateBookingItemCents, formatUsd } from '../shared/bookingCatalog';
import { liveReservationRequestsEnabled, reservationUnavailableMessage } from '../utils/requestAvailability';

type RequestMode = 'course' | 'transfer';
interface Result { reference?: string; portalUrl?: string; emailStatus?: string; error?: string }

const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#06212a] px-4 py-3 text-[#F8F4E8] outline-none transition-colors focus:border-[#11C7D9]';
const labelClass = 'text-sm font-semibold text-[#F8F4E8]/78';

const ServiceRequest: React.FC<{ mode: RequestMode }> = ({ mode }) => {
  const { catalog } = useBooking();
  const [searchParams] = useSearchParams();
  const options = useMemo(() => catalog.items.filter((item) => item.active && item.category === (mode === 'course' ? 'Course' : 'Transfer')).sort((a, b) => a.sortOrder - b.sortOrder), [catalog.items, mode]);
  const initialId = options.some((item) => item.id === searchParams.get('course')) ? searchParams.get('course')! : options[0]?.id ?? '';
  const [catalogItemId, setCatalogItemId] = useState(initialId);
  const selected = options.find((item) => item.id === catalogItemId) ?? options[0];
  const [requestedDate, setRequestedDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [details, setDetails] = useState<BookingItemDetails>(mode === 'transfer' ? { transferTrip: 'one_way' } : {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const partySize = adults + children;
  const estimate = selected ? estimateBookingItemCents(selected, partySize, details) : 0;
  const updateDetails = (change: Partial<BookingItemDetails>) => setDetails((current) => ({ ...current, ...change }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || requestedDate < belizeDateAfter(selected.noticeDays) || partySize < 1) return setError('Choose a valid service, party size, and date at least seven days away.');
    if (mode === 'course' && selected.id === 'course-referral' && details.referralDocuments === undefined) return setError('Select your referral-document status.');
    if (mode === 'transfer' && (!details.arrivalTime || !details.destination || (details.transferTrip === 'round_trip' && (!details.returnDate || !details.returnTime)))) return setError('Complete the transfer direction, time, destination, and any return details.');
    if (!liveReservationRequestsEnabled) return setError(reservationUnavailableMessage);
    setSubmitting(true); setError('');
    try {
      const response = await fetch(API.url('/reservations'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ customer: { name, email, phone }, adults, children, accommodation, notes, company, items: [{ catalogItemId: selected.id, requestedDate, adults, children, details }] }) });
      const body = await response.json() as Result;
      if (!response.ok || !body.reference) throw new Error(body.error || 'Your request could not be saved.');
      setResult(body);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your request could not be saved.'); }
    finally { setSubmitting(false); }
  };

  const heading = mode === 'course' ? 'Request a scuba course.' : 'Request a private transfer.';
  const backPath = mode === 'course' ? '/courses' : '/transfers-charters';
  const whatsapp = buildWhatsAppUrl(`Hi Action Divers! I need help with a ${mode} request${selected ? ` for ${selected.name}` : ''}${requestedDate ? ` on ${requestedDate}` : ''}. Party: ${adults} adults, ${children} children.`);

  if (result?.reference) return <main className="flex min-h-[78vh] items-center px-5 pb-24 pt-36"><SEO title="Request Received" description="Your private Action Divers request." path={mode === 'course' ? '/courses/request' : '/transfers-charters/request'} noindex /><div className="mx-auto max-w-2xl text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-[#11C7D9]" /><h1 className="mt-7 text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">Your request is in.</h1><p className="mt-5 text-lg text-[#F8F4E8]/72">Reference <strong>{result.reference}</strong>. Staff will review the details and email you before any payment is requested.</p>{result.portalUrl && <a href={result.portalUrl} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[var(--brand-orange)] px-7 font-bold text-white">View request</a>}</div></main>;

  return <main className="mx-auto max-w-6xl px-5 pb-28 pt-32 sm:px-8 lg:pt-40">
    <SEO title={mode === 'course' ? 'Request a Scuba Course' : 'Request a Belize Boat Transfer'} description={mode === 'course' ? 'Send Action Divers a dedicated scuba course request.' : 'Send Action Divers your private boat transfer details for staff confirmation.'} path={mode === 'course' ? '/courses/request' : '/transfers-charters/request'} noindex />
    <Link to={backPath} className="inline-flex items-center text-sm font-bold text-[#8DE7EF]"><ArrowLeft className="mr-2 h-4 w-4" /> Back to {mode === 'course' ? 'courses' : 'transfers'}</Link>
    <header className="mt-8 max-w-3xl"><h1 className="text-5xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] sm:text-7xl">{heading}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#F8F4E8]/70">This is a dedicated {mode} request—not a tour-cart item. Requests require at least seven days’ advance notice. Staff will confirm availability, details, and the final price.</p></header>
    {!liveReservationRequestsEnabled && <div role="status" className="mt-8 flex max-w-3xl items-start gap-3 rounded-xl bg-[#11C7D9]/10 px-5 py-4 text-sm leading-relaxed text-[#C8F5F8]"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#11C7D9]" aria-hidden="true" /><p><strong>Preview mode:</strong> complete the details here, then send the request through WhatsApp. Nothing will be submitted to a live reservation system.</p></div>}
    <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-9">
        <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>{mode === 'course' ? 'Course' : 'Transfer service'}<select value={selected?.id ?? ''} onChange={(event) => { const next = options.find((item) => item.id === event.target.value); setCatalogItemId(event.target.value); setDetails(mode === 'transfer' ? { transferTrip: 'one_way' } : {}); if (next?.maxParticipants && partySize > next.maxParticipants) { const nextAdults = Math.min(Math.max(1, adults), next.maxParticipants); setAdults(nextAdults); setChildren(Math.max(0, next.maxParticipants - nextAdults)); } }} className={fieldClass}>{options.map((item) => <option key={item.id} value={item.id}>{item.name} — {formatUsd(item.priceCents)}</option>)}</select></label>
          <label className={labelClass}>{mode === 'course' ? 'Preferred start date' : 'Outbound date'}<input required type="date" min={belizeDateAfter(selected?.noticeDays ?? 7)} value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} className={`${fieldClass} [color-scheme:dark]`} /></label>
          <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Adults<input required type="number" min={1} max={Math.max(1, (selected?.maxParticipants ?? 80) - children)} value={adults} onChange={(event) => setAdults(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, (selected?.maxParticipants ?? 80) - children)))} className={fieldClass} /></label><label className={labelClass}>Children<input type="number" min={0} max={Math.max(0, (selected?.maxParticipants ?? 80) - adults)} value={children} onChange={(event) => setChildren(Math.min(Math.max(0, Number(event.target.value) || 0), Math.max(0, (selected?.maxParticipants ?? 80) - adults)))} className={fieldClass} /></label></div>
        </section>

        {mode === 'course' ? <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2"><label className={labelClass}>Current certification level<input value={details.certificationLevel ?? ''} onChange={(event) => updateDetails({ certificationLevel: event.target.value })} placeholder="Not certified, Open Water, etc." className={fieldClass} /></label><label className={labelClass}>Last dive date (if applicable)<input type="date" max={belizeDateAfter(0)} value={details.lastDiveDate ?? ''} onChange={(event) => updateDetails({ lastDiveDate: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label>{selected?.id === 'course-referral' && <label className={`${labelClass} sm:col-span-2`}>Referral-document status<select required value={details.referralDocuments === undefined ? '' : details.referralDocuments ? 'ready' : 'not-ready'} onChange={(event) => updateDetails({ referralDocuments: event.target.value === 'ready' })} className={fieldClass}><option value="">Select status</option><option value="ready">Documents ready to share</option><option value="not-ready">Documents not ready</option></select></label>}</section> : <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2"><label className={labelClass}>Direction<select value={details.transferTrip ?? 'one_way'} onChange={(event) => updateDetails({ transferTrip: event.target.value as 'one_way' | 'round_trip' })} className={fieldClass}><option value="one_way">One way</option><option value="round_trip">Round trip</option></select></label><label className={labelClass}>Flight or pickup time<input required type="time" value={details.arrivalTime ?? ''} onChange={(event) => updateDetails({ arrivalTime: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Airline and flight number<input value={details.flightNumber ?? ''} onChange={(event) => updateDetails({ flightNumber: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Destination<input required value={details.destination ?? ''} onChange={(event) => updateDetails({ destination: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Luggage<input value={details.luggage ?? ''} onChange={(event) => updateDetails({ luggage: event.target.value })} placeholder="Bags or oversized items" className={fieldClass} /></label><label className={labelClass}>Special requirements<input value={details.specialRequirements ?? ''} onChange={(event) => updateDetails({ specialRequirements: event.target.value })} className={fieldClass} /></label>{details.transferTrip === 'round_trip' && <><label className={labelClass}>Return date<input required type="date" min={requestedDate || belizeDateAfter(7)} value={details.returnDate ?? ''} onChange={(event) => updateDetails({ returnDate: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Return time<input required type="time" value={details.returnTime ?? ''} onChange={(event) => updateDetails({ returnTime: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Return airline and flight<input value={details.returnFlightNumber ?? ''} onChange={(event) => updateDetails({ returnFlightNumber: event.target.value })} className={fieldClass} /></label></>}</section>}

        <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2"><label className={labelClass}>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Phone (optional)<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Hotel or villa<input value={accommodation} onChange={(event) => setAccommodation(event.target.value)} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Additional notes<textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} className={`${fieldClass} resize-y`} /></label><input tabIndex={-1} aria-hidden="true" autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} className="absolute left-[-9999px] h-px w-px" /></section>
      </div>
      <aside><div className="sticky top-28 rounded-2xl bg-[#06212a] p-6"><h2 className="text-xl font-extrabold">Request summary</h2><p className="mt-5 font-bold">{selected?.name ?? 'Select a service'}</p>{selected?.description && <p className="mt-2 text-sm leading-relaxed text-[#F8F4E8]/65">{selected.description}</p>}{selected && (selected.minimumPaidParticipants || selected.maxParticipants) && <p className="mt-2 text-sm leading-relaxed text-[#F8F4E8]/65">{selected.minimumPaidParticipants ? `Minimum billed guests: ${selected.minimumPaidParticipants}.` : ''}{selected.minimumPaidParticipants && selected.maxParticipants ? ' ' : ''}{selected.maxParticipants ? `Maximum guests: ${selected.maxParticipants}.` : ''}</p>}<div className="mt-5 flex justify-between border-y border-white/10 py-4 text-sm"><span className="text-[#F8F4E8]/65">Starting estimate</span><strong>{formatUsd(estimate)}</strong></div><p className="mt-4 text-sm leading-relaxed text-[#F8F4E8]/58">This is an estimate only. Staff confirms availability, billable quantities, and the final price.</p>{mode === 'transfer' && <p className="mt-3 text-sm leading-relaxed text-[#F8F4E8]/58">Transfer pricing is proposed and subject to staff confirmation.</p>}{error && <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}<button disabled={submitting || !selected} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 font-bold text-white disabled:opacity-45">{submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…</> : liveReservationRequestsEnabled ? `Send ${mode} request` : 'Check request details'}</button><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold"><MessageCircle className="mr-2 h-5 w-5" /> Send through WhatsApp</a></div></aside>
    </form>
  </main>;
};

export default ServiceRequest;
