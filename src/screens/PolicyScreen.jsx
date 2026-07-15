import { useState, useEffect, useContext } from 'react';
import {
  BookOpen, Plus, Edit3, Trash2, Shield,
  FileText, Users, X, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { getPolicies, createPolicy, updatePolicy, deletePolicy } from '../api/client.js';

// ── Category Config ────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'HR', 'Operations', 'Finance', 'General', 'Field'];

const CAT_CFG = {
  HR:         { color: '#0E5C52', bg: '#0E5C5218', icon: Users },
  Operations: { color: '#C7912F', bg: '#C7912F18', icon: Shield },
  Finance:    { color: '#3E7A4C', bg: '#3E7A4C18', icon: FileText },
  General:    { color: '#6B7A74', bg: '#6B7A7418', icon: BookOpen },
  Field:      { color: '#7C5CBF', bg: '#7C5CBF18', icon: FileText },
};

function getCatCfg(category) {
  return CAT_CFG[category] || CAT_CFG.General;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Category Badge ────────────────────────────────────────────────────────────
function CatBadge({ category }) {
  const cfg = getCatCfg(category);
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700 }}>
      {category}
    </span>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ t, policy, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  async function doDelete() {
    setDeleting(true);
    try {
      await deletePolicy(policy._id);
      onDeleted();
    } catch (err) {
      setError(err.message || 'Delete failed');
      setDeleting(false);
    }
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 380, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${t.danger}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Trash2 size={22} color={t.danger} />
          </div>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text, marginBottom: 6 }}>Delete Policy?</div>
          <div style={{ fontSize: '0.82rem', color: t.textMuted }}>
            "<span style={{ fontWeight: 600, color: t.text }}>{policy.title}</span>" will be permanently deleted.
          </div>
          {error && <div style={{ marginTop: 10, fontSize: '0.78rem', color: t.danger }}>{error}</div>}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 12, background: t.bgSubtle, border: `1px solid ${t.border}`, color: t.textMuted, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={doDelete} disabled={deleting}
            style={{ flex: 1, padding: '10px', borderRadius: 12, background: t.danger, border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Policy Form Modal ─────────────────────────────────────────────────────────
function PolicyModal({ t, onClose, onSaved, initial = null }) {
  const isEdit = !!initial;
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(isEdit ? {
    title: initial.title || '',
    category: initial.category || 'General',
    content: initial.content || '',
    effectiveDate: initial.effectiveDate ? initial.effectiveDate.slice(0, 10) : today,
  } : { title: '', category: 'General', content: '', effectiveDate: today });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.content.trim()) e.content = 'Content is required';
    if (!form.effectiveDate) e.effectiveDate = 'Date is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError('');
    try {
      if (isEdit) await updatePolicy(initial._id, form);
      else await createPolicy(form);
      onSaved();
    } catch (err) {
      setApiError(err.message || 'Save failed');
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
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>
            {isEdit ? 'Edit Policy' : 'Add Policy'}
          </h2>
          <button onClick={onClose} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={t.textMuted} />
          </button>
        </div>
        {apiError && (
          <div style={{ background: `${t.danger}15`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: t.danger, border: `1px solid ${t.danger}33` }}>{apiError}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle(errors.title)} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Policy title…" />
            {errors.title && <div style={errStyle}>{errors.title}</div>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Category</label>
              <select style={{ ...inputStyle(), cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Effective Date</label>
              <input type="date" style={inputStyle(errors.effectiveDate)} value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} />
              {errors.effectiveDate && <div style={errStyle}>{errors.effectiveDate}</div>}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Content</label>
            <textarea style={{ ...inputStyle(errors.content), minHeight: 140, resize: 'vertical', lineHeight: 1.6 }} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Write the full policy content here…" />
            {errors.content && <div style={errStyle}>{errors.content}</div>}
          </div>
          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? t.textMuted : t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', transition: 'all 0.18s' }}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Policy'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Read-More Modal ───────────────────────────────────────────────────────────
function ReadModal({ t, policy, onClose }) {
  const cfg = getCatCfg(policy.category);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 6, background: cfg.color }} />
        <div style={{ padding: 24 }}>
          <div className="flex items-start justify-between gap-3" style={{ marginBottom: 16 }}>
            <div>
              <CatBadge category={policy.category} />
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: t.text, marginTop: 8 }}>{policy.title}</h2>
              {policy.effectiveDate && (
                <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 4 }}>Effective: {formatDate(policy.effectiveDate)}</div>
              )}
            </div>
            <button onClick={onClose} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={16} color={t.textMuted} />
            </button>
          </div>
          <div style={{ fontSize: '0.88rem', color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', padding: '16px', background: t.bgSubtle, borderRadius: 12 }}>
            {policy.content}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Policy Card ───────────────────────────────────────────────────────────────
function PolicyCard({ t, policy, isAdmin, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [readModal, setReadModal] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cfg = getCatCfg(policy.category);
  const CatIcon = cfg.icon;

  const preview = policy.content?.length > 120 ? policy.content.slice(0, 120) + '…' : policy.content;

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: hovered ? t.shadowMd : t.shadow, transform: hovered ? 'translateY(-2px)' : 'none', transition: 'all 0.18s ease', overflow: 'hidden' }}
      >
        {/* Top color strip */}
        <div style={{ height: 5, background: cfg.color }} />
        <div style={{ padding: '16px 18px' }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2" style={{ marginBottom: 10 }}>
            <div className="flex items-center gap-2">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CatIcon size={16} color={cfg.color} />
              </div>
              <div>
                <CatBadge category={policy.category} />
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(policy)} style={{ background: t.primarySoft, border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={12} color={t.primary} />
                </button>
                <button onClick={() => onDelete(policy)} style={{ background: `${t.danger}18`, border: 'none', borderRadius: 7, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={12} color={t.danger} />
                </button>
              </div>
            )}
          </div>

          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: t.text, marginBottom: 6, lineHeight: 1.3 }}>{policy.title}</div>

          {policy.effectiveDate && (
            <div style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 600, marginBottom: 8 }}>
              Effective: {formatDate(policy.effectiveDate)}
            </div>
          )}

          <div style={{ fontSize: '0.8rem', color: t.textMuted, lineHeight: 1.55, marginBottom: 10 }}>
            {expanded ? policy.content : preview}
          </div>

          {/* Read more / collapse */}
          {policy.content?.length > 120 ? (
            <button
              onClick={() => setReadModal(true)}
              style={{ fontSize: '0.75rem', color: t.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <BookOpen size={12} /> Read More
            </button>
          ) : null}
        </div>
      </div>

      {readModal && <ReadModal t={t} policy={policy} onClose={() => setReadModal(false)} />}
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function PolicyScreen({ t, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getPolicies(activeCategory !== 'All' ? activeCategory : '');
      if (res?.success) setPolicies(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeCategory]);

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Policies" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6">

          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: 20 }}>
            {/* Category filter tabs */}
            <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                    background: activeCategory === cat ? (cat === 'All' ? t.primary : getCatCfg(cat).color) : t.card,
                    color: activeCategory === cat ? (cat === 'All' ? t.onPrimary : '#fff') : t.textMuted,
                    boxShadow: activeCategory === cat ? t.shadow : 'none',
                    transition: 'all 0.15s',
                    border: activeCategory === cat ? 'none' : `1px solid ${t.border}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1"
                style={{ background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, padding: '9px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={14} /> Add Policy
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: `${t.danger}12`, border: `1px solid ${t.danger}33`, marginBottom: 16 }}>
              <AlertCircle size={18} color={t.danger} />
              <span style={{ fontSize: '0.85rem', color: t.danger }}>{error}</span>
              <button onClick={load} style={{ marginLeft: 'auto', fontSize: '0.78rem', color: t.danger, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                  <div style={{ height: 5, background: t.bgSubtle }} />
                  <div style={{ padding: 18 }}>
                    <div style={{ height: 12, width: '40%', background: t.bgSubtle, borderRadius: 6, marginBottom: 10 }} />
                    <div style={{ height: 14, width: '80%', background: t.bgSubtle, borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 10, width: '60%', background: t.bgSubtle, borderRadius: 6, marginBottom: 6 }} />
                    <div style={{ height: 10, width: '90%', background: t.bgSubtle, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center" style={{ paddingTop: 60, gap: 12 }}>
              <BookOpen size={52} color={t.textMuted} strokeWidth={1.2} />
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>No Policies Found</div>
              <div style={{ fontSize: '0.82rem', color: t.textMuted }}>
                {activeCategory !== 'All' ? `No ${activeCategory} policies yet` : 'No company policies have been added'}
              </div>
              {isAdmin && (
                <button onClick={() => setShowForm(true)} style={{ marginTop: 8, background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.85rem' }}>
                  Add First Policy
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {policies.map(policy => (
                <PolicyCard
                  key={policy._id}
                  t={t}
                  policy={policy}
                  isAdmin={isAdmin}
                  onEdit={p => setEditTarget(p)}
                  onDelete={p => setDeleteTarget(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <PolicyModal t={t} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
      {editTarget && (
        <PolicyModal t={t} initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}
      {deleteTarget && (
        <DeleteModal t={t} policy={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); load(); }} />
      )}
    </div>
  );
}
