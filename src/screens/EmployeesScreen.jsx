import { useState, useEffect, useContext } from 'react';
import {
  Users, UserPlus, Edit3, Briefcase, Building2,
  Phone, Mail, Calendar, DollarSign, MapPin,
  AlertCircle, Search, X, ChevronDown, User, Shield
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import {
  getEmployees, registerEmployee,
  updateEmployee, getMyProfile
} from '../api/client.js';

// ── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function StatusBadge({ status, t }) {
  const cfg = {
    active:    { bg: `${t.active}1A`,    color: t.active,    label: 'Active' },
    inactive:  { bg: `${t.textMuted}1A`, color: t.textMuted, label: 'Inactive' },
    suspended: { bg: `${t.danger}1A`,    color: t.danger,    label: 'Suspended' },
  };
  const c = cfg[(status || 'active').toLowerCase()] || cfg.active;
  return (
    <span style={{
      background: c.bg, color: c.color, borderRadius: 20,
      padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700,
      display: 'inline-block', letterSpacing: '0.03em',
    }}>
      {c.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value, t }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2" style={{ marginBottom: 8 }}>
      <Icon size={14} color={t.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: t.text, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

// ── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ t }) {
  return (
    <div className="animate-pulse rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.border}`, minHeight: 150 }}>
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: t.bgSubtle }} />
        <div className="flex-1">
          <div style={{ height: 14, width: '60%', background: t.bgSubtle, borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 10, width: '40%', background: t.bgSubtle, borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ height: 10, width: '80%', background: t.bgSubtle, borderRadius: 6, marginBottom: 6 }} />
      <div style={{ height: 10, width: '50%', background: t.bgSubtle, borderRadius: 6 }} />
    </div>
  );
}

// ── Register / Edit Modal ────────────────────────────────────────────────────
const DEPARTMENTS = ['Management', 'Operations', 'Finance', 'Field', 'HR', 'IT', 'Customer Service'];

function RegisterModal({ t, onClose, onSaved, initial = null }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(isEdit ? {
    department: initial.department || '',
    position:   initial.position   || '',
    salary:     initial.salary     || '',
    status:     initial.status     || 'active',
    address:    initial.address    || '',
    notes:      initial.notes      || '',
  } : {
    name: '', phone: '', email: '', department: '', position: '',
    joinDate: new Date().toISOString().slice(0, 10),
    salary: '', address: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!isEdit) {
      if (!form.name.trim()) e.name = 'Name is required';
      if (!form.phone.match(/^07[0-9]-[0-9]{7}$/)) e.phone = 'Format: 07X-XXXXXXX';
      if (form.email && !form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Invalid email';
    }
    if (!form.department) e.department = 'Select department';
    if (!form.position.trim()) e.position = 'Position is required';
    if (form.salary && isNaN(Number(form.salary))) e.salary = 'Must be a number';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError('');
    try {
      const payload = isEdit
        ? {
            department: form.department, position: form.position,
            salary: form.salary ? Number(form.salary) : undefined,
            status: form.status, address: form.address, notes: form.notes
          }
        : {
            name: form.name, phone: form.phone,
            email: form.email || undefined, department: form.department,
            position: form.position, joinDate: form.joinDate,
            salary: form.salary ? Number(form.salary) : undefined,
            address: form.address,
            emergencyContact: {
              name: form.emergencyName, phone: form.emergencyPhone,
              relation: form.emergencyRelation
            }
          };
      if (isEdit) await updateEmployee(initial._id, payload);
      else await registerEmployee(payload);
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
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 24, position: 'relative' }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>
            {isEdit ? 'Edit Employee' : 'Register Employee'}
          </h2>
          <button onClick={onClose} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={t.textMuted} />
          </button>
        </div>

        {apiError && (
          <div style={{ background: `${t.danger}15`, border: `1px solid ${t.danger}33`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: t.danger }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.72rem', color: t.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Personal Info</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle(errors.name)} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Nimal Perera" />
                {errors.name && <div style={errStyle}>{errors.name}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Phone (07X-XXXXXXX)</label>
                  <input style={inputStyle(errors.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="071-2345678" />
                  {errors.phone && <div style={errStyle}>{errors.phone}</div>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email (optional)</label>
                  <input style={inputStyle(errors.email)} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" type="email" />
                  {errors.email && <div style={errStyle}>{errors.email}</div>}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Join Date</label>
                <input style={inputStyle()} value={form.joinDate} onChange={e => set('joinDate', e.target.value)} type="date" />
              </div>
            </>
          )}

          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.72rem', color: t.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: isEdit ? 0 : 8 }}>Job Details</div>
          <div className="grid grid-cols-2 gap-3">
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Department</label>
              <select style={{ ...inputStyle(errors.department), cursor: 'pointer' }} value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <div style={errStyle}>{errors.department}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Position</label>
              <input style={inputStyle(errors.position)} value={form.position} onChange={e => set('position', e.target.value)} placeholder="e.g. Loan Officer" />
              {errors.position && <div style={errStyle}>{errors.position}</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Salary (LKR)</label>
              <input style={inputStyle(errors.salary)} value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. 45000" type="number" min="0" />
              {errors.salary && <div style={errStyle}>{errors.salary}</div>}
            </div>
            {isEdit && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Status</label>
                <select style={{ ...inputStyle(), cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Address</label>
            <input style={inputStyle()} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City, Province" />
          </div>
          {isEdit && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle(), minHeight: 72, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." />
            </div>
          )}
          {!isEdit && (
            <>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.72rem', color: t.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 8 }}>Emergency Contact</div>
              <div className="grid grid-cols-2 gap-3">
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Contact Name</label>
                  <input style={inputStyle()} value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Full name" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Relation</label>
                  <input style={inputStyle()} value={form.emergencyRelation} onChange={e => set('emergencyRelation', e.target.value)} placeholder="e.g. Spouse" />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Contact Phone</label>
                <input style={inputStyle()} value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} placeholder="07X-XXXXXXX" />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? t.textMuted : t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', marginTop: 8, transition: 'all 0.18s ease' }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Register Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ t, employee, onClose, onEdit }) {
  const initials = getInitials(employee.name);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>Employee Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(employee)} style={{ background: t.primarySoft, border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, color: t.primary }}>
              <Edit3 size={13} /> Edit
            </button>
            <button onClick={onClose} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color={t.textMuted} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.3rem', color: t.primary, flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: t.text }}>{employee.name}</div>
            <div style={{ fontSize: '0.8rem', color: t.textMuted, marginBottom: 4 }}>{employee.employeeId}</div>
            <StatusBadge status={employee.status} t={t} />
          </div>
        </div>
        <div style={{ background: t.bgSubtle, borderRadius: 14, padding: 16 }}>
          <InfoRow icon={Building2} label="Department" value={employee.department} t={t} />
          <InfoRow icon={Briefcase} label="Position" value={employee.position} t={t} />
          <InfoRow icon={Phone} label="Phone" value={employee.phone} t={t} />
          <InfoRow icon={Mail} label="Email" value={employee.email} t={t} />
          <InfoRow icon={Calendar} label="Join Date" value={employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) : null} t={t} />
          <InfoRow icon={DollarSign} label="Salary" value={employee.salary ? `Rs. ${Number(employee.salary).toLocaleString('en-LK')}` : null} t={t} />
          <InfoRow icon={MapPin} label="Address" value={employee.address} t={t} />
          {employee.emergencyContact?.name && (
            <InfoRow icon={Shield} label="Emergency Contact" value={`${employee.emergencyContact.name} (${employee.emergencyContact.relation}) — ${employee.emergencyContact.phone}`} t={t} />
          )}
        </div>
        {employee.notes && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: `${t.accent}12`, borderRadius: 10, fontSize: '0.8rem', color: t.text, border: `1px solid ${t.accent}22` }}>
            <span style={{ fontWeight: 600, color: t.accent }}>Notes: </span>{employee.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Employee Card ─────────────────────────────────────────────────────────────
function EmployeeCard({ t, employee, onView, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const initials = getInitials(employee.name);
  return (
    <div
      onClick={() => onView(employee)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: hovered ? t.shadowMd : t.shadow, transform: hovered ? 'translateY(-3px)' : 'none', transition: 'all 0.18s ease', cursor: 'pointer', padding: 18, position: 'relative' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', color: t.primary, flexShrink: 0 }}>{initials}</div>
          <div className="min-w-0">
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', color: t.text }} className="truncate">{employee.name}</div>
            <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }}>{employee.employeeId}</div>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onEdit(employee); }}
          style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Edit3 size={13} color={t.textMuted} />
        </button>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {employee.department && (
          <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: t.textMuted }}>
            <Building2 size={12} color={t.primary} /> {employee.department}
          </div>
        )}
        {employee.position && (
          <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: t.textMuted }}>
            <Briefcase size={12} color={t.accent} /> {employee.position}
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusBadge status={employee.status} t={t} />
        {employee.phone && (
          <div className="flex items-center gap-1" style={{ fontSize: '0.72rem', color: t.textMuted }}>
            <Phone size={11} /> {employee.phone}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Agent Profile View ────────────────────────────────────────────────────────
function AgentProfileView({ t, profile }) {
  const initials = getInitials(profile.name);
  const fields = [
    { icon: Building2, label: 'Department', value: profile.department },
    { icon: Briefcase, label: 'Position',   value: profile.position },
    { icon: Phone,     label: 'Phone',      value: profile.phone },
    { icon: Mail,      label: 'Email',      value: profile.email },
    { icon: Calendar,  label: 'Joined',     value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) : null },
    { icon: MapPin,    label: 'Address',    value: profile.address },
  ];
  return (
    <div>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, boxShadow: t.shadowMd, padding: 24, marginBottom: 20 }}>
        <div className="flex items-center gap-5">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.6rem', color: t.primary, flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.25rem', color: t.text }}>{profile.name}</div>
            <div style={{ fontSize: '0.82rem', color: t.textMuted, marginBottom: 6 }}>{profile.employeeId}</div>
            <StatusBadge status={profile.status} t={t} />
          </div>
        </div>
      </div>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Personal Details</div>
        <div className="flex flex-col gap-3">
          {fields.map((f, i) => f.value ? (
            <div key={i} className="flex items-center gap-3" style={{ padding: '10px 14px', background: t.bgSubtle, borderRadius: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={15} color={t.primary} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</div>
                <div style={{ fontSize: '0.85rem', color: t.text, fontWeight: 500 }}>{f.value}</div>
              </div>
            </div>
          ) : null)}
        </div>
      </div>
      {profile.emergencyContact?.name && (
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow, padding: 20 }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Emergency Contact</div>
          <div className="flex items-center gap-3" style={{ padding: '10px 14px', background: `${t.danger}0D`, borderRadius: 12, border: `1px solid ${t.danger}22` }}>
            <Shield size={16} color={t.danger} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: t.text }}>{profile.emergencyContact.name}</div>
              <div style={{ fontSize: '0.75rem', color: t.textMuted }}>{profile.emergencyContact.relation} · {profile.emergencyContact.phone}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EmployeesScreen({ t, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  async function load() {
    setLoading(true); setError('');
    try {
      if (isAdmin) {
        const res = await getEmployees(statusFilter);
        if (res?.success) setEmployees(res.data || []);
      } else {
        const res = await getMyProfile();
        if (res?.success) setProfile(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = employees.filter(e =>
    !search ||
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Employees" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6">

          {isAdmin && (
            <>
              {/* Toolbar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: 20 }}>
                <div className="flex items-center gap-2 flex-1">
                  <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                    <Search size={15} color={t.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search employees…"
                      style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 12, border: `1.5px solid ${t.border}`, background: t.card, color: t.text, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      style={{ appearance: 'none', padding: '9px 32px 9px 12px', borderRadius: 12, border: `1.5px solid ${t.border}`, background: t.card, color: t.text, fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <ChevronDown size={13} color={t.textMuted} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <button
                  onClick={() => setShowRegister(true)}
                  className="flex items-center gap-2"
                  style={{ background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Poppins', whiteSpace: 'nowrap', transition: 'all 0.18s ease' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <UserPlus size={15} /> Register Employee
                </button>
              </div>

              {error && !loading && (
                <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: `${t.danger}12`, border: `1px solid ${t.danger}33`, marginBottom: 16 }}>
                  <AlertCircle size={18} color={t.danger} />
                  <span style={{ fontSize: '0.85rem', color: t.danger }}>{error}</span>
                  <button onClick={load} style={{ marginLeft: 'auto', fontSize: '0.78rem', color: t.danger, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <SkeletonCard key={i} t={t} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: 60, gap: 12 }}>
                  <Users size={52} color={t.textMuted} strokeWidth={1.2} />
                  <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>No Employees Found</div>
                  <div style={{ fontSize: '0.82rem', color: t.textMuted }}>
                    {search ? 'Try a different search term' : 'Register the first employee to get started'}
                  </div>
                  {!search && (
                    <button onClick={() => setShowRegister(true)} style={{ marginTop: 8, background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.85rem' }}>
                      Register Employee
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map(emp => (
                    <EmployeeCard key={emp._id} t={t} employee={emp}
                      onView={setViewTarget}
                      onEdit={e => { setEditTarget(e); setViewTarget(null); }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {!isAdmin && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>My Profile</div>
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div style={{ height: 140, borderRadius: 20, background: t.card, border: `1px solid ${t.border}`, marginBottom: 16 }} />
                  <div style={{ height: 300, borderRadius: 18, background: t.card, border: `1px solid ${t.border}` }} />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3" style={{ paddingTop: 40 }}>
                  <AlertCircle size={40} color={t.danger} />
                  <div style={{ fontSize: '0.85rem', color: t.danger }}>{error}</div>
                  <button onClick={load} style={{ background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 10, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
                </div>
              ) : profile ? (
                <AgentProfileView t={t} profile={profile} />
              ) : (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: 60, gap: 12 }}>
                  <User size={52} color={t.textMuted} strokeWidth={1.2} />
                  <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>Profile Not Found</div>
                  <div style={{ fontSize: '0.82rem', color: t.textMuted }}>Contact admin to set up your employee profile.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showRegister && (
        <RegisterModal t={t} onClose={() => setShowRegister(false)} onSaved={() => { setShowRegister(false); load(); }} />
      )}
      {editTarget && (
        <RegisterModal t={t} initial={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}
      {viewTarget && (
        <DetailModal t={t} employee={viewTarget} onClose={() => setViewTarget(null)} onEdit={e => { setViewTarget(null); setEditTarget(e); }} />
      )}
    </div>
  );
}
