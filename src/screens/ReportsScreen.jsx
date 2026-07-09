import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { formatRs } from '../theme.js';
import { getReportSummary, getReportTrend, getReportBreakdown } from '../api/client.js';


function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="chart-tooltip"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadowMd,
        color: t.text,
      }}
    >
      <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: '0.88rem', color: t.primary }}>
        {formatRs(payload[0]?.value)}
      </div>
    </div>
  );
}

function PieTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="chart-tooltip"
      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd, color: t.text }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: payload[0].payload.fill }}>
        {payload[0].name}
      </div>
      <div style={{ fontSize: '0.8rem', color: t.text, fontWeight: 600 }}>
        {payload[0].value}% · {payload[0].payload.count} loans
      </div>
    </div>
  );
}

export default function ReportsScreen({ t, onToggleTheme, onOpenSettings }) {
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={t.mode === 'dark' ? '#0E1614' : '#FFFFFF'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, trendRes, breakdownRes] = await Promise.all([
        getReportSummary(),
        getReportTrend(),
        getReportBreakdown()
      ]);

      if (summaryRes && summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (trendRes && trendRes.success) {
        setTrend(trendRes.data);
      }
      if (breakdownRes && breakdownRes.success) {
        setBreakdown(breakdownRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Reports" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="flex-1 px-4 py-6 flex flex-col gap-6" style={{ overflowY: 'auto' }}>
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex-1 h-20 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
            ))}
          </div>
          <div className="animate-pulse h-64 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
          <div className="animate-pulse h-64 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
        <TopBar t={t} title="Reports" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3">
          <AlertCircle size={48} color={t.overdue} />
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.text }}>Failed to Load Reports</h3>
          <p style={{ fontSize: '0.85rem', color: t.overdue, textAlign: 'center', maxWidth: '80%' }}>{error}</p>
          <button
            onClick={fetchReportData}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              background: t.primary,
              color: t.onPrimary,
              border: 'none',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalCollected = trend.reduce((s, m) => s + m.amount, 0);
  const activeCount = summary?.activeLoans || 0;
  const overdueCount = summary?.overdueCount || 0;
  const pieColors = [t.primary, t.accent, t.overdue];

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Reports" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 flex flex-col">

        {/* Summary row */}
        <div className="flex gap-3 mb-5">
          {[
            { label: 'Total (6mo)', value: formatRs(totalCollected), color: t.primary },
            { label: 'Active Loans', value: activeCount.toString(), color: t.active },
            { label: 'Overdue', value: overdueCount.toString(), color: t.overdue },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="flex-1 rounded-2xl p-4 flex flex-col gap-1"
              style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
            >
              <div style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: '0.82rem', color }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart: Monthly collections */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', color: t.text }}>
                Collections Trend
              </h3>
              <p style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: 2 }}>Monthly totals · last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={t.border}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: t.textMuted, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v / 1000}k`}
              />
              <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: t.primarySoft }} />
              <Bar
                dataKey="amount"
                radius={[6, 6, 0, 0]}
                fill={t.primary}
              >
                {trend.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={i === trend.length - 1 ? t.accent : t.primary}
                    opacity={i === trend.length - 1 ? 0.8 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '0.65rem', color: t.textMuted, textAlign: 'right', marginTop: 4 }}>
            * Current month is partial
          </div>
        </div>

        {/* Pie chart: Loan type breakdown */}
        <div
          className="rounded-2xl p-5"
          style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
        >
          <div className="mb-4">
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', color: t.text }}>
              Loan Type Breakdown
            </h3>
            <p style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: 2 }}>Portfolio distribution by type</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4">
            {breakdown.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: t.textMuted, textAlign: 'center', width: '100%', padding: '24px 0' }}>
                No active loan breakdown data.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={CustomLabel}
                    >
                      {breakdown.map((entry, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip t={t} />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex lg:flex-col gap-3 justify-center w-full lg:w-auto lg:min-w-32">
                  {breakdown.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: pieColors[i % pieColors.length],
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.text }}>{entry.name}</div>
                        <div style={{ fontSize: '0.68rem', color: t.textMuted }}>{entry.value}% · {entry.count} loans</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

