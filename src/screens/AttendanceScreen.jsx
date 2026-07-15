import { useState, useEffect, useContext } from 'react';
import {
  CheckCircle2, XCircle, Clock, CalendarDays,
  Users, ChevronLeft, ChevronRight, AlertCircle, X,
  ClipboardList, TrendingUp
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import {
  markAttendance, getMyAttendance, getAllAttendance,
  getEmployees
} from '../api/client.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toLocalDateStr(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const STATUS_COLORS = {
  present:  { bg: '#0E5C5220', color: '#0E5C52', label: 'Present' },
  late:     { bg: '#C7912F20', color: '#C7912F', label: 'Late' },
  absent:   { bg: '#B5433A20', color: '#B5433A', label: 'Absent' },
  halfday:  { bg: '#E3B15C20', color: '#E3B15C', label: 'Half-Day' },
  'half-day': { bg: '#E3B15C20', color: '#E3B15C', label: 'Half-Day' },
  onleave:  { bg: '#4A7BC820', color: '#4A7BC8', label: 'On Leave' },
  'on-leave': { bg: '#4A7BC820', color: '#4A7BC8', label: 'On Leave' },
};

function StatusPill({ status, t, size = 'sm' }) {
  const cfg = STATUS_COLORS[(status || '').toLowerCase()] || { bg: t.bgSubtle, color: t.textMuted, label: status || '—' };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, borderRadius: 20,
      padding: size === 'sm' ? '2px 9px' : '4px 13px',
      fontSize: size === 'sm' ? '0.68rem' : '0.78rem',
      fontWeight: 700, display: 'inline-block',
    }}>
      {cfg.label}
    </span>
  );
}

// ── Calendar Grid ─────────────────────────────────────────────────────────────
function MonthCalendar({ t, year, month, records }) {
  const recordMap = {};
  records.forEach(r => {
    const d = toLocalDateStr(r.date);
    if (d) recordMap[d] = r.status;
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1" style={{ marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: t.textMuted, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const yyyy = year, mm = String(month + 1).padStart(2,'0'), dd = String(d).padStart(2,'0');
          const dateKey = `${yyyy}-${mm}-${dd}`;
          const status = recordMap[dateKey];
          const cfg = status ? (STATUS_COLORS[status.toLowerCase()] || null) : null;
          const isToday = dateKey === today;
          return (
            <div
              key={dateKey}
              style={{
                height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: cfg ? cfg.bg : isToday ? `${t.primary}15` : t.bgSubtle,
                border: isToday ? `1.5px solid ${t.primary}` : '1.5px solid transparent',
                fontSize: '0.72rem', fontWeight: 600,
                color: cfg ? cfg.color : isToday ? t.primary : t.textMuted,
                transition: 'all 0.15s',
              }}
              title={status || (isToday ? 'Today' : '')}
            >
              {d}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3" style={{ marginTop: 14 }}>
        {[['present','Present'],['late','Late'],['absent','Absent'],['half-day','Half-Day'],['on-leave','On Leave']].map(([k,l]) => {
          const c = STATUS_COLORS[k];
          return (
            <div key={k} className="flex items-center gap-1">
              <div style={{ width: 10, height: 10, borderRadius: 3, background: c.bg, border: `1.5px solid ${c.color}` }} />
              <span style={{ fontSize: '0.65rem', color: t.textMuted }}>{l}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mark Attendance Modal ─────────────────────────────────────────────────────
function MarkModal({ t, employees = [], onClose, onMarked }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState({
    employeeId: '',
    date: todayStr(),
    status: 'present',
    checkIn: '',
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (isAdmin && !form.employeeId) e.employeeId = 'Select an employee';
    if (!form.date) e.date = 'Date is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setApiError('');
    try {
      const payload = {
        date: form.date,
        status: form.status,
        checkIn: form.checkIn || undefined,
        note: form.note || undefined,
        ...(isAdmin && form.employeeId ? { employeeId: form.employeeId } : {}),
      };
      await markAttendance(payload);
      onMarked();
    } catch (err) {
      setApiError(err.message || 'Failed to mark attendance');
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
      <div onClick={e => e.stopPropagation()} style={{ background: t.card, borderRadius: 20, boxShadow: t.shadowMd, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>Mark Attendance</h2>
          <button onClick={onClose} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={t.textMuted} />
          </button>
        </div>
        {apiError && (
          <div style={{ background: `${t.danger}15`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: t.danger, border: `1px solid ${t.danger}33` }}>
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Employee</label>
              <select style={{ ...inputStyle(errors.employeeId), cursor: 'pointer' }} value={form.employeeId} onChange={e => set('employeeId', e.target.value)}>
                <option value="">Select employee…</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
              {errors.employeeId && <div style={errStyle}>{errors.employeeId}</div>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle(errors.date)} value={form.date} onChange={e => set('date', e.target.value)} />
              {errors.date && <div style={errStyle}>{errors.date}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Check-In Time</label>
              <input type="time" style={inputStyle()} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['present','late','half-day','absent'].map(s => {
                const cfg = STATUS_COLORS[s];
                const active = form.status === s;
                return (
                  <button key={s} type="button" onClick={() => set('status', s)}
                    style={{ padding: '9px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: `2px solid ${active ? cfg.color : t.border}`, background: active ? cfg.bg : t.bgSubtle, color: active ? cfg.color : t.textMuted, transition: 'all 0.15s' }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Note (optional)</label>
            <input style={inputStyle()} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any note…" />
          </div>
          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '12px', background: saving ? t.textMuted : t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins', transition: 'all 0.18s' }}>
            {saving ? 'Saving…' : 'Mark Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color, t }) {
  return (
    <div className="flex flex-col items-center" style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: '14px 18px', flex: 1, minWidth: 80 }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Poppins', color }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Agent View ────────────────────────────────────────────────────────────────
function AgentAttendanceView({ t, onMarkSuccess }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMark, setShowMark] = useState(false);
  const [error, setError] = useState('');
  const [markedSuccess, setMarkedSuccess] = useState(false);

  async function loadAttendance(m, y) {
    setLoading(true); setError('');
    try {
      const res = await getMyAttendance(m + 1, y);
      if (res?.success) setRecords(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAttendance(month, year); }, [month, year]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const todayRecord = records.find(r => toLocalDateStr(r.date) === todayStr());
  const presentDays  = records.filter(r => r.status === 'present').length;
  const lateDays     = records.filter(r => r.status === 'late').length;
  const absentDays   = records.filter(r => r.status === 'absent').length;
  const halfDays     = records.filter(r => ['halfday','half-day'].includes((r.status||'').toLowerCase())).length;

  function handleMarked() {
    setShowMark(false);
    setMarkedSuccess(true);
    loadAttendance(month, year);
    setTimeout(() => setMarkedSuccess(false), 3000);
  }

  return (
    <>
      {/* Today's status card */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, boxShadow: t.shadowMd, padding: 22, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
          Today — {new Date().toLocaleDateString('en-LK', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        {todayRecord ? (
          <div className="flex items-center gap-4">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: STATUS_COLORS[todayRecord.status?.toLowerCase()]?.bg || t.bgSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={28} color={STATUS_COLORS[todayRecord.status?.toLowerCase()]?.color || t.textMuted} />
            </div>
            <div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>Attendance Marked</div>
              <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: 3 }}>
                {todayRecord.checkIn ? `Check-in: ${todayRecord.checkIn}` : 'No check-in time recorded'}
              </div>
              <div style={{ marginTop: 6 }}><StatusPill status={todayRecord.status} t={t} size="md" /></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${t.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={26} color={t.danger} />
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>Not Marked Yet</div>
              <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: 3 }}>Mark your attendance for today</div>
            </div>
            <button
              onClick={() => setShowMark(true)}
              style={{ background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'all 0.18s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Mark Now
            </button>
          </div>
        )}
        {markedSuccess && (
          <div style={{ marginTop: 12, padding: '8px 14px', background: `${t.active}15`, borderRadius: 10, fontSize: '0.8rem', color: t.active, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} /> Attendance marked successfully!
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-3" style={{ marginBottom: 20 }}>
        <StatPill label="Present" value={presentDays} color={STATUS_COLORS.present.color} t={t} />
        <StatPill label="Late" value={lateDays} color={STATUS_COLORS.late.color} t={t} />
        <StatPill label="Absent" value={absentDays} color={STATUS_COLORS.absent.color} t={t} />
        {halfDays > 0 && <StatPill label="Half Day" value={halfDays} color={STATUS_COLORS['half-day'].color} t={t} />}
      </div>

      {/* Monthly calendar */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow, padding: 20 }}>
        {/* Month navigation */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={16} color={t.textMuted} />
          </button>
          <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: t.text }}>
            {MONTHS[month]} {year}
          </div>
          <button onClick={nextMonth} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={16} color={t.textMuted} />
          </button>
        </div>
        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-1">
              {Array(35).fill(0).map((_, i) => <div key={i} style={{ height: 34, borderRadius: 8, background: t.bgSubtle }} />)}
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 20, fontSize: '0.82rem', color: t.danger }}>{error}</div>
        ) : (
          <MonthCalendar t={t} year={year} month={month} records={records} />
        )}
      </div>

      {showMark && <MarkModal t={t} onClose={() => setShowMark(false)} onMarked={handleMarked} />}
    </>
  );
}

// ── Admin View ────────────────────────────────────────────────────────────────
function AdminAttendanceView({ t }) {
  const now = new Date();
  const [employees, setEmployees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());
  const [selEmployee, setSelEmployee] = useState('');
  const [showMark, setShowMark] = useState(false);

  async function loadAll() {
    setLoading(true); setError('');
    try {
      const [empRes, attRes] = await Promise.all([
        getEmployees('active'),
        getAllAttendance({ month: month + 1, year }),
      ]);
      if (empRes?.success) setEmployees(empRes.data || []);
      if (attRes?.success) setAllRecords(attRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [month, year]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const todayRecs  = allRecords.filter(r => toLocalDateStr(r.date) === todayStr());
  const todayPresent = todayRecs.filter(r => r.status === 'present' || r.status === 'late').length;
  const todayAbsent  = employees.length - todayRecs.length;

  const filteredRecords = selEmployee
    ? allRecords.filter(r => r.employee?._id === selEmployee || r.employeeId === selEmployee)
    : allRecords;

  const selectedEmpObj = employees.find(e => e._id === selEmployee);

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ marginBottom: 20 }}>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '16px 18px', boxShadow: t.shadow }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Present Today</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Poppins', color: STATUS_COLORS.present.color }}>{loading ? '—' : todayPresent}</div>
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '16px 18px', boxShadow: t.shadow }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Absent Today</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Poppins', color: STATUS_COLORS.absent.color }}>{loading ? '—' : Math.max(0, todayAbsent)}</div>
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '16px 18px', boxShadow: t.shadow, gridColumn: 'span 2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="sm:col-span-1">
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Total Employees</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Poppins', color: t.text }}>{loading ? '—' : employees.length}</div>
          </div>
          <button
            onClick={() => setShowMark(true)}
            style={{ background: t.primary, color: t.onPrimary, border: 'none', borderRadius: 11, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Poppins' }}
          >
            + Mark
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: `${t.danger}12`, border: `1px solid ${t.danger}33`, marginBottom: 16 }}>
          <AlertCircle size={18} color={t.danger} />
          <span style={{ fontSize: '0.85rem', color: t.danger }}>{error}</span>
          <button onClick={loadAll} style={{ marginLeft: 'auto', fontSize: '0.78rem', color: t.danger, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow, padding: 18, marginBottom: 16 }}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <button onClick={prevMonth} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={15} color={t.textMuted} />
            </button>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: t.text, minWidth: 140, textAlign: 'center' }}>{MONTHS[month]} {year}</div>
            <button onClick={nextMonth} style={{ background: t.bgSubtle, border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={15} color={t.textMuted} />
            </button>
          </div>
          <select
            value={selEmployee}
            onChange={e => setSelEmployee(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.bgSubtle, color: t.text, fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">All Employees</option>
            {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>

        {/* Calendar for selected employee or summary */}
        <div style={{ marginTop: 16 }}>
          {loading ? (
            <div className="animate-pulse grid grid-cols-7 gap-1">
              {Array(35).fill(0).map((_, i) => <div key={i} style={{ height: 30, borderRadius: 6, background: t.bgSubtle }} />)}
            </div>
          ) : selEmployee ? (
            <>
              <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem', color: t.text, marginBottom: 10 }}>
                {selectedEmpObj?.name} — {MONTHS[month]} {year}
              </div>
              <MonthCalendar t={t} year={year} month={month} records={filteredRecords} />
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', color: t.textMuted, textAlign: 'center', padding: '10px 0' }}>
              Select an employee to view their calendar
            </div>
          )}
        </div>
      </div>

      {/* Records table */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}` }}>
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {MONTHS[month]} {year} Records {selEmployee ? `— ${selectedEmpObj?.name}` : '(All)'}
          </span>
        </div>
        {loading ? (
          <div className="animate-pulse p-4 flex flex-col gap-2">
            {[1,2,3].map(i => <div key={i} style={{ height: 44, borderRadius: 8, background: t.bgSubtle }} />)}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: t.textMuted, fontSize: '0.85rem' }}>
            No attendance records for this period.
          </div>
        ) : (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {filteredRecords.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
              <div key={r._id || i} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${t.border}`, background: i % 2 === 0 ? 'transparent' : `${t.bgSubtle}55` }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: t.primary, flexShrink: 0 }}>
                    {(r.employee?.name || 'E').split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: t.text }}>{r.employee?.name || 'Employee'}</div>
                    <div style={{ fontSize: '0.7rem', color: t.textMuted }}>
                      {toLocalDateStr(r.date)} {r.checkIn ? `· ${r.checkIn}` : ''}
                    </div>
                  </div>
                </div>
                <StatusPill status={r.status} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>

      {showMark && <MarkModal t={t} employees={employees} onClose={() => setShowMark(false)} onMarked={() => { setShowMark(false); loadAll(); }} />}
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AttendanceScreen({ t, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Attendance" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6">
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {isAdmin ? 'Attendance Management' : 'My Attendance'}
            </div>
          </div>
          {isAdmin ? (
            <AdminAttendanceView t={t} />
          ) : (
            <AgentAttendanceView t={t} />
          )}
        </div>
      </div>
    </div>
  );
}
