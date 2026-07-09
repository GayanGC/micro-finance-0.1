import { useState, useRef } from 'react';
import { Shield, Clock, Briefcase, Upload, Check, User, DollarSign, Percent } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

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

export default function NewLoanScreen({ t, onBack, onSubmit, onToggleTheme }) {
  const [form, setForm] = useState({
    customerName: '',
    loanType: 'Daily',
    amount: '',
    interestRate: '',
    guarantor: '',
  });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = 'Enter a valid amount';
    if (!form.interestRate || isNaN(form.interestRate)) e.interestRate = 'Enter a valid rate';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitted(true);
    setTimeout(() => {
      onSubmit({
        customerName: form.customerName,
        type: form.loanType,
        amount: +form.amount,
        balance: +form.amount,
        interestRate: +form.interestRate,
        guarantor: form.guarantor,
        status: 'Pending',
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        area: 'Colombo',
      });
      onBack();
    }, 800);
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
              <TextInput
                t={t}
                value={form.customerName}
                onChange={e => set('customerName', e.target.value)}
                placeholder="Full name of customer"
                icon={User}
              />
              {errors.customerName && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.customerName}</span>}
            </FormField>

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

            <FormField t={t} label="Interest Rate (% per annum)">
              <TextInput
                t={t}
                value={form.interestRate}
                onChange={e => set('interestRate', e.target.value)}
                placeholder="e.g. 12"
                icon={Percent}
                type="number"
              />
              {errors.interestRate && <span style={{ fontSize: '0.72rem', color: t.overdue }}>{errors.interestRate}</span>}
            </FormField>
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

          {/* Submit */}
          <PrimaryButton t={t} fullWidth onClick={handleSubmit} disabled={submitted} size="lg">
            {submitted ? 'Saving…' : '✓ Submit Loan Application'}
          </PrimaryButton>
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
