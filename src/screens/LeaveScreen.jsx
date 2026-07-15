import { useState, useEffect, useContext } from 'react';
import {
  CalendarOff, CheckCircle2, XCircle, Clock3,
  FileText, AlertCircle, X, Plus, ChevronDown
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { requestLeave, getMyLeaves, getAllLeaves, reviewLeave } from '../api/client.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const LEAVE_TYPES = {
  Annual:  { color: '#0E5C52', bg: '#0E5C5218' },
  Sick:    { color: '#B5433A', bg: '#B5433A18' },
  Casual:  { color: '#C7912F', bg: '#C7912F18' },
  Unpaid:  { color: '#6B7A74', bg: '#6B7A7418' },
  Other:   { color: '#7C5CBF', bg: '#7C5CBF18' },
};

const LEAVE_BALANCE = { Annual: 14, Sick: 10, Casual: 7 };

const STATUS_CFG = {
  pending:  { color: '#C7912F', bg: '#C7912F18', label: 'Pending', dot: true },
  approved: { color: '#0E5C52', bg: '#0E5C5218', label: 'Approved', dot: false },
  rejected: { color: '#B5433A', bg: '#B5433A18', label: 'Rejected', dot: false },
};

function calcDays(start, end) {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return Math.max(1, Math.round(diff / 86400000) + 1);
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[(status || '').toLowerCase()] || STATUS_CFG.pending;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {cfg.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
      {cfg.label}
    </span>
  );
}

// ── Leave Type Badge ──────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = LEAVE_TYPES[type] || LEAVE_TYPES.Other;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700 }}>
      {type}
    </span>
  );
}

// ── Request Modal ─────────────────────────────────────────────────────────────
function RequestModal({ t, onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ type: 'Annual', startDate: today, endDate: today, reason: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const days = calcDays(form.startDate, form.endDate);

  function validate() {
    const e = {};
    if (!form.startDate) e.startDate = 'Required';
    if (!form.endDate) e.endDate = 'Required';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) e.endDate = 'End must be after start';
    if (!form.reason.trim()) e.reason = 'Please provide a reason';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError('');
    try {
      await requestLeave({ type: form.type, startDate: form.startDate, endDate: form.endDate, reason: form.reason });
      onSaved();
    } catch (err) {
      setApiError(err.message || 'Failed to submit leave request');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = (err) => ({
    width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: '0.85rem',
    background: t.bgSubtle, border: `1.5px solid ${err ? t.danger : t.border}`,
    color: t.text, outline: 'none', boxSizing: 'border-box',
  });
  const labelStyle = { fontSize: '0.75rem', fontWeight: 700, color: t.textMuted, marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const errStyle = { fontSize: '0.7rem', color: t.danger, marginTop: 3 };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>Request Leave</h2>
          <button onClick={onClose} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={t.textMuted} />
          </button>
        </div>

        {apiError && (
          <div style={{ background: `${t.danger}15`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: t.danger, border: `1px solid ${t.danger}33` }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Leave Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(LEAVE_TYPES).map(type => {
                const cfg = LEAVE_TYPES[type];
                const active = form.type === type;
                return (
                  <button key={type} type="button" onClick={() => set('type', type)}
                    style={{ padding: '8px 4px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: `2px solid ${active ? cfg.color : t.border}`, background: active ? cfg.bg : t.bgSubtle, color: active ? cfg.color : t.textMuted, transition: 'all 0.15s' }}>
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Start Date</label>
              <input type="date" style={inputStyle(errors.startDate)} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              {errors.startDate && <div style={errStyle}>{errors.startDate}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>End Date</label>
              <input type="date" style={inputStyle(errors.endDate)} value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)} />
              {errors.endDate && <div style={errStyle}>{errors.endDate}</div>}
            </div>
          </div>
          {/* Days auto-calculated */}
          <div style={{ marginBottom: 14, padding: '10px 14px', background: `${t.primary}12`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOff size={15} color={t.primary} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: t.primary }}>{days} day{days !== 1 ? 's' : ''} of leave</span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Reason</label>
            <textarea style={{ ...inputStyle(errors.reason), minHeight: 80, resize: 'vertical' }} value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Briefly describe the reason…" />
            {errors.reason && <div style={errStyle}>{errors.reason}</div>}
          </div>
          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? t.textMuted : t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', transition: 'all 0.18s' }}>
            {saving ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Leave Card ────────────────────────────────────────────────────────────────
function LeaveCard({ t, leave, isAdmin = false, onApprove, onReject }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [acting, setActing] = useState(false);
  const days = calcDays(leave.startDate, leave.endDate);

  async function doApprove() {
    setActing(true);
    try { await onApprove(leave._id); } finally { setActing(false); }
  }
  async function doReject() {
    setActing(true);
    try { await onReject(leave._id, rejectNote); setShowRejectInput(false); } finally { setActing(false); }
  }

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, boxShadow: t.shadow, overflow: 'hidden' }}>
      {/* Color strip */}
      <div style={{ height: 4, background: LEAVE_TYPES[leave.type]?.color || t.textMuted }} />
      <div style={{ padding: '14px 16px' }}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2" style={{ marginBottom: 10 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={leave.type} />
            <StatusBadge status={leave.status} />
          </div>
          <div style={{ fontSize: '0.72rem', color: t.textMuted, flexShrink: 0, fontWeight: 600 }}>{days} day{days !== 1 ? 's' : ''}</div>
        </div>

        {/* Employee name (admin view) */}
        {isAdmin && leave.employee?.name && (
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: t.primary, flexShrink: 0 }}>
              {leave.employee.name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: t.text }}>{leave.employee.name}</span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          <CalendarOff size={13} color={t.textMuted} />
          <span style={{ fontSize: '0.78rem', color: t.textMuted }}>
            {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
          </span>
        </div>

        {/* Reason */}
        <div style={{ fontSize: '0.8rem', color: t.text, lineHeight: 1.5 }}>{leave.reason}</div>

        {/* Admin note */}
        {leave.adminNote && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: t.bgSubtle, borderRadius: 8, fontSize: '0.75rem', color: t.textMuted }}>
            <span style={{ fontWeight: 700 }}>Admin: </span>{leave.adminNote}
          </div>
        )}

        {/* Admin actions for pending */}
        {isAdmin && leave.status === 'pending' && (
          <div style={{ marginTop: 12 }}>
            {!showRejectInput ? (
              <div className="flex gap-2">
                <button onClick={doApprove} disabled={acting}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, background: `${LEAVE_TYPES.Annual.bg}`, border: `1.5px solid ${LEAVE_TYPES.Annual.color}`, color: LEAVE_TYPES.Annual.color, fontWeight: 700, fontSize: '0.78rem', cursor: acting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button onClick={() => setShowRejectInput(true)} disabled={acting}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, background: `${LEAVE_TYPES.Sick.bg}`, border: `1.5px solid ${LEAVE_TYPES.Sick.color}`, color: LEAVE_TYPES.Sick.color, fontWeight: 700, fontSize: '0.78rem', cursor: acting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            ) : (
              <div>
                <input
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  placeholder="Reason for rejection (optional)…"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${t.danger}`, background: t.bgSubtle, color: t.text, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                />
                <div className="flex gap-2">
                  <button onClick={doReject} disabled={acting}
                    style={{ flex: 1, padding: '8px', borderRadius: 10, background: `${t.danger}18`, border: `1.5px solid ${t.danger}`, color: t.danger, fontWeight: 700, fontSize: '0.78rem', cursor: acting ? 'not-allowed' : 'pointer' }}>
                    {acting ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                  <button onClick={() => setShowRejectInput(false)} style={{ padding: '8px 14px', borderRadius: 10, background: t.bgSubtle, border: `1px solid ${t.border}`, color: t.textMuted, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Agent Leave View ──────────────────────────────────────────────────────────
function AgentLeaveView({ t }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequest, setShowRequest] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getMyLeaves();
      if (res?.success) setLeaves(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const usedAnnual  = leaves.filter(l => l.type === 'Annual' && l.status === 'approved').reduce((a, l) => a + calcDays(l.startDate, l.endDate), 0);
  const usedSick    = leaves.filter(l => l.type === 'Sick'   && l.status === 'approved').reduce((a, l) => a + calcDays(l.startDate, l.endDate), 0);
  const usedCasual  = leaves.filter(l => l.type === 'Casual' && l.status === 'approved').reduce((a, l) => a + calcDays(l.startDate, l.endDate), 0);

  return (
    <>
      {/* Leave balance */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow, padding: 18, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Leave Balance</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Annual', total: LEAVE_BALANCE.Annual, used: usedAnnual, color: LEAVE_TYPES.Annual.color, bg: LEAVE_TYPES.Annual.bg },
            { label: 'Sick',   total: LEAVE_BALANCE.Sick,   used: usedSick,   color: LEAVE_TYPES.Sick.color,   bg: LEAVE_TYPES.Sick.bg },
            { label: 'Casual', total: LEAVE_BALANCE.Casual, used: usedCasual, color: LEAVE_TYPES.Casual.color, bg: LEAVE_TYPES.Casual.bg },
          ].map(({ label, total, used, color, bg }) => (
            <div key={label} style={{ background: bg, border: `1.5px solid ${color}33`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Poppins', color }}>{total - used}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: '0.62rem', color: `${color}99`, marginTop: 1 }}>{used}/{total} used</div>
              {/* Mini progress bar */}
              <div style={{ height: 4, background: `${color}22`, borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (used/total)*100)}%`, background: color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request button + list */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>My Requests</div>
        <button onClick={() => setShowRequest(true)}
          className="flex items-center gap-1"
          style={{ background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Poppins' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={14} /> Request Leave
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: `${t.danger}12`, border: `1px solid ${t.danger}33`, marginBottom: 14 }}>
          <AlertCircle size={16} color={t.danger} />
          <span style={{ fontSize: '0.82rem', color: t.danger }}>{error}</span>
          <button onClick={load} style={{ marginLeft: 'auto', fontSize: '0.75rem', color: t.danger, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: 120, borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }} />)}
        </div>
      ) : leaves.length === 0 ? (
        <div className="flex flex-col items-center" style={{ paddingTop: 40, gap: 10 }}>
          <CalendarOff size={48} color={t.textMuted} strokeWidth={1.2} />
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: t.text }}>No Leave Requests</div>
          <div style={{ fontSize: '0.82rem', color: t.textMuted }}>Submit a request when you need time off</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaves.map(l => <LeaveCard key={l._id} t={t} leave={l} />)}
        </div>
      )}

      {showRequest && <RequestModal t={t} onClose={() => setShowRequest(false)} onSaved={() => { setShowRequest(false); load(); }} />}
    </>
  );
}

// ── Admin Leave View ──────────────────────────────────────────────────────────
const TABS = ['Pending', 'Approved', 'Rejected', 'All'];

function AdminLeaveView({ t }) {
  const [activeTab, setActiveTab] = useState('Pending');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const filters = activeTab !== 'All' ? { status: activeTab.toLowerCase() } : {};
      const res = await getAllLeaves(filters);
      if (res?.success) setLeaves(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeTab]);

  async function handleApprove(id) {
    try { await reviewLeave(id, { status: 'approved' }); load(); } catch (e) { /* ignore */ }
  }
  async function handleReject(id, note) {
    try { await reviewLeave(id, { status: 'rejected', adminNote: note }); load(); } catch (e) { /* ignore */ }
  }

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: t.bgSubtle, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '8px 4px', borderRadius: 14, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: activeTab === tab ? t.card : 'transparent', color: activeTab === tab ? t.primary : t.textMuted, boxShadow: activeTab === tab ? t.shadow : 'none', transition: 'all 0.15s', position: 'relative' }}>
            {tab}
            {tab === 'Pending' && pendingCount > 0 && !loading && (
              <span style={{ position: 'absolute', top: 4, right: 8, width: 16, height: 16, borderRadius: '50%', background: t.overdue, color: t.onPrimary, fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: `${t.danger}12`, border: `1px solid ${t.danger}33`, marginBottom: 14 }}>
          <AlertCircle size={16} color={t.danger} />
          <span style={{ fontSize: '0.82rem', color: t.danger }}>{error}</span>
          <button onClick={load} style={{ marginLeft: 'auto', fontSize: '0.75rem', color: t.danger, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="animate-pulse" style={{ height: 130, borderRadius: 16, background: t.card, border: `1px solid ${t.border}` }} />)}
        </div>
      ) : leaves.length === 0 ? (
        <div className="flex flex-col items-center" style={{ paddingTop: 40, gap: 10 }}>
          <FileText size={48} color={t.textMuted} strokeWidth={1.2} />
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: t.text }}>No {activeTab} Requests</div>
          <div style={{ fontSize: '0.82rem', color: t.textMuted }}>Nothing to review in this category</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaves.map(l => (
            <LeaveCard key={l._id} t={t} leave={l} isAdmin
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LeaveScreen({ t, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Leave" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6">
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isAdmin ? 'Leave Management' : 'My Leave'}
            </div>
          </div>
          {isAdmin ? <AdminLeaveView t={t} /> : <AgentLeaveView t={t} />}
        </div>
      </div>
    </div>
  );
}
