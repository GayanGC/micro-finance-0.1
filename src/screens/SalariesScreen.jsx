import { useState, useEffect, useContext } from 'react';
import { DollarSign, FileText, Plus, Check, X, ShieldAlert, Award, ArrowDownLeft, Clock, History, Calendar, CheckCircle, HelpCircle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { 
  getSalaryRecords, 
  createSalaryRecord, 
  updateSalaryRecord, 
  requestAdvance, 
  getAdvances, 
  reviewAdvance, 
  requestEmployeeLoan, 
  getEmployeeLoans, 
  reviewEmployeeLoan, 
  repayEmployeeLoan,
  getEmployees 
} from '../api/client.js';
import { formatRs } from '../theme.js';

export default function SalariesScreen({ t, onNavigate, onToggleTheme, onOpenSettings }) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  // Tabs: 'records' | 'advances' | 'loans'
  const [activeTab, setActiveTab] = useState('records');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data lists
  const [records, setRecords] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [employeeLoans, setEmployeeLoans] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modals state
  const [salaryModal, setSalaryModal] = useState(false);
  const [advanceModal, setAdvanceModal] = useState(false);
  const [empLoanModal, setEmpLoanModal] = useState(false);
  const [repayModal, setRepayModal] = useState(false);
  
  // Selected items for review
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // Form states
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    baseSalary: '',
    allowance: '',
    advancePaid: '',
    loanDeduction: '',
  });

  const [advanceForm, setAdvanceForm] = useState({
    amount: '',
    reason: '',
    month: new Date().toISOString().slice(0, 7),
  });

  const [empLoanForm, setEmpLoanForm] = useState({
    amount: '',
    interestRate: '5',
    installmentsCount: '12',
    reason: '',
  });

  const [repayForm, setRepayForm] = useState({
    amount: '',
  });

  // Fetch functions
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'records') {
        const res = await getSalaryRecords();
        if (res && res.success) setRecords(res.data);
        if (isAdmin) {
          const empRes = await getEmployees('active');
          if (empRes && empRes.success) setEmployees(empRes.data);
        }
      } else if (activeTab === 'advances') {
        const res = await getAdvances();
        if (res && res.success) setAdvances(res.data);
      } else if (activeTab === 'loans') {
        const res = await getEmployeeLoans();
        if (res && res.success) setEmployeeLoans(res.data);
      }
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handle salary generation
  const handleCreateSalary = async (e) => {
    e.preventDefault();
    if (!salaryForm.employeeId || !salaryForm.baseSalary) return;
    try {
      const res = await createSalaryRecord({
        ...salaryForm,
        baseSalary: Number(salaryForm.baseSalary),
        allowance: Number(salaryForm.allowance) || 0,
        advancePaid: Number(salaryForm.advancePaid) || 0,
        loanDeduction: Number(salaryForm.loanDeduction) || 0,
      });
      if (res && res.success) {
        setSalaryModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create record');
    }
  };

  // Handle salary payment release
  const handlePaySalary = async (id) => {
    try {
      const res = await updateSalaryRecord(id, { status: 'Paid' });
      if (res && res.success) fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update record');
    }
  };

  // Handle advance request
  const handleRequestAdvance = async (e) => {
    e.preventDefault();
    if (!advanceForm.amount || !advanceForm.reason) return;
    try {
      const res = await requestAdvance(advanceForm);
      if (res && res.success) {
        setAdvanceModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to request advance');
    }
  };

  // Handle advance review
  const handleReviewAdvance = async (id, status) => {
    try {
      const res = await reviewAdvance(id, { status, adminNote });
      if (res && res.success) {
        setSelectedItem(null);
        setAdminNote('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to review request');
    }
  };

  // Handle employee loan request
  const handleRequestEmpLoan = async (e) => {
    e.preventDefault();
    if (!empLoanForm.amount || !empLoanForm.interestRate || !empLoanForm.installmentsCount) return;
    try {
      const res = await requestEmployeeLoan({
        amount: Number(empLoanForm.amount),
        interestRate: Number(empLoanForm.interestRate),
        installmentsCount: Number(empLoanForm.installmentsCount),
        reason: empLoanForm.reason,
      });
      if (res && res.success) {
        setEmpLoanModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to request employee loan');
    }
  };

  // Handle employee loan review
  const handleReviewEmpLoan = async (id, status) => {
    try {
      const res = await reviewEmployeeLoan(id, { status, adminNote });
      if (res && res.success) {
        setSelectedItem(null);
        setAdminNote('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to review loan');
    }
  };

  // Handle employee loan repayment manual
  const handleRepayEmpLoan = async (e) => {
    e.preventDefault();
    if (!selectedItem || !repayForm.amount) return;
    try {
      const res = await repayEmployeeLoan(selectedItem._id, { amount: Number(repayForm.amount) });
      if (res && res.success) {
        setRepayModal(false);
        setSelectedItem(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to record repayment');
    }
  };

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar
        t={t}
        title="Salaries & Advances"
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
      />

      <div className="flex-1 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>
        <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 flex flex-col gap-6">
          
          {/* Custom Styled Tabs */}
          <div className="flex gap-2 p-1 rounded-2xl" style={{ background: t.bgSubtle, border: `1px solid ${t.border}` }}>
            <button
              onClick={() => setActiveTab('records')}
              className="flex-1 py-3 text-xs font-bold rounded-xl btn-press"
              style={{
                background: activeTab === 'records' ? t.card : 'transparent',
                color: activeTab === 'records' ? t.primary : t.textMuted,
                border: activeTab === 'records' ? `1px solid ${t.border}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Payslips & Records
            </button>
            <button
              onClick={() => setActiveTab('advances')}
              className="flex-1 py-3 text-xs font-bold rounded-xl btn-press"
              style={{
                background: activeTab === 'advances' ? t.card : 'transparent',
                color: activeTab === 'advances' ? t.primary : t.textMuted,
                border: activeTab === 'advances' ? `1px solid ${t.border}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Salary Advances
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className="flex-1 py-3 text-xs font-bold rounded-xl btn-press"
              style={{
                background: activeTab === 'loans' ? t.card : 'transparent',
                color: activeTab === 'loans' ? t.primary : t.textMuted,
                border: activeTab === 'loans' ? `1px solid ${t.border}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Employee Loans
            </button>
          </div>

          {/* Action buttons based on Role */}
          <div className="flex justify-between items-center">
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>
              {activeTab === 'records' && 'Monthly Payroll Ledger'}
              {activeTab === 'advances' && 'Salary Advance Requests'}
              {activeTab === 'loans' && 'Internal Employee Loans'}
            </h3>
            
            {activeTab === 'records' && isAdmin && (
              <button
                onClick={() => setSalaryModal(true)}
                className="btn-press px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                style={{ background: t.primary, color: t.onPrimary, cursor: 'pointer', border: 'none' }}
              >
                <Plus size={14} /> Generate Payslip
              </button>
            )}

            {activeTab === 'advances' && !isAdmin && (
              <button
                onClick={() => setAdvanceModal(true)}
                className="btn-press px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                style={{ background: t.primary, color: t.onPrimary, cursor: 'pointer', border: 'none' }}
              >
                <Plus size={14} /> Request Advance
              </button>
            )}

            {activeTab === 'loans' && !isAdmin && (
              <button
                onClick={() => setEmpLoanModal(true)}
                className="btn-press px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                style={{ background: t.primary, color: t.onPrimary, cursor: 'pointer', border: 'none' }}
              >
                <Plus size={14} /> Request Loan
              </button>
            )}
          </div>

          {/* Tab Content Rendering */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse h-28 rounded-2xl border" style={{ background: t.card, borderColor: t.border }} />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 rounded-xl" style={{ color: t.overdue, background: `${t.overdue}11` }}>
              <ShieldAlert size={16} />
              <span className="text-xs font-semibold">{error}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* TAB 1: SALARY RECORDS */}
              {activeTab === 'records' && (
                records.length === 0 ? (
                  <div className="p-8 rounded-2xl text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                    <DollarSign size={32} color={t.textMuted} className="mx-auto mb-2" />
                    <div style={{ fontWeight: 600, color: t.textMuted, fontSize: '0.85rem' }}>No salary records generated yet</div>
                  </div>
                ) : (
                  records.map(rec => (
                    <div
                      key={rec._id}
                      className="p-5 rounded-2xl flex flex-col gap-4"
                      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div style={{ fontWeight: 700, color: t.text, fontSize: '0.95rem' }}>
                            {rec.employeeId?.name || 'Employee'}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: t.textMuted }}>
                            Month: {rec.month} · Base: {formatRs(rec.baseSalary)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" 
                            style={{ 
                              background: rec.status === 'Paid' ? `${t.paid}20` : `${t.pending}20`,
                              color: rec.status === 'Paid' ? t.paid : t.pending 
                            }}
                          >
                            {rec.status}
                          </span>
                          {rec.status === 'Pending' && isAdmin && (
                            <button
                              onClick={() => handlePaySalary(rec._id)}
                              className="btn-press px-3 py-1 rounded-lg text-[10px] font-bold"
                              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
                            >
                              Release Pay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* EPF/ETF and Deductions breakdowns */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>EPF (EMPLOYEE 8%)</span>
                          <span className="font-mono text-xs font-semibold block mt-0.5" style={{ color: t.overdue }}>
                            -{formatRs(rec.epfEmployee)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>EPF (EMPLOYER 12%)</span>
                          <span className="font-mono text-xs font-semibold block mt-0.5" style={{ color: t.paid }}>
                            {formatRs(rec.epfEmployer)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>ETF (EMPLOYER 3%)</span>
                          <span className="font-mono text-xs font-semibold block mt-0.5" style={{ color: t.paid }}>
                            {formatRs(rec.etfEmployer)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>ADVANCES / LOANS</span>
                          <span className="font-mono text-xs font-semibold block mt-0.5" style={{ color: t.overdue }}>
                            -{formatRs(rec.advancePaid + rec.loanDeduction)}
                          </span>
                        </div>
                        <div className="col-span-2 md:col-span-1 rounded-xl p-2 flex flex-col justify-center" style={{ background: t.bgSubtle }}>
                          <span className="text-[9px] font-bold block" style={{ color: t.primary }}>NET DISBURSED</span>
                          <span className="font-mono text-xs font-bold block" style={{ color: t.text }}>
                            {formatRs(rec.netSalary)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* TAB 2: ADVANCES */}
              {activeTab === 'advances' && (
                advances.length === 0 ? (
                  <div className="p-8 rounded-2xl text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                    <ArrowDownLeft size={32} color={t.textMuted} className="mx-auto mb-2" />
                    <div style={{ fontWeight: 600, color: t.textMuted, fontSize: '0.85rem' }}>No advance requests</div>
                  </div>
                ) : (
                  advances.map(adv => (
                    <div
                      key={adv._id}
                      className="p-5 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem' }}>
                            {adv.employeeId?.name || 'Employee'}
                          </span>
                          <span className="font-mono text-xs font-bold" style={{ color: t.primary }}>
                            {formatRs(adv.amount)}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: t.text }}>
                          Reason: <span className="italic">{adv.reason}</span>
                        </p>
                        <span style={{ fontSize: '0.7rem', color: t.textMuted }}>
                          Month: {adv.month} · Requested on {new Date(adv.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" 
                          style={{ 
                            background: adv.status === 'Approved' ? `${t.paid}20` : adv.status === 'Rejected' ? `${t.overdue}20` : `${t.pending}20`,
                            color: adv.status === 'Approved' ? t.paid : adv.status === 'Rejected' ? t.overdue : t.pending 
                          }}
                        >
                          {adv.status}
                        </span>

                        {adv.status === 'Pending' && isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedItem(adv); setAdminNote(''); }}
                              className="btn-press px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                              style={{ background: t.primary, border: 'none', cursor: 'pointer' }}
                            >
                              Review
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}

              {/* TAB 3: LOANS */}
              {activeTab === 'loans' && (
                employeeLoans.length === 0 ? (
                  <div className="p-8 rounded-2xl text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                    <HelpCircle size={32} color={t.textMuted} className="mx-auto mb-2" />
                    <div style={{ fontWeight: 600, color: t.textMuted, fontSize: '0.85rem' }}>No employee loan requests</div>
                  </div>
                ) : (
                  employeeLoans.map(loan => (
                    <div
                      key={loan._id}
                      className="p-5 rounded-2xl flex flex-col gap-4"
                      style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div style={{ fontWeight: 700, color: t.text, fontSize: '0.95rem' }}>
                            {loan.employeeId?.name || 'Employee'}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: t.textMuted }}>
                            Principal: {formatRs(loan.amount)} at {loan.interestRate}% interest
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" 
                            style={{ 
                              background: loan.status === 'Active' ? `${t.paid}20` : loan.status === 'Settled' ? `${t.bgSubtle}` : loan.status === 'Rejected' ? `${t.overdue}20` : `${t.pending}20`,
                              color: loan.status === 'Active' ? t.paid : loan.status === 'Settled' ? t.textMuted : loan.status === 'Rejected' ? t.overdue : t.pending 
                            }}
                          >
                            {loan.status}
                          </span>
                          {loan.status === 'Pending' && isAdmin && (
                            <button
                              onClick={() => { setSelectedItem(loan); setAdminNote(''); }}
                              className="btn-press px-3 py-1 rounded-lg text-[10px] font-bold text-white"
                              style={{ background: t.primary, border: 'none', cursor: 'pointer' }}
                            >
                              Review Loan
                            </button>
                          )}
                          {loan.status === 'Active' && isAdmin && (
                            <button
                              onClick={() => { setSelectedItem(loan); setRepayModal(true); }}
                              className="btn-press px-3 py-1 rounded-lg text-[10px] font-bold"
                              style={{ background: t.accent, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
                            >
                              Repay Deduction
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Repayment Progress bar */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>MONTHLY DEDUCTION</span>
                          <span className="font-mono text-xs font-semibold block mt-0.5" style={{ color: t.overdue }}>
                            {formatRs(loan.monthlyDeduction)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>REPAID / TOTAL INST.</span>
                          <span className="font-mono text-xs font-semibold block mt-0.5" style={{ color: t.text }}>
                            {loan.repaidInstallments} / {loan.installmentsCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>REMAINING BALANCE</span>
                          <span className="font-mono text-xs font-bold block mt-0.5" style={{ color: t.overdue }}>
                            {formatRs(loan.balance)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold block" style={{ color: t.textMuted }}>REASON</span>
                          <span className="text-xs italic block mt-0.5 truncate" style={{ color: t.textMuted }}>
                            {loan.reason || 'None provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

            </div>
          )}

        </div>
      </div>

      {/* MODAL: GENERATE PAYSLIP (ADMIN) */}
      {salaryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSalaryModal(false)}
        >
          <form 
            onSubmit={handleCreateSalary}
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>Generate Monthly Payslip</h3>
              <button type="button" onClick={() => setSalaryModal(false)} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>SELECT EMPLOYEE *</label>
                <select
                  required
                  value={salaryForm.employeeId}
                  onChange={e => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
                  style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                >
                  <option value="">Choose active employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp.userId?._id}>{emp.userId?.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>PAYROLL MONTH *</label>
                  <input
                    type="month"
                    required
                    value={salaryForm.month}
                    onChange={e => setSalaryForm({ ...salaryForm, month: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>BASE SALARY *</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={salaryForm.baseSalary}
                    onChange={e => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold" style={{ color: t.textMuted }}>ALLOWANCE</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={salaryForm.allowance}
                    onChange={e => setSalaryForm({ ...salaryForm, allowance: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold" style={{ color: t.textMuted }}>ADVANCE DEDUCT</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={salaryForm.advancePaid}
                    onChange={e => setSalaryForm({ ...salaryForm, advancePaid: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold" style={{ color: t.textMuted }}>LOAN DEDUCT</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={salaryForm.loanDeduction}
                    onChange={e => setSalaryForm({ ...salaryForm, loanDeduction: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-press w-full py-3 rounded-xl mt-2 font-bold"
              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
            >
              ✓ Generate & Save Payslip
            </button>
          </form>
        </div>
      )}

      {/* MODAL: REQUEST SALARY ADVANCE (EMPLOYEE) */}
      {advanceModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setAdvanceModal(false)}
        >
          <form 
            onSubmit={handleRequestAdvance}
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>Request Salary Advance</h3>
              <button type="button" onClick={() => setAdvanceModal(false)} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>AMOUNT (RS) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={advanceForm.amount}
                    onChange={e => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>TARGET MONTH *</label>
                  <input
                    type="month"
                    required
                    value={advanceForm.month}
                    onChange={e => setAdvanceForm({ ...advanceForm, month: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>REASON / REMARK *</label>
                <textarea
                  required
                  placeholder="Explain why advance is needed..."
                  value={advanceForm.reason}
                  onChange={e => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                  style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, minHeight: 80, padding: '12px', color: t.text, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-press w-full py-3 rounded-xl font-bold"
              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
            >
              ✓ Submit Advance Request
            </button>
          </form>
        </div>
      )}

      {/* MODAL: REQUEST EMPLOYEE LOAN (EMPLOYEE) */}
      {empLoanModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setEmpLoanModal(false)}
        >
          <form 
            onSubmit={handleRequestEmpLoan}
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>Request Employee Loan</h3>
              <button type="button" onClick={() => setEmpLoanModal(false)} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>LOAN AMOUNT (RS) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={empLoanForm.amount}
                  onChange={e => setEmpLoanForm({ ...empLoanForm, amount: e.target.value })}
                  style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>INTEREST RATE (% FLAT) *</label>
                  <input
                    type="number"
                    required
                    value={empLoanForm.interestRate}
                    onChange={e => setEmpLoanForm({ ...empLoanForm, interestRate: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>INSTALLMENTS (MONTHS) *</label>
                  <input
                    type="number"
                    required
                    value={empLoanForm.installmentsCount}
                    onChange={e => setEmpLoanForm({ ...empLoanForm, installmentsCount: e.target.value })}
                    style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>REASON FOR LOAN</label>
                <textarea
                  placeholder="Explain why this loan is needed..."
                  value={empLoanForm.reason}
                  onChange={e => setEmpLoanForm({ ...empLoanForm, reason: e.target.value })}
                  style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, minHeight: 80, padding: '12px', color: t.text, fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-press w-full py-3 rounded-xl font-bold"
              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
            >
              ✓ Submit Loan Application
            </button>
          </form>
        </div>
      )}

      {/* REVIEW DIALOG (ADMIN APPROVAL/REJECTION FOR ADVANCES & LOANS) */}
      {selectedItem && !repayModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>
                Review Application
              </h3>
              <button type="button" onClick={() => setSelectedItem(null)} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            <div className="text-xs flex flex-col gap-2">
              <div>
                <span style={{ color: t.textMuted }}>Applicant: </span>
                <span style={{ fontWeight: 700, color: t.text }}>{selectedItem.employeeId?.name}</span>
              </div>
              <div>
                <span style={{ color: t.textMuted }}>Request Amount: </span>
                <span style={{ fontWeight: 700, color: t.primary }}>{formatRs(selectedItem.amount)}</span>
              </div>
              {selectedItem.reason && (
                <div>
                  <span style={{ color: t.textMuted }}>Details: </span>
                  <span className="italic" style={{ color: t.text }}>"{selectedItem.reason}"</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>ADMIN DECISION NOTE</label>
              <input
                type="text"
                placeholder="Add optional reviewer remark..."
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => {
                  if (activeTab === 'advances') {
                    handleReviewAdvance(selectedItem._id, 'Approved');
                  } else {
                    handleReviewEmpLoan(selectedItem._id, 'Active');
                  }
                }}
                className="btn-press flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: t.paid, border: 'none', cursor: 'pointer' }}
              >
                Approve
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'advances') {
                    handleReviewAdvance(selectedItem._id, 'Rejected');
                  } else {
                    handleReviewEmpLoan(selectedItem._id, 'Rejected');
                  }
                }}
                className="btn-press flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: t.overdue, border: 'none', cursor: 'pointer' }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD LOAN REPAYMENT (MANUAL DEDUCTION) */}
      {repayModal && selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setRepayModal(false); setSelectedItem(null); }}
        >
          <form 
            onSubmit={handleRepayEmpLoan}
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-4 modal-card"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowMd }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: t.text }}>Record Loan Repayment</h3>
              <button type="button" onClick={() => { setRepayModal(false); setSelectedItem(null); }} className="border-none bg-transparent cursor-pointer">
                <X size={18} color={t.textMuted} />
              </button>
            </div>

            <div className="text-xs">
              <div style={{ color: t.textMuted }}>Deducting payment for: <span style={{ fontWeight: 700, color: t.text }}>{selectedItem.employeeId?.name}</span></div>
              <div style={{ color: t.textMuted }} className="mt-1">Remaining Loan Balance: <span style={{ fontWeight: 700, color: t.overdue }}>{formatRs(selectedItem.balance)}</span></div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold" style={{ color: t.textMuted }}>REPAYMENT AMOUNT (RS) *</label>
              <input
                type="number"
                required
                placeholder={`Default: ${selectedItem.monthlyDeduction}`}
                value={repayForm.amount}
                onChange={e => setRepayForm({ amount: e.target.value })}
                style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, borderRadius: 12, height: 44, padding: '0 12px', color: t.text }}
              />
            </div>

            <button
              type="submit"
              className="btn-press w-full py-3 rounded-xl font-bold"
              style={{ background: t.primary, color: t.onPrimary, border: 'none', cursor: 'pointer' }}
            >
              ✓ Record Repayment Deduction
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
