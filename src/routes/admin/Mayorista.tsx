import { useEffect, useState } from 'react';

import { adminApi, type AdminHorecaLead } from '../../lib/admin-api';

type Filter = 'all' | 'pending' | 'contacted';

export default function AdminMayorista() {
  const [leads, setLeads] = useState<AdminHorecaLead[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = (f: Filter) => {
    setLoading(true);
    adminApi
      .listHorecaLeads(f === 'all' ? undefined : f)
      .then(setLeads)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(filter), [filter]);

  const toggleContacted = async (lead: AdminHorecaLead) => {
    try {
      await adminApi.updateHorecaLead(lead.id, { contacted: !lead.contacted_at });
      load(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const saveNote = async (lead: AdminHorecaLead, notes: string) => {
    try {
      await adminApi.updateHorecaLead(lead.id, { notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (lead: AdminHorecaLead) => {
    if (!confirm(`¿Borrar el lead de ${lead.company}?`)) return;
    try {
      await adminApi.deleteHorecaLead(lead.id);
      load(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Leads Mayorista</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">
            Consultas B2B desde /horeca. Marcá contactado y dejá notas de seguimiento.
          </p>
        </div>
        <div className="flex gap-1 rounded-md bg-white p-1 shadow-sm">
          {(['all', 'pending', 'contacted'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                filter === f ? 'bg-tengu-ink text-tengu-cream' : 'text-tengu-dark/60 hover:bg-tengu-dark/5'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Sin contactar' : 'Contactados'}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : leads.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">No hay leads en este filtro.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onToggle={toggleContacted} onSaveNote={saveNote} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  onToggle,
  onSaveNote,
  onRemove,
}: {
  lead: AdminHorecaLead;
  onToggle: (l: AdminHorecaLead) => void;
  onSaveNote: (l: AdminHorecaLead, notes: string) => void;
  onRemove: (l: AdminHorecaLead) => void;
}) {
  const [note, setNote] = useState(lead.notes ?? '');
  const contacted = !!lead.contacted_at;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg">
            {lead.company}
            {lead.business_type && <span className="ml-2 text-xs uppercase tracking-wider text-tengu-mustard">{lead.business_type}</span>}
          </p>
          <p className="text-sm text-tengu-dark/70">
            {lead.contact_name} · <a href={`mailto:${lead.email}`} className="text-tengu-ink hover:underline">{lead.email}</a> · {lead.phone}
          </p>
          <p className="mt-0.5 text-xs text-tengu-dark/50">
            {lead.city && <>{lead.city} · </>}
            {lead.kg_per_month && <>{lead.kg_per_month}/mes · </>}
            {lead.machine_type && <>{lead.machine_type} · </>}
            {new Date(lead.created_at).toLocaleDateString('es-CL')}
          </p>
        </div>
        <button
          onClick={() => onToggle(lead)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            contacted ? 'bg-emerald-100 text-emerald-900' : 'bg-tengu-mustard/20 text-tengu-dark'
          }`}
        >
          {contacted ? '✓ Contactado' : 'Sin contactar'}
        </button>
      </div>

      {lead.message && (
        <p className="mt-3 whitespace-pre-line rounded-md bg-tengu-cream/40 p-3 text-sm text-tengu-dark/80">
          {lead.message}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (lead.notes ?? '') && onSaveNote(lead, note)}
          placeholder="Notas internas (se guardan al salir del campo)"
          maxLength={1000}
          className="flex-1 rounded-md border border-tengu-dark/15 bg-white px-3 py-2 text-sm"
        />
        <a
          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-emerald-700"
        >
          WhatsApp
        </a>
        <button onClick={() => onRemove(lead)} className="text-xs uppercase tracking-wider text-tengu-coral hover:underline">
          Borrar
        </button>
      </div>
    </div>
  );
}
