import { useState, useEffect, useCallback } from 'react';
import {
  FileText, RefreshCw, Download, Plus, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Clock, Printer, X, Save,
  TrendingUp, Users, DollarSign, Calendar, Search, Filter,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { formatRs } from '../theme.js';
import {
  getETFEPFRecords, getETFEPFSummary, bulkGenerateETFEPF,
  updateETFEPFRecord, createETFEPFRecord
} from '../api/client.js';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const STATUS_COLORS = {
  pending:   { bg: '#F59E0B14', border: '#F59E0B40', text: '#D97706' },
  paid:      { bg: '#05966914', border: '#05966940', text: '#059669' },
  submitted: { bg: '#1A56DB14', border: '#1A56DB40', text: '#1A56DB' },
};

// ── EPF/ETF Rates (Sri Lanka) ─────────────────────────────────────────────────
const EPF_EMPLOYEE = 0.08;   // 8%
const EPF_EMPLOYER = 0.12;   // 12%
const ETF_EMPLOYER = 0.03;   // 3%

function calcContributions(salary) {
  const basic = Number(salary) || 0;
  return {
    epfEmployee: Math.round(basic * EPF_EMPLOYEE),
    epfEmployer: Math.round(basic * EPF_EMPLOYER),
    epfTotal:    Math.round(basic * (EPF_EMPLOYEE + EPF_EMPLOYER)),
    etfEmployer: Math.round(basic * ETF_EMPLOYER),
    totalContribution: Math.round(basic * (EPF_EMPLOYEE + EPF_EMPLOYER + ETF_EMPLOYER)),
  };
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.text, fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status === 'paid' && <CheckCircle2 size={11} />}
      {status === 'pending' && <Clock size={11} />}
      {status}
    </span>
  );
}

function SummaryCard({ t, label, value, subtitle, color, icon: Icon }) {
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 16, padding: '18px 20px',
      boxShadow: t.shadow, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: `linear-gradient(90deg, ${color}, ${color}66)`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: t.text }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

// ── Print letter template ─────────────────────────────────────────────────────
function printLetterForRecord(record, type) {
  const emp = record.employee;
  const name = emp?.userId?.name || emp?.name || 'Employee';
  const month = MONTHS[(record.month || 1) - 1];
  const year = record.year;

  const letterHTML = `
    <html><head><title>${type} Letter - ${name}</title>
    <style>
      body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #111; }
      .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #000; padding-bottom: 16px; }
      .company { font-size: 20px; font-weight: bold; }
      .subtitle { font-size: 13px; color: #555; }
      .title { font-size: 18px; font-weight: bold; margin: 24px 0 16px; text-decoration: underline; }
      .info-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
      th { background: #f0f0f0; border: 1px solid #ccc; padding: 8px 12px; text-align: left; font-weight: bold; }
      td { border: 1px solid #ccc; padding: 8px 12px; }
      .total-row td { font-weight: bold; background: #f9f9f9; }
      .footer { margin-top: 48px; display: flex; justify-content: space-between; font-size: 12px; }
      .sign { text-align: center; border-top: 1px solid #000; padding-top: 4px; width: 180px; }
      .note { font-size: 11px; color: #666; margin-top: 24px; font-style: italic; }
    </style></head><body>
    <div class="header">
      <div class="company">MicroFinance Company (Pvt) Ltd</div>
      <div class="subtitle">Registered under Employees' Provident Fund Act & Employees' Trust Fund Act</div>
    </div>
    <div class="title">${type === 'epf' ? "EMPLOYEES' PROVIDENT FUND (EPF)" : "EMPLOYEES' TRUST FUND (ETF)"} — CONTRIBUTION STATEMENT</div>
    <div class="info-row"><span><b>Employee Name:</b> ${name}</span><span><b>Month/Year:</b> ${month} ${year}</span></div>
    <div class="info-row"><span><b>Employee ID:</b> ${emp?.employeeId || 'N/A'}</span><span><b>Date Issued:</b> ${new Date().toLocaleDateString('en-LK')}</span></div>
    <div class="info-row"><span><b>Department:</b> ${emp?.department || 'N/A'}</span><span><b>Position:</b> ${emp?.position || 'N/A'}</span></div>
    <br/>
    ${type === 'epf' ? `
    <table>
      <tr><th>Description</th><th>Rate</th><th>Amount (Rs.)</th></tr>
      <tr><td>Basic Salary</td><td>—</td><td>${record.basicSalary?.toLocaleString('en-LK')}</td></tr>
      <tr><td>EPF — Employee Contribution</td><td>8%</td><td>${record.epfEmployee?.toLocaleString('en-LK')}</td></tr>
      <tr><td>EPF — Employer Contribution</td><td>12%</td><td>${record.epfEmployer?.toLocaleString('en-LK')}</td></tr>
      <tr class="total-row"><td colspan="2">Total EPF Contribution</td><td>${record.epfTotal?.toLocaleString('en-LK')}</td></tr>
    </table>
    <p style="font-size:12px">The above EPF contributions will be remitted to the Employees' Provident Fund maintained by the Central Bank of Sri Lanka as per the EPF Act No. 15 of 1958.</p>
    ` : `
    <table>
      <tr><th>Description</th><th>Rate</th><th>Amount (Rs.)</th></tr>
      <tr><td>Basic Salary</td><td>—</td><td>${record.basicSalary?.toLocaleString('en-LK')}</td></tr>
      <tr><td>ETF — Employer Contribution</td><td>3%</td><td>${record.etfEmployer?.toLocaleString('en-LK')}</td></tr>
      <tr class="total-row"><td>Total ETF Contribution</td><td>3%</td><td>${record.etfEmployer?.toLocaleString('en-LK')}</td></tr>
    </table>
    <p style="font-size:12px">The above ETF contributions will be remitted to the Employees' Trust Fund Board as per the ETF Act No. 46 of 1980.</p>
    `}
    <div class="note">This is a computer-generated statement and does not require a signature for validity.</div>
    <div class="footer">
      <div class="sign">Prepared by<br/><br/>Accounts Department</div>
      <div class="sign">Authorized by<br/><br/>HR Manager</div>
      <div style="text-align:right; font-size:11px; color:#888">Generated: ${new Date().toLocaleString('en-LK')}</div>
    </div>
    </body></html>
  `;

  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(letterHTML);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

function printMonthlyReturn(records, month, year) {
  const rows = records.map(r => {
    const name = r.employee?.userId?.name || 'Unknown';
    const empId = r.employee?.employeeId || 'N/A';
    return `<tr>
      <td>${empId}</td><td>${name}</td>
      <td>${r.basicSalary?.toLocaleString('en-LK')}</td>
      <td>${r.epfEmployee?.toLocaleString('en-LK')}</td>
      <td>${r.epfEmployer?.toLocaleString('en-LK')}</td>
      <td>${r.epfTotal?.toLocaleString('en-LK')}</td>
      <td>${r.etfEmployer?.toLocaleString('en-LK')}</td>
      <td>${(r.epfTotal + r.etfEmployer)?.toLocaleString('en-LK')}</td>
    </tr>`;
  }).join('');

  const totBasic = records.reduce((s, r) => s + (r.basicSalary || 0), 0);
  const totEPF   = records.reduce((s, r) => s + (r.epfTotal || 0), 0);
  const totETF   = records.reduce((s, r) => s + (r.etfEmployer || 0), 0);

  const html = `<html><head><title>Monthly Return ${MONTHS[month-1]} ${year}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; font-size: 12px; }
    h2 { text-align: center; font-size: 16px; margin-bottom: 4px; }
    .meta { text-align: center; color: #555; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1A56DB; color: white; padding: 8px; text-align: left; }
    td { border: 1px solid #ddd; padding: 6px 8px; }
    tr:nth-child(even) { background: #f5f5f5; }
    .total-row td { font-weight: bold; background: #e8f0fe; }
  </style></head><body>
  <h2>EPF / ETF Monthly Return</h2>
  <div class="meta">${MONTHS[month-1]} ${year} — MicroFinance Company (Pvt) Ltd</div>
  <table>
    <thead><tr>
      <th>Emp ID</th><th>Name</th><th>Basic (Rs.)</th>
      <th>EPF Emp 8%</th><th>EPF Empr 12%</th><th>EPF Total</th>
      <th>ETF 3%</th><th>Grand Total</th>
    </tr></thead>
    <tbody>${rows}
    <tr class="total-row">
      <td colspan="2">TOTAL (${records.length} employees)</td>
      <td>${totBasic.toLocaleString('en-LK')}</td>
      <td>${Math.round(totBasic*0.08).toLocaleString('en-LK')}</td>
      <td>${Math.round(totBasic*0.12).toLocaleString('en-LK')}</td>
      <td>${totEPF.toLocaleString('en-LK')}</td>
      <td>${totETF.toLocaleString('en-LK')}</td>
      <td>${(totEPF + totETF).toLocaleString('en-LK')}</td>
    </tr></tbody>
  </table>
  <p style="margin-top:24px;font-size:11px;color:#888">Generated: ${new Date().toLocaleString('en-LK')}</p>
  </body></html>`;

  const w = window.open('', '_blank', 'width=1100,height=700');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

export default function ETFEPFScreen({ t, onToggleTheme, onOpenSettings }) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rec, sum] = await Promise.all([
        getETFEPFRecords({ year, month }),
        getETFEPFSummary({ year, month }),
      ]);
      if (rec?.success)  setRecords(rec.data);
      if (sum?.success)  setSummary(sum.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const handleBulkGenerate = async () => {
    setGenerating(true);
    try {
      const res = await bulkGenerateETFEPF({ year, month });
      if (res?.success) {
        showToast(`✅ Created: ${res.data.created}, Skipped: ${res.data.skipped}`);
        load();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateETFEPFRecord(id, { status, ...(status === 'paid' ? { paidDate: new Date() } : {}) });
      showToast('✅ Status updated');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = records.filter(r => {
    const name = (r.employee?.userId?.name || '').toLowerCase();
    const empId = (r.employee?.employeeId || '').toLowerCase();
    return name.includes(search.toLowerCase()) || empId.includes(search.toLowerCase());
  });

  const btnStyle = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 10, border: 'none',
    background: color, color: '#fff', fontSize: '0.8rem',
    fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins',
    transition: 'all 0.18s ease',
  });

  const outlineBtn = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 10,
    border: `1.5px solid ${color}50`,
    background: `${color}10`, color: color,
    fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Poppins', transition: 'all 0.18s ease',
  });

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="ETF / EPF" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: t.primary, color: '#fff', padding: '10px 20px',
          borderRadius: 12, zIndex: 999, fontSize: '0.85rem', fontWeight: 600,
          boxShadow: t.shadowMd, animation: 'fadeIn 0.25s ease',
        }}>{toast}</div>
      )}

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto' }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6">

          <PageHeader
            t={t}
            title="ETF / EPF Management"
            subtitle="Employee Provident Fund & Employees' Trust Fund contributions"
            breadcrumb={['HR & People', 'ETF / EPF']}
            icon={FileText}
            iconColor={t.primary}
            action={
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => printMonthlyReturn(records, month, year)}
                  style={outlineBtn(t.accent)}
                  title="Print Monthly Return"
                >
                  <Printer size={15} /> Monthly Return
                </button>
                <button
                  onClick={handleBulkGenerate}
                  disabled={generating}
                  style={btnStyle(generating ? t.textMuted : t.primary)}
                >
                  {generating ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
                  {generating ? 'Generating...' : 'Auto Generate'}
                </button>
              </div>
            }
          />

          {/* Month / Year selector */}
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20,
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: '12px 16px', boxShadow: t.shadow,
            flexWrap: 'wrap',
          }}>
            <Calendar size={18} color={t.primary} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: t.textMuted }}>Period:</span>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              style={{
                background: t.bgSubtle, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: '6px 10px', color: t.text,
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{
                background: t.bgSubtle, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: '6px 10px', color: t.text,
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={load} style={outlineBtn(t.primary)}>
              <RefreshCw size={14} /> Refresh
            </button>

            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: t.bgSubtle, border: `1px solid ${t.border}`,
              borderRadius: 8, padding: '6px 12px', marginLeft: 'auto',
            }}>
              <Search size={14} color={t.textMuted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search employee..."
                style={{ background: 'none', border: 'none', color: t.text, fontSize: '0.8rem', width: 160 }}
              />
            </div>
          </div>

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <SummaryCard t={t} label="Employees" value={summary.totalEmployees || 0} color={t.primary} icon={Users}
                subtitle={`${MONTHS[month - 1]} ${year}`} />
              <SummaryCard t={t} label="Total EPF" value={formatRs(summary.totalEPF || 0)} color={t.info}  icon={TrendingUp}
                subtitle={`Emp 8% + Empr 12%`} />
              <SummaryCard t={t} label="Total ETF" value={formatRs(summary.totalETF || 0)} color={t.accent} icon={DollarSign}
                subtitle="Employer 3%" />
              <SummaryCard t={t} label="Grand Total" value={formatRs(summary.totalContribution || 0)} color={t.success} icon={CheckCircle2}
                subtitle={`${summary.paidCount || 0} paid, ${summary.pendingCount || 0} pending`} />
            </div>
          )}

          {/* Rate Info Banner */}
          <div style={{
            display: 'flex', gap: 16, flexWrap: 'wrap',
            background: `${t.primary}08`, border: `1px solid ${t.primary}25`,
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            fontSize: '0.76rem', color: t.textMuted, fontWeight: 500,
          }}>
            <span style={{ color: t.text, fontWeight: 700 }}>🇱🇰 Statutory Rates:</span>
            <span>EPF Employee: <strong style={{ color: t.primary }}>8%</strong></span>
            <span>EPF Employer: <strong style={{ color: t.info }}>12%</strong></span>
            <span>ETF Employer: <strong style={{ color: t.accent }}>3%</strong></span>
            <span style={{ marginLeft: 'auto', color: t.success }}>Total Employer Liability: <strong>15%</strong></span>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: `${t.danger}10`, border: `1px solid ${t.danger}30`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
              color: t.danger, fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Records table */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse h-16 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: 16, padding: '40px', textAlign: 'center',
              boxShadow: t.shadow,
            }}>
              <FileText size={36} color={t.textMuted} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, color: t.text, marginBottom: 4 }}>
                {records.length === 0 ? 'No records for this period' : 'No matching employees'}
              </div>
              <div style={{ fontSize: '0.8rem', color: t.textMuted, marginBottom: 16 }}>
                {records.length === 0 ? `Click "Auto Generate" to create ETF/EPF records for ${MONTHS[month - 1]} ${year}` : 'Try a different search term'}
              </div>
              {records.length === 0 && (
                <button onClick={handleBulkGenerate} disabled={generating} style={btnStyle(t.primary)}>
                  <Plus size={15} /> Auto Generate Records
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
                gap: 8, padding: '8px 16px',
                fontSize: '0.68rem', fontWeight: 700, color: t.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <span>Employee</span>
                <span>Basic</span>
                <span>EPF (8%+12%)</span>
                <span>ETF (3%)</span>
                <span>Total</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {filtered.map(r => {
                const name = r.employee?.userId?.name || 'Unknown';
                const empId = r.employee?.employeeId || '';
                const dept = r.employee?.department || '';
                const isExpanded = expandedId === r._id;
                const calc = calcContributions(r.basicSalary);

                return (
                  <div key={r._id} style={{
                    background: t.card, border: `1px solid ${isExpanded ? t.primary + '50' : t.border}`,
                    borderRadius: 14, overflow: 'hidden',
                    boxShadow: isExpanded ? `0 4px 16px ${t.primary}15` : t.shadow,
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Main row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 120px',
                        gap: 8, padding: '14px 16px',
                        alignItems: 'center', cursor: 'pointer',
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : r._id)}
                    >
                      {/* Employee */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: t.text }}>{name}</div>
                        <div style={{ fontSize: '0.7rem', color: t.textMuted }}>{empId} {dept ? `· ${dept}` : ''}</div>
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '0.82rem', fontWeight: 600, color: t.text }}>
                        {formatRs(r.basicSalary)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '0.82rem', color: t.info }}>
                        {formatRs(r.epfTotal)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '0.82rem', color: t.accent }}>
                        {formatRs(r.etfEmployer)}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: '0.85rem', fontWeight: 700, color: t.success }}>
                        {formatRs((r.epfTotal || 0) + (r.etfEmployer || 0))}
                      </div>
                      <StatusBadge status={r.status} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setExpandedId(isExpanded ? null : r._id)}
                          style={outlineBtn(t.primary)}>
                          {isExpanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{
                        padding: '0 16px 16px',
                        borderTop: `1px solid ${t.border}`,
                        background: `${t.primary}04`,
                      }}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 mb-4">
                          <div style={{ background: t.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, marginBottom: 3 }}>EPF Employee (8%)</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.text }}>{formatRs(r.epfEmployee)}</div>
                          </div>
                          <div style={{ background: t.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, marginBottom: 3 }}>EPF Employer (12%)</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.text }}>{formatRs(r.epfEmployer)}</div>
                          </div>
                          <div style={{ background: t.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.border}` }}>
                            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 600, marginBottom: 3 }}>ETF Employer (3%)</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.accent }}>{formatRs(r.etfEmployer)}</div>
                          </div>
                          <div style={{ background: `${t.success}10`, borderRadius: 10, padding: '10px 14px', border: `1px solid ${t.success}30` }}>
                            <div style={{ fontSize: '0.65rem', color: t.success, fontWeight: 600, marginBottom: 3 }}>Total Liability</div>
                            <div style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 700, color: t.success }}>{formatRs((r.epfTotal || 0) + (r.etfEmployer || 0))}</div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => printLetterForRecord(r, 'epf')} style={outlineBtn(t.primary)}>
                            <Printer size={13} /> EPF Letter
                          </button>
                          <button onClick={() => printLetterForRecord(r, 'etf')} style={outlineBtn(t.accent)}>
                            <Printer size={13} /> ETF Letter
                          </button>
                          {r.status === 'pending' && (
                            <button onClick={() => handleUpdateStatus(r._id, 'paid')} style={outlineBtn(t.success)}>
                              <CheckCircle2 size={13} /> Mark Paid
                            </button>
                          )}
                          {r.status === 'paid' && (
                            <button onClick={() => handleUpdateStatus(r._id, 'submitted')} style={outlineBtn(t.info)}>
                              <Save size={13} /> Mark Submitted
                            </button>
                          )}
                          {r.status !== 'pending' && (
                            <button onClick={() => handleUpdateStatus(r._id, 'pending')} style={outlineBtn(t.textMuted)}>
                              <Clock size={13} /> Reset to Pending
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Print all button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={() => printMonthlyReturn(filtered, month, year)}
                  style={btnStyle(t.accent)}
                >
                  <Printer size={15} /> Print Monthly Return ({filtered.length} records)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
