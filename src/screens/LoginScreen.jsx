import { useState, useContext } from 'react';
import { Lock, Phone, Eye, EyeOff, TrendingUp, Mail, Sun, Moon, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

export default function LoginScreen({ t, onToggleTheme }) {
  const [loginType, setLoginType] = useState('phone'); // 'phone' or 'email'
  
  // Credentials states
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [showPin, setShowPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(''); // track focus state
  
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (loginType === 'phone') {
        if (!phone) {
          throw new Error('Phone number is required.');
        }
        if (!/^0\d{9}$/.test(phone)) {
          throw new Error('Enter a valid 10-digit Sri Lankan phone number (e.g. 0712345678).');
        }
        if (pin.length < 4) {
          throw new Error('PIN must be at least 4 digits.');
        }
        await login({ loginType: 'phone', phone, pin });
      } else {
        if (!email) {
          throw new Error('Email is required.');
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          throw new Error('Enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await login({ loginType: 'email', email, password });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  }

  const isLight = t.mode === 'light';
  
  // Layout styles implemented via inline CSS for 100% cross-browser styling robustness
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: isLight 
        ? 'radial-gradient(circle at 50% 50%, #FDFDFD 0%, #EFEBE2 100%)' 
        : 'radial-gradient(circle at 50% 50%, #12211C 0%, #060B0A 100%)',
    },
    card: {
      width: '100%',
      maxWidth: '450px',
      borderRadius: '32px',
      padding: '48px 36px',
      boxSizing: 'border-box',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      border: `1.5px solid ${isLight ? 'rgba(228, 223, 211, 0.7)' : 'rgba(35, 51, 48, 0.7)'}`,
      background: isLight 
        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)' 
        : 'linear-gradient(135deg, rgba(24, 36, 32, 0.75) 0%, rgba(24, 36, 32, 0.45) 100%)',
      boxShadow: isLight 
        ? '0 24px 60px rgba(14, 92, 82, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)' 
        : '0 24px 60px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
    },
    title: {
      fontFamily: 'Poppins',
      fontWeight: 800,
      fontSize: '2rem',
      color: t.text,
      letterSpacing: '-0.02em',
      marginBottom: '6px',
    },
    subtitle: {
      color: t.textMuted,
      fontSize: '0.92rem',
      fontWeight: 500,
      marginBottom: '32px',
    },
    tabSelector: {
      display: 'flex',
      width: '100%',
      padding: '6px',
      borderRadius: '18px',
      marginBottom: '32px',
      boxSizing: 'border-box',
      background: isLight ? '#EFEBE2' : '#141F1C',
      border: `1px solid ${isLight ? '#E4DFD3' : '#233330'}`,
    },
    tabButton: (isActive) => ({
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '14px 0',
      borderRadius: '14px',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'Poppins',
      fontWeight: '700',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'all 0.2s ease',
      background: isActive ? t.card : 'transparent',
      color: isActive ? t.text : t.textMuted,
      boxShadow: isActive ? (isLight ? '0 4px 12px rgba(14, 92, 82, 0.08)' : '0 4px 12px rgba(0, 0, 0, 0.35)') : 'none',
    }),
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      marginBottom: '28px',
    },
    label: {
      fontSize: '0.92rem',
      fontWeight: 700,
      color: t.text,
      marginBottom: '8px',
      fontFamily: 'Poppins',
      display: 'block',
    },
    inputWrapper: (focused) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderRadius: '16px',
      padding: '0 16px',
      height: '58px',
      boxSizing: 'border-box',
      background: isLight ? '#FFFFFF' : '#141F1C',
      border: `2px solid ${focused ? t.primary : t.border}`,
      boxShadow: focused ? `0 0 0 4px ${t.primary}1A` : 'none',
      transition: 'all 0.2s ease',
    }),
    input: {
      flex: 1,
      height: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: t.text,
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: 'inherit',
    },
    errorBox: {
      borderRadius: '16px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'start',
      gap: '12px',
      background: `${t.overdue}12`,
      border: `1px solid ${t.overdue}30`,
      marginBottom: '24px',
    },
    errorText: {
      fontSize: '0.82rem',
      color: t.overdue,
      fontWeight: 600,
      lineHeight: 1.45,
      margin: 0,
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Neon Blobs for Luxury Aesthetic */}
      <div
        className="absolute rounded-full pointer-events-none filter blur-[100px] opacity-30 md:opacity-40 animate-pulse"
        style={{
          width: '380px',
          height: '380px',
          top: '-5%',
          right: '-5%',
          background: isLight ? 'rgba(14, 92, 82, 0.2)' : 'rgba(79, 179, 162, 0.2)',
          animationDuration: '6s',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none filter blur-[100px] opacity-30 md:opacity-40"
        style={{
          width: '380px',
          height: '380px',
          bottom: '-5%',
          left: '-5%',
          background: isLight ? 'rgba(199, 145, 47, 0.15)' : 'rgba(227, 177, 92, 0.15)',
        }}
      />

      {/* Theme Toggle Button */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className="absolute top-6 right-6 p-3 rounded-2xl border btn-press theme-transition z-20 cursor-pointer backdrop-blur-md"
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(24, 36, 32, 0.8)',
            borderColor: isLight ? '#E4DFD3' : '#233330',
            color: t.text,
            boxShadow: t.shadow,
          }}
          aria-label="Toggle Theme"
        >
          {isLight ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      )}

      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Logo & Top Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className="flex items-center justify-center rounded-[24px] mb-4 relative"
            style={{
              width: 84,
              height: 84,
              background: `linear-gradient(135deg, ${t.primary} 0%, ${isLight ? '#0B473F' : '#6BD0BF'} 100%)`,
              boxShadow: isLight 
                ? '0 12px 36px rgba(14, 92, 82, 0.22)' 
                : '0 12px 36px rgba(79, 179, 162, 0.22)',
            }}
          >
            <TrendingUp size={42} color={isLight ? '#FFFFFF' : '#08211C'} strokeWidth={2.5} />
          </div>
          
          <h1
            style={{
              fontFamily: 'Poppins',
              fontWeight: 800,
              fontSize: '2.2rem',
              color: t.text,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            MicroFinance
          </h1>
          <p style={{ color: t.textMuted, fontSize: '0.95rem', marginTop: 6, fontWeight: 600, letterSpacing: '0.01em' }}>
            Passbook Ledger · Field Agent Portal
          </p>
        </div>

        {/* Form Card (Responsive padding and border styling) */}
        <div style={styles.card}>
          <div style={styles.title}>Sign In</div>
          <div style={styles.subtitle}>Choose auth method to continue</div>

          {/* Tab Selector (Sleek Segment Control - 100% Stretch Layout) */}
          <div style={styles.tabSelector}>
            <button
              type="button"
              onClick={() => {
                setLoginType('phone');
                setError('');
              }}
              style={styles.tabButton(loginType === 'phone')}
            >
              <Phone size={16} strokeWidth={2.5} />
              Phone & PIN
            </button>
            
            <button
              type="button"
              onClick={() => {
                setLoginType('email');
                setError('');
              }}
              style={styles.tabButton(loginType === 'email')}
            >
              <Mail size={16} strokeWidth={2.5} />
              Email & Pass
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              
              {/* ── PHONE LOGIN FIELDS ── */}
              {loginType === 'phone' && (
                <>
                  {/* Phone Input */}
                  <div>
                    <label style={styles.label}>Phone Number</label>
                    <div style={styles.inputWrapper(isFocused === 'phone')}>
                      <Phone size={18} color={isFocused === 'phone' ? t.primary : t.textMuted} strokeWidth={2} />
                      <input
                        type="tel"
                        placeholder="077 123 4567"
                        value={phone}
                        onFocus={() => setIsFocused('phone')}
                        onBlur={() => setIsFocused('')}
                        onChange={e => setPhone(e.target.value.replace(/\s+/g, ''))}
                        style={{
                          ...styles.input,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: '600',
                        }}
                      />
                    </div>
                  </div>

                  {/* PIN Input */}
                  <div>
                    <label style={styles.label}>Access PIN</label>
                    <div style={styles.inputWrapper(isFocused === 'pin')}>
                      <Lock size={18} color={isFocused === 'pin' ? t.primary : t.textMuted} strokeWidth={2} />
                      <input
                        type={showPin ? 'text' : 'password'}
                        placeholder="••••"
                        value={pin}
                        onFocus={() => setIsFocused('pin')}
                        onBlur={() => setIsFocused('')}
                        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        style={{
                          ...styles.input,
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: '600',
                          letterSpacing: showPin ? '0.15em' : '0.45em',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(s => !s)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        style={{ background: 'none', border: 'none', outline: 'none' }}
                      >
                        {showPin
                          ? <EyeOff size={18} color={t.textMuted} />
                          : <Eye size={18} color={t.textMuted} />
                        }
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── EMAIL LOGIN FIELDS ── */}
              {loginType === 'email' && (
                <>
                  {/* Email Input */}
                  <div>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.inputWrapper(isFocused === 'email')}>
                      <Mail size={18} color={isFocused === 'email' ? t.primary : t.textMuted} strokeWidth={2} />
                      <input
                        type="email"
                        placeholder="agent@microfinance.lk"
                        value={email}
                        onFocus={() => setIsFocused('email')}
                        onBlur={() => setIsFocused('')}
                        onChange={e => setEmail(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputWrapper(isFocused === 'password')}>
                      <Lock size={18} color={isFocused === 'password' ? t.primary : t.textMuted} strokeWidth={2} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onFocus={() => setIsFocused('password')}
                        onBlur={() => setIsFocused('')}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                          ...styles.input,
                          fontFamily: showPassword ? 'inherit' : "'IBM Plex Mono', monospace",
                          letterSpacing: showPassword ? 'normal' : '0.3em',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                        style={{ background: 'none', border: 'none', outline: 'none' }}
                      >
                        {showPassword
                          ? <EyeOff size={18} color={t.textMuted} />
                          : <Eye size={18} color={t.textMuted} />
                        }
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Error Message Panel */}
            {error && (
              <div style={styles.errorBox}>
                <div style={{ w: '3px', background: t.overdue, alignSelf: 'stretch', borderRadius: '4px' }} />
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '32px' }}>
              <PrimaryButton 
                t={t} 
                fullWidth 
                onClick={handleSubmit} 
                disabled={loading} 
                size="lg"
                style={{
                  height: '58px',
                  borderRadius: '16px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  background: `linear-gradient(135deg, ${t.primary} 0%, ${isLight ? '#0B473F' : '#6BD0BF'} 100%)`,
                  boxShadow: isLight
                    ? '0 6px 24px rgba(14, 92, 82, 0.22)'
                    : '0 6px 24px rgba(79, 179, 162, 0.22)',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking Credentials...
                  </span>
                ) : 'Sign In'}
              </PrimaryButton>
            </div>
          </form>

          {/* Help Center Info */}
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: t.textMuted, marginTop: '28px', fontWeight: 500 }}>
            Trouble signing in? Contact your branch manager.
          </p>
        </div>

        {/* Footer info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: '600', color: t.textMuted }}>
            <CheckCircle2 size={14} color={t.active} />
            <span>Local Database Server Active</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: t.textMuted, fontWeight: 500, margin: 0 }}>
            MicroFinance v0.1 · Secure Ledger Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
