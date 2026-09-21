import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { API } from '../config';
import { useBooking } from '../contexts/BookingContext';
import { belizeDateAfter, BookingItemDetails, estimateBookingItemCents, formatUsd, requiresRefresher } from '../shared/bookingCatalog';

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
  const [includeAfternoonDive, setIncludeAfternoonDive] = useState(false);
  const [diveAdults, setDiveAdults] = useState(1);
  const [diveChildren, setDiveChildren] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const partySize = adults + children;
  const afternoonDive = catalog.items.find((item) => item.active && item.id === 'dive-single');
  const isRefresher = mode === 'course' && selected?.id === 'course-refresher';
  const lastDiveNeedsRefresher = requiresRefresher(details.lastDiveDate ?? '');
  const afternoonDiveEstimate = isRefresher && includeAfternoonDive && afternoonDive
    ? estimateBookingItemCents(afternoonDive, diveAdults + diveChildren, details)
    : 0;
  const estimate = selected ? estimateBookingItemCents(selected, partySize, details) + afternoonDiveEstimate : 0;
  const updateDetails = (change: Partial<BookingItemDetails>) => setDetails((current) => ({ ...current, ...change }));

  useEffect(() => {
    setDiveAdults((current) => Math.min(current, adults));
    setDiveChildren((current) => Math.min(current, children));
  }, [adults, children]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || requestedDate < belizeDateAfter(selected.noticeDays) || partySize < 1) return setError('Choose a valid service, party size, and date at least seven days away.');
    if (isRefresher && (!details.certificationLevel || !details.lastDiveDate)) return setError('Add the certification level and last-dive date for the Refresher.');
    if (isRefresher && includeAfternoonDive && (!afternoonDive || diveAdults + diveChildren < 1 || diveAdults > adults || diveChildren > children)) return setError('Choose who will join the afternoon dive within the total party size.');
    if (mode === 'course' && selected.id === 'course-referral' && details.referralDocuments === undefined) return setError('Select your referral-document status.');
    if (mode === 'transfer' && (!details.arrivalTime || !details.destination || (details.transferTrip === 'round_trip' && (!details.returnDate || !details.returnTime)))) return setError('Complete the transfer direction, time, destination, and any return details.');
    setSubmitting(true); setError('');
    try {
      const requestItems = [{ catalogItemId: selected.id, requestedDate, adults, children, details }];
      if (isRefresher && includeAfternoonDive && afternoonDive) requestItems.push({ catalogItemId: afternoonDive.id, requestedDate, adults: diveAdults, children: diveChildren, details });
      const response = await fetch(API.url('/reservations'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ customer: { name, email, phone }, adults, children, accommodation, notes, company, items: requestItems }) });
      const body = await response.json() as Result;
      if (!response.ok || !body.reference) throw new Error(body.error || 'Your request could not be saved.');
      setResult(body);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your request could not be saved.'); }
    finally { setSubmitting(false); }
  };

  const heading = mode === 'course' ? 'Request a scuba course.' : 'Request a private transfer.';
  const backPath = mode === 'course' ? '/courses' : '/transfers-charters';

  if (result?.reference) return <main className="flex min-h-[78vh] items-center px-5 pb-24 pt-36"><SEO title="Request Received" description="Your private Action Divers request." path={mode === 'course' ? '/courses/request' : '/transfers-charters/request'} noindex /><div className="mx-auto max-w-2xl text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-[#11C7D9]" /><h1 className="mt-7 text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">Your request is in.</h1><p className="mt-5 text-lg text-[#F8F4E8]/72">Reference <strong>{result.reference}</strong>. Staff will review the details and email you before any payment is requested.</p>{result.portalUrl && <a href={result.portalUrl} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[var(--brand-orange)] px-7 font-bold text-white">View request</a>}</div></main>;

  return <main className="mx-auto max-w-6xl px-5 pb-28 pt-32 sm:px-8 lg:pt-40">
    <SEO title={mode === 'course' ? 'Request a Scuba Course' : 'Request a Belize Boat Transfer'} description={mode === 'course' ? 'Send Action Divers a dedicated scuba course request.' : 'Send Action Divers your private boat transfer details for staff confirmation.'} path={mode === 'course' ? '/courses/request' : '/transfers-charters/request'} noindex />
    <Link to={backPath} className="inline-flex items-center text-sm font-bold text-[#8DE7EF]"><ArrowLeft className="mr-2 h-4 w-4" /> Back to {mode === 'course' ? 'courses' : 'transfers'}</Link>
    <header className="mt-8 max-w-3xl"><h1 className="text-5xl font-extrabold tracking-[-0.035em] text-[#F8F4E8] sm:text-7xl">{heading}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#F8F4E8]/70">This is a dedicated {mode} request—not a tour-cart item. Requests require at least seven days’ advance notice. Staff will confirm availability, details, and the final price.</p></header>
    <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-9">
        <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>{mode === 'course' ? 'Course' : 'Transfer service'}<select value={selected?.id ?? ''} onChange={(event) => { const next = options.find((item) => item.id === event.target.value); setCatalogItemId(event.target.value); setDetails(mode === 'transfer' ? { transferTrip: 'one_way' } : {}); setIncludeAfternoonDive(false); if (next?.maxParticipants && partySize > next.maxParticipants) { const nextAdults = Math.min(Math.max(1, adults), next.maxParticipants); setAdults(nextAdults); setChildren(Math.max(0, next.maxParticipants - nextAdults)); } }} className={fieldClass}>{options.map((item) => <option key={item.id} value={item.id}>{item.name} — {formatUsd(item.priceCents)}</option>)}</select></label>
          <label className={labelClass}>{mode === 'course' ? 'Preferred start date' : 'Outbound date'}<input required type="date" min={belizeDateAfter(selected?.noticeDays ?? 7)} value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} className={`${fieldClass} [color-scheme:dark]`} /></label>
          <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Adults<input required type="number" min={1} max={Math.max(1, (selected?.maxParticipants ?? 80) - children)} value={adults} onChange={(event) => setAdults(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(1, (selected?.maxParticipants ?? 80) - children)))} className={fieldClass} /></label><label className={labelClass}>Children<input type="number" min={0} max={Math.max(0, (selected?.maxParticipants ?? 80) - adults)} value={children} onChange={(event) => setChildren(Math.min(Math.max(0, Number(event.target.value) || 0), Math.max(0, (selected?.maxParticipants ?? 80) - adults)))} className={fieldClass} /></label></div>
        </section>

        {mode === 'course' ? (
          <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2">
            <label className={labelClass}>Current certification level<input required={isRefresher} value={details.certificationLevel ?? ''} onChange={(event) => updateDetails({ certificationLevel: event.target.value })} placeholder="Not certified, Open Water, etc." className={fieldClass} /></label>
            <label className={labelClass}>Last dive date {isRefresher ? '' : '(if applicable)'}<input required={isRefresher} type="date" max={belizeDateAfter(0)} value={details.lastDiveDate ?? ''} onChange={(event) => updateDetails({ lastDiveDate: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label>
            {lastDiveNeedsRefresher && <div role="status" className="flex gap-3 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-relaxed text-amber-50 sm:col-span-2"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><p><strong>Refresher required.</strong> A certified diver who has not dived in over one year should complete a Refresher before joining a recreational dive.</p></div>}
            {selected?.id === 'course-referral' && <label className={`${labelClass} sm:col-span-2`}>Referral-document status<select required value={details.referralDocuments === undefined ? '' : details.referralDocuments ? 'ready' : 'not-ready'} onChange={(event) => updateDetails({ referralDocuments: event.target.value === 'ready' })} className={fieldClass}><option value="">Select status</option><option value="ready">Documents ready to share</option><option value="not-ready">Documents not ready</option></select></label>}
            {isRefresher && afternoonDive && <div className="rounded-2xl border border-[#11C7D9]/25 bg-[#0a313a] p-5 sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-4">
                <input type="checkbox" checked={includeAfternoonDive} onChange={(event) => { setIncludeAfternoonDive(event.target.checked); if (event.target.checked) { setDiveAdults(adults); setDiveChildren(children); } }} className="mt-1 h-5 w-5 accent-[#11C7D9]" />
                <span><strong className="block text-[#F8F4E8]">Request an afternoon dive after the Refresher</strong><span className="mt-1 block text-sm leading-relaxed text-[#F8F4E8]/65">Add a same-day {afternoonDive.name}. Staff will confirm that the morning Refresher and afternoon schedule are available.</span></span>
              </label>
              {includeAfternoonDive && <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                <label className={labelClass}>Adults joining the dive<input required type="number" min={0} max={adults} value={diveAdults} onChange={(event) => setDiveAdults(Math.min(Math.max(0, Number(event.target.value) || 0), adults))} className={fieldClass} /></label>
                <label className={labelClass}>Children joining the dive<input type="number" min={0} max={children} value={diveChildren} onChange={(event) => setDiveChildren(Math.min(Math.max(0, Number(event.target.value) || 0), children))} className={fieldClass} /></label>
                <p className="text-sm leading-relaxed text-[#F8F4E8]/60 sm:col-span-2">At least one guest must join. The dive estimate applies its minimum paid-participant rule even when fewer guests participate.</p>
              </div>}
            </div>}
          </section>
        ) : <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2"><label className={labelClass}>Direction<select value={details.transferTrip ?? 'one_way'} onChange={(event) => updateDetails({ transferTrip: event.target.value as 'one_way' | 'round_trip' })} className={fieldClass}><option value="one_way">One way</option><option value="round_trip">Round trip</option></select></label><label className={labelClass}>Flight or pickup time<input required type="time" value={details.arrivalTime ?? ''} onChange={(event) => updateDetails({ arrivalTime: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Airline and flight number<input value={details.flightNumber ?? ''} onChange={(event) => updateDetails({ flightNumber: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Destination<input required value={details.destination ?? ''} onChange={(event) => updateDetails({ destination: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Luggage<input value={details.luggage ?? ''} onChange={(event) => updateDetails({ luggage: event.target.value })} placeholder="Bags or oversized items" className={fieldClass} /></label><label className={labelClass}>Special requirements<input value={details.specialRequirements ?? ''} onChange={(event) => updateDetails({ specialRequirements: event.target.value })} className={fieldClass} /></label>{details.transferTrip === 'round_trip' && <><label className={labelClass}>Return date<input required type="date" min={requestedDate || belizeDateAfter(7)} value={details.returnDate ?? ''} onChange={(event) => updateDetails({ returnDate: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Return time<input required type="time" value={details.returnTime ?? ''} onChange={(event) => updateDetails({ returnTime: event.target.value })} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Return airline and flight<input value={details.returnFlightNumber ?? ''} onChange={(event) => updateDetails({ returnFlightNumber: event.target.value })} className={fieldClass} /></label></>}</section>}

        <section className="grid gap-5 border-t border-white/12 pt-7 sm:grid-cols-2"><label className={labelClass}>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Phone (optional)<input type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Hotel or villa<input value={accommodation} onChange={(event) => setAccommodation(event.target.value)} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Additional notes<textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} className={`${fieldClass} resize-y`} /></label><input tabIndex={-1} aria-hidden="true" autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} className="absolute left-[-9999px] h-px w-px" /></section>
      </div>
      <aside><div className="sticky top-28 rounded-2xl bg-[#06212a] p-6">
        <h2 className="text-xl font-extrabold">Request summary</h2>
        <p className="mt-5 font-bold">{selected?.name ?? 'Select a service'}</p>
        {selected?.description && <p className="mt-2 text-sm leading-relaxed text-[#F8F4E8]/65">{selected.description}</p>}
        {selected && (selected.minimumPaidParticipants || selected.maxParticipants) && <p className="mt-2 text-sm leading-relaxed text-[#F8F4E8]/65">{selected.minimumPaidParticipants ? `Minimum billed guests: ${selected.minimumPaidParticipants}.` : ''}{selected.minimumPaidParticipants && selected.maxParticipants ? ' ' : ''}{selected.maxParticipants ? `Maximum guests: ${selected.maxParticipants}.` : ''}</p>}
        {isRefresher && includeAfternoonDive && afternoonDive && <div className="mt-4 border-t border-white/10 pt-4"><p className="font-bold text-[#F8F4E8]">+ Afternoon dive</p><p className="mt-1 text-sm text-[#F8F4E8]/60">{afternoonDive.name} · {diveAdults + diveChildren} guest{diveAdults + diveChildren === 1 ? '' : 's'}</p></div>}
        <div className="mt-5 flex justify-between border-y border-white/10 py-4 text-sm"><span className="text-[#F8F4E8]/65">Starting estimate</span><strong>{formatUsd(estimate)}</strong></div>
        <p className="mt-4 text-sm leading-relaxed text-[#F8F4E8]/58">This is an estimate only. Staff confirms availability, billable quantities, and the final price.</p>
        {mode === 'transfer' && <p className="mt-3 text-sm leading-relaxed text-[#F8F4E8]/58">Transfer pricing is proposed and subject to staff confirmation.</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-100">{error}</p>}
        <button disabled={submitting || !selected} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 font-bold text-white disabled:opacity-45">{submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…</> : `Send ${mode} request`}</button>
      </div></aside>
    </form>
  </main>;
};

export default ServiceRequest;
