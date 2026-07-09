import { useState, useContext } from 'react';
import { Lock, Phone, Eye, EyeOff, TrendingUp } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

export default function LoginScreen({ t }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone || pin.length < 4) {
      setError('Please enter your phone number and 4-digit PIN.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(phone, pin);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  }


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: t.bg }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: t.primarySoft,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: t.accentSoft,
          pointerEvents: 'none',
        }}
      />

      <div
        className="w-full max-w-sm relative"
        style={{ zIndex: 1 }}
      >
        {/* Logo & branding */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="flex items-center justify-center rounded-2xl mb-4"
            style={{
              width: 72,
              height: 72,
              background: t.primary,
              boxShadow: `0 8px 32px ${t.primary}55`,
            }}
          >
            <TrendingUp size={36} color={t.onPrimary} strokeWidth={2} />
          </div>
          <h1
            style={{
              fontFamily: 'Poppins',
              fontWeight: 800,
              fontSize: '1.6rem',
              color: t.text,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            MicroFinance
          </h1>
          <p style={{ color: t.textMuted, fontSize: '0.8rem', marginTop: 4, fontWeight: 500 }}>
            Passbook Ledger — Field Agent
          </p>
        </div>

        {/* Login card */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadowMd,
          }}
        >
          <h2
            style={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: t.text,
              marginBottom: 6,
            }}
          >
            Sign in
          </h2>
          <p style={{ color: t.textMuted, fontSize: '0.78rem', marginBottom: 24 }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Phone input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                Phone Number
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4"
                style={{
                  background: t.bgSubtle,
                  border: `1.5px solid ${t.border}`,
                  height: 52,
                  transition: 'border-color 0.2s',
                }}
                onFocus={() => {}}
              >
                <Phone size={16} color={t.textMuted} strokeWidth={2} />
                <input
                  type="tel"
                  placeholder="07X XXX XXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.9rem',
                    color: t.text,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                  }}
                />
              </div>
            </div>

            {/* PIN input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: 6 }}>
                PIN
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4"
                style={{
                  background: t.bgSubtle,
                  border: `1.5px solid ${t.border}`,
                  height: 52,
                }}
              >
                <Lock size={16} color={t.textMuted} strokeWidth={2} />
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1.2rem',
                    color: t.text,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                    letterSpacing: showPin ? '0.15em' : '0.3em',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  {showPin
                    ? <EyeOff size={16} color={t.textMuted} />
                    : <Eye size={16} color={t.textMuted} />
                  }
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p style={{ fontSize: '0.75rem', color: t.overdue, fontWeight: 500 }}>{error}</p>
            )}

            {/* Submit */}
            <PrimaryButton t={t} fullWidth onClick={handleSubmit} disabled={loading} size="lg">
              {loading ? 'Signing in…' : 'Sign In'}
            </PrimaryButton>
          </form>

          {/* Hint */}
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: t.textMuted, marginTop: 16 }}>
            Trouble signing in? Contact your branch manager.
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: t.textMuted, marginTop: 24 }}>
          MicroFinance v0.1 · Secure Field Agent Portal
        </p>
      </div>
    </div>
  );
}
