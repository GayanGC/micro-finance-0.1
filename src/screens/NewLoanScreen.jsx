

import { useState, useRef, useEffect } from 'react';
import { Shield, Clock, Briefcase, Upload, Check, User, DollarSign, Percent, AlertCircle, Phone, MapPin, CreditCard } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { getCustomers, createCustomer, createLoan } from '../api/client.js';

const LOAN_TYPES = ['Insurance', 'Daily', 'Wage'];
const LOAN_TYPE_ICONS = { Insurance: Shield, Daily: Clock, Wage: Briefcase };

function FormField({ t, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ t, value, onChange, placeholder, icon: Icon, type = 'text', prefix }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4"
      style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, height: 52 }}
    >
      {Icon && <Icon size={16} color={t.textMuted} strokeWidth={2} />}
      {prefix && <span style={{ color: t.textMuted, fontSize: '0.85rem', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          fontSize: '0.9rem',
          color: t.text,
          fontFamily: prefix ? "'IBM Plex Mono', monospace" : 'Inter',
          fontWeight: prefix ? 600 : 400,
        }}
      />
    </div>
  );
}

export default function NewLoanScreen({ t, onBack, onToggleTheme }) {
  const [form, setForm] = useState({
    loanType: 'Daily',
    amount: '',
    interestRateMonthly: '',
    interestRateAnnual: '',
    paymentFrequency: 'Daily',
    installments: '30',
    guarantor: '',
  });

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // New Customer info state
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerNic, setNewCustomerNic] = useState('');
  const [newCustomerArea, setNewCustomerArea] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef();

  function set(key, val) { 
    setForm(f => {
      const updated = { ...f, [key]: val };
      // Auto compute annual rate if monthly is changed, and vice versa
      if (key === 'interestRateMonthly') {
        updated.interestRateAnnual = val ? String(parseFloat(val) * 12) : '';
      } else if (key === 'interestRateAnnual') {
        updated.interestRateMonthly = val ? String((parseFloat(val) / 12).toFixed(2)) : '';
      }
      return updated;
    }); 
  }

  // Search suggestions useEffect
  useEffect(() => {
    if (!customerSearch.trim() || selectedCustomer) {
      setCustomerSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await getCustomers(customerSearch);
        if (res && res.success) {
          setCustomerSuggestions(res.data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(delay);
  }, [customerSearch, selectedCustomer]);

  function validate() {
    const e = {};
    if (!selectedCustomer) e.customerName = 'Required';
    if (isNewCustomer && !newCustomerPhone.trim()) e.newCustomerPhone = 'Phone number is required';
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Enter a valid amount';
    if (!form.interestRateAnnual || isNaN(form.interestRateAnnual)) e.interestRateAnnual = 'Enter a valid rate';
    if (!form.installments || isNaN(form.installments) || +form.installments <= 0) e.installments = 'Enter installments';
    return e;
  }

  // Dynamic values
  const principalAmt = Number(form.amount) || 0;
  const annualRate = (Number(form.interestRateAnnual) || 0) / 100;
  const totalTerms = Number(form.installments) || 1;
  const interestAmt = Math.round(principalAmt * annualRate);
  const totalRepayable = principalAmt + interestAmt;
  const installmentAmt = Math.round(totalRepayable / totalTerms);

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    setErrorMsg('');

    try {
      let finalCustomerId = selectedCustomer._id;

      // Register new customer if flagged
      if (isNewCustomer) {
        const custRes = await createCustomer({
          name: selectedCustomer.name,
          phone: newCustomerPhone,
          nic: newCustomerNic,
          area: newCustomerArea,
          address: newCustomerAddress
        });

        if (custRes && custRes.success && custRes.data) {
          finalCustomerId = custRes.data._id;
        } else {
          throw new Error('Customer registration failed');
        }
      }

      // Compute due date based on payment frequency & installments count
      const dueDate = new Date();
      const count = Number(form.installments) || 30;
      if (form.paymentFrequency === 'Daily') {
        dueDate.setDate(dueDate.getDate() + count);
      } else if (form.paymentFrequency === 'Weekly') {
        dueDate.setDate(dueDate.getDate() + count * 7);
      } else if (form.paymentFrequency === 'Monthly') {
        dueDate.setMonth(dueDate.getMonth() + count);
      }

      // Create loan
      const loanRes = await createLoan({
        customer: finalCustomerId,
        type: form.loanType,
        amount: principalAmt,
        interestRate: Number(form.interestRateAnnual) || 0,
        interestRateMonthly: Number(form.interestRateMonthly) || 0,
        interestRateAnnual: Number(form.interestRateAnnual) || 0,
        paymentFrequency: form.paymentFrequency,
        installments: totalTerms,
        installmentsPaid: 0,
        guarantor: form.guarantor,
        dueDate: dueDate.toISOString(),
        documentUrl: file ? file.name : ''
      });

      if (loanRes && loanRes.success) {
        onBack();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit loan application');
      setSubmitting(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  return (
    <div className="flex flex-col min-h-full screen-slide-up" style={{ background: t.bg }}>
      <TopBar
        t={t}
        title="New Loan"
        onBack={onBack}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex-1 px-4 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-xl mx-auto flex flex-col gap-5">

          {/* Section: Customer Info */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.text }}>
              Customer Information
            </h3>

            <FormField t={t} label="Customer Name">
              {selectedCustomer ? (
                <div
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}` }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: t.text }}>{selectedCustomer.name}</div>
                    <div style={{ fontSize: '0.72rem', color: t.textMuted }}>
                      {isNewCustomer ? 'New Registration' : `${selectedCustomer.phone} · ${selectedCustomer.area}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                      setIsNewCustomer(false);
                    }}
                    className="btn-press text-xs font-bold"
                    style={{ color: t.overdue, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <TextInput
                    t={t}
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Type name to search existing customers..."
                    icon={User}
                  />

                  {/* Suggestions Dropdown */}
                  {customerSuggestions.length > 0 && (
                    <div
                      className="mt-1 rounded-xl border max-h-40 overflow-y-auto"
                      style={{ background: t.card, borderColor: t.border, boxShadow: t.shadow }}
                    >
                      {customerSuggestions.map(cust => (
                        <button
                          key={cust._id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCustomerSuggestions([]);
                          }}
                          className="w-full text-left px-4 py-2.5 border-b last:border-b-0 btn-press"
                          style={{ borderBottomColor: t.border }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: t.text }}>{cust.name}</div>
                          <div style={{ fontSize: '0.7rem', color: t.textMuted }}>{cust.phone} · {cust.area}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Create New Prompt */}
                  {customerSearch.trim() && !selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewCustomer(true);
                        setSelectedCustomer({ name: customerSearch, _id: 'new' });
                      }}
                      className="mt-2 text-xs font-bold flex items-center gap-1.5"
                      style={{ color: t.primary }}
                    >
                      + Register "{customerSearch}" as a New Customer
                    </button>
                  )}
                </div>
              )}
              {errors.customerName && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.customerName}</span>}
            </FormField>

            {/* Inline registration fields */}
            {isNewCustomer && (
              <div className="flex flex-col gap-4 mt-2 p-4 rounded-xl border border-dashed" style={{ borderColor: t.border }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.accent }}>Register details for {selectedCustomer.name}</div>

                <FormField t={t} label="Phone Number *">
                  <TextInput
                    t={t}
                    value={newCustomerPhone}
                    onChange={e => setNewCustomerPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    icon={Phone}
                    type="tel"
                  />
                  {errors.newCustomerPhone && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.newCustomerPhone}</span>}
                </FormField>

                <FormField t={t} label="NIC">
                  <TextInput
                    t={t}
                    value={newCustomerNic}
                    onChange={e => setNewCustomerNic(e.target.value)}
                    placeholder="e.g. 981234567V"
                    icon={CreditCard}
                  />
                </FormField>

                <FormField t={t} label="Area">
                  <TextInput
                    t={t}
                    value={newCustomerArea}
                    onChange={e => setNewCustomerArea(e.target.value)}
                    placeholder="e.g. Colombo 7"
                    icon={MapPin}
                  />
                </FormField>

                <FormField t={t} label="Address">
                  <TextInput
                    t={t}
                    value={newCustomerAddress}
                    onChange={e => setNewCustomerAddress(e.target.value)}
                    placeholder="Full street address"
                    icon={MapPin}
                  />
                </FormField>
              </div>
            )}

            <FormField t={t} label="Guarantor Name">
              <TextInput
                t={t}
                value={form.guarantor}
                onChange={e => set('guarantor', e.target.value)}
                placeholder="Guarantor full name"
                icon={User}
              />
            </FormField>
          </div>

          {/* Section: Loan Details */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.text }}>
              Loan Details
            </h3>

            {/* Loan type toggle */}
            <FormField t={t} label="Loan Type">
              <div className="flex gap-2">
                {LOAN_TYPES.map(type => {
                  const Icon = LOAN_TYPE_ICONS[type];
                  const active = form.loanType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => set('loanType', type)}
                      className="flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 btn-press"
                      style={{
                        background: active ? t.primary : t.bgSubtle,
                        border: `1.5px solid ${active ? t.primary : t.border}`,
                        color: active ? t.onPrimary : t.textMuted,
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      <Icon size={16} strokeWidth={2} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{type}</span>
                    </button>
                  );
                })}
              </div>
            </FormField>

            <FormField t={t} label="Loan Amount">
              <TextInput
                t={t}
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="0"
                icon={DollarSign}
                prefix="Rs."
                type="number"
              />
              {errors.amount && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.amount}</span>}
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField t={t} label="Monthly Interest Rate (%)">
                <TextInput
                  t={t}
                  value={form.interestRateMonthly}
                  onChange={e => set('interestRateMonthly', e.target.value)}
                  placeholder="e.g. 1"
                  icon={Percent}
                  type="number"
                />
              </FormField>

              <FormField t={t} label="Annual Interest Rate (%)">
                <TextInput
                  t={t}
                  value={form.interestRateAnnual}
                  onChange={e => set('interestRateAnnual', e.target.value)}
                  placeholder="e.g. 12"
                  icon={Percent}
                  type="number"
                />
                {errors.interestRateAnnual && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.interestRateAnnual}</span>}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField t={t} label="Payment Frequency">
                <select
                  value={form.paymentFrequency}
                  onChange={e => set('paymentFrequency', e.target.value)}
                  className="rounded-xl px-4 w-full"
                  style={{ background: t.bgSubtle, border: `1.5px solid ${t.border}`, height: 52, color: t.text, fontSize: '0.9rem' }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </FormField>

              <FormField t={t} label="Total Installments">
                <TextInput
                  t={t}
                  value={form.installments}
                  onChange={e => set('installments', e.target.value)}
                  placeholder="e.g. 30"
                  icon={Clock}
                  type="number"
                />
                {errors.installments && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.installments}</span>}
              </FormField>
            </div>

            {/* Calculations Preview Card */}
            {principalAmt > 0 && (
              <div 
                className="p-4 rounded-xl flex flex-col gap-2 mt-2" 
                style={{ background: `linear-gradient(135deg, ${t.primary}0B, ${t.accent}05)`, border: `1px solid ${t.border}` }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Installment calculation preview
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span style={{ fontSize: '0.8rem', color: t.textMuted }}>Installment Amount ({form.paymentFrequency}):</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: t.primary }}>Rs. {installmentAmt.toLocaleString('en-LK')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: t.textMuted }}>Total Interest ({form.interestRateAnnual}%):</span>
                  <span style={{ fontWeight: 600, color: t.text }}>Rs. {interestAmt.toLocaleString('en-LK')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: t.textMuted }}>Total Repayable:</span>
                  <span style={{ fontWeight: 600, color: t.text }}>Rs. {totalRepayable.toLocaleString('en-LK')}</span>
                </div>
              </div>
            )}

          </div>

          {/* Document upload dropzone */}
          <div
            className="rounded-2xl p-5"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: t.text, marginBottom: 16 }}>
              Documents
            </h3>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer"
              style={{
                border: `2px dashed ${dragging ? t.primary : t.border}`,
                padding: '28px 16px',
                background: dragging ? t.primarySoft : t.bgSubtle,
                transition: 'all 0.2s',
              }}
            >
              {file ? (
                <>
                  <Check size={28} color={t.paid} strokeWidth={2} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: t.paid }}>{file.name}</div>
                  <div style={{ fontSize: '0.7rem', color: t.textMuted }}>Tap to change</div>
                </>
              ) : (
                <>
                  <Upload size={28} color={t.textMuted} strokeWidth={1.5} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: t.text }}>Drop documents here</div>
                  <div style={{ fontSize: '0.7rem', color: t.textMuted }}>NIC, income proof, photos · PDF, JPG, PNG</div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0])}
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2" style={{ color: t.overdue }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{errorMsg}</span>
            </div>
          )}

          {/* Submit */}
          <PrimaryButton t={t} fullWidth onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting ? 'Saving…' : '✓ Submit Loan Application'}
          </PrimaryButton>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}

