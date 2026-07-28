import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, ChevronDown, ChevronRight, ClipboardList, DollarSign, Download, FileText, ListChecks, Loader2, Pencil, Plus, Printer, RefreshCw, Save, Search, Send, SlidersHorizontal, Trash2, Users } from 'lucide-react';
import { API } from '../config';
import { BookingCatalog, BookingCatalogItem, DEFAULT_BOOKING_CATALOG, formatUsd } from '../shared/bookingCatalog';

type StaffRole = 'owner' | 'staff';
type DashboardTab = 'reservations' | 'roster' | 'catalog' | 'templates' | 'staff';

interface Session { email: string; name: string; role: StaffRole }
interface ReservationSummary { id: string; reference: string; status: string; customer_name: string; customer_email: string; adults: number; children: number; estimated_total_cents: number; current_quote_version: number | null; version: number; created_at: string; updated_at: string }
interface ReservationDetail {
  reservation: { id: string; reference: string; status: string; customer: { name: string; email: string; phone: string | null }; party: { adults: number; children: number }; accommodation: string | null; divingExperience: string | null; customerNotes: string | null; internalNotes: string | null; customerMessage: string | null; estimatedTotalCents: number; version: number; createdAt: string; updatedAt: string };
  items: Array<{ id: string; catalog_item_id: string | null; name_snapshot: string; requested_date: string; price_snapshot_cents: number; pricing_basis: 'per_person' | 'per_group'; adults: number; children: number }>;
  quote: { id: string; status: string; version: number; customer_message: string | null; subtotal_cents: number; discount_cents: number; total_cents: number; expires_at: string | null } | null;
  quoteItems: Array<{ id: string; reservation_item_id: string | null; catalog_item_id: string | null; label: string; service_date: string | null; quantity: number; unit_price_cents: number; notes: string | null }>;
  discount: { discount_type: 'none' | 'percentage' | 'fixed'; value: number; amount_cents: number; reason: string | null } | null;
  payment: { status: string; paid_at: string | null; expires_at: string; last_error_code: string | null } | null;
  events: Array<{ actor: string; event_type: string; detail_json: string | null; created_at: string }>;
  deliveries: Array<{ recipient: string; template_key: string; status: string; created_at: string }>;
}

interface QuoteLine { key: string; reservationItemId: string | null; catalogItemId: string | null; label: string; serviceDate: string; quantity: number; unitPrice: string; notes: string }
interface MessageTemplate { id: string; name: string; subject: string; body: string; active: number }
interface RosterRow { reservation_item_id: string; tour_name: string; requested_date: string; adults: number; children: number; reservation_id: string; reference: string; status: string; customer_name: string; customer_email: string; customer_phone: string | null; accommodation: string | null; diving_experience: string | null; customer_notes: string | null; internal_notes: string | null }

const STATUS_LABELS: Record<string, string> = { new: 'New', reviewing: 'Reviewing', needs_contact: 'Needs contact', quoted: 'Update sent', awaiting_payment: 'Awaiting payment', paid: 'Paid', cancelled: 'Cancelled', completed: 'Completed' };
const ADMIN_PREVIEW = import.meta.env.DEV && window.location.pathname === '/admin/preview';
const PREVIEW_RESERVATIONS: ReservationSummary[] = [
  { id: 'preview-1', reference: 'AD-DEMO24', status: 'reviewing', customer_name: 'Maya Thompson', customer_email: 'maya@example.com', adults: 2, children: 1, estimated_total_cents: 48125, current_quote_version: null, version: 3, created_at: '2026-07-28T14:10:00.000Z', updated_at: '2026-07-28T15:05:00.000Z' },
  { id: 'preview-2', reference: 'AD-REEF82', status: 'awaiting_payment', customer_name: 'Daniel Ruiz', customer_email: 'daniel@example.com', adults: 2, children: 0, estimated_total_cents: 28876, current_quote_version: 1, version: 5, created_at: '2026-07-27T16:30:00.000Z', updated_at: '2026-07-28T13:42:00.000Z' },
  { id: 'preview-3', reference: 'AD-CAVE19', status: 'needs_contact', customer_name: 'Priya Shah', customer_email: 'priya@example.com', adults: 4, children: 0, estimated_total_cents: 33750, current_quote_version: null, version: 2, created_at: '2026-07-26T18:15:00.000Z', updated_at: '2026-07-28T11:20:00.000Z' },
  { id: 'preview-4', reference: 'AD-PAID73', status: 'paid', customer_name: 'Noah Williams', customer_email: 'noah@example.com', adults: 2, children: 0, estimated_total_cents: 17500, current_quote_version: 1, version: 6, created_at: '2026-07-24T09:00:00.000Z', updated_at: '2026-07-27T20:12:00.000Z' },
];
const PREVIEW_DETAIL: ReservationDetail = {
  reservation: { id: 'preview-1', reference: 'AD-DEMO24', status: 'reviewing', customer: { name: 'Maya Thompson', email: 'maya@example.com', phone: '+1 305 555 0148' }, party: { adults: 2, children: 1 }, accommodation: 'A hotel north of San Pedro', divingExperience: 'Certified beginner', customerNotes: 'We would prefer morning departures and need child-friendly snorkeling guidance.', internalNotes: 'Confirm the child snorkel equipment before sending.', customerMessage: null, estimatedTotalCents: 48125, version: 3, createdAt: '2026-07-28T14:10:00.000Z', updatedAt: '2026-07-28T15:05:00.000Z' },
  items: [
    { id: 'preview-item-1', catalog_item_id: 'snorkel-hol', name_snapshot: 'Hol Chan & Shark Ray Alley Snorkeling', requested_date: '2026-09-12', price_snapshot_cents: 9000, pricing_basis: 'per_person', adults: 2, children: 1 },
    { id: 'preview-item-2', catalog_item_id: 'main-altun', name_snapshot: 'Altun Ha & Cave Tubing', requested_date: '2026-09-14', price_snapshot_cents: 33750, pricing_basis: 'per_person', adults: 2, children: 0 },
  ],
  quote: { id: 'preview-quote-1', status: 'draft', version: 1, customer_message: 'We can accommodate both requested experiences. Please review the proposed dates and details below.', subtotal_cents: 51750, discount_cents: 3625, total_cents: 48125, expires_at: null },
  quoteItems: [
    { id: 'preview-line-1', reservation_item_id: 'preview-item-1', catalog_item_id: 'snorkel-hol', label: 'Hol Chan & Shark Ray Alley Snorkeling', service_date: '2026-09-12', quantity: 2, unit_price_cents: 9000, notes: 'Morning departure' },
    { id: 'preview-line-2', reservation_item_id: 'preview-item-2', catalog_item_id: 'main-altun', label: 'Altun Ha & Cave Tubing', service_date: '2026-09-14', quantity: 1, unit_price_cents: 33750, notes: 'Mainland transfer included in quoted rate' },
  ],
  discount: { discount_type: 'fixed', value: 3625, amount_cents: 3625, reason: 'Combined-trip courtesy adjustment' },
  payment: null,
  events: [
    { actor: 'maya@example.com', event_type: 'reservation_created', detail_json: null, created_at: '2026-07-28T14:10:00.000Z' },
    { actor: 'owner@actiondiversbelize.com', event_type: 'quote_draft_saved', detail_json: null, created_at: '2026-07-28T15:05:00.000Z' },
  ],
  deliveries: [{ recipient: 'maya@example.com', template_key: 'customer_acknowledgement', status: 'sent', created_at: '2026-07-28T14:10:05.000Z' }],
};
const PREVIEW_TEMPLATES: MessageTemplate[] = [
  { id: 'quote-ready', name: 'Quote ready', subject: 'Your Action Divers reservation is ready', body: 'We have reviewed your requested tours and prepared the final details for your trip.', active: 1 },
  { id: 'needs-contact', name: 'Needs a quick conversation', subject: 'A question about your Action Divers reservation', body: 'We need to confirm one detail before finalizing your reservation. Please reply to this email.', active: 1 },
  { id: 'unavailable', name: 'Requested option unavailable', subject: 'Update about your Action Divers request', body: 'The requested tour or date is not currently available. Please reply and we will help find another option.', active: 1 },
];

const apiFetch = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(API.url(path), { ...options, credentials: 'include', headers: { Accept: 'application/json', ...options.headers } });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
};

const dateTime = (value: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const fieldClass = 'mt-2 w-full rounded-xl border border-white/15 bg-[#061a22] px-3 py-3 text-sm text-[#F8F4E8] outline-none focus:border-[#11C7D9]';
const labelClass = 'block text-sm font-semibold text-[#F8F4E8]/68';

const AnimatedDisclosure: React.FC<{ open: boolean; id: string; children: React.ReactNode }> = ({ open, id, children }) => (
  <div id={id} aria-hidden={!open} inert={!open} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
    <div className="min-h-0 overflow-hidden">{children}</div>
  </div>
);

const Admin: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<DashboardTab>('reservations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReservationDetail | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tourFilter, setTourFilter] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reservationEditing, setReservationEditing] = useState(false);
  const [quoteEditing, setQuoteEditing] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [catalog, setCatalog] = useState<BookingCatalog | null>(null);
  const [catalogDirty, setCatalogDirty] = useState(false);
  const [staffRows, setStaffRows] = useState<Array<{ email: string; display_name: string | null; role: StaffRole; active: number }>>([]);

  const [internalNotes, setInternalNotes] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [validForDays, setValidForDays] = useState(7);
  const [catalogItemToAdd, setCatalogItemToAdd] = useState('');
  const [working, setWorking] = useState('');

  const loadList = async (status = statusFilter, cursor = '', append = false, clear = false) => {
    if (ADMIN_PREVIEW) {
      const normalizedQuery = clear ? '' : query.trim().toLowerCase();
      setReservations(PREVIEW_RESERVATIONS.filter((reservation) => (!status || reservation.status === status) && (!normalizedQuery || `${reservation.reference} ${reservation.customer_name} ${reservation.customer_email}`.toLowerCase().includes(normalizedQuery))));
      setNextCursor(null);
      return;
    }
    const parameters = new URLSearchParams();
    if (!clear && query.trim()) parameters.set('q', query.trim());
    if (status) parameters.set('status', status);
    if (!clear && dateFrom) parameters.set('dateFrom', dateFrom);
    if (!clear && dateTo) parameters.set('dateTo', dateTo);
    if (!clear && tourFilter) parameters.set('tour', tourFilter);
    if (cursor) parameters.set('cursor', cursor);
    const body = await apiFetch<{ reservations: ReservationSummary[]; nextCursor: string | null }>(`/admin-api/reservations?${parameters}`);
    setReservations((current) => append ? [...current, ...body.reservations] : body.reservations);
    setNextCursor(body.nextCursor);
  };

  const loadDetail = async (id: string) => {
    setWorking('detail');
    try {
      setReservationEditing(false);
      setQuoteEditing(false);
      if (ADMIN_PREVIEW) {
        setSelectedId(id);
        applyDetail({ ...PREVIEW_DETAIL, reservation: { ...PREVIEW_DETAIL.reservation, id, ...(PREVIEW_RESERVATIONS.find((row) => row.id === id) ? { reference: PREVIEW_RESERVATIONS.find((row) => row.id === id)!.reference, status: PREVIEW_RESERVATIONS.find((row) => row.id === id)!.status, customer: { ...PREVIEW_DETAIL.reservation.customer, name: PREVIEW_RESERVATIONS.find((row) => row.id === id)!.customer_name, email: PREVIEW_RESERVATIONS.find((row) => row.id === id)!.customer_email } } : {}) } });
        return;
      }
      const body = await apiFetch<{ detail: ReservationDetail }>(`/admin-api/reservations/${id}`);
      setSelectedId(id);
      setDetail(body.detail);
    } finally { setWorking(''); }
  };

  const applyDetail = (next: ReservationDetail) => {
    setDetail(next);
    setInternalNotes(next.reservation.internalNotes || '');
    setCustomerMessage(next.quote?.customer_message || next.reservation.customerMessage || '');
    const lines = next.quoteItems.length
      ? next.quoteItems.map((item) => ({ key: item.id, reservationItemId: item.reservation_item_id, catalogItemId: item.catalog_item_id, label: item.label, serviceDate: item.service_date || '', quantity: item.quantity, unitPrice: (item.unit_price_cents / 100).toFixed(2), notes: item.notes || '' }))
      : next.items.map((item) => ({ key: crypto.randomUUID(), reservationItemId: item.id, catalogItemId: item.catalog_item_id, label: item.name_snapshot, serviceDate: item.requested_date, quantity: item.pricing_basis === 'per_person' ? item.adults + item.children : 1, unitPrice: (item.price_snapshot_cents / 100).toFixed(2), notes: '' }));
    setQuoteLines(lines);
    setDiscountType(next.discount?.discount_type || 'none');
    setDiscountValue(next.discount ? (next.discount.discount_type === 'percentage' ? (next.discount.value / 100).toFixed(2).replace(/\.00$/, '') : (next.discount.amount_cents / 100).toFixed(2)) : '');
    setDiscountReason(next.discount?.reason || '');
  };

  useEffect(() => {
    if (ADMIN_PREVIEW) {
      setSession({ email: 'owner@actiondiversbelize.com', name: 'Action Divers Owner', role: 'owner' });
      setReservations(PREVIEW_RESERVATIONS);
      setTemplates(PREVIEW_TEMPLATES);
      setCatalog(DEFAULT_BOOKING_CATALOG);
      applyDetail(PREVIEW_DETAIL);
      setSelectedId(PREVIEW_DETAIL.reservation.id);
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch<{ staff: Session }>('/admin-api/session'),
      apiFetch<{ reservations: ReservationSummary[]; nextCursor: string | null }>('/admin-api/reservations'),
      apiFetch<{ templates: MessageTemplate[] }>('/admin-api/templates'),
      apiFetch<{ published: BookingCatalog; draft: BookingCatalog | null }>('/admin-api/catalog'),
    ]).then(([sessionBody, listBody, templateBody, catalogBody]) => {
      setSession(sessionBody.staff);
      setReservations(listBody.reservations);
      setNextCursor(listBody.nextCursor);
      setTemplates(templateBody.templates);
      setCatalog(catalogBody.draft || catalogBody.published);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Staff portal could not be loaded.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (detail) applyDetail(detail); }, [detail?.reservation.id, detail?.reservation.version]);

  const run = async (key: string, action: () => Promise<void>) => {
    setWorking(key); setError(''); setNotice('');
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Action failed.'); } finally { setWorking(''); }
  };

  const saveReservation = () => detail && run('reservation', async () => {
    if (ADMIN_PREVIEW) { applyDetail({ ...detail, reservation: { ...detail.reservation, internalNotes, customerMessage, version: detail.reservation.version + 1 } }); setNotice('Preview: reservation changes saved locally.'); return; }
    const body = await apiFetch<{ detail: ReservationDetail }>(`/admin-api/reservations/${detail.reservation.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'If-Match': String(detail.reservation.version) },
      body: JSON.stringify({ customer: detail.reservation.customer, party: detail.reservation.party, accommodation: detail.reservation.accommodation, divingExperience: detail.reservation.divingExperience, customerNotes: detail.reservation.customerNotes, items: detail.items.map((item) => ({ id: item.id, requestedDate: item.requested_date, adults: item.adults, children: item.children })), internalNotes, customerMessage }),
    });
    applyDetail(body.detail); await loadList(); setNotice('Reservation details saved.');
  });

  const quotePayload = () => ({
    customerMessage,
    items: quoteLines.map((line) => ({ reservationItemId: line.reservationItemId, catalogItemId: line.catalogItemId, label: line.label, serviceDate: line.serviceDate || null, quantity: line.quantity, unitPriceCents: Math.round(Number(line.unitPrice) * 100), notes: line.notes })),
    discount: discountType === 'percentage' ? { type: discountType, percent: Number(discountValue), reason: discountReason } : discountType === 'fixed' ? { type: discountType, amountCents: Math.round(Number(discountValue) * 100), reason: discountReason } : { type: 'none' },
  });

  const saveQuote = () => detail && run('quote', async () => {
    if (ADMIN_PREVIEW) { setNotice('Preview: quote draft saved locally.'); return; }
    const body = await apiFetch<{ detail: ReservationDetail }>(`/admin-api/reservations/${detail.reservation.id}/quote-draft`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'If-Match': String(detail.reservation.version) }, body: JSON.stringify(quotePayload()),
    });
    applyDetail(body.detail); await loadList(); setNotice('Quote draft saved.');
  });

  const sendQuote = (payable: boolean) => detail && run(payable ? 'payment' : 'update', async () => {
    if (ADMIN_PREVIEW) { applyDetail({ ...detail, reservation: { ...detail.reservation, status: payable ? 'awaiting_payment' : 'quoted', version: detail.reservation.version + 1 }, quote: detail.quote ? { ...detail.quote, status: payable ? 'payable' : 'sent_update' } : null }); setNotice(payable ? 'Preview: quote and payment link would be emailed.' : 'Preview: informational update would be emailed.'); return; }
    const body = await apiFetch<{ detail: ReservationDetail; emailStatus: string }>(`/admin-api/reservations/${detail.reservation.id}/${payable ? 'send-for-payment' : 'send-update'}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'If-Match': String(detail.reservation.version), 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ validForDays }),
    });
    applyDetail(body.detail); await loadList(); setNotice(body.emailStatus === 'sent' ? (payable ? 'Quote and payment link emailed.' : 'Reservation update emailed.') : 'The update was saved, but email delivery failed.');
  });

  const changeStatus = (status: string) => detail && run(`status-${status}`, async () => {
    if (ADMIN_PREVIEW) { applyDetail({ ...detail, reservation: { ...detail.reservation, status, version: detail.reservation.version + 1 } }); setNotice(`Preview: status changed to ${STATUS_LABELS[status]}.`); return; }
    const body = await apiFetch<{ detail: ReservationDetail }>(`/admin-api/reservations/${detail.reservation.id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'If-Match': String(detail.reservation.version) }, body: JSON.stringify({ status, reason: internalNotes }),
    });
    applyDetail(body.detail); await loadList(); setNotice(`Status changed to ${STATUS_LABELS[status]}.`);
  });

  const openTab = async (next: DashboardTab) => {
    setTab(next); setError(''); setNotice('');
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (ADMIN_PREVIEW) {
      if ((next === 'catalog' || next === 'roster') && !catalog) setCatalog(DEFAULT_BOOKING_CATALOG);
      if (next === 'staff') setStaffRows([{ email: 'owner@actiondiversbelize.com', display_name: 'Action Divers Owner', role: 'owner', active: 1 }, { email: 'guide@actiondiversbelize.com', display_name: 'Reservations Team', role: 'staff', active: 1 }]);
      return;
    }
    if ((next === 'catalog' || next === 'roster') && !catalog) {
      const body = await apiFetch<{ published: BookingCatalog; draft: BookingCatalog | null }>('/admin-api/catalog');
      setCatalog(body.draft || body.published);
    }
    if (next === 'staff' && session?.role === 'owner') {
      const body = await apiFetch<{ staff: typeof staffRows }>('/admin-api/staff'); setStaffRows(body.staff);
    }
  };

  const addQuoteLine = () => {
    const item = catalog?.items.find((candidate) => candidate.id === catalogItemToAdd && candidate.active);
    setQuoteLines((lines) => [...lines, {
      key: crypto.randomUUID(), reservationItemId: null, catalogItemId: item?.id ?? null,
      label: item?.name ?? 'Custom item', serviceDate: '', quantity: 1,
      unitPrice: item ? (item.priceCents / 100).toFixed(2) : '0.00', notes: '',
    }]);
    setCatalogItemToAdd('');
  };

  const updateCatalogItem = (id: string, changes: Partial<BookingCatalogItem>) => {
    setCatalog((current) => current ? { ...current, items: current.items.map((item) => item.id === id ? { ...item, ...changes } : item) } : current);
    setCatalogDirty(true);
  };

  const saveCatalog = () => catalog && run('catalog-save', async () => {
    if (ADMIN_PREVIEW) { setCatalogDirty(false); setNotice('Preview: catalog draft saved locally.'); return; }
    await apiFetch('/admin-api/catalog', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catalog) });
    setCatalogDirty(false); setNotice('Catalog draft saved.');
  });

  const publishCatalog = () => run('catalog-publish', async () => {
    if (catalogDirty) throw new Error('Save the catalog draft before publishing.');
    if (ADMIN_PREVIEW) { setNotice('Preview: catalog revision published locally.'); return; }
    const body = await apiFetch<{ published: BookingCatalog }>('/admin-api/catalog/publish', { method: 'POST' });
    setCatalog(body.published); setNotice('Catalog published. Public prices now use this revision.');
  });

  const quoteSubtotal = useMemo(() => quoteLines.reduce((sum, line) => sum + Math.max(0, line.quantity * Math.round(Number(line.unitPrice || 0) * 100)), 0), [quoteLines]);
  const quoteDiscount = useMemo(() => {
    if (discountType === 'percentage') return Math.min(quoteSubtotal, Math.max(0, Math.round(quoteSubtotal * (Number(discountValue) || 0) / 100)));
    if (discountType === 'fixed') return Math.min(quoteSubtotal, Math.max(0, Math.round((Number(discountValue) || 0) * 100)));
    return 0;
  }, [discountType, discountValue, quoteSubtotal]);
  const quoteTotal = quoteSubtotal - quoteDiscount;
  const activeFilterCount = [statusFilter, tourFilter, dateFrom, dateTo].filter(Boolean).length;

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#001219] text-[#F8F4E8]"><Loader2 className="mr-3 h-6 w-6 animate-spin text-[#11C7D9]" /> Verifying staff access…</div>;
  if (!session) return <div className="flex min-h-screen items-center justify-center bg-[#001219] px-6 text-center"><div className="max-w-lg"><AlertCircle className="mx-auto h-10 w-10 text-[var(--brand-orange)]" /><h1 className="mt-5 text-3xl font-extrabold text-[#F8F4E8]">Staff access unavailable</h1><p className="mt-4 leading-relaxed text-[#F8F4E8]/68">{error || 'Sign in through the approved Cloudflare Access application, then reload this page.'}</p><button onClick={() => window.location.reload()} className="mt-7 rounded-full bg-[var(--brand-orange)] px-6 py-3 font-bold text-white">Try again</button></div></div>;

  return (
    <div className="min-h-screen bg-[#001219] pb-20 pt-24 text-[#F8F4E8]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-white/10 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold text-[#11C7D9]">Action Divers operations</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Reservations</h1></div>
          <div className="text-sm text-[#F8F4E8]/60"><span className="font-bold text-[#F8F4E8]">{session.name}</span><span className="ml-2 rounded-full bg-white/8 px-3 py-1 text-xs">{session.role}</span></div>
        </header>
        {ADMIN_PREVIEW && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#11C7D9]/10 px-4 py-3 text-sm text-[#BDF5FA]"><span><strong>Local preview</strong> · Fictional data · Actions are simulated</span><span className="text-[#F8F4E8]/55">Cloudflare Access appears before this dashboard in production.</span></div>}

        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 py-3" aria-label="Staff sections">
          {([['reservations', ClipboardList, 'Reservations'], ['roster', ListChecks, 'Daily Roster'], ['catalog', DollarSign, 'Catalog'], ['templates', FileText, 'Templates'], ...(session.role === 'owner' ? [['staff', Users, 'Staff']] : [])] as Array<[DashboardTab, React.ElementType, string]>).map(([value, Icon, label]) => (
            <button key={value} onClick={() => openTab(value)} className={`inline-flex min-h-11 shrink-0 items-center rounded-lg px-4 text-sm font-bold transition-colors ${tab === value ? 'bg-[#11C7D9]/15 text-[#BDF5FA]' : 'text-[#F8F4E8]/58 hover:bg-white/5 hover:text-[#F8F4E8]'}`}><Icon className="mr-2 h-4 w-4" />{label}</button>
          ))}
        </nav>

        {(error || notice) && <div className={`mt-5 rounded-xl p-4 text-sm ${error ? 'bg-red-400/10 text-red-100' : 'bg-emerald-400/10 text-emerald-100'}`}>{error || notice}</div>}

        {tab === 'reservations' && (
          <div className="mt-7 grid gap-7 xl:grid-cols-[390px_minmax(0,1fr)]">
            <aside className="min-w-0 rounded-xl bg-[#06242c] p-4 sm:p-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto">
              <div className="flex items-center justify-between gap-4"><div><h2 className="font-extrabold">Reservation queue</h2><p className="mt-1 text-xs text-[#B7D2D7]">Newest activity first</p></div><button onClick={() => loadList()} className="h-10 w-10 rounded-lg bg-[#0a3039] text-[#D9EEF1] transition-colors hover:bg-[#10404a]" aria-label="Refresh reservations"><RefreshCw className="mx-auto h-4 w-4" /></button></div>
              <label className="relative mt-5 block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-[#B7D2D7]" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && loadList()} placeholder="Reference, guest, email" className="w-full rounded-lg bg-[#03181e] py-3 pl-10 pr-3 text-sm text-[#F8F4E8] outline-none placeholder:text-[#8FB0B7] focus:ring-2 focus:ring-[#11C7D9]/55" /></label>
              <button onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="reservation-filters" className="mt-3 flex min-h-10 w-full items-center justify-between rounded-lg bg-[#0a3039] px-4 text-sm font-bold text-[#D9EEF1] transition-colors hover:bg-[#10404a]"><span className="inline-flex items-center"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters{activeFilterCount > 0 && <span className="ml-2 rounded-full bg-[#11C7D9] px-2 py-0.5 text-xs text-[#001219]">{activeFilterCount}</span>}</span><ChevronDown className={`h-4 w-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} /></button>
              <AnimatedDisclosure open={filtersOpen} id="reservation-filters"><div className="pt-3"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Reservation status" className="w-full rounded-lg bg-[#03181e] p-3 text-sm text-[#F8F4E8] outline-none focus:ring-2 focus:ring-[#11C7D9]/55"><option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <select value={tourFilter} onChange={(event) => setTourFilter(event.target.value)} aria-label="Tour filter" className="w-full rounded-lg bg-[#03181e] p-3 text-sm text-[#F8F4E8] outline-none focus:ring-2 focus:ring-[#11C7D9]/55"><option value="">All tours</option>{[...(catalog?.items ?? [])].filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-[#B7D2D7]"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />From<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-2 w-full rounded-lg bg-[#03181e] px-3 py-2.5 text-sm text-[#F8F4E8] [color-scheme:dark] outline-none focus:ring-2 focus:ring-[#11C7D9]/55" /></label>
                <label className="text-xs font-semibold text-[#B7D2D7]">Through<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-2 w-full rounded-lg bg-[#03181e] px-3 py-2.5 text-sm text-[#F8F4E8] [color-scheme:dark] outline-none focus:ring-2 focus:ring-[#11C7D9]/55" /></label>
              </div>
              <div className="mt-4 flex gap-2"><button onClick={() => loadList()} className="min-h-10 flex-1 rounded-lg bg-[#11C7D9] px-4 text-sm font-bold text-[#001219] hover:bg-[#43d4e0]">Apply filters</button><button onClick={() => { setQuery(''); setStatusFilter(''); setTourFilter(''); setDateFrom(''); setDateTo(''); void loadList('', '', false, true); }} className="min-h-10 rounded-lg bg-[#0a3039] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#10404a]">Clear</button></div></div></AnimatedDisclosure>
              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {reservations.length === 0 ? <p className="py-10 text-center text-sm text-[#F8F4E8]/50">No reservations match this view.</p> : reservations.map((reservation) => (
                  <button key={reservation.id} onClick={() => loadDetail(reservation.id)} className={`flex w-full items-center gap-4 px-2 py-4 text-left transition-colors ${selectedId === reservation.id ? 'bg-[#0b343d] text-white' : 'text-[#D9EEF1] hover:bg-[#092d35] hover:text-white'}`}>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${reservation.status === 'paid' ? 'bg-emerald-400' : reservation.status === 'needs_contact' ? 'bg-amber-300' : 'bg-[#11C7D9]'}`} />
                    <span className="min-w-0 flex-1"><span className="block truncate font-bold">{reservation.customer_name}</span><span className="mt-1 block text-xs text-[#F8F4E8]/45">{reservation.reference} · {STATUS_LABELS[reservation.status]}</span></span><ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                ))}
              </div>
              {nextCursor && <button onClick={() => loadList(statusFilter, nextCursor, true)} className="mt-4 min-h-10 w-full rounded-lg bg-[#0a3039] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#10404a]">Load 50 more</button>}
            </aside>

            <main className="min-w-0">
              {!detail ? <div className="flex min-h-[420px] items-center justify-center border-y border-white/10 text-center text-[#F8F4E8]/48">Select a reservation to review it.</div> : (
                <div className="space-y-9">
                  <section className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-[#11C7D9]">{detail.reservation.reference}</p><h2 className="mt-2 text-3xl font-extrabold">{detail.reservation.customer.name}</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">{detail.reservation.customer.email} · {detail.reservation.party.adults} adults, {detail.reservation.party.children} children</p></div><span className="w-fit rounded-full bg-white/8 px-4 py-2 text-sm font-bold">{STATUS_LABELS[detail.reservation.status]}</span></section>

                  <section className="border-b border-white/10 pb-8">
                    <div className="flex items-center justify-between gap-4"><h3 className="text-xl font-extrabold">Guest and request</h3><button onClick={() => setReservationEditing((editing) => !editing)} aria-expanded={reservationEditing} aria-controls="reservation-editor" className="inline-flex min-h-10 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Pencil className="mr-2 h-4 w-4" /> {reservationEditing ? 'Close editor' : 'Edit details'}</button></div>
                    {!reservationEditing && <div className="mt-5"><dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3"><div><dt className="text-xs text-[#F8F4E8]/48">Phone</dt><dd className="mt-1 text-sm font-semibold">{detail.reservation.customer.phone || 'Not provided'}</dd></div><div><dt className="text-xs text-[#F8F4E8]/48">Accommodation</dt><dd className="mt-1 text-sm font-semibold">{detail.reservation.accommodation || 'Not provided'}</dd></div><div><dt className="text-xs text-[#F8F4E8]/48">Diving experience</dt><dd className="mt-1 text-sm font-semibold">{detail.reservation.divingExperience || 'Not provided'}</dd></div></dl>{detail.reservation.customerNotes && <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#F8F4E8]/68">{detail.reservation.customerNotes}</p>}<div className="mt-5 divide-y divide-white/10 border-y border-white/10">{detail.items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><span className="font-bold">{item.name_snapshot}</span><p className="mt-1 text-xs text-[#F8F4E8]/48">{item.adults} adults · {item.children} children</p></div><span className="inline-flex items-center text-sm text-[#B7D2D7]"><CalendarDays className="mr-2 h-4 w-4" />{item.requested_date}</span></div>)}</div></div>}
                    <AnimatedDisclosure open={reservationEditing} id="reservation-editor"><div className="pt-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <label className={labelClass}>Name<input value={detail.reservation.customer.name} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, customer: { ...current.reservation.customer, name: event.target.value } } } : current)} className={fieldClass} /></label>
                      <label className={labelClass}>Email<input type="email" value={detail.reservation.customer.email} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, customer: { ...current.reservation.customer, email: event.target.value } } } : current)} className={fieldClass} /></label>
                      <label className={labelClass}>Phone<input value={detail.reservation.customer.phone || ''} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, customer: { ...current.reservation.customer, phone: event.target.value } } } : current)} className={fieldClass} /></label>
                      <label className={labelClass}>Adults<input type="number" min={1} max={40} value={detail.reservation.party.adults} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, party: { ...current.reservation.party, adults: Number(event.target.value) } } } : current)} className={fieldClass} /></label>
                      <label className={labelClass}>Children<input type="number" min={0} max={40} value={detail.reservation.party.children} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, party: { ...current.reservation.party, children: Number(event.target.value) } } } : current)} className={fieldClass} /></label>
                      <label className={labelClass}>Accommodation<input value={detail.reservation.accommodation || ''} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, accommodation: event.target.value } } : current)} className={fieldClass} /></label>
                      <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>Diving experience<input value={detail.reservation.divingExperience || ''} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, divingExperience: event.target.value } } : current)} className={fieldClass} /></label>
                      <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>Customer notes<textarea rows={3} value={detail.reservation.customerNotes || ''} onChange={(event) => setDetail((current) => current ? { ...current, reservation: { ...current.reservation, customerNotes: event.target.value } } : current)} className={fieldClass} /></label>
                    </div>
                    <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                      {detail.items.map((item, index) => <div key={item.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_180px_90px_90px] sm:items-end"><div><p className="font-bold">{item.name_snapshot}</p><p className="mt-1 text-xs text-[#F8F4E8]/45">Requested tour {index + 1}</p></div><label className={labelClass}>Requested date<input type="date" value={item.requested_date} onChange={(event) => setDetail((current) => current ? { ...current, items: current.items.map((candidate) => candidate.id === item.id ? { ...candidate, requested_date: event.target.value } : candidate) } : current)} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Adults<input type="number" min={0} max={detail.reservation.party.adults} value={item.adults} onChange={(event) => setDetail((current) => current ? { ...current, items: current.items.map((candidate) => candidate.id === item.id ? { ...candidate, adults: Number(event.target.value) } : candidate) } : current)} className={fieldClass} /></label><label className={labelClass}>Children<input type="number" min={0} max={detail.reservation.party.children} value={item.children} onChange={(event) => setDetail((current) => current ? { ...current, items: current.items.map((candidate) => candidate.id === item.id ? { ...candidate, children: Number(event.target.value) } : candidate) } : current)} className={fieldClass} /></label></div>)}
                    </div>
                    <div className="mt-5 flex justify-end gap-2"><button onClick={() => { if (selectedId) void loadDetail(selectedId); setReservationEditing(false); }} className="min-h-10 rounded-lg px-4 text-sm font-bold text-[#D9EEF1] hover:bg-white/5">Cancel</button><button onClick={async () => { await saveReservation(); setReservationEditing(false); }} className="inline-flex min-h-10 items-center rounded-lg bg-[#11C7D9] px-5 text-sm font-bold text-[#001219]"><Save className="mr-2 h-4 w-4" /> Save details</button></div></div></AnimatedDisclosure>
                  </section>

                  <section className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>Internal notes<textarea rows={4} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} className={fieldClass} placeholder="Only staff can see this." /></label>
                    <label className={labelClass}>Customer-facing message<textarea rows={4} value={customerMessage} onChange={(event) => setCustomerMessage(event.target.value)} className={fieldClass} placeholder="Included in the portal and email." /></label>
                    <label className={`${labelClass} sm:col-span-2`}>Use a template<select value="" onChange={(event) => { const template = templates.find((candidate) => candidate.id === event.target.value); if (template) setCustomerMessage(template.body); }} className={fieldClass}><option value="">Choose a prepared message…</option>{templates.filter((template) => template.active).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
                    <button onClick={saveReservation} disabled={working === 'reservation'} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/18 px-5 text-sm font-bold hover:bg-white/5 disabled:opacity-50 sm:w-fit"><Save className="mr-2 h-4 w-4" /> Save notes</button>
                  </section>

                  <section className="border-t border-white/10 pt-8">
                    <div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-extrabold">Quote draft</h3><p className="mt-1 text-sm text-[#F8F4E8]/55">Finalized quotes are immutable. Later changes create a new version.</p></div><button onClick={() => setQuoteEditing((editing) => !editing)} aria-expanded={quoteEditing} aria-controls="quote-editor" className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Pencil className="mr-2 h-4 w-4" /> {quoteEditing ? 'Close editor' : 'Edit quote'}</button></div>
                    {!quoteEditing && <div className="mt-5"><div className="divide-y divide-white/10 border-y border-white/10">{quoteLines.map((line) => <div key={line.key} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_140px_90px] sm:items-center"><div><p className="font-bold">{line.label}</p><p className="mt-1 text-xs text-[#F8F4E8]/48">{line.serviceDate || 'Date not set'} · Qty {line.quantity}</p></div><span className="text-sm text-[#B7D2D7]">{formatUsd(Math.round((Number(line.unitPrice) || 0) * 100))} each</span><span className="font-bold sm:text-right">{formatUsd(Math.round((Number(line.unitPrice) || 0) * 100) * line.quantity)}</span></div>)}</div><dl className="ml-auto mt-5 max-w-xs space-y-2 text-sm"><div className="flex justify-between gap-8 text-[#F8F4E8]/65"><dt>Subtotal</dt><dd>{formatUsd(quoteSubtotal)}</dd></div><div className="flex justify-between gap-8 text-emerald-300"><dt>Discount</dt><dd>-{formatUsd(quoteDiscount)}</dd></div><div className="flex justify-between gap-8 border-t border-white/10 pt-2 text-lg font-extrabold"><dt>Draft total</dt><dd>{formatUsd(quoteTotal)}</dd></div></dl></div>}
                    <AnimatedDisclosure open={quoteEditing} id="quote-editor"><div className="pt-5"><div className="flex flex-col gap-3 rounded-xl bg-[#06242c] p-4 sm:flex-row sm:items-end">
                      <label className={`${labelClass} min-w-0 flex-1`}>Add another tour or custom item<select value={catalogItemToAdd} onChange={(event) => setCatalogItemToAdd(event.target.value)} className={fieldClass}><option value="">Custom item / no catalog selection</option>{[...(catalog?.items ?? [])].filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <option key={item.id} value={item.id}>{item.name} — {formatUsd(item.priceCents)}</option>)}</select></label>
                      <button onClick={addQuoteLine} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0d3943] px-5 text-sm font-bold text-[#D9EEF1] transition-colors hover:bg-[#124852]"><Plus className="mr-2 h-4 w-4" /> Add line</button>
                    </div>
                    <div className="mt-5 space-y-4">
                      {quoteLines.map((line, index) => (
                        <div key={line.key} className="grid gap-3 rounded-xl bg-white/[0.035] p-4 md:grid-cols-[minmax(160px,1.4fr)_150px_80px_120px_40px]">
                          <label className={labelClass}>Description<input value={line.label} onChange={(event) => setQuoteLines((lines) => lines.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, label: event.target.value } : candidate))} className={fieldClass} /></label>
                          <label className={labelClass}>Service date<input type="date" value={line.serviceDate} onChange={(event) => setQuoteLines((lines) => lines.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, serviceDate: event.target.value } : candidate))} className={`${fieldClass} [color-scheme:dark]`} /></label>
                          <label className={labelClass}>Qty<input type="number" min={1} max={100} value={line.quantity} onChange={(event) => setQuoteLines((lines) => lines.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, quantity: Number(event.target.value) } : candidate))} className={fieldClass} /></label>
                          <label className={labelClass}>USD each<input inputMode="decimal" value={line.unitPrice} onChange={(event) => setQuoteLines((lines) => lines.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, unitPrice: event.target.value } : candidate))} className={fieldClass} /></label>
                          <button onClick={() => setQuoteLines((lines) => lines.filter((_, candidateIndex) => candidateIndex !== index))} className="mt-7 h-10 w-10 rounded-full text-red-200/60 hover:bg-red-400/10 hover:text-red-100" aria-label={`Remove ${line.label}`}>×</button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <label className={labelClass}>Discount<select value={discountType} onChange={(event) => setDiscountType(event.target.value as typeof discountType)} className={fieldClass}><option value="none">None</option><option value="percentage">Percentage</option><option value="fixed">Fixed USD</option></select></label>
                      {discountType !== 'none' && <><label className={labelClass}>{discountType === 'percentage' ? 'Percent' : 'Amount USD'}<input inputMode="decimal" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} className={fieldClass} /></label><label className={labelClass}>Reason<input value={discountReason} onChange={(event) => setDiscountReason(event.target.value)} className={fieldClass} /></label></>}
                    </div>
                    <div className="mt-6 flex flex-col gap-5 border-y border-white/10 py-5 sm:flex-row sm:items-end sm:justify-between"><dl className="min-w-[260px] space-y-2 text-sm"><div className="flex justify-between gap-8 text-[#F8F4E8]/65"><dt>Line subtotal</dt><dd>{formatUsd(quoteSubtotal)}</dd></div><div className="flex justify-between gap-8 text-emerald-300"><dt>Discount</dt><dd>−{formatUsd(quoteDiscount)}</dd></div><div className="flex justify-between gap-8 border-t border-white/10 pt-2 text-lg font-extrabold text-[#F8F4E8]"><dt>Draft total</dt><dd>{formatUsd(quoteTotal)}</dd></div></dl><button onClick={saveQuote} disabled={working === 'quote'} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/10 px-6 text-sm font-bold hover:bg-white/15 disabled:opacity-50"><Save className="mr-2 h-4 w-4" /> Save quote draft</button></div>
                    </div></AnimatedDisclosure>
                  </section>

                  <section className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 xl:grid-cols-4">
                    <button onClick={() => changeStatus('needs_contact')} className="min-h-12 rounded-xl border border-amber-300/25 px-4 text-sm font-bold text-amber-100 hover:bg-amber-300/8">Needs contact</button>
                    <button onClick={() => changeStatus('cancelled')} className="min-h-12 rounded-xl border border-red-300/20 px-4 text-sm font-bold text-red-100 hover:bg-red-300/8">Unavailable / cancel</button>
                    <button onClick={() => sendQuote(false)} disabled={detail.quote?.status !== 'draft' || Boolean(working)} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#11C7D9]/35 px-4 text-sm font-bold text-[#BDF5FA] hover:bg-[#11C7D9]/10 disabled:opacity-35"><Send className="mr-2 h-4 w-4" /> Send update</button>
                    <div><label className="mb-2 block text-xs text-[#F8F4E8]/55">Quote valid days<input type="number" min={1} max={30} value={validForDays} onChange={(event) => setValidForDays(Number(event.target.value))} className="ml-2 w-14 rounded-lg bg-white/8 px-2 py-1 text-[#F8F4E8]" /></label><button onClick={() => sendQuote(true)} disabled={detail.quote?.status !== 'draft' || Boolean(working)} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--brand-orange)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-orange-light)] disabled:opacity-35"><DollarSign className="mr-2 h-4 w-4" /> Send quote & payment</button></div>
                  </section>

                  <section className="border-t border-white/10 pt-8"><h3 className="text-lg font-extrabold">Activity</h3><div className="mt-4 divide-y divide-white/8">{detail.events.slice(0, 12).map((event, index) => <div key={`${event.created_at}-${index}`} className="flex gap-4 py-3 text-sm"><span className="w-36 shrink-0 text-[#F8F4E8]/42">{dateTime(event.created_at)}</span><span className="text-[#F8F4E8]/72">{event.event_type.replaceAll('_', ' ')} · {event.actor}</span></div>)}</div></section>
                </div>
              )}
            </main>
          </div>
        )}

        {tab === 'roster' && catalog && <DailyRosterPanel catalog={catalog} preview={ADMIN_PREVIEW} />}

        {false && catalog && (
          <section className="mt-7"><div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-extrabold">Booking catalog</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">Save changes as a draft, then publish one complete revision.</p></div><div className="flex gap-3"><button onClick={saveCatalog} disabled={!catalogDirty || Boolean(working)} className="rounded-full border border-white/18 px-5 py-3 text-sm font-bold disabled:opacity-40">Save draft</button><button onClick={publishCatalog} disabled={catalogDirty || Boolean(working)} className="rounded-full bg-[var(--brand-orange)] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Publish</button></div></div><div className="mt-5 divide-y divide-white/10">{[...catalog.items].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <div key={item.id} className="grid gap-4 py-4 sm:grid-cols-[minmax(220px,1fr)_140px_130px_90px] sm:items-end"><label className={labelClass}>Public name<input value={item.name} onChange={(event) => updateCatalogItem(item.id, { name: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Price USD<input inputMode="decimal" value={(item.priceCents / 100).toFixed(2)} onChange={(event) => updateCatalogItem(item.id, { priceCents: Math.max(0, Math.round(Number(event.target.value) * 100) || 0) })} className={fieldClass} /></label><label className={labelClass}>Pricing<select value={item.pricingBasis} onChange={(event) => updateCatalogItem(item.id, { pricingBasis: event.target.value as BookingCatalogItem['pricingBasis'] })} className={fieldClass}><option value="per_person">Per person</option><option value="per_group">Per group</option></select></label><label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={item.active} onChange={(event) => updateCatalogItem(item.id, { active: event.target.checked })} className="h-4 w-4 accent-[#11C7D9]" /> Active</label></div>)}</div></section>
        )}

        {tab === 'catalog' && catalog && <CompactCatalogPanel catalog={catalog} dirty={catalogDirty} working={Boolean(working)} updateItem={updateCatalogItem} save={saveCatalog} publish={publishCatalog} />}
        {tab === 'templates' && <CompactTemplatesPanel templates={templates} setTemplates={setTemplates} run={run} preview={ADMIN_PREVIEW} />}
        {tab === 'staff' && session.role === 'owner' && <CompactStaffPanel rows={staffRows} setRows={setStaffRows} run={run} preview={ADMIN_PREVIEW} currentEmail={session.email} />}
      </div>
    </div>
  );
};

const TemplatesPanel: React.FC<{ templates: MessageTemplate[]; setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>; run: (key: string, action: () => Promise<void>) => Promise<void>; preview: boolean }> = ({ templates, setTemplates, run, preview }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const refresh = async () => setTemplates((await apiFetch<{ templates: MessageTemplate[] }>('/admin-api/templates')).templates);
  const create = () => run('template', async () => {
    if (preview) setTemplates((current) => [...current, { id: crypto.randomUUID(), name, subject, body, active: 1 }]);
    else { await apiFetch('/admin-api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, subject, body }) }); await refresh(); }
    setName(''); setSubject(''); setBody('');
  });
  const save = (template: MessageTemplate) => run(`template-${template.id}`, async () => {
    if (!preview) await apiFetch(`/admin-api/templates/${encodeURIComponent(template.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...template, active: Boolean(template.active) }) });
    else setTemplates((current) => current.map((row) => row.id === template.id ? template : row));
    if (!preview) await refresh();
  });
  const remove = (template: MessageTemplate) => run(`template-${template.id}`, async () => {
    if (!window.confirm(`Delete the “${template.name}” template?`)) return;
    if (!preview) await apiFetch(`/admin-api/templates/${encodeURIComponent(template.id)}`, { method: 'DELETE' });
    setTemplates((current) => current.filter((row) => row.id !== template.id));
  });
  const update = (id: string, changes: Partial<MessageTemplate>) => setTemplates((current) => current.map((template) => template.id === id ? { ...template, ...changes } : template));
  return <section className="mt-7 max-w-6xl"><h2 className="text-2xl font-extrabold">Message templates</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">Edit reusable wording here. Staff can still customize it for an individual reservation.</p><div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-4">{templates.map((template) => <div key={template.id} className="rounded-xl bg-[#06242c] p-5"><div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Template name<input value={template.name} onChange={(event) => update(template.id, { name: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Email subject<input value={template.subject} onChange={(event) => update(template.id, { subject: event.target.value })} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Message<textarea rows={4} value={template.body} onChange={(event) => update(template.id, { body: event.target.value })} className={fieldClass} /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-bold text-[#D9EEF1]"><input type="checkbox" checked={Boolean(template.active)} onChange={(event) => update(template.id, { active: event.target.checked ? 1 : 0 })} className="h-4 w-4 accent-[#11C7D9]" /> Active</label><div className="flex gap-2"><button onClick={() => remove(template)} className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-bold text-red-200 hover:bg-red-400/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</button><button onClick={() => save(template)} className="inline-flex min-h-10 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Save className="mr-2 h-4 w-4" /> Save</button></div></div></div>)}</div><div className="h-fit rounded-xl bg-[#402b24] p-5"><h3 className="font-bold">Add template</h3><label className={`${labelClass} mt-4`}>Name<input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label><label className={`${labelClass} mt-4`}>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} className={fieldClass} /></label><label className={`${labelClass} mt-4`}>Message<textarea rows={6} value={body} onChange={(event) => setBody(event.target.value)} className={fieldClass} /></label><button onClick={create} disabled={!name.trim() || !subject.trim() || !body.trim()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--brand-orange)] font-bold text-white disabled:opacity-40"><Plus className="mr-2 h-4 w-4" /> Add template</button></div></div></section>;
};

const StaffPanel: React.FC<{ rows: Array<{ email: string; display_name: string | null; role: StaffRole; active: number }>; setRows: React.Dispatch<React.SetStateAction<Array<{ email: string; display_name: string | null; role: StaffRole; active: number }>>>; run: (key: string, action: () => Promise<void>) => Promise<void>; preview: boolean; currentEmail: string }> = ({ rows, setRows, run, preview, currentEmail }) => {
  const [email, setEmail] = useState(''); const [displayName, setDisplayName] = useState(''); const [role, setRole] = useState<StaffRole>('staff');
  const refresh = async () => setRows((await apiFetch<{ staff: typeof rows }>('/admin-api/staff')).staff);
  const add = () => run('staff', async () => { if (preview) setRows((current) => [...current.filter((row) => row.email !== email), { email, display_name: displayName, role, active: 1 }]); else { await apiFetch('/admin-api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, displayName, role }) }); await refresh(); } setEmail(''); setDisplayName(''); });
  const update = (memberEmail: string, changes: Partial<(typeof rows)[number]>) => setRows((current) => current.map((member) => member.email === memberEmail ? { ...member, ...changes } : member));
  const save = (member: (typeof rows)[number]) => run(`staff-${member.email}`, async () => { if (!preview) { await apiFetch(`/admin-api/staff/${encodeURIComponent(member.email)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: member.display_name, role: member.role, active: Boolean(member.active) }) }); await refresh(); } });
  const remove = (member: (typeof rows)[number]) => run(`staff-${member.email}`, async () => { if (!window.confirm(`Remove staff access for ${member.email}?`)) return; if (!preview) { await apiFetch(`/admin-api/staff/${encodeURIComponent(member.email)}`, { method: 'DELETE' }); await refresh(); } else setRows((current) => current.map((row) => row.email === member.email ? { ...row, active: 0 } : row)); });
  return <section className="mt-7 max-w-6xl"><h2 className="text-2xl font-extrabold">Staff access</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">Dashboard membership is managed here. Staff must also pass the Cloudflare Access email policy.</p><div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-4">{rows.map((member) => <div key={member.email} className="rounded-xl bg-[#06242c] p-5"><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px]"><label className={labelClass}>Display name<input value={member.display_name || ''} onChange={(event) => update(member.email, { display_name: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Role<select value={member.role} onChange={(event) => update(member.email, { role: event.target.value as StaffRole })} className={fieldClass}><option value="staff">Staff</option><option value="owner">Owner</option></select></label></div><p className="mt-3 text-sm text-[#B7D2D7]">{member.email}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-bold text-[#D9EEF1]"><input type="checkbox" checked={Boolean(member.active)} onChange={(event) => update(member.email, { active: event.target.checked ? 1 : 0 })} className="h-4 w-4 accent-[#11C7D9]" /> {member.active ? 'Active' : 'Inactive'}</label><div className="flex gap-2">{member.email === currentEmail ? <span className="self-center px-3 text-xs text-[#B7D2D7]">Current account</span> : <button onClick={() => remove(member)} className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-bold text-red-200 hover:bg-red-400/10"><Trash2 className="mr-2 h-4 w-4" /> Remove</button>}<button onClick={() => save(member)} className="inline-flex min-h-10 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Save className="mr-2 h-4 w-4" /> Save</button></div></div></div>)}</div><div className="h-fit rounded-xl bg-[#402b24] p-5"><h3 className="font-bold">Add or reactivate staff</h3><label className={`${labelClass} mt-4`}>Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={fieldClass} /></label><label className={`${labelClass} mt-4`}>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} /></label><label className={`${labelClass} mt-4`}>Role<select value={role} onChange={(event) => setRole(event.target.value as StaffRole)} className={fieldClass}><option value="staff">Staff</option><option value="owner">Owner</option></select></label><button onClick={add} disabled={!email.trim()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--brand-orange)] font-bold text-white disabled:opacity-40"><Plus className="mr-2 h-4 w-4" /> Save staff member</button></div></div></section>;
};

const DailyRosterPanel: React.FC<{ catalog: BookingCatalog; preview: boolean }> = ({ catalog, preview }) => {
  const [date, setDate] = useState(preview ? '2026-09-12' : new Date().toISOString().slice(0, 10));
  const [tour, setTour] = useState(preview ? 'snorkel-hol' : '');
  const [rows, setRows] = useState<RosterRow[]>([]);
  const [totals, setTotals] = useState({ adults: 0, children: 0, guests: 0, reservations: 0 });
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [rosterError, setRosterError] = useState('');
  const selectedTour = catalog.items.find((item) => item.id === tour || item.tourId === tour);
  const activeItems = [...catalog.items].filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder);

  const generate = async () => {
    if (!date || !tour) return;
    setLoadingRoster(true); setRosterError('');
    try {
      let nextRows: RosterRow[];
      if (preview) {
        nextRows = PREVIEW_DETAIL.items.filter((item) => item.requested_date === date && (item.catalog_item_id === tour || catalog.items.find((entry) => entry.id === item.catalog_item_id)?.tourId === tour)).map((item) => ({ reservation_item_id: item.id, tour_name: item.name_snapshot, requested_date: item.requested_date, adults: item.adults, children: item.children, reservation_id: PREVIEW_DETAIL.reservation.id, reference: PREVIEW_DETAIL.reservation.reference, status: PREVIEW_DETAIL.reservation.status, customer_name: PREVIEW_DETAIL.reservation.customer.name, customer_email: PREVIEW_DETAIL.reservation.customer.email, customer_phone: PREVIEW_DETAIL.reservation.customer.phone, accommodation: PREVIEW_DETAIL.reservation.accommodation, diving_experience: PREVIEW_DETAIL.reservation.divingExperience, customer_notes: PREVIEW_DETAIL.reservation.customerNotes, internal_notes: PREVIEW_DETAIL.reservation.internalNotes }));
      } else {
        const body = await apiFetch<{ roster: RosterRow[]; totals: typeof totals }>(`/admin-api/roster?date=${encodeURIComponent(date)}&tour=${encodeURIComponent(tour)}`);
        nextRows = body.roster;
        setTotals(body.totals);
      }
      if (preview) setTotals(nextRows.reduce((sum, row) => ({ adults: sum.adults + row.adults, children: sum.children + row.children, guests: sum.guests + row.adults + row.children, reservations: sum.reservations + 1 }), { adults: 0, children: 0, guests: 0, reservations: 0 }));
      setRows(nextRows); setGenerated(true);
    } catch (reason) { setRosterError(reason instanceof Error ? reason.message : 'The roster could not be generated.'); }
    finally { setLoadingRoster(false); }
  };

  const safeCell = (value: unknown) => {
    let cell = String(value ?? '');
    if (/^[=+\-@]/.test(cell)) cell = `'${cell}`;
    return `"${cell.replaceAll('"', '""')}"`;
  };
  const countLabel = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
  const exportRows = rows.map((row) => [date, row.tour_name, row.reference, STATUS_LABELS[row.status] || row.status, row.customer_name, row.customer_email, row.customer_phone, row.accommodation, row.adults, row.children, row.adults + row.children, row.diving_experience, row.customer_notes, row.internal_notes]);
  const downloadCsv = () => {
    const headers = ['Date', 'Tour', 'Reference', 'Status', 'Lead guest', 'Email', 'Phone', 'Accommodation', 'Adults', 'Children', 'Total guests', 'Diving experience', 'Customer notes', 'Internal notes'];
    const csv = `\uFEFF${[headers, ...exportRows].map((row) => row.map(safeCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `action-divers-roster-${date}-${tour}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };
  const printRoster = () => {
    const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character));
    const popup = window.open('', '_blank');
    if (!popup) { setRosterError('Allow pop-ups to open the printable roster.'); return; }
    popup.opener = null;
    popup.document.write(`<!doctype html><html><head><title>Action Divers roster — ${escape(date)}</title><style>body{font:13px Arial,sans-serif;color:#10272d;margin:32px}h1{margin:0 0 6px;font-size:24px}p{margin:4px 0 20px;color:#49666d}table{width:100%;border-collapse:collapse}th,td{padding:9px 8px;border-bottom:1px solid #ccd8da;text-align:left;vertical-align:top}th{font-size:11px;text-transform:uppercase;color:#49666d}.summary{margin:18px 0;font-weight:bold}@media print{body{margin:16px}}</style></head><body><h1>Action Divers Daily Roster</h1><p>${escape(selectedTour?.name || 'Selected tour')} · ${escape(date)}</p><div class="summary">${countLabel(totals.reservations, 'reservation')} · ${countLabel(totals.adults, 'adult')} · ${countLabel(totals.children, 'child', 'children')} · ${countLabel(totals.guests, 'guest')}</div><table><thead><tr><th>Guest / reference</th><th>Participation</th><th>Contact</th><th>Accommodation</th><th>Status</th><th>Notes</th></tr></thead><tbody>${rows.map((row) => `<tr><td><strong>${escape(row.customer_name)}</strong><br>${escape(row.reference)}</td><td>${countLabel(row.adults, 'adult')}<br>${countLabel(row.children, 'child', 'children')}</td><td>${escape(row.customer_email)}<br>${escape(row.customer_phone || '')}</td><td>${escape(row.accommodation || '')}</td><td>${escape(STATUS_LABELS[row.status] || row.status)}</td><td>${escape(row.customer_notes || '')}${row.internal_notes ? `<br><strong>Staff:</strong> ${escape(row.internal_notes)}` : ''}</td></tr>`).join('')}</tbody></table></body></html>`);
    popup.document.close(); popup.focus(); popup.print();
  };

  return <section className="mt-7">
    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-2xl font-extrabold">Daily tour roster</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F8F4E8]/60">Generate an operational guest list for one tour and date. Cancelled reservations are excluded.</p></div>{generated && rows.length > 0 && <div className="flex flex-wrap gap-2"><button onClick={downloadCsv} className="inline-flex min-h-10 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Download className="mr-2 h-4 w-4" /> Download CSV</button><button onClick={printRoster} className="inline-flex min-h-10 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Printer className="mr-2 h-4 w-4" /> Print / Save PDF</button></div>}</div>
    <div className="mt-6 grid gap-4 rounded-xl bg-[#06242c] p-5 md:grid-cols-[180px_minmax(260px,1fr)_auto] md:items-end"><label className={labelClass}>Tour date<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setGenerated(false); }} className={`${fieldClass} [color-scheme:dark]`} /></label><label className={labelClass}>Tour or activity<select value={tour} onChange={(event) => { setTour(event.target.value); setGenerated(false); }} className={fieldClass}><option value="">Choose a tour</option>{activeItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button onClick={generate} disabled={!date || !tour || loadingRoster} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#11C7D9] px-5 text-sm font-bold text-[#001219] disabled:opacity-40">{loadingRoster ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />} Generate roster</button></div>
    <p className="mt-4 text-sm text-amber-100/80">The roster identifies each booking’s lead guest and participant counts. Individual traveler names are not collected yet.</p>
    {rosterError && <p role="alert" className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-100">{rosterError}</p>}
    {generated && <div className="mt-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h3 className="text-xl font-extrabold">{selectedTour?.name || 'Tour roster'}</h3><p className="mt-1 text-sm text-[#F8F4E8]/55">{date}</p></div><dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><div><dt className="text-[#F8F4E8]/50">Reservations</dt><dd className="mt-1 font-bold">{totals.reservations}</dd></div><div><dt className="text-[#F8F4E8]/50">Adults</dt><dd className="mt-1 font-bold">{totals.adults}</dd></div><div><dt className="text-[#F8F4E8]/50">Children</dt><dd className="mt-1 font-bold">{totals.children}</dd></div><div><dt className="text-[#F8F4E8]/50">Total guests</dt><dd className="mt-1 font-bold text-[#11C7D9]">{totals.guests}</dd></div></dl></div>{rows.length === 0 ? <div className="mt-6 border-y border-white/10 py-12 text-center text-[#F8F4E8]/55">No active reservations match this tour and date.</div> : <div className="mt-5 overflow-x-auto"><table className="min-w-[1050px] w-full border-collapse text-left text-sm"><thead><tr className="border-b border-white/15 text-xs text-[#B7D2D7]"><th className="px-3 py-3 font-semibold">Guest / reference</th><th className="px-3 py-3 font-semibold">Participation</th><th className="px-3 py-3 font-semibold">Contact</th><th className="px-3 py-3 font-semibold">Accommodation</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Notes</th></tr></thead><tbody>{rows.map((row) => <tr key={row.reservation_item_id} className="border-b border-white/8 align-top"><td className="px-3 py-4"><p className="font-bold">{row.customer_name}</p><p className="mt-1 text-xs text-[#11C7D9]">{row.reference}</p></td><td className="px-3 py-4"><p>{row.adults} adults</p><p className="mt-1 text-[#F8F4E8]/58">{row.children} children</p></td><td className="px-3 py-4"><p>{row.customer_email}</p><p className="mt-1 text-[#F8F4E8]/58">{row.customer_phone || 'No phone'}</p></td><td className="px-3 py-4 text-[#F8F4E8]/72">{row.accommodation || 'Not provided'}</td><td className="px-3 py-4"><span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold">{STATUS_LABELS[row.status] || row.status}</span></td><td className="max-w-sm px-3 py-4 text-[#F8F4E8]/65">{row.customer_notes || 'No customer notes'}{row.internal_notes && <p className="mt-2 text-amber-100"><strong>Staff:</strong> {row.internal_notes}</p>}</td></tr>)}</tbody></table></div>}</div>}
  </section>;
};

const CompactCatalogPanel: React.FC<{ catalog: BookingCatalog; dirty: boolean; working: boolean; updateItem: (id: string, changes: Partial<BookingCatalogItem>) => void; save: () => false | Promise<void>; publish: () => Promise<void> }> = ({ catalog, dirty, working, updateItem, save, publish }) => {
  const [editing, setEditing] = useState(false);
  const items = [...catalog.items].sort((a, b) => a.sortOrder - b.sortOrder);
  return <section className="mt-7">
    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-extrabold">Booking catalog</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">Review the published offering, then open editing only when prices or availability need to change.</p></div><button onClick={() => setEditing((open) => !open)} aria-expanded={editing} aria-controls="catalog-editor" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Pencil className="mr-2 h-4 w-4" /> {editing ? 'Close editor' : 'Edit catalog'}</button></div>
    {!editing && <div className="mt-5 divide-y divide-white/10">{items.map((item) => <div key={item.id} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_150px_110px] sm:items-center"><div><p className="font-bold">{item.name}</p><p className="mt-1 text-xs text-[#F8F4E8]/48">{item.pricingBasis === 'per_person' ? 'Per person' : 'Per group'}{item.maxParticipants ? ` · Maximum ${item.maxParticipants} guests` : ''}</p></div><span className="font-bold">{formatUsd(item.priceCents)}</span><span className={`w-fit rounded-full px-2 py-1 text-xs font-bold ${item.active ? 'bg-emerald-300/10 text-emerald-200' : 'bg-white/8 text-[#B7D2D7]'}`}>{item.active ? 'Active' : 'Inactive'}</span></div>)}</div>}
    <AnimatedDisclosure open={editing} id="catalog-editor"><div className="pt-5"><div className="divide-y divide-white/10">{items.map((item) => <div key={item.id} className="grid gap-4 py-4 sm:grid-cols-[minmax(220px,1fr)_120px_120px_110px_90px] sm:items-end"><label className={labelClass}>Public name<input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Price USD<input inputMode="decimal" value={(item.priceCents / 100).toFixed(2)} onChange={(event) => updateItem(item.id, { priceCents: Math.max(0, Math.round(Number(event.target.value) * 100) || 0) })} className={fieldClass} /></label><label className={labelClass}>Pricing<select value={item.pricingBasis} onChange={(event) => updateItem(item.id, { pricingBasis: event.target.value as BookingCatalogItem['pricingBasis'] })} className={fieldClass}><option value="per_person">Per person</option><option value="per_group">Per group</option></select></label><label className={labelClass}>Max guests<input type="number" min={1} max={80} value={item.maxParticipants ?? ''} placeholder="No limit" onChange={(event) => updateItem(item.id, { maxParticipants: event.target.value ? Math.min(80, Math.max(1, Number(event.target.value) || 1)) : undefined })} className={fieldClass} /></label><label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" checked={item.active} onChange={(event) => updateItem(item.id, { active: event.target.checked })} className="h-4 w-4 accent-[#11C7D9]" /> Active</label></div>)}</div><div className="mt-5 flex flex-wrap justify-end gap-3"><button onClick={() => void save()} disabled={!dirty || working} className="rounded-lg border border-white/18 px-5 py-3 text-sm font-bold disabled:opacity-40">Save draft</button><button onClick={() => void publish()} disabled={dirty || working} className="rounded-lg bg-[var(--brand-orange)] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Publish</button></div></div></AnimatedDisclosure>
  </section>;
};

type TemplatePanelProps = {
  templates: MessageTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  run: (key: string, action: () => Promise<void>) => Promise<void>;
  preview: boolean;
};

const CompactTemplatesPanel: React.FC<TemplatePanelProps> = ({ templates, setTemplates, run, preview }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', subject: '', body: '' });
  const refresh = async () => setTemplates((await apiFetch<{ templates: MessageTemplate[] }>('/admin-api/templates')).templates);
  const update = (id: string, changes: Partial<MessageTemplate>) => setTemplates((current) => current.map((row) => row.id === id ? { ...row, ...changes } : row));
  const save = (template: MessageTemplate) => run(`template-${template.id}`, async () => {
    if (!preview) {
      await apiFetch(`/admin-api/templates/${encodeURIComponent(template.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...template, active: Boolean(template.active) }) });
      await refresh();
    }
    setEditingId(null);
  });
  const remove = (template: MessageTemplate) => run(`template-${template.id}`, async () => {
    if (!window.confirm(`Delete the “${template.name}” template?`)) return;
    if (!preview) await apiFetch(`/admin-api/templates/${encodeURIComponent(template.id)}`, { method: 'DELETE' });
    setTemplates((current) => current.filter((row) => row.id !== template.id));
  });
  const create = () => run('template-new', async () => {
    if (preview) setTemplates((current) => [...current, { id: crypto.randomUUID(), ...draft, active: 1 }]);
    else {
      await apiFetch('/admin-api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      await refresh();
    }
    setDraft({ name: '', subject: '', body: '' });
    setAdding(false);
  });

  return <section className="mt-7 max-w-6xl">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold">Message templates</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">Reusable wording stays compact until you choose a template to edit.</p></div><button onClick={() => setAdding((open) => !open)} aria-expanded={adding} aria-controls="new-template" className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Plus className="mr-2 h-4 w-4" /> {adding ? 'Close form' : 'Add template'}</button></div>
    <AnimatedDisclosure open={adding} id="new-template"><div className="mt-5 rounded-xl bg-[#402b24] p-5"><div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Name<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className={fieldClass} /></label><label className={labelClass}>Subject<input value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Message<textarea rows={5} value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} className={fieldClass} /></label></div><button onClick={create} disabled={!draft.name.trim() || !draft.subject.trim() || !draft.body.trim()} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--brand-orange)] px-5 font-bold text-white disabled:opacity-40"><Plus className="mr-2 h-4 w-4" /> Save new template</button></div></AnimatedDisclosure>
    <div className="mt-6 space-y-3">{templates.map((template) => <article key={template.id} className="rounded-xl bg-[#06242c] p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{template.name}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${template.active ? 'bg-emerald-300/10 text-emerald-200' : 'bg-white/8 text-[#B7D2D7]'}`}>{template.active ? 'Active' : 'Inactive'}</span></div><p className="mt-2 text-sm text-[#B7D2D7]">{template.subject}</p><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#F8F4E8]/55">{template.body}</p></div><button onClick={() => setEditingId((id) => id === template.id ? null : template.id)} aria-expanded={editingId === template.id} aria-controls={`template-${template.id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Pencil className="mr-2 h-4 w-4" /> Edit</button></div><AnimatedDisclosure open={editingId === template.id} id={`template-${template.id}`}><div className="pt-5"><div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Template name<input value={template.name} onChange={(event) => update(template.id, { name: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Email subject<input value={template.subject} onChange={(event) => update(template.id, { subject: event.target.value })} className={fieldClass} /></label><label className={`${labelClass} sm:col-span-2`}>Message<textarea rows={4} value={template.body} onChange={(event) => update(template.id, { body: event.target.value })} className={fieldClass} /></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={Boolean(template.active)} onChange={(event) => update(template.id, { active: event.target.checked ? 1 : 0 })} className="h-4 w-4 accent-[#11C7D9]" /> Active</label><div className="flex gap-2"><button onClick={() => remove(template)} className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-bold text-red-200 hover:bg-red-400/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</button><button onClick={() => save(template)} className="inline-flex min-h-10 items-center rounded-lg bg-[#11C7D9] px-4 text-sm font-bold text-[#001219]"><Save className="mr-2 h-4 w-4" /> Save</button></div></div></div></AnimatedDisclosure></article>)}</div>
  </section>;
};

type StaffRow = { email: string; display_name: string | null; role: StaffRole; active: number };
type StaffPanelProps = { rows: StaffRow[]; setRows: React.Dispatch<React.SetStateAction<StaffRow[]>>; run: (key: string, action: () => Promise<void>) => Promise<void>; preview: boolean; currentEmail: string };

const CompactStaffPanel: React.FC<StaffPanelProps> = ({ rows, setRows, run, preview, currentEmail }) => {
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ email: string; displayName: string; role: StaffRole }>({ email: '', displayName: '', role: 'staff' });
  const refresh = async () => setRows((await apiFetch<{ staff: StaffRow[] }>('/admin-api/staff')).staff);
  const update = (email: string, changes: Partial<StaffRow>) => setRows((current) => current.map((row) => row.email === email ? { ...row, ...changes } : row));
  const save = (member: StaffRow) => run(`staff-${member.email}`, async () => {
    if (!preview) {
      await apiFetch(`/admin-api/staff/${encodeURIComponent(member.email)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: member.display_name, role: member.role, active: Boolean(member.active) }) });
      await refresh();
    }
    setEditingEmail(null);
  });
  const remove = (member: StaffRow) => run(`staff-${member.email}`, async () => {
    if (!window.confirm(`Remove staff access for ${member.email}?`)) return;
    if (!preview) { await apiFetch(`/admin-api/staff/${encodeURIComponent(member.email)}`, { method: 'DELETE' }); await refresh(); }
    else setRows((current) => current.map((row) => row.email === member.email ? { ...row, active: 0 } : row));
  });
  const add = () => run('staff-new', async () => {
    if (preview) setRows((current) => [...current.filter((row) => row.email !== draft.email), { email: draft.email, display_name: draft.displayName, role: draft.role, active: 1 }]);
    else { await apiFetch('/admin-api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) }); await refresh(); }
    setDraft({ email: '', displayName: '', role: 'staff' });
    setAdding(false);
  });

  return <section className="mt-7 max-w-6xl">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold">Staff access</h2><p className="mt-2 text-sm text-[#F8F4E8]/58">Membership stays easy to scan. Editing requires an explicit action.</p></div><button onClick={() => setAdding((open) => !open)} aria-expanded={adding} aria-controls="new-staff" className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Plus className="mr-2 h-4 w-4" /> {adding ? 'Close form' : 'Add staff'}</button></div>
    <AnimatedDisclosure open={adding} id="new-staff"><div className="mt-5 rounded-xl bg-[#402b24] p-5"><div className="grid gap-4 sm:grid-cols-3"><label className={labelClass}>Name<input value={draft.displayName} onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))} className={fieldClass} /></label><label className={labelClass}>Email<input type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className={fieldClass} /></label><label className={labelClass}>Role<select value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as StaffRole }))} className={fieldClass}><option value="staff">Staff</option><option value="owner">Owner</option></select></label></div><button onClick={add} disabled={!draft.email.trim()} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--brand-orange)] px-5 font-bold text-white disabled:opacity-40"><Plus className="mr-2 h-4 w-4" /> Save staff member</button></div></AnimatedDisclosure>
    <div className="mt-6 space-y-3">{rows.map((member) => <article key={member.email} className="rounded-xl bg-[#06242c] p-5"><div className="flex items-center justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{member.display_name || 'Unnamed staff member'}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${member.active ? 'bg-emerald-300/10 text-emerald-200' : 'bg-white/8 text-[#B7D2D7]'}`}>{member.active ? 'Active' : 'Inactive'}</span><span className="rounded-full bg-[#11C7D9]/10 px-2 py-1 text-xs font-bold text-[#BDF5FA]">{member.role}</span></div><p className="mt-2 text-sm text-[#B7D2D7]">{member.email}</p></div><button onClick={() => setEditingEmail((email) => email === member.email ? null : member.email)} aria-expanded={editingEmail === member.email} aria-controls={`staff-${member.email}`} className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-[#0d3943] px-4 text-sm font-bold text-[#D9EEF1] hover:bg-[#124852]"><Pencil className="mr-2 h-4 w-4" /> Edit</button></div><AnimatedDisclosure open={editingEmail === member.email} id={`staff-${member.email}`}><div className="pt-5"><div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px] ft"><label className={labelClass}>Display name<input value={member.display_name || ''} onChange={(event) => update(member.email, { display_name: event.target.value })} className={fieldClass} /></label><label className={labelClass}>Role<select value={member.role} onChange={(event) => update(member.email, { role: event.target.value as StaffRole })} className={fieldClass}><option value="staff">Staff</option><option value="owner">Owner</option></select></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={Boolean(member.active)} onChange={(event) => update(member.email, { active: event.target.checked ? 1 : 0 })} className="h-4 w-4 accent-[#11C7D9]" /> Active</label><div className="flex gap-2">{member.email !== currentEmail && <button onClick={() => remove(member)} className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-bold text-red-200 hover:bg-red-400/10"><Trash2 className="mr-2 h-4 w-4" /> Remove</button>}<button onClick={() => save(member)} className="inline-flex min-h-10 items-center rounded-lg bg-[#11C7D9] px-4 text-sm font-bold text-[#001219]"><Save className="mr-2 h-4 w-4" /> Save</button></div></div></div></AnimatedDisclosure></article>)}</div>
  </section>;
};

export default Admin;
